"""Unit tests for MCP task management tools - Compatible with Phase 2 schema."""
import json
from datetime import datetime, timedelta
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from src.integration.mcp_tools import (
    add_task,
    list_tasks,
    update_task,
    complete_task,
    delete_task,
    _parse_due_date,
    _format_task,
)


class TestParseDueDate:
    """Tests for _parse_due_date helper function."""

    def test_parse_valid_date(self):
        """Test parsing a valid ISO 8601 date."""
        result = _parse_due_date("2026-01-30T10:00:00")
        assert result is not None
        assert result.year == 2026
        assert result.month == 1
        assert result.day == 30

    def test_parse_date_with_z_suffix(self):
        """Test parsing a date with Z (UTC) suffix."""
        result = _parse_due_date("2026-01-30T10:00:00Z")
        assert result is not None

    def test_parse_none(self):
        """Test parsing None returns None."""
        result = _parse_due_date(None)
        assert result is None

    def test_parse_empty_string(self):
        """Test parsing empty string returns None."""
        result = _parse_due_date("")
        assert result is None

    def test_parse_invalid_date(self):
        """Test parsing invalid date returns None."""
        result = _parse_due_date("not-a-date")
        assert result is None


class TestFormatTask:
    """Tests for _format_task helper function."""

    def test_format_task_with_due_date(self):
        """Test formatting a task with a due date."""
        task = MagicMock()
        task.id = "task-123"  # Phase 2 uses 'id' not 'task_id'
        task.title = "Test task"  # Phase 2 uses 'title' not 'description'
        task.description = "Details about task"  # Also set description
        task.completed = False
        task.priority = 3
        task.due_date = datetime(2026, 1, 30, 10, 0, 0)
        task.created_at = datetime(2026, 1, 26, 10, 0, 0)

        result = _format_task(task)

        assert result["id"] == "task-123"
        assert result["title"] == "Test task"
        assert result["description"] == "Details about task"
        assert result["completed"] is False
        assert result["priority"] == 3
        assert result["due_date"] is not None

    def test_format_task_without_due_date(self):
        """Test formatting a task without a due date."""
        task = MagicMock()
        task.id = "task-456"
        task.title = "Another task"
        task.description = None
        task.completed = True
        task.priority = 5
        task.due_date = None
        task.created_at = datetime(2026, 1, 26, 10, 0, 0)

        result = _format_task(task)

        assert result["id"] == "task-456"
        assert result["due_date"] is None
        assert result["description"] is None


class TestAddTask:
    """Tests for add_task tool."""

    @pytest.mark.asyncio
    async def test_add_task_success(self):
        """Test successful task creation."""
        mock_task = MagicMock()
        mock_task.id = "new-task-123"  # Phase 2 uses 'id'
        mock_task.title = "Buy groceries"  # Phase 2 uses 'title'
        mock_task.description = "Task details"
        mock_task.completed = False
        mock_task.priority = 3
        mock_task.due_date = None
        mock_task.created_at = datetime.now()

        mock_repo = AsyncMock()
        mock_repo.create.return_value = mock_task

        mock_session = AsyncMock()
        mock_session.__aenter__.return_value = mock_session
        mock_session.__aexit__.return_value = None

        with patch("src.integration.mcp_tools.get_session", return_value=mock_session):
            with patch("src.integration.mcp_tools.TaskRepository", return_value=mock_repo):
                # Note: Phase 2 uses title as required param
                result = await add_task("user-123", "Buy groceries")

        result_data = json.loads(result)
        assert result_data["success"] is True
        assert result_data["task"]["title"] == "Buy groceries"
        assert result_data["task"]["id"] == "new-task-123"

    @pytest.mark.asyncio
    async def test_add_task_with_priority(self):
        """Test task creation with custom priority."""
        mock_task = MagicMock()
        mock_task.id = "new-task-456"
        mock_task.title = "Urgent task"
        mock_task.description = "Important"
        mock_task.completed = False
        mock_task.priority = 5
        mock_task.due_date = None
        mock_task.created_at = datetime.now()

        mock_repo = AsyncMock()
        mock_repo.create.return_value = mock_task

        mock_session = AsyncMock()
        mock_session.__aenter__.return_value = mock_session
        mock_session.__aexit__.return_value = None

        with patch("src.integration.mcp_tools.get_session", return_value=mock_session):
            with patch("src.integration.mcp_tools.TaskRepository", return_value=mock_repo):
                result = await add_task("user-123", "Urgent task", priority=5)

        result_data = json.loads(result)
        assert result_data["success"] is True
        assert result_data["task"]["priority"] == 5


