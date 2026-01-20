"""Task service functions for CRUD operations in the Todo application."""
from typing import List, Optional
from sqlmodel import Session, select
from src.models.task import Task
from datetime import datetime


def create_task_for_user(*, session: Session, user_id: str, task: Task) -> Task:
    """
    Create a new task for a specific user.
    
    Args:
        session: Database session
        user_id: The ID of the user creating the task
        task: Task object with title, description, and completed status
    
    Returns:
        Created Task object
    """
    db_task = Task(
        user_id=user_id,
        title=task.title,
        description=task.description,
        completed=task.completed if task.completed is not None else False,
        created_at=datetime.now(),
        updated_at=datetime.now()
    )
    session.add(db_task)
    session.commit()
    session.refresh(db_task)
    return db_task


def get_tasks_by_user(*, session: Session, user_id: str, skip: int = 0, limit: int = 100) -> List[Task]:
    """
    Retrieve all tasks for a specific user.
    
    Args:
        session: Database session
        user_id: The ID of the user whose tasks to retrieve
        skip: Number of records to skip (for pagination)
        limit: Maximum number of records to return (for pagination)
    
    Returns:
        List of Task objects
    """
    statement = select(Task).where(Task.user_id == user_id).offset(skip).limit(limit)
    tasks = session.exec(statement).all()
    return tasks


def get_task_by_id(*, session: Session, user_id: str, task_id: str) -> Optional[Task]:
    """
    Retrieve a specific task by its ID for a specific user.

    Args:
        session: Database session
        user_id: The ID of the user who owns the task
        task_id: The ID of the task to retrieve

    Returns:
        Task object if found and owned by the user, None otherwise
    """
    statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
    task = session.exec(statement).first()
    return task


def update_task(*, session: Session, user_id: str, task_id: str, task_data: dict) -> Optional[Task]:
    """
    Update a task's information.

    Args:
        session: Database session
        user_id: The ID of the user who owns the task
        task_id: The ID of the task to update
        task_data: Dictionary containing fields to update

    Returns:
        Updated Task object if found and owned by the user, None otherwise
    """
    db_task = get_task_by_id(session=session, user_id=user_id, task_id=task_id)
    if not db_task:
        return None

    # Update fields
    for field, value in task_data.items():
        if hasattr(db_task, field) and field != 'id' and field != 'user_id':  # Don't allow changing ID or user_id
            setattr(db_task, field, value)

    # Update the updated_at timestamp
    db_task.updated_at = datetime.now()

    session.add(db_task)
    session.commit()
    session.refresh(db_task)
    return db_task


def delete_task(*, session: Session, user_id: str, task_id: str) -> bool:
    """
    Delete a task from the database.

    Args:
        session: Database session
        user_id: The ID of the user who owns the task
        task_id: The ID of the task to delete

    Returns:
        True if task was deleted, False if task was not found or not owned by user
    """
    db_task = get_task_by_id(session=session, user_id=user_id, task_id=task_id)
    if not db_task:
        return False

    session.delete(db_task)
    session.commit()
    return True


def complete_task(*, session: Session, user_id: str, task_id: str) -> Optional[Task]:
    """
    Mark a task as completed.

    Args:
        session: Database session
        user_id: The ID of the user who owns the task
        task_id: The ID of the task to mark as completed

    Returns:
        Updated Task object if found and owned by the user, None otherwise
    """
    db_task = get_task_by_id(session=session, user_id=user_id, task_id=task_id)
    if not db_task:
        return None

    db_task.completed = True
    db_task.updated_at = datetime.now()

    session.add(db_task)
    session.commit()
    session.refresh(db_task)
    return db_task


def get_tasks_by_status(*, session: Session, user_id: str, completed: bool, skip: int = 0, limit: int = 100) -> List[Task]:
    """
    Retrieve tasks for a specific user filtered by completion status.
    
    Args:
        session: Database session
        user_id: The ID of the user whose tasks to retrieve
        completed: Boolean indicating whether to return completed or incomplete tasks
        skip: Number of records to skip (for pagination)
        limit: Maximum number of records to return (for pagination)
    
    Returns:
        List of Task objects
    """
    statement = select(Task).where(Task.user_id == user_id, Task.completed == completed).offset(skip).limit(limit)
    tasks = session.exec(statement).all()
    return tasks