"""Core AI agent definition using OpenAI Agents SDK with Gemini model.

This module defines the main agent configuration, instructions, and tool bindings
for the AI-powered todo chatbot. Compatible with Phase 2 database schema.
"""
import json
from typing import Any

from agents import Agent, ModelSettings, RunConfig, function_tool
from agents.models.openai_chatcompletions import OpenAIChatCompletionsModel

from src.core.config import settings
from src.core.mcp import tool_registry
from src.domain.agent.context import UserContext
from src.integration.llm_client import get_llm_client

# Agent system instructions - updated for Phase 2 compatibility
AGENT_INSTRUCTIONS = """You are a helpful AI assistant for managing todo tasks. You help users:

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
- Due dates should be mentioned when relevant

When using tools:
- Use the user_id provided in the context for all tool calls
- Always use the appropriate tool for task operations
- Parse tool responses as JSON and present results in a user-friendly way
- The 'title' field is the main task name, 'description' is optional details

Remember: You are stateless. Each request is independent, but you have access to the user's conversation history for context."""


def create_run_config() -> RunConfig:
    """Create the RunConfig for Gemini model.

    Returns:
        Configured RunConfig with Gemini model and provider
    """
    client = get_llm_client()
    model = OpenAIChatCompletionsModel(
        model=settings.gemini_model,
        openai_client=client,
    )

    return RunConfig(
        model=model,
        model_provider=client,  # type: ignore
        tracing_disabled=True,  # Disable tracing to avoid duplicate API calls
    )


def create_task_tools(user_id: str) -> list[Any]:
    """Create function tools for task management bound to a specific user.

    This creates function tools that wrap the MCP tool handlers and
    automatically inject the user_id for authorization.

    Args:
        user_id: User ID to bind to all tool calls

    Returns:
        List of function tools for the agent
    """
    tools = []

    # Import handlers directly
    from src.integration.mcp_tools import (
        add_task,
        list_tasks,
        update_task,
        complete_task,
        delete_task,
    )

    @function_tool
    async def add_task_tool(
        title: str,
        description: str | None = None,
        due_date: str | None = None,
        priority: int = 3,
    ) -> str:
        """Add a new task. Provide title (required), optional description, due_date (ISO 8601), and priority (1-5)."""
        return await add_task(user_id, title, description, due_date, priority)

    @function_tool
    async def list_tasks_tool(
        completed: bool | None = None,
    ) -> str:
        """List all tasks. Optionally filter by completed status (true/false)."""
        return await list_tasks(user_id, completed)

    @function_tool
    async def update_task_tool(
        task_id: str,
        title: str | None = None,
        description: str | None = None,
        due_date: str | None = None,
        priority: int | None = None,
    ) -> str:
        """Update an existing task by task_id. Can update title, description, due_date, or priority."""
        return await update_task(user_id, task_id, title, description, due_date, priority)

    @function_tool
    async def complete_task_tool(
        task_id: str,
    ) -> str:
        """Mark a task as completed by task_id."""
        return await complete_task(user_id, task_id)

    @function_tool
    async def delete_task_tool(
        task_id: str,
    ) -> str:
        """Delete a task permanently by task_id."""
        return await delete_task(user_id, task_id)

    tools.extend([
        add_task_tool,
        list_tasks_tool,
        update_task_tool,
        complete_task_tool,
        delete_task_tool,
    ])

    return tools


def create_agent(context: UserContext | None = None) -> Agent:
    """Create the main todo chatbot agent.

    Args:
        context: Optional user context for the agent

    Returns:
        Configured Agent instance
    """
    # Create tools bound to the user context
    tools = []
    if context:
        tools = create_task_tools(context.user_id)

    # Add context to instructions if provided
    instructions = AGENT_INSTRUCTIONS
    if context:
        instructions += f"\n\nCurrent user context:\n- User ID: {context.user_id}\n- Conversation ID: {context.conversation_id}"

    return Agent(
        name="TodoAssistant",
        instructions=instructions,
        tools=tools,
    )


def format_tool_summary(tool_calls: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Format tool calls for the response summary.

    Args:
        tool_calls: List of tool call dictionaries

    Returns:
        Formatted list of tool summaries
    """
    summaries = []
    for call in tool_calls:
        summaries.append({
            "tool_name": call.get("name", "unknown"),
            "arguments": call.get("arguments", {}),
        })
    return summaries
