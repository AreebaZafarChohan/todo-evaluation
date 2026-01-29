"""Conversation and Message SQLModel definitions - Phase 3 new tables."""
from datetime import datetime
from typing import TYPE_CHECKING
from uuid import uuid4

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from src.persistence.models.user import User


def generate_uuid() -> str:
    """Generate a UUID string."""
    return str(uuid4())


class Message(SQLModel, table=True):
    """Message entity representing a single message in a conversation.

    This is a NEW table for Phase 3 - requires migration.

    Attributes:
        id: Unique identifier for the message
        conversation_id: Foreign key to the parent conversation
        role: Message role ('user' or 'assistant')
        content: Message content text
        created_at: Timestamp when the message was created
        tool_calls: JSON string of tool calls made during this message (assistant only)
    """

    __tablename__ = "message"  # Phase 3 new table

    id: str = Field(default_factory=generate_uuid, primary_key=True, max_length=36)
    conversation_id: str = Field(foreign_key="conversation.id", index=True)
    role: str = Field(max_length=20)  # 'user' or 'assistant'
    content: str = Field(default="")
    created_at: datetime = Field(default_factory=datetime.now)
    tool_calls: str | None = Field(default=None)  # JSON string of tool invocations

    # Relationship
    conversation: "Conversation" = Relationship(back_populates="messages")


class Conversation(SQLModel, table=True):
    """Conversation entity representing a chat session between user and chatbot.

    This is a NEW table for Phase 3 - requires migration.

    Attributes:
        id: Unique identifier for the conversation
        user_id: Foreign key to the user who owns the conversation
        created_at: Timestamp when the conversation was created
        updated_at: Timestamp when the conversation was last updated
        messages: List of messages in this conversation
    """

    __tablename__ = "conversation"  # Phase 3 new table

    id: str = Field(default_factory=generate_uuid, primary_key=True, max_length=36)
    user_id: str = Field(foreign_key="user.id", index=True)  # FK to Phase 2 user table
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

    # Relationships
    user: "User" = Relationship(back_populates="conversations")
    messages: list[Message] = Relationship(back_populates="conversation")


class MessageCreate(SQLModel):
    """Schema for creating a new message."""

    role: str
    content: str
    tool_calls: str | None = None


class MessageRead(SQLModel):
    """Schema for reading message data."""

    id: str
    conversation_id: str
    role: str
    content: str
    created_at: datetime
    tool_calls: str | None


class ConversationCreate(SQLModel):
    """Schema for creating a new conversation."""

    user_id: str


class ConversationRead(SQLModel):
    """Schema for reading conversation data."""

    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
    messages: list[MessageRead] = []
