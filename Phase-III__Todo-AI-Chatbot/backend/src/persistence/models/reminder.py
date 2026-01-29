"""Reminder SQLModel definition for task reminder persistence."""
from datetime import datetime
from typing import TYPE_CHECKING
from uuid import uuid4

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from src.persistence.models.task import Task


def generate_uuid() -> str:
    """Generate a UUID string."""
    return str(uuid4())


class Reminder(SQLModel, table=True):
    """Reminder entity representing a scheduled notification for a task.

    This table stores reminder state to enable persistent notification scheduling.
    A task can have zero or more reminders, each with its own trigger time
    and recurrence pattern.

    Attributes:
        id: Unique identifier for the reminder
        task_id: Foreign key to the task this reminder belongs to
        user_id: Foreign key to the user who owns the task (for efficient queries)
        next_trigger_at: Timestamp when this reminder should next be triggered
        repeat_interval_minutes: How often to repeat (in minutes), 0 for one-time
        active: Whether this reminder is currently active
        created_at: Timestamp when the reminder was created
        updated_at: Timestamp when the reminder was last updated
    """

    __tablename__ = "reminder"  # Singular table name for consistency

    id: str = Field(default_factory=generate_uuid, primary_key=True, max_length=36)
    task_id: str = Field(foreign_key="task.id", index=True)
    user_id: str = Field(index=True)  # Denormalized for efficient user queries
    next_trigger_at: datetime | None = Field(index=True)  # When to send next reminder
    repeat_interval_minutes: int = Field(default=0, ge=0)  # 0 = one-time, >0 = recurring
    active: bool = Field(default=True)  # Can be deactivated without deleting

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

    # Relationships
    task: "Task" = Relationship(back_populates="reminders")

    def __repr__(self) -> str:
        """String representation of Reminder."""
        return (
            f"<Reminder(id={self.id[:8]}..., task_id={self.task_id[:8]}..., "
            f"next_trigger_at={self.next_trigger_at}, active={self.active})>"
        )