class TestListTasks:
    """Tests for list_tasks tool."""

    @pytest.mark.asyncio
    async def test_list_tasks_with_results(self):
        """Test listing tasks that exist."""
        mock_task1 = MagicMock()
        mock_task1.id = "task-1"  # Phase 2 uses 'id'
        mock_task1.title = "Task 1"  # Phase 2 uses 'title'
        mock_task1.description = "Details"
        mock_task1.completed = False
        mock_task1.priority = 3
        mock_task1.due_date = None
        mock_task1.created_at = datetime.now()

        mock_repo = AsyncMock()
        mock_repo.get_by_user_id.return_value = [mock_task1]

        mock_session = AsyncMock()
        mock_session.__aenter__.return_value = mock_session
        mock_session.__aexit__.return_value = None

        with patch("src.integration.mcp_tools.get_session", return_value=mock_session):
            with patch("src.integration.mcp_tools.TaskRepository", return_value=mock_repo):
                result = await list_tasks("user-123")

        result_data = json.loads(result)
        assert result_data["success"] is True
        assert len(result_data["tasks"]) == 1
        assert result_data["tasks"][0]["id"] == "task-1"
        assert result_data["tasks"][0]["title"] == "Task 1"

    @pytest.mark.asyncio
    async def test_list_tasks_empty(self):
        """Test listing tasks when none exist."""
        mock_repo = AsyncMock()
        mock_repo.get_by_user_id.return_value = []

        mock_session = AsyncMock()
        mock_session.__aenter__.return_value = mock_session
        mock_session.__aexit__.return_value = None

        with patch("src.integration.mcp_tools.get_session", return_value=mock_session):
            with patch("src.integration.mcp_tools.TaskRepository", return_value=mock_repo):
                result = await list_tasks("user-123")

        result_data = json.loads(result)
        assert result_data["success"] is True
        assert len(result_data["tasks"]) == 0

    @pytest.mark.asyncio
    async def test_list_tasks_with_completed_filter(self):
        """Test listing only completed tasks."""
        mock_task = MagicMock()
        mock_task.id = "completed-task"
        mock_task.title = "Done task"
        mock_task.description = "Finished work"
        mock_task.completed = True
        mock_task.priority = 2
        mock_task.due_date = None
        mock_task.created_at = datetime.now()

        mock_repo = AsyncMock()
        mock_repo.get_by_user_id.return_value = [mock_task]

        mock_session = AsyncMock()
        mock_session.__aenter__.return_value = mock_session
        mock_session.__aexit__.return_value = None

        with patch("src.integration.mcp_tools.get_session", return_value=mock_session):
            with patch("src.integration.mcp_tools.TaskRepository", return_value=mock_repo):
                result = await list_tasks("user-123", completed=True)

        result_data = json.loads(result)
        assert result_data["success"] is True
        assert len(result_data["tasks"]) == 1
        assert result_data["tasks"][0]["title"] == "Done task"


