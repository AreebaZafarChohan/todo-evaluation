"""Task domain services including reminder integration.

This module provides business logic services for task management,
including integration with the reminder scheduling system.
"""
from datetime import datetime
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from src.domain.reminders.scheduler import (
    get_next_reminder_time,
    get_pending_reminders,
    ReminderInfo,
)
from src.persistence.models.task import Task, TaskCreate, TaskUpdate
from src.persistence.repositories.task_repository import TaskRepository


class TaskService:
    """Service for task business logic operations."""

    def __init__(self, session: AsyncSession) -> None:
        """Initialize service with database session.

        Args:
            session: Async database session
        """
        self.session = session
        self.repo = TaskRepository(session)

    async def create_task(
        self,
        user_id: str,
        description: str,
        due_date: datetime | None = None,
        priority: int = 3,
    ) -> tuple[Task, ReminderInfo | None]:
        """Create a task and calculate its reminder schedule.

        Args:
            user_id: User's unique identifier
            description: Task description
            due_date: Optional due date
            priority: Priority level (1-5)

        Returns:
            Tuple of created Task and optional ReminderInfo
        """
        task_data = TaskCreate(
            description=description,
            due_date=due_date,
            priority=priority,
        )

        task = await self.repo.create(user_id, task_data)

        # Calculate reminder info if due date is set
        reminder_info = None
        if task.due_date:
            next_reminder = get_next_reminder_time(task.due_date)
            if next_reminder:
                reminder_info = ReminderInfo(
                    task_id=task.task_id,
                    user_id=user_id,
                    description=task.description,
                    due_date=task.due_date,
                    priority=task.priority,
                    next_reminder=next_reminder,
                )

        return task, reminder_info

    async def update_task(
        self,
        task_id: str,
        user_id: str,
        description: str | None = None,
        due_date: datetime | None = None,
        priority: int | None = None,
    ) -> tuple[Task | None, ReminderInfo | None]:
        """Update a task and recalculate its reminder schedule.

        Args:
            task_id: Task's unique identifier
            user_id: User's unique identifier
            description: New description (optional)
            due_date: New due date (optional)
            priority: New priority (optional)

        Returns:
            Tuple of updated Task (or None) and optional ReminderInfo
        """
        update_data = TaskUpdate(
            description=description,
            due_date=due_date,
            priority=priority,
        )

        task = await self.repo.update(task_id, user_id, update_data)

        if task is None:
            return None, None

        # Recalculate reminder info if due date exists
        reminder_info = None
        if task.due_date:
            next_reminder = get_next_reminder_time(task.due_date)
            if next_reminder:
                reminder_info = ReminderInfo(
                    task_id=task.task_id,
                    user_id=user_id,
                    description=task.description,
                    due_date=task.due_date,
                    priority=task.priority,
                    next_reminder=next_reminder,
                )

        return task, reminder_info

    async def complete_task(
        self,
        task_id: str,
        user_id: str,
    ) -> Task | None:
        """Complete a task (also cancels any pending reminders).

        Args:
            task_id: Task's unique identifier
            user_id: User's unique identifier

        Returns:
            Completed Task or None if not found
        """
        return await self.repo.complete(task_id, user_id)

    async def get_user_reminders(
        self,
        user_id: str,
    ) -> list[ReminderInfo]:
        """Get all pending reminders for a user.

        Args:
            user_id: User's unique identifier

        Returns:
            List of ReminderInfo objects
        """
        return await get_pending_reminders(self.session, user_id)

    async def get_task_reminder(
        self,
        task_id: str,
        user_id: str,
    ) -> ReminderInfo | None:
        """Get reminder info for a specific task.

        Args:
            task_id: Task's unique identifier
            user_id: User's unique identifier

        Returns:
            ReminderInfo or None if no reminder scheduled
        """
        task = await self.repo.get_by_id_and_user(task_id, user_id)

        if task is None or task.due_date is None or task.completed:
            return None

        next_reminder = get_next_reminder_time(task.due_date)
        if next_reminder is None:
            return None

        return ReminderInfo(
            task_id=task.task_id,
            user_id=user_id,
            description=task.description,
            due_date=task.due_date,
            priority=task.priority,
            next_reminder=next_reminder,
        )
