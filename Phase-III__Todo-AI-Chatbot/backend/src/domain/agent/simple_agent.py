"""Simple non-streaming agent for todo chatbot - matches Physical AI pattern."""
import logging
from typing import Any

from agents import Agent, Runner, RunConfig, OpenAIChatCompletionsModel, function_tool, enable_verbose_stdout_logging

from src.core.config import settings
from src.integration.llm_client import get_llm_client
from src.integration.mcp_tools import (
    add_task,
    complete_task,
    delete_task,
    list_tasks,
    update_task,
)

# Enable verbose logging to see tool calls
enable_verbose_stdout_logging()

logger = logging.getLogger(__name__)

# Agent instructions
SYSTEM_PROMPT = """You are a helpful AI assistant for managing todo tasks.

MANDATORY: You MUST use the provided tools for ALL task operations. NEVER try to handle tasks without calling a tool.

Your available tools:
1. add_task_tool - Add new tasks
2. list_tasks_tool - List all tasks
3. update_task_tool - Update tasks (use old_title parameter!)
4. complete_task_tool - Mark tasks complete (use title parameter!)
5. delete_task_tool - Delete tasks (use title parameter!)

CRITICAL - How to identify tasks:
- Users will say the task TITLE, NOT the ID
- ALWAYS use the 'title' or 'old_title' parameter
- NEVER ask users for task_id

Examples you MUST follow:
1. User: "delete reading" → CALL delete_task_tool(title="reading")
2. User: "complete abc task" → CALL complete_task_tool(title="abc")
3. User: "update abcdefgh to xyz" → CALL update_task_tool(old_title="abcdefgh", title="xyz")

If a tool returns an error, report it clearly to the user.

Guidelines:
- Be friendly and conversational
- Confirm actions after tool calls succeed
- Format lists clearly with bullet points
- Priority: 1=lowest, 5=highest
"""


class SimpleTodoAgent:
    """Simple todo agent without streaming - matches Physical AI pattern."""

    def __init__(self, user_id: str):
        """Initialize agent with user-specific tools.

        Args:
            user_id: User ID for tool authorization
        """
        self.user_id = user_id

        # Create Gemini client and model
        client = get_llm_client()
        chat_model = OpenAIChatCompletionsModel(
            model=settings.gemini_model,
            openai_client=client,
        )

        # Create RunConfig with tracing disabled
        self.run_config = RunConfig(
            model=chat_model,
            model_provider=client,  # type: ignore
            tracing_disabled=True,  # Disable tracing to prevent duplicate API calls
        )

        # Create tools bound to user
        tools = self._create_tools()

        # Create agent
        self.agent = Agent(
            name="TodoAssistant",
            instructions=SYSTEM_PROMPT,
            tools=tools,
        )

        logger.info(f"SimpleTodoAgent initialized for user {user_id}")

    def _create_tools(self) -> list[Any]:
        """Create function tools bound to the user."""

        @function_tool
        async def add_task_tool(
            title: str,
            description: str | None = None,
            due_date: str | None = None,
            priority: int = 3,
        ) -> str:
            """Add a new task. Provide title (required), optional description, due_date (ISO 8601), and priority (1-5)."""
            return await add_task(self.user_id, title, description, due_date, priority)

        @function_tool
        async def list_tasks_tool(
            completed: bool | None = None,
        ) -> str:
            """List all tasks. Optionally filter by completed status (true/false)."""
            return await list_tasks(self.user_id, completed)

        @function_tool
        async def update_task_tool(
            task_id: str | None = None,
            old_title: str | None = None,
            title: str | None = None,
            description: str | None = None,
            due_date: str | None = None,
            priority: int | None = None,
        ) -> str:
            """Update an existing task. Provide either task_id OR old_title to identify the task. Can update title, description, due_date, or priority."""
            return await update_task(
                self.user_id, task_id, old_title, title, description, due_date, priority
            )

        @function_tool
        async def complete_task_tool(
            task_id: str | None = None,
            title: str | None = None,
        ) -> str:
            """Mark a task as completed. Provide either task_id OR title to identify the task."""
            return await complete_task(self.user_id, task_id, title)

        @function_tool
        async def delete_task_tool(
            task_id: str | None = None,
            title: str | None = None,
        ) -> str:
            """Delete a task permanently. Provide either task_id OR title to identify the task."""
            logger.info(f"delete_task_tool called with task_id={task_id}, title={title}")
            result = await delete_task(self.user_id, task_id, title)
            logger.info(f"delete_task result: {result}")
            return result

        return [
            add_task_tool,
            list_tasks_tool,
            update_task_tool,
            complete_task_tool,
            delete_task_tool,
        ]

    async def run(self, user_query: str) -> str:
        """Run the agent with a user query.

        Args:
            user_query: User's message

        Returns:
            Agent's response text
        """
        logger.info(f"Agent received query: {user_query} for user: {self.user_id}")
        logger.info(f"Agent has {len(self.agent.tools)} tools available")

        try:
            run_result = await Runner.run(
                self.agent, user_query, run_config=self.run_config
            )
            response = run_result.final_output

            # Log tool usage for debugging
            if hasattr(run_result, 'tool_calls') and run_result.tool_calls:
                logger.info(f"Tools called: {len(run_result.tool_calls)} tool(s)")
            else:
                logger.warning(f"No tools were called for query: {user_query}")

            logger.info(f"Agent response for user {self.user_id}: {response[:200]}...")
            return response

        except Exception as e:
            logger.error(f"Error during agent execution for user {self.user_id}: {e}", exc_info=True)
            raise RuntimeError(f"Failed to run agent: {e}")
