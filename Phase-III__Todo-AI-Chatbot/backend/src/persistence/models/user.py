"""User SQLModel definition - Compatible with Phase 2 database schema."""
from datetime import datetime
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from src.persistence.models.conversation import Conversation
    from src.persistence.models.task import Task


class User(SQLModel, table=True):
    """User entity - MUST match Phase 2 schema exactly.

    This model references the existing 'user' table from Phase 2.
    DO NOT create migrations for this table - it already exists.

    Attributes:
        id: Unique identifier for the user (from Better Auth)
        email: User's email address
        name: User's display name
        hashed_password: Hashed password (managed by Better Auth)
        created_at: Timestamp when the user was created
    """

    __tablename__ = "user"  # Phase 2 uses 'user' not 'users'
    __table_args__ = {'extend_existing': True}

    id: str = Field(primary_key=True)  # Phase 2 uses 'id' not 'user_id'
    email: str = Field(unique=True, index=True)
    name: str
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.now)

    # Relationships - Phase 3 additions
    tasks: list["Task"] = Relationship(back_populates="user")
    conversations: list["Conversation"] = Relationship(back_populates="user")


class UserRead(SQLModel):
    """Schema for reading user data."""

    id: str
    email: str
    name: str
    created_at: datetime
