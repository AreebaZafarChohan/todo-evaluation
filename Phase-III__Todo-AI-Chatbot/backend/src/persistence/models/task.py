"""Task SQLModel definition - Compatible with Phase 2 database schema."""
from datetime import datetime
from typing import TYPE_CHECKING
from uuid import uuid4

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from src.persistence.models.user import User
    from src.persistence.models.reminder import Reminder


def generate_uuid() -> str:
    """Generate a UUID string."""
    return str(uuid4())


class Task(SQLModel, table=True):
    """Task entity - MUST match Phase 2 schema exactly.

    This model references the existing 'task' table from Phase 2.
    Phase 3 adds new fields (due_date, priority) that need migration.

    Attributes:
        id: Unique identifier for the task
        user_id: Foreign key to the user who owns the task
        title: Task title (main description) - Phase 2 field
        description: Optional detailed description - Phase 2 field
        completed: Whether the task is completed
        created_at: Timestamp when the task was created
        updated_at: Timestamp when the task was last updated
        due_date: Optional due date for reminders - Phase 3 addition
        priority: Priority level (1-5) - Phase 3 addition
    """

    __tablename__ = "task"  # Phase 2 uses 'task' not 'tasks'
    __table_args__ = {'extend_existing': True}

    id: str = Field(default_factory=generate_uuid, primary_key=True)  # Phase 2 uses 'id'
    user_id: str = Field(foreign_key="user.id", index=True)  # FK to 'user.id'
    title: str = Field(min_length=1, max_length=200)  # Phase 2: main task description
    description: str | None = Field(default=None, max_length=1000)  # Phase 2: optional details
    completed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

    # Phase 3 additions - need migration to add these columns
    due_date: datetime | None = Field(default=None, index=True)
    priority: int = Field(default=3, ge=1, le=5)

    # Relationships
    user: "User" = Relationship(back_populates="tasks")
    reminders: list["Reminder"] = Relationship(back_populates="task", cascade_delete=True)


class TaskCreate(SQLModel):
    """Schema for creating a new task."""

    title: str
    description: str | None = None
    due_date: datetime | None = None
    priority: int = 3


class TaskRead(SQLModel):
    """Schema for reading task data."""

    id: str
    user_id: str
    title: str | None
    description: str | None
    completed: bool
    created_at: datetime
    updated_at: datetime | None
    due_date: datetime | None
    priority: int


class TaskUpdate(SQLModel):
    """Schema for updating a task."""

    title: str | None = None
    description: str | None = None
    due_date: datetime | None = None
    priority: int | None = None
    completed: bool | None = None
