"""Reminder scheduling logic for tasks with due dates.

This module implements the reminder scheduling logic that triggers notifications
at 5 hours before due date and every 15 minutes thereafter. The implementation
maintains stateless server architecture by using database-driven scheduling.
"""
from datetime import datetime, timedelta
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from src.persistence.models.task import Task
from src.persistence.repositories.task_repository import TaskRepository


# Reminder configuration
INITIAL_REMINDER_HOURS = 5  # First reminder at 5 hours before due
REPEAT_INTERVAL_MINUTES = 15  # Repeat every 15 minutes


def calculate_reminder_times(due_date: datetime) -> list[datetime]:
    """Calculate all reminder times for a task's due date.

    Args:
        due_date: The task's due date

    Returns:
        List of datetime objects when reminders should be sent
    """
    reminders = []
    now = datetime.utcnow()

    # Initial reminder at 5 hours before
    initial_reminder = due_date - timedelta(hours=INITIAL_REMINDER_HOURS)

    if initial_reminder > now:
        reminders.append(initial_reminder)

    # Subsequent reminders every 15 minutes until due date
    current_reminder = initial_reminder + timedelta(minutes=REPEAT_INTERVAL_MINUTES)
    while current_reminder < due_date:
        if current_reminder > now:
            reminders.append(current_reminder)
        current_reminder += timedelta(minutes=REPEAT_INTERVAL_MINUTES)

    return reminders


def get_next_reminder_time(due_date: datetime) -> datetime | None:
    """Get the next reminder time for a task.

    Args:
        due_date: The task's due date

    Returns:
        Next reminder datetime or None if no more reminders
    """
    now = datetime.utcnow()

    if due_date <= now:
        return None

    # Check if we're within the reminder window
    initial_reminder = due_date - timedelta(hours=INITIAL_REMINDER_HOURS)

    if now < initial_reminder:
        return initial_reminder

    # Calculate next 15-minute interval
    time_since_initial = now - initial_reminder
    intervals_passed = time_since_initial.total_seconds() // (REPEAT_INTERVAL_MINUTES * 60)
    next_reminder = initial_reminder + timedelta(
        minutes=REPEAT_INTERVAL_MINUTES * (intervals_passed + 1)
    )

    if next_reminder >= due_date:
        return None

    return next_reminder


def should_send_reminder(due_date: datetime, last_reminder: datetime | None = None) -> bool:
    """Determine if a reminder should be sent now.

    Args:
        due_date: The task's due date
        last_reminder: When the last reminder was sent (if any)

    Returns:
        True if a reminder should be sent now
    """
    now = datetime.utcnow()

    if due_date <= now:
        return False

    # Check if within reminder window
    initial_reminder = due_date - timedelta(hours=INITIAL_REMINDER_HOURS)

    if now < initial_reminder:
        return False

    # If no previous reminder, send one
    if last_reminder is None:
        return True

    # Check if enough time has passed since last reminder
    time_since_last = now - last_reminder
    if time_since_last >= timedelta(minutes=REPEAT_INTERVAL_MINUTES):
        return True

    return False


async def get_tasks_needing_reminders(session: AsyncSession) -> list[Task]:
    """Get all tasks that need reminders sent.

    This function queries for tasks where:
    - Task is not completed
    - Task has a due date
    - Due date is within the reminder window (5 hours or less)
    - Due date is in the future

    Args:
        session: Database session

    Returns:
        List of tasks needing reminders
    """
    repo = TaskRepository(session)
    now = datetime.utcnow()
    reminder_window_start = now + timedelta(hours=INITIAL_REMINDER_HOURS)

    # Get all users' pending tasks with due dates
    # Note: In production, this would be optimized with proper indexing
    from sqlmodel import select
    result = await session.execute(
        select(Task).where(
            Task.completed == False,  # noqa: E712
            Task.due_date.isnot(None),
            Task.due_date > now,
            Task.due_date <= reminder_window_start,
        )
    )

    return list(result.scalars().all())


class ReminderInfo:
    """Information about a pending reminder."""

    def __init__(
        self,
        task_id: str,
        user_id: str,
        description: str,
        due_date: datetime,
        priority: int,
        next_reminder: datetime | None,
    ):
        self.task_id = task_id
        self.user_id = user_id
        self.description = description
        self.due_date = due_date
        self.priority = priority
        self.next_reminder = next_reminder

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary for serialization."""
        return {
            "task_id": self.task_id,
            "user_id": self.user_id,
            "description": self.description,
            "due_date": self.due_date.isoformat(),
            "priority": self.priority,
            "next_reminder": self.next_reminder.isoformat() if self.next_reminder else None,
            "time_remaining": str(self.due_date - datetime.utcnow()) if self.due_date > datetime.utcnow() else "overdue",
        }


async def get_pending_reminders(session: AsyncSession, user_id: str) -> list[ReminderInfo]:
    """Get pending reminders for a user.

    Args:
        session: Database session
        user_id: User's unique identifier

    Returns:
        List of ReminderInfo objects
    """
    repo = TaskRepository(session)
    tasks = await repo.get_pending_with_due_date(user_id)

    reminders = []
    for task in tasks:
        if task.due_date:
            next_reminder = get_next_reminder_time(task.due_date)
            if next_reminder:
                reminders.append(ReminderInfo(
                    task_id=task.task_id,
                    user_id=task.user_id,
                    description=task.description,
                    due_date=task.due_date,
                    priority=task.priority,
                    next_reminder=next_reminder,
                ))

    return reminders
