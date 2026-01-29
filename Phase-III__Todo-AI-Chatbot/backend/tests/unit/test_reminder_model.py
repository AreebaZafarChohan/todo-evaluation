"""Unit tests for Reminder SQLModel schema, relationships, and CRUD operations."""
import pytest
from datetime import datetime, timedelta
from uuid import uuid4

from sqlmodel import select

from src.persistence.models.reminder import Reminder
from src.persistence.models.task import Task
from src.persistence.models.user import User
from src.core.database import get_session


class TestReminderModel:
    """Test Reminder SQLModel schema definition and validation."""

    async def test_reminder_schema_fields(self):
        """Test that Reminder model has all required fields with correct types."""
        reminder = Reminder(
            task_id=str(uuid4()),
            user_id=str(uuid4()),
            next_trigger_at=datetime.now() + timedelta(hours=1),
            repeat_interval_minutes=60,
            active=True
        )

        # Verify all fields exist
        assert hasattr(reminder, "id")
        assert hasattr(reminder, "task_id")
        assert hasattr(reminder, "user_id")
        assert hasattr(reminder, "next_trigger_at")
        assert hasattr(reminder, "repeat_interval_minutes")
        assert hasattr(reminder, "active")
        assert hasattr(reminder, "created_at")
        assert hasattr(reminder, "updated_at")
        assert hasattr(reminder, "task")

        # Verify field types
        assert isinstance(reminder.id, str)
        assert isinstance(reminder.task_id, str)
        assert isinstance(reminder.user_id, str)
        assert reminder.next_trigger_at is None or isinstance(reminder.next_trigger_at, datetime)
        assert isinstance(reminder.repeat_interval_minutes, int)
        assert isinstance(reminder.active, bool)
        assert isinstance(reminder.created_at, datetime)
        assert isinstance(reminder.updated_at, datetime)

    async def test_reminder_default_values(self):
        """Test that Reminder model has correct default values."""
        task_id = str(uuid4())
        user_id = str(uuid4())

        reminder = Reminder(task_id=task_id, user_id=user_id)

        # Check defaults
        assert reminder.repeat_interval_minutes == 0
        assert reminder.active is True
        assert reminder.next_trigger_at is None

    async def test_reminder_repeat_interval_validation(self):
        """Test that Reminder model validates repeat_interval_minutes field."""
        task_id = str(uuid4())
        user_id = str(uuid4())

        # Valid intervals (non-negative)
        valid_intervals = [0, 15, 30, 60, 1440]  # 0, 15min, 30min, 1hr, 24hr
        for interval in valid_intervals:
            reminder = Reminder(
                task_id=task_id,
                user_id=user_id,
                repeat_interval_minutes=interval
            )
            assert reminder.repeat_interval_minutes == interval

        # Invalid negative interval should raise validation error
        with pytest.raises(ValueError):
            Reminder(task_id=task_id, user_id=user_id, repeat_interval_minutes=-1)

    async def test_reminder_timing_edge_cases(self):
        """Test Reminder with various timing edge cases for next_trigger_at."""
        task_id = str(uuid4())
        user_id = str(uuid4())
        now = datetime.now()

        # Past date
        past_time = now - timedelta(days=1)
        reminder = Reminder(
            task_id=task_id,
            user_id=user_id,
            next_trigger_at=past_time
        )
        assert reminder.next_trigger_at == past_time

        # Future date (far future)
        future_time = now + timedelta(days=365)
        reminder = Reminder(
            task_id=task_id,
            user_id=user_id,
            next_trigger_at=future_time
        )
        assert reminder.next_trigger_at == future_time

        # Exact same time with millisecond precision
        exact_time = now
        reminder = Reminder(
            task_id=task_id,
            user_id=user_id,
            next_trigger_at=exact_time
        )
        assert reminder.next_trigger_at == exact_time

    @pytest.mark.asyncio
    async def test_reminder_crud_operations(self):
        """Test basic CRUD operations for Reminder model."""
        user_id = str(uuid4())
        task_id = str(uuid4())
        next_trigger = datetime.now() + timedelta(hours=2)
        repeat_interval = 30

        # Create reminder
        async with get_session() as session:
            reminder = Reminder(
                task_id=task_id,
                user_id=user_id,
                next_trigger_at=next_trigger,
                repeat_interval_minutes=repeat_interval,
                active=True
            )
            session.add(reminder)
            await session.commit()
            await session.refresh(reminder)

            assert reminder.id is not None
            assert reminder.task_id == task_id
            assert reminder.user_id == user_id
            assert reminder.next_trigger_at == next_trigger
            assert reminder.repeat_interval_minutes == repeat_interval
            assert reminder.active is True

            reminder_id = reminder.id

        # Read reminder
        async with get_session() as session:
            result = await session.execute(
                select(Reminder).where(Reminder.id == reminder_id)
            )
            retrieved_reminder = result.scalar_one()

            assert retrieved_reminder.id == reminder_id
            assert retrieved_reminder.task_id == task_id
            assert retrieved_reminder.next_trigger_at == next_trigger

        # Update reminder
        new_trigger_time = datetime.now() + timedelta(days=1)
        async with get_session() as session:
            result = await session.execute(
                select(Reminder).where(Reminder.id == reminder_id)
            )
            reminder = result.scalar_one()

            reminder.next_trigger_at = new_trigger_time
            reminder.active = False
            reminder.repeat_interval_minutes = 60
            await session.commit()
            await session.refresh(reminder)

            assert reminder.next_trigger_at == new_trigger_time
            assert reminder.active is False
            assert reminder.repeat_interval_minutes == 60

        # Verify update
        async with get_session() as session:
            result = await session.execute(
                select(Reminder).where(Reminder.id == reminder_id)
            )
            updated_reminder = result.scalar_one()

            assert updated_reminder.next_trigger_at == new_trigger_time
            assert updated_reminder.active is False

    @pytest.mark.asyncio
    async def test_reminder_task_relationship(self):
        """Test Reminder relationship with Task."""
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
            await session.flush()

            # Create task
            task = Task(user_id=user_id, title="Task with reminders")
            session.add(task)
            await session.flush()
            task_id = task.id

            # Create multiple reminders for task
            now = datetime.now()
            reminder1 = Reminder(
                task_id=task_id,
                user_id=user_id,
                next_trigger_at=now + timedelta(hours=1),
                repeat_interval_minutes=60
            )
            reminder2 = Reminder(
                task_id=task_id,
                user_id=user_id,
                next_trigger_at=now + timedelta(days=1),
                repeat_interval_minutes=1440  # 24 hours
            )
            reminder3 = Reminder(
                task_id=task_id,
                user_id=user_id,
                next_trigger_at=None,  # No specific time (e.g., immediate)
                repeat_interval_minutes=0
            )

            session.add(reminder1)
            session.add(reminder2)
            session.add(reminder3)
            await session.commit()

            # Query reminders by task
            result = await session.execute(
                select(Reminder).where(Reminder.task_id == task_id)
            )
            reminders = result.scalars().all()

            assert len(reminders) == 3

            # Verify all reminders have correct task_id
            for reminder in reminders:
                assert reminder.task_id == task_id

    @pytest.mark.asyncio
    async def test_reminder_cascade_delete_behavior(self):
        """Test that deleting a task cascades to its reminders."""
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
            await session.flush()

            # Create task with reminders
            task = Task(user_id=user_id, title="Task to be deleted")
            session.add(task)
            await session.flush()
            task_id = task.id

            # Create reminders
            for i in range(3):
                reminder = Reminder(
                    task_id=task_id,
                    user_id=user_id,
                    next_trigger_at=datetime.now() + timedelta(hours=i+1),
                    repeat_interval_minutes=60
                )
                session.add(reminder)

            await session.commit()

            # Verify reminders exist
            result = await session.execute(
                select(Reminder).where(Reminder.task_id == task_id)
            )
            reminders_before_delete = result.scalars().all()
            assert len(reminders_before_delete) == 3

            # Delete task
            await session.delete(task)
            await session.commit()

            # Verify reminders are also deleted (cascade)
            result = await session.execute(
                select(Reminder).where(Reminder.task_id == task_id)
            )
            reminders_after_delete = result.scalars().all()
            assert len(reminders_after_delete) == 0

    @pytest.mark.asyncio
    async def test_reminder_query_by_next_trigger_time(self):
        """Test querying reminders based on next trigger time for scheduling."""
        async with get_session() as session:
            # Create user and tasks
            user_id = str(uuid4())
            user = User(
                id=user_id,
                email=f"test-{user_id}@example.com",
                name="Test User",
                hashed_password="fake_hash"
            )
            session.add(user)
            await session.flush()

            now = datetime.now()

            # Create tasks with different reminder times
            task1 = Task(user_id=user_id, title="Task 1")
            task2 = Task(user_id=user_id, title="Task 2")
            task3 = Task(user_id=user_id, title="Task 3", due_date=now + timedelta(hours=24))
            session.add(task1)
            session.add(task2)
            session.add(task3)
            await session.flush()

            # Create reminders with different trigger times
            past_reminder = Reminder(
                task_id=task1.id,
                user_id=user_id,
                next_trigger_at=now - timedelta(hours=1),  # Past due
                active=True
            )

            future_reminder = Reminder(
                task_id=task2.id,
                user_id=user_id,
                next_trigger_at=now + timedelta(hours=6),  # 6 hours from now
                active=True
            )

            null_reminder = Reminder(
                task_id=task3.id,
                user_id=user_id,
                next_trigger_at=None,  # No specific trigger time
                active=True
            )

            inactive_reminder = Reminder(
                task_id=task3.id,
                user_id=user_id,
                next_trigger_at=now + timedelta(hours=2),
                active=False  # Inactive - should not trigger
            )

            session.add(past_reminder)
            session.add(future_reminder)
            session.add(null_reminder)
            session.add(inactive_reminder)
            await session.commit()

            # Query active reminders that should trigger in the next 12 hours
            cutoff_time = now + timedelta(hours=12)
            result = await session.execute(
                select(Reminder).where(
                    Reminder.active == True,
                    Reminder.next_trigger_at != None,
                    Reminder.next_trigger_at <= cutoff_time
                )
            )
            upcoming_reminders = result.scalars().all()

            # Should include future_reminder but not past (already passed) or inactive
            assert len([r for r in upcoming_reminders if r.id == future_reminder.id]) == 1
            assert len([r for r in upcoming_reminders if r.id == inactive_reminder.id]) == 0

    @pytest.mark.asyncio
    async def test_reminder_user_denormalization(self):
        """Test that user_id is properly denormalized for efficient queries."""
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
            await session.flush()

            # Create multiple tasks
            task1 = Task(user_id=user_id, title="Task 1")
            task2 = Task(user_id=user_id, title="Task 2")
            session.add(task1)
            session.add(task2)
            await session.flush()

            # Create reminders with same user_id (denormalized)
            reminder1 = Reminder(
                task_id=task1.id,
                user_id=user_id,
                next_trigger_at=datetime.now() + timedelta(hours=1)
            )
            reminder2 = Reminder(
                task_id=task2.id,
                user_id=user_id,  # Same user
                next_trigger_at=datetime.now() + timedelta(hours=2)
            )
            session.add(reminder1)
            session.add(reminder2)
            await session.commit()

            # Query all reminders for user efficiently (no join needed)
            result = await session.execute(
                select(Reminder).where(Reminder.user_id == user_id)
            )
            user_reminders = result.scalars().all()

            assert len(user_reminders) == 2
            for reminder in user_reminders:
                assert reminder.user_id == user_id