class TestUpdateTask:
    """Tests for update_task tool."""

    @pytest.mark.asyncio
    async def test_update_task_success(self):
        """Test successful task update."""
        mock_task = MagicMock()
        mock_task.id = "task-123"
        mock_task.title = "Updated title"
        mock_task.description = "Updated details"
        mock_task.completed = False
        mock_task.priority = 4
        mock_task.due_date = None
        mock_task.created_at = datetime.now()

        mock_repo = AsyncMock()
        mock_repo.update.return_value = mock_task

        mock_session = AsyncMock()
        mock_session.__aenter__.return_value = mock_session
        mock_session.__aexit__.return_value = None

        with patch("src.integration.mcp_tools.get_session", return_value=mock_session):
            with patch("src.integration.mcp_tools.TaskRepository", return_value=mock_repo):
                result = await update_task(
                    "user-123", "task-123", title="Updated title"
                )

        result_data = json.loads(result)
        assert result_data["success"] is True
        assert result_data["task"]["id"] == "task-123"
        assert result_data["task"]["title"] == "Updated title"

    @pytest.mark.asyncio
    async def test_update_task_not_found(self):
        """Test updating a non-existent task."""
        mock_repo = AsyncMock()
        mock_repo.update.return_value = None

        mock_session = AsyncMock()
        mock_session.__aenter__.return_value = mock_session
        mock_session.__aexit__.return_value = None

        with patch("src.integration.mcp_tools.get_session", return_value=mock_session):
            with patch("src.integration.mcp_tools.TaskRepository", return_value=mock_repo):
                result = await update_task("user-123", "nonexistent-task")

        result_data = json.loads(result)
        assert result_data["success"] is False


class TestCompleteTask:
    """Tests for complete_task tool."""

    @pytest.mark.asyncio
    async def test_complete_task_success(self):
        """Test successful task completion."""
        mock_task = MagicMock()
        mock_task.id = "task-123"
        mock_task.title = "Completed task"
        mock_task.description = "All done"
        mock_task.completed = True
        mock_task.priority = 3
        mock_task.due_date = None
        mock_task.created_at = datetime.now()

        mock_repo = AsyncMock()
        mock_repo.complete.return_value = mock_task

        mock_session = AsyncMock()
        mock_session.__aenter__.return_value = mock_session
        mock_session.__aexit__.return_value = None

        with patch("src.integration.mcp_tools.get_session", return_value=mock_session):
            with patch("src.integration.mcp_tools.TaskRepository", return_value=mock_repo):
                result = await complete_task("user-123", "task-123")

        result_data = json.loads(result)
        assert result_data["success"] is True
        assert result_data["task"]["completed"] is True


class TestDeleteTask:
    """Tests for delete_task tool."""

    @pytest.mark.asyncio
    async def test_delete_task_success(self):
        """Test successful task deletion."""
        mock_task = MagicMock()
        mock_task.id = "task-123"
        mock_task.title = "Task to delete"
        mock_task.description = "Remove this"

        mock_repo = AsyncMock()
        mock_repo.get_by_id_and_user.return_value = mock_task
        mock_repo.delete.return_value = True

        mock_session = AsyncMock()
        mock_session.__aenter__.return_value = mock_session
        mock_session.__aexit__.return_value = None

        with patch("src.integration.mcp_tools.get_session", return_value=mock_session):
            with patch("src.integration.mcp_tools.TaskRepository", return_value=mock_repo):
                result = await delete_task("user-123", "task-123")

        result_data = json.loads(result)
        assert result_data["success"] is True

    @pytest.mark.asyncio
    async def test_delete_nonexistent_task(self):
        """Test deleting a non-existent task."""
        mock_repo = AsyncMock()
        mock_repo.get_by_id_and_user.return_value = None

        mock_session = AsyncMock()
        mock_session.__aenter__.return_value = mock_session
        mock_session.__aexit__.return_value = None

        with patch("src.integration.mcp_tools.get_session", return_value=mock_session):
            with patch("src.integration.mcp_tools.TaskRepository", return_value=mock_repo):
                result = await delete_task("user-123", "nonexistent-task")

        result_data = json.loads(result)
        assert result_data["success"] is False
