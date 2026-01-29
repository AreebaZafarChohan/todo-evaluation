"""MCP task management tools for the AI agent - Compatible with Phase 2 schema.

This module defines and registers all MCP tools that the AI agent
can use to manage tasks. Each tool is stateless and operates
through the database via repositories.
"""
import json
from datetime import datetime
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from src.core.mcp import tool_registry
from src.persistence.models.task import TaskCreate, TaskUpdate
from src.persistence.repositories.task_repository import TaskRepository


# Session provider will be set during app startup
_session_provider: Any = None


def set_session_provider(provider: Any) -> None:
    """Set the database session provider for MCP tools.

    Args:
        provider: Async session maker that yields AsyncSession
    """
    global _session_provider
    _session_provider = provider


def get_session() -> AsyncSession:
    """Get a database session for tool execution."""
    if _session_provider is None:
        raise RuntimeError("Session provider not configured")
    return _session_provider()


# Tool input schemas - compatible with Phase 2 field names
ADD_TASK_SCHEMA = {
    "type": "object",
    "properties": {
        "user_id": {"type": "string", "description": "ID of the user creating the task"},
        "title": {"type": "string", "description": "Task title (main description)"},
        "description": {"type": "string", "description": "Optional detailed description"},
        "due_date": {
            "type": "string",
            "format": "date-time",
            "description": "Optional due date in ISO 8601 format",
        },
        "priority": {
            "type": "integer",
            "minimum": 1,
            "maximum": 5,
            "description": "Priority level (1=lowest, 5=highest)",
        },
    },
    "required": ["user_id", "title"],
}

LIST_TASKS_SCHEMA = {
    "type": "object",
    "properties": {
        "user_id": {"type": "string", "description": "ID of the user whose tasks to list"},
        "completed": {
            "type": "boolean",
            "description": "Filter by completion status (optional)",
        },
    },
    "required": ["user_id"],
}

UPDATE_TASK_SCHEMA = {
    "type": "object",
    "properties": {
        "user_id": {"type": "string", "description": "ID of the user who owns the task"},
        "task_id": {"type": "string", "description": "ID of the task to update"},
        "title": {"type": "string", "description": "New task title"},
        "description": {"type": "string", "description": "New description"},
        "due_date": {
            "type": "string",
            "format": "date-time",
            "description": "New due date in ISO 8601 format",
        },
        "priority": {
            "type": "integer",
            "minimum": 1,
            "maximum": 5,
            "description": "New priority level",
        },
    },
    "required": ["user_id", "task_id"],
}

COMPLETE_TASK_SCHEMA = {
    "type": "object",
    "properties": {
        "user_id": {"type": "string", "description": "ID of the user who owns the task"},
        "task_id": {"type": "string", "description": "ID of the task to complete"},
    },
    "required": ["user_id", "task_id"],
}

DELETE_TASK_SCHEMA = {
    "type": "object",
    "properties": {
        "user_id": {"type": "string", "description": "ID of the user who owns the task"},
        "task_id": {"type": "string", "description": "ID of the task to delete"},
    },
    "required": ["user_id", "task_id"],
}


def _parse_due_date(due_date_str: str | None) -> datetime | None:
    """Parse ISO 8601 date string to datetime.

    Args:
        due_date_str: ISO 8601 formatted date string

    Returns:
        Parsed datetime or None
    """
    if not due_date_str:
        return None
    try:
        return datetime.fromisoformat(due_date_str.replace("Z", "+00:00"))
    except ValueError:
        return None


def _format_task(task: Any) -> dict:
    """Format a task for JSON response - uses Phase 2 field names.

    Args:
        task: Task model instance

    Returns:
        Dictionary representation of task
    """
    # Safe attribute access with defaults
    return {
        "id": getattr(task, "id", None),  # Phase 2 uses 'id' not 'task_id'
        "title": getattr(task, "title", ""),  # Phase 2 uses 'title'
        "description": getattr(task, "description", None),
        "completed": getattr(task, "completed", False),
        "priority": getattr(task, "priority", 3),
        "due_date": task.due_date.isoformat() if task.due_date else None,
        "created_at": task.created_at.isoformat() if task.created_at else None,
    }


# Full tool implementations
async def add_task(
    user_id: str,
    title: str,
    description: str | None = None,
    due_date: str | None = None,
    priority: int = 3,
) -> str:
    """Add a new task for the user.

    Args:
        user_id: ID of the user creating the task
        title: Task title
        description: Optional detailed description
        due_date: Optional due date in ISO 8601 format
        priority: Priority level (1-5, default 3)

    Returns:
        JSON string with created task details or error message
    """
    async with get_session() as session:
        repo = TaskRepository(session)

        parsed_due_date = _parse_due_date(due_date)
        task_data = TaskCreate(
            title=title,
            description=description,
            due_date=parsed_due_date,
            priority=max(1, min(5, priority)),
        )

        task = await repo.create(user_id, task_data)
        await session.commit()

        return json.dumps({
            "success": True,
            "message": f"Task created successfully",
            "task": _format_task(task),
        })


