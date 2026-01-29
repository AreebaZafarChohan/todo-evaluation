"""Conversation and Message repository for database operations."""
from datetime import datetime

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlmodel import select

from src.persistence.models.conversation import (
    Conversation,
    Message,
)


class ConversationRepository:
    """Repository for Conversation and Message entity database operations."""

    def __init__(self, session: AsyncSession) -> None:
        """Initialize repository with database session.

        Args:
            session: Async database session
        """
        self.session = session

    async def get_by_id(self, conversation_id: str) -> Conversation | None:
        """Get a conversation by ID with its messages.

        Args:
            conversation_id: Conversation's unique identifier

        Returns:
            Conversation with messages if found, None otherwise
        """
        result = await self.session.execute(
            select(Conversation)
            .where(Conversation.id == conversation_id)
            .options(selectinload(Conversation.messages))
        )
        return result.scalar_one_or_none()

    async def get_by_user_id(self, user_id: str) -> list[Conversation]:
        """Get all conversations for a user.

        Args:
            user_id: User's unique identifier

        Returns:
            List of conversations (without messages loaded)
        """
        result = await self.session.execute(
            select(Conversation)
            .where(Conversation.user_id == user_id)
            .order_by(Conversation.updated_at.desc())
        )
        return list(result.scalars().all())

    async def get_latest_for_user(self, user_id: str) -> Conversation | None:
        """Get the most recent conversation for a user with messages.

        Args:
            user_id: User's unique identifier

        Returns:
            Most recent Conversation with messages, or None
        """
        result = await self.session.execute(
            select(Conversation)
            .where(Conversation.user_id == user_id)
            .order_by(Conversation.updated_at.desc())
            .limit(1)
            .options(selectinload(Conversation.messages))
        )
        return result.scalar_one_or_none()

    async def create(self, user_id: str) -> Conversation:
        """Create a new conversation.

        Args:
            user_id: User's unique identifier

        Returns:
            Created Conversation entity
        """
        conversation = Conversation(user_id=user_id)
        self.session.add(conversation)
        await self.session.flush()
        await self.session.refresh(conversation)
        return conversation

    async def get_or_create_for_user(self, user_id: str) -> Conversation:
        """Get the latest conversation for a user or create a new one.

        Args:
            user_id: User's unique identifier

        Returns:
            Existing or newly created Conversation with messages
        """
        conversation = await self.get_latest_for_user(user_id)
        if conversation is None:
            conversation = await self.create(user_id)
            # Refresh the conversation with messages loaded
            result = await self.session.execute(
                select(Conversation)
                .where(Conversation.id == conversation.id)
                .options(selectinload(Conversation.messages))
            )
            conversation = result.scalar_one_or_none()
        return conversation

    async def add_message(
        self,
        conversation_id: str,
        role: str,
        content: str,
        tool_calls: str | None = None,
    ) -> Message:
        """Add a message to a conversation.

        Args:
            conversation_id: Conversation's unique identifier
            role: Message role ('user' or 'assistant')
            content: Message content
            tool_calls: Optional JSON string of tool calls

        Returns:
            Created Message entity
        """
        message = Message(
            conversation_id=conversation_id,
            role=role,
            content=content,
            tool_calls=tool_calls,
        )
        self.session.add(message)

        # Update conversation's updated_at timestamp
        result = await self.session.execute(
            select(Conversation).where(Conversation.id == conversation_id)
        )
        conversation = result.scalar_one_or_none()
        if conversation:
            conversation.updated_at = datetime.now()
            self.session.add(conversation)

        await self.session.flush()
        await self.session.refresh(message)
        return message

    async def get_messages(
        self,
        conversation_id: str,
        limit: int | None = None,
    ) -> list[Message]:
        """Get messages for a conversation ordered by creation time.

        Args:
            conversation_id: Conversation's unique identifier
            limit: Optional limit on number of messages

        Returns:
            List of messages ordered by creation time (oldest first)
        """
        query = (
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(Message.created_at.asc())
        )
        if limit:
            query = query.limit(limit)

        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def delete_conversation(self, conversation_id: str) -> bool:
        """Delete a conversation and all its messages.

        Args:
            conversation_id: Conversation's unique identifier

        Returns:
            True if deleted, False if not found
        """
        conversation = await self.get_by_id(conversation_id)
        if conversation is None:
            return False

        # Delete all messages first
        for message in conversation.messages:
            await self.session.delete(message)

        await self.session.delete(conversation)
        return True
