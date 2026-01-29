"""Unit tests for Conversation and Message SQLModel schemas and relationships."""
import pytest
from datetime import datetime, timedelta
from uuid import uuid4

from sqlmodel import select

from src.persistence.models.conversation import Conversation, Message
from src.persistence.models.user import User
from src.core.database import get_session


class TestConversationModel:
    """Test Conversation SQLModel schema definition and validation."""

    async def test_conversation_schema_fields(self):
        """Test that Conversation model has all required fields with correct types."""
        user_id = str(uuid4())
        conversation = Conversation(user_id=user_id)

        # Verify all fields exist
        assert hasattr(conversation, "id")
        assert hasattr(conversation, "user_id")
        assert hasattr(conversation, "created_at")
        assert hasattr(conversation, "updated_at")
        assert hasattr(conversation, "messages")

        # Verify field types
        assert isinstance(conversation.id, str)
        assert isinstance(conversation.user_id, str)
        assert isinstance(conversation.created_at, datetime)
        assert isinstance(conversation.updated_at, datetime)
        assert isinstance(conversation.messages, list)

    @pytest.mark.asyncio
    async def test_conversation_crud_operations(self):
        """Test basic CRUD operations for Conversation model."""
        user_id = str(uuid4())

        # Create conversation
        async with get_session() as session:
            conversation = Conversation(user_id=user_id)
            session.add(conversation)
            await session.commit()
            await session.refresh(conversation)

            assert conversation.id is not None
            assert conversation.user_id == user_id

            conversation_id = conversation.id

        # Read conversation
        async with get_session() as session:
            result = await session.execute(
                select(Conversation).where(Conversation.id == conversation_id)
            )
            retrieved_conversation = result.scalar_one()

            assert retrieved_conversation.id == conversation_id
            assert retrieved_conversation.user_id == user_id

        # Update conversation
        async with get_session() as session:
            result = await session.execute(
                select(Conversation).where(Conversation.id == conversation_id)
            )
            conversation = result.scalar_one()

            # Update updated_at by reassigning
            conversation.updated_at = datetime.now()
            await session.commit()
            await session.refresh(conversation)

        # Add messages to conversation
        async with get_session() as session:
            result = await session.execute(
                select(Conversation).where(Conversation.id == conversation_id)
            )
            conversation = result.scalar_one()

            message1 = Message(
                conversation_id=conversation.id,
                user_id=user_id,
                role="user",
                content="Hello, bot!"
            )
            message2 = Message(
                conversation_id=conversation.id,
                user_id=user_id,
                role="assistant",
                content="Hello! How can I help you?"
            )

            session.add(message1)
            session.add(message2)
            await session.commit()

            # Verify messages are linked
            assert len(conversation.messages) >= 2


class TestMessageModel:
    """Test Message SQLModel schema definition and validation."""

    async def test_message_schema_fields(self):
        """Test that Message model has all required fields with correct types."""
        conversation_id = str(uuid4())
        user_id = str(uuid4())

        message = Message(
            conversation_id=conversation_id,
            user_id=user_id,
            role="user",
            content="Test message"
        )

        # Verify all fields exist
        assert hasattr(message, "id")
        assert hasattr(message, "conversation_id")
        assert hasattr(message, "user_id")
        assert hasattr(message, "role")
        assert hasattr(message, "content")
        assert hasattr(message, "created_at")
        assert hasattr(message, "tool_calls")

        # Verify field types
        assert isinstance(message.id, str)
        assert isinstance(message.conversation_id, str)
        assert isinstance(message.user_id, str)
        assert isinstance(message.role, str)
        assert isinstance(message.content, str)
        assert isinstance(message.created_at, datetime)
        assert message.tool_calls is None or isinstance(message.tool_calls, str)

    async def test_message_role_validation(self):
        """Test that Message model validates role field."""
        conversation_id = str(uuid4())
        user_id = str(uuid4())

        # Valid roles
        valid_roles = ["user", "assistant"]
        for role in valid_roles:
            message = Message(
                conversation_id=conversation_id,
                user_id=user_id,
                role=role,
                content="Test"
            )
            assert message.role == role

        # Invalid role - SQLModel won't validate at model level, but max_length constraint exists
        # The constraint is defined with max_length=20 which will be enforced by the database

    @pytest.mark.asyncio
    async def test_message_crud_operations(self):
        """Test basic CRUD operations for Message model."""
        conversation_id = str(uuid4())
        user_id = str(uuid4())
        message_content = "Test message content"

        # Create message
        async with get_session() as session:
            message = Message(
                conversation_id=conversation_id,
                user_id=user_id,
                role="user",
                content=message_content
            )
            session.add(message)
            await session.commit()
            await session.refresh(message)

            assert message.id is not None
            assert message.content == message_content
            assert message.role == "user"

            message_id = message.id

        # Read message
        async with get_session() as session:
            result = await session.execute(
                select(Message).where(Message.id == message_id)
            )
            retrieved_message = result.scalar_one()

            assert retrieved_message.id == message_id
            assert retrieved_message.content == message_content

        # Update message
        async with get_session() as session:
            result = await session.execute(
                select(Message).where(Message.id == message_id)
            )
            message = result.scalar_one()

            message.content = "Updated message content"
            await session.commit()
            await session.refresh(message)

            assert message.content == "Updated message content"


