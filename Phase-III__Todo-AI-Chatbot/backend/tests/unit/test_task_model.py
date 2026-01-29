"""Unit tests for Task SQLModel schema and CRUD operations."""
import pytest
from datetime import datetime, timedelta
from uuid import uuid4

from sqlmodel import select

from src.persistence.models.task import Task
from src.persistence.models.user import User
from src.core.database import get_session


class TestTaskModel:
    """Test Task SQLModel schema definition and validation."""

    async def test_task_schema_fields(self):
        """Test that Task model has all required fields with correct types."""
        task = Task(
            user_id=str(uuid4()),
            title="Test Task",
            description="Test description",
            completed=False,
            priority=3,
            due_date=datetime.now() + timedelta(days=1)
        )

        # Verify all fields exist
        assert hasattr(task, "id")
        assert hasattr(task, "user_id")
        assert hasattr(task, "title")
        assert hasattr(task, "description")
        assert hasattr(task, "completed")
        assert hasattr(task, "created_at")
        assert hasattr(task, "updated_at")
        assert hasattr(task, "due_date")
        assert hasattr(task, "priority")

        # Verify field types
        assert isinstance(task.id, str)
        assert isinstance(task.user_id, str)
        assert isinstance(task.title, str)
        assert task.description is None or isinstance(task.description, str)
        assert isinstance(task.completed, bool)
        assert isinstance(task.created_at, datetime)
        assert isinstance(task.updated_at, datetime)
        assert task.due_date is None or isinstance(task.due_date, datetime)
        assert isinstance(task.priority, int)

    async def test_task_default_values(self):
        """Test that Task model has correct default values."""
        user_id = str(uuid4())
        task = Task(user_id=user_id, title="Test Task")

        # Check defaults
        assert task.completed is False
        assert task.priority == 3
        assert task.description is None
        assert task.due_date is None

    async def test_task_priority_validation(self):
        """Test that Task model validates priority field (1-5 range)."""
        user_id = str(uuid4())

        # Valid priorities
        valid_priorities = [1, 2, 3, 4, 5]
        for priority in valid_priorities:
            task = Task(user_id=user_id, title="Test", priority=priority)
            assert task.priority == priority

        # Invalid priorities should raise validation error
        with pytest.raises(ValueError):
            Task(user_id=user_id, title="Test", priority=0)

        with pytest.raises(ValueError):
            Task(user_id=user_id, title="Test", priority=6)

    async def test_task_title_validation(self):
        """Test that Task model validates title field (min/max length)."""
        user_id = str(uuid4())

        # Valid title
        task = Task(user_id=user_id, title="Valid Title")
        assert task.title == "Valid Title"

        # Empty title should fail
        with pytest.raises(ValueError):
            Task(user_id=user_id, title="")

    @pytest.mark.asyncio
    async def test_task_crud_operations(self):
        """Test basic CRUD operations for Task model."""
        user_id = str(uuid4())
        task_title = "Test Task CRUD"
        task_description = "Test description for CRUD"

        # Create task
        async with get_session() as session:
            task = Task(
                user_id=user_id,
                title=task_title,
                description=task_description,
                priority=2,
                due_date=datetime.now() + timedelta(days=2)
            )
            session.add(task)
            await session.commit()
            await session.refresh(task)

            assert task.id is not None
            assert task.title == task_title
            assert task.priority == 2

            task_id = task.id

        # Read task
        async with get_session() as session:
            result = await session.execute(select(Task).where(Task.id == task_id))
            retrieved_task = result.scalar_one()

            assert retrieved_task.id == task_id
            assert retrieved_task.title == task_title
            assert retrieved_task.description == task_description

        # Update task
        async with get_session() as session:
            result = await session.execute(select(Task).where(Task.id == task_id))
            task = result.scalar_one()

            task.title = "Updated Title"
            task.priority = 5
            task.completed = True
            await session.commit()
            await session.refresh(task)

            assert task.title == "Updated Title"
            assert task.priority == 5
            assert task.completed is True

        # Verify update
        async with get_session() as session:
            result = await session.execute(select(Task).where(Task.id == task_id))
            updated_task = result.scalar_one()

            assert updated_task.title == "Updated Title"
            assert updated_task.completed is True

    @pytest.mark.asyncio
    async def test_task_user_relationship(self):
        """Test Task relationship with User."""
        async with get_session() as session:
            # Create user
            user_id = str(uuid4())
            user = User(
                id=user_id,
                email=f"test-{user_id}@example.com",
                name="Test User",
                hashed_password="fake_hash"
            )
            session.add(user)
            await session.commit()

            # Create tasks for user
            task1 = Task(user_id=user_id, title="Task 1", priority=1)
            task2 = Task(user_id=user_id, title="Task 2", priority=2)
            session.add(task1)
            session.add(task2)
            await session.commit()

            # Query tasks by user
            result = await session.execute(
                select(Task).where(Task.user_id == user_id).order_by(Task.priority)
            )
            tasks = result.scalars().all()

            assert len(tasks) == 2
            assert tasks[0].title == "Task 1"
            assert tasks[1].title == "Task 2"