async def list_tasks(
    user_id: str,
    completed: bool | None = None,
) -> str:
    """List all tasks for a user.

    Args:
        user_id: ID of the user whose tasks to list
        completed: Optional filter by completion status

    Returns:
        JSON string with list of tasks
    """
    async with get_session() as session:
        repo = TaskRepository(session)
        tasks = await repo.get_by_user_id(user_id, completed)

        task_list = [_format_task(t) for t in tasks]

        if not task_list:
            status_msg = ""
            if completed is True:
                status_msg = " completed"
            elif completed is False:
                status_msg = " pending"
            return json.dumps({
                "success": True,
                "message": f"No{status_msg} tasks found",
                "tasks": [],
            })

        return json.dumps({
            "success": True,
            "message": f"Found {len(task_list)} task(s)",
            "tasks": task_list,
        })


async def update_task(
    user_id: str,
    task_id: str,
    title: str | None = None,
    description: str | None = None,
    due_date: str | None = None,
    priority: int | None = None,
) -> str:
    """Update an existing task.

    Args:
        user_id: ID of the user who owns the task
        task_id: ID of the task to update
        title: New task title (optional)
        description: New description (optional)
        due_date: New due date in ISO 8601 format (optional)
        priority: New priority level (optional)

    Returns:
        JSON string with updated task details or error message
    """
    async with get_session() as session:
        repo = TaskRepository(session)

        # Build update data
        update_data = TaskUpdate()
        if title is not None:
            update_data.title = title
        if description is not None:
            update_data.description = description
        if due_date is not None:
            update_data.due_date = _parse_due_date(due_date)
        if priority is not None:
            update_data.priority = max(1, min(5, priority))

        task = await repo.update(task_id, user_id, update_data)
        await session.commit()

        if task is None:
            return json.dumps({
                "success": False,
                "error": f"Task with ID '{task_id}' not found or access denied",
            })

        return json.dumps({
            "success": True,
            "message": "Task updated successfully",
            "task": _format_task(task),
        })


async def complete_task(
    user_id: str,
    task_id: str,
) -> str:
    """Mark a task as completed.

    Args:
        user_id: ID of the user who owns the task
        task_id: ID of the task to complete

    Returns:
        JSON string with completion status
    """
    async with get_session() as session:
        repo = TaskRepository(session)
        task = await repo.complete(task_id, user_id)
        await session.commit()

        if task is None:
            return json.dumps({
                "success": False,
                "error": f"Task with ID '{task_id}' not found or access denied",
            })

        return json.dumps({
            "success": True,
            "message": f"Task '{task.title}' marked as completed",
            "task": _format_task(task),
        })


async def delete_task(
    user_id: str,
    task_id: str,
) -> str:
    """Delete a task permanently.

    Args:
        user_id: ID of the user who owns the task
        task_id: ID of the task to delete

    Returns:
        JSON string with deletion status
    """
    async with get_session() as session:
        repo = TaskRepository(session)

        # Get task first for confirmation message
        task = await repo.get_by_id_and_user(task_id, user_id)
        if task is None:
            return json.dumps({
                "success": False,
                "error": f"Task with ID '{task_id}' not found or access denied",
            })

        task_title = task.title
        deleted = await repo.delete(task_id, user_id)
        await session.commit()

        return json.dumps({
            "success": True,
            "message": f"Task '{task_title}' deleted successfully",
        })


def register_mcp_tools() -> None:
    """Register all MCP tools with full implementations.

    Call this during app startup to make tools available to the agent.
    """
    tool_registry.register_tool(
        name="add_task",
        description="Add a new task for the user. Requires user_id and title. Optionally accepts description, due_date (ISO 8601) and priority (1-5, default 3).",
        input_schema=ADD_TASK_SCHEMA,
        handler=add_task,
    )

    tool_registry.register_tool(
        name="list_tasks",
        description="List all tasks for a user. Can filter by completion status (true=completed, false=pending).",
        input_schema=LIST_TASKS_SCHEMA,
        handler=list_tasks,
    )

    tool_registry.register_tool(
        name="update_task",
        description="Update an existing task. Can modify title, description, due_date (ISO 8601), or priority (1-5).",
        input_schema=UPDATE_TASK_SCHEMA,
        handler=update_task,
    )

    tool_registry.register_tool(
        name="complete_task",
        description="Mark a task as completed.",
        input_schema=COMPLETE_TASK_SCHEMA,
        handler=complete_task,
    )

    tool_registry.register_tool(
        name="delete_task",
        description="Delete a task permanently. This action cannot be undone.",
        input_schema=DELETE_TASK_SCHEMA,
        handler=delete_task,
    )


# Keep placeholder registration for backwards compatibility
def register_placeholder_tools() -> None:
    """Register MCP tools (full implementations)."""
    register_mcp_tools()