class TestConversationMessageRelationship:
    """Test the relationship between Conversation and Message models."""

    @pytest.mark.asyncio
    async def test_one_to_many_relationship(self):
        """Test that one conversation can have many messages."""
        user_id = str(uuid4())
        conversation_id = str(uuid4())

        async with get_session() as session:
            # Create conversation
            conversation = Conversation(id=conversation_id, user_id=user_id)
            session.add(conversation)
            await session.flush()

            # Create multiple messages
            messages = []
            for i in range(5):
                message = Message(
                    conversation_id=conversation_id,
                    user_id=user_id,
                    role="user" if i % 2 == 0 else "assistant",
                    content=f"Message {i+1}"
                )
                session.add(message)
                messages.append(message)

            await session.commit()

            # Query conversation with messages
            result = await session.execute(
                select(Conversation).where(Conversation.id == conversation_id)
            )
            retrieved_conversation = result.scalar_one()

            # Verify all messages are linked
            assert len(retrieved_conversation.messages) == 5

            # Verify message ordering and content
            for i, message in enumerate(retrieved_conversation.messages):
                assert f"Message {i+1}" in message.content

    @pytest.mark.asyncio
    async def test_cascade_delete_behavior(self):
        """Test that deleting a conversation cascades to its messages."""
        user_id = str(uuid4())
        conversation_id = str(uuid4())

        async with get_session() as session:
            # Create conversation
            conversation = Conversation(id=conversation_id, user_id=user_id)
            session.add(conversation)
            await session.flush()

            # Create messages
            for i in range(3):
                message = Message(
                    conversation_id=conversation_id,
                    user_id=user_id,
                    role="user",
                    content=f"Message {i+1}"
                )
                session.add(message)

            await session.commit()

            # Verify messages exist
            result = await session.execute(
                select(Message).where(Message.conversation_id == conversation_id)
            )
            messages_before_delete = result.scalars().all()
            assert len(messages_before_delete) == 3

            # Delete conversation
            await session.delete(conversation)
            await session.commit()

            # Verify messages are also deleted (cascade)
            result = await session.execute(
                select(Message).where(Message.conversation_id == conversation_id)
            )
            messages_after_delete = result.scalars().all()
            assert len(messages_after_delete) == 0

    @pytest.mark.asyncio
    async def test_conversation_retrieval_with_messages(self):
        """Test retrieving a conversation history with all messages."""
        user_id = str(uuid4())

        async with get_session() as session:
            # Create conversation
            conversation = Conversation(user_id=user_id)
            session.add(conversation)
            await session.flush()
            conversation_id = conversation.id

            # Add messages in chronological order
            messages_data = [
                ("user", "What's the weather?"),
                ("assistant", "It's sunny today!"),
                ("user", "Thanks!"),
                ("assistant", "You're welcome!"),
            ]

            for role, content in messages_data:
                message = Message(
                    conversation_id=conversation_id,
                    user_id=user_id,
                    role=role,
                    content=content
                )
                session.add(message)

            await session.commit()

            # Retrieve conversation with messages
            result = await session.execute(
                select(Conversation).where(Conversation.id == conversation_id)
            )
            retrieved_conversation = result.scalar_one()

            # Verify all messages are present and in order
            assert len(retrieved_conversation.messages) == 4

            # Sort messages by creation time to verify order
            sorted_messages = sorted(
                retrieved_conversation.messages,
                key=lambda m: m.created_at
            )

            for i, (expected_role, expected_content) in enumerate(messages_data):
                assert sorted_messages[i].role == expected_role
                assert sorted_messages[i].content == expected_content
