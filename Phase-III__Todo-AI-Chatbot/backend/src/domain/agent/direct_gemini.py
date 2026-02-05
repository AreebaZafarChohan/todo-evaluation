"""Direct Gemini integration without OpenAI Agents SDK."""
import json
import logging
from typing import Any, Callable

import google.generativeai as genai

from src.core.config import settings
from src.integration.mcp_tools import (
    add_task,
    complete_task,
    delete_task,
    list_tasks,
    update_task,
)

logger = logging.getLogger(__name__)

# System prompt
SYSTEM_PROMPT = """You are a helpful AI assistant for managing todo tasks. You help users:

1. Add new tasks to their todo list
2. List and view their existing tasks
3. Update task details (title, description, due date, priority)
4. Mark tasks as complete
5. Delete tasks they no longer need

Guidelines:
- Always be friendly and conversational
- Confirm actions after completing them (e.g., "I've added 'Buy groceries' to your tasks")
- When listing tasks, format them clearly with their status, priority, and due date if set
- If a user's request is ambiguous, ask for clarification
- Priority levels are 1 (lowest) to 5 (highest)
- Due dates should be in ISO 8601 format (YYYY-MM-DD)

When using tools:
- Use the appropriate tool for each task operation
- Parse tool responses and present results in a user-friendly way
- The 'title' field is the main task name, 'description' is optional details
"""


class DirectGeminiAgent:
    """Direct Gemini agent without OpenAI Agents SDK."""

    def __init__(self, user_id: str):
        """Initialize agent with user-specific tools.

        Args:
            user_id: User ID for tool authorization
        """
        self.user_id = user_id

        # Configure Gemini
        genai.configure(api_key=settings.gemini_api_key)

        # Create model
        self.model = genai.GenerativeModel(
            model_name="gemini-2.0-flash-exp",
            system_instruction=SYSTEM_PROMPT,
        )

        # Create tools map
        self.tools = self._create_tools_map()

        logger.info(f"DirectGeminiAgent initialized for user {user_id}")

    def _create_tools_map(self) -> dict[str, Callable]:
        """Create tools map bound to the user."""

        async def add_task_tool(
            title: str,
            description: str | None = None,
            due_date: str | None = None,
            priority: int = 3,
        ) -> str:
            """Add a new task."""
            return await add_task(self.user_id, title, description, due_date, priority)

        async def list_tasks_tool(
            completed: bool | None = None,
        ) -> str:
            """List all tasks."""
            return await list_tasks(self.user_id, completed)

        async def update_task_tool(
            task_id: str,
            title: str | None = None,
            description: str | None = None,
            due_date: str | None = None,
            priority: int | None = None,
        ) -> str:
            """Update an existing task."""
            return await update_task(
                self.user_id, task_id, title, description, due_date, priority
            )

        async def complete_task_tool(
            task_id: str,
        ) -> str:
            """Mark a task as completed."""
            return await complete_task(self.user_id, task_id)

        async def delete_task_tool(
            task_id: str,
        ) -> str:
            """Delete a task permanently."""
            return await delete_task(self.user_id, task_id)

        return {
            "add_task": add_task_tool,
            "list_tasks": list_tasks_tool,
            "update_task": update_task_tool,
            "complete_task": complete_task_tool,
            "delete_task": delete_task_tool,
        }

    async def run(self, user_query: str) -> str:
        """Run the agent with a user query.

        Args:
            user_query: User's message

        Returns:
            Agent's response text
        """
        logger.info(f"Agent received query: {user_query} for user: {self.user_id}")

        try:
            # For now, simple chat without function calling
            # (Gemini function calling API is different from OpenAI)
            response = self.model.generate_content(user_query)
            response_text = response.text

            logger.info(f"Agent response for user {self.user_id}: {response_text}")
            return response_text

        except Exception as e:
            logger.error(
                f"Error during agent execution for user {self.user_id}: {e}",
                exc_info=True,
            )
            raise RuntimeError(f"Failed to run agent: {e}")
