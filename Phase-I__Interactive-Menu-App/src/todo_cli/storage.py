"""In-memory storage for tasks - Task-ID: T009, T010"""

from typing import Optional
from .models import Task

# Task-ID: T009 - In-memory storage variables
_tasks: dict[int, Task] = {}
_next_id: int = 1


def add_task(task: Task) -> Task:
    """
    Add a new task to storage.
    Task-ID: T010

    Args:
        task: Task to add

    Returns:
        The added task with assigned ID
    """
    global _next_id
    task.id = _next_id
    _tasks[_next_id] = task
    _next_id += 1
    return task


def get_task(task_id: int) -> Optional[Task]:
    """
    Get a task by ID.
    Task-ID: T010

    Args:
        task_id: The ID of the task to retrieve

    Returns:
        The task if found, None otherwise
    """
    return _tasks.get(task_id)


def get_all_tasks() -> list[Task]:
    """
    Get all tasks from storage.
    Task-ID: T010

    Returns:
        List of all tasks, sorted by ID
    """
    return sorted(_tasks.values(), key=lambda t: t.id)


def update_task(task: Task) -> Task:
    """
    Update an existing task in storage.
    Task-ID: T010

    Args:
        task: The task to update (must have a valid ID)

    Returns:
        The updated task
    """
    _tasks[task.id] = task
    return task


def delete_task(task_id: int) -> bool:
    """
    Delete a task from storage.
    Task-ID: T010

    Args:
        task_id: The ID of the task to delete

    Returns:
        True if task was deleted, False if task did not exist
    """
    if task_id in _tasks:
        del _tasks[task_id]
        return True
    return False
