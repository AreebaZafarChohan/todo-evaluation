"""Task repository for database operations - Compatible with Phase 2."""
from datetime import datetime

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from src.persistence.models.task import Task, TaskCreate, TaskUpdate


class TaskRepository:
    """Repository for Task entity database operations.

    Uses Phase 2's existing 'task' table with Phase 3 additions.
    """

    def __init__(self, session: AsyncSession) -> None:
        """Initialize repository with database session.

        Args:
            session: Async database session
        """
        self.session = session

    async def get_by_id(self, task_id: str) -> Task | None:
        """Get a task by its ID.

        Args:
            task_id: Task's unique identifier

        Returns:
            Task if found, None otherwise
        """
        result = await self.session.execute(
            select(Task).where(Task.id == task_id)
        )
        return result.scalar_one_or_none()

    async def get_by_id_and_user(self, task_id: str, user_id: str) -> Task | None:
        """Get a task by ID ensuring it belongs to the specified user.

        Args:
            task_id: Task's unique identifier
            user_id: User's unique identifier

        Returns:
            Task if found and belongs to user, None otherwise
        """
        result = await self.session.execute(
            select(Task).where(
                Task.id == task_id,
                Task.user_id == user_id,
            )
        )
        return result.scalar_one_or_none()

    async def get_by_user_id(
        self,
        user_id: str,
        completed: bool | None = None,
    ) -> list[Task]:
        """Get all tasks for a user.

        Args:
            user_id: User's unique identifier
            completed: Optional filter by completion status

        Returns:
            List of tasks for the user
        """
        query = select(Task).where(Task.user_id == user_id)

        if completed is not None:
            query = query.where(Task.completed == completed)

        query = query.order_by(Task.priority.desc(), Task.created_at.desc())

        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def get_pending_with_due_date(self, user_id: str) -> list[Task]:
        """Get all pending tasks with due dates for a user.

        Args:
            user_id: User's unique identifier

        Returns:
            List of pending tasks with due dates
        """
        result = await self.session.execute(
            select(Task).where(
                Task.user_id == user_id,
                Task.completed == False,  # noqa: E712
                Task.due_date.isnot(None),
            ).order_by(Task.due_date.asc())
        )
        return list(result.scalars().all())

    async def create(self, user_id: str, task_data: TaskCreate) -> Task:
        """Create a new task for a user.

        Args:
            user_id: User's unique identifier
            task_data: Task creation data

        Returns:
            Created Task entity
        """
        task = Task(user_id=user_id, **task_data.model_dump())
        self.session.add(task)
        await self.session.flush()
        await self.session.refresh(task)
        return task

    async def update(self, task_id: str, user_id: str, task_data: TaskUpdate) -> Task | None:
        """Update an existing task.

        Args:
            task_id: Task's unique identifier
            user_id: User's unique identifier (for authorization)
            task_data: Task update data

        Returns:
            Updated Task if found, None otherwise
        """
        task = await self.get_by_id_and_user(task_id, user_id)
        if task is None:
            return None

        update_dict = task_data.model_dump(exclude_unset=True)
        for key, value in update_dict.items():
            setattr(task, key, value)

        task.updated_at = datetime.now()
        self.session.add(task)
        await self.session.flush()
        await self.session.refresh(task)
        return task

    async def complete(self, task_id: str, user_id: str) -> Task | None:
        """Mark a task as completed.

        Args:
            task_id: Task's unique identifier
            user_id: User's unique identifier (for authorization)

        Returns:
            Updated Task if found, None otherwise
        """
        return await self.update(task_id, user_id, TaskUpdate(completed=True))

    async def delete(self, task_id: str, user_id: str) -> bool:
        """Delete a task.

        Args:
            task_id: Task's unique identifier
            user_id: User's unique identifier (for authorization)

        Returns:
            True if deleted, False if not found
        """
        task = await self.get_by_id_and_user(task_id, user_id)
        if task is None:
            return False

        await self.session.delete(task)
        return True

    async def search_by_title(
        self,
        user_id: str,
        search_term: str,
    ) -> list[Task]:
        """Search tasks by title.

        Args:
            user_id: User's unique identifier
            search_term: Text to search for in titles

        Returns:
            List of matching tasks
        """
        result = await self.session.execute(
            select(Task).where(
                Task.user_id == user_id,
                Task.title.ilike(f"%{search_term}%"),
            ).order_by(Task.created_at.desc())
        )
        return list(result.scalars().all())
