"""Mock agent for testing without API calls."""
import json
import logging

from src.integration.mcp_tools import (
    add_task,
    complete_task,
    delete_task,
    list_tasks,
    update_task,
)

logger = logging.getLogger(__name__)


class MockTodoAgent:
    """Mock agent that actually calls tools but doesn't use Gemini API."""

    def __init__(self, user_id: str):
        self.user_id = user_id
        logger.info(f"MockTodoAgent initialized for user {user_id}")

    async def run(self, user_query: str) -> str:
        """Run mock agent - parses query and calls appropriate tool.

        Args:
            user_query: User's message

        Returns:
            Agent's response text
        """
        query_lower = user_query.lower()
        logger.info(f"Mock agent processing: {user_query}")

        try:
            # List tasks
            if "list" in query_lower and "task" in query_lower:
                result = await list_tasks(self.user_id)
                data = json.loads(result)
                if data["success"] and data["tasks"]:
                    tasks_text = "\n".join([
                        f"- **{t['title']}** (ID: {t['id']}, Status: {'✅ Complete' if t['completed'] else '⏳ Pending'}, Priority: {t['priority']})"
                        for t in data["tasks"]
                    ])
                    return f"Here are your tasks:\n\n{tasks_text}"
                return "You don't have any tasks yet."

            # Create task
            if "create" in query_lower or "add" in query_lower:
                # Simple parsing
                title = "New Task"
                description = None

                if "title" in query_lower:
                    # Extract title
                    parts = user_query.split("title")
                    if len(parts) > 1:
                        title = parts[1].strip().split("with")[0].strip().strip('"').strip()

                if "description" in query_lower:
                    parts = user_query.split("description")
                    if len(parts) > 1:
                        description = parts[1].strip().strip('"').strip()

                result = await add_task(self.user_id, title, description)
                data = json.loads(result)
                if data["success"]:
                    return f"✅ Created task: **{title}**"
                return f"❌ Failed to create task: {data.get('error', 'Unknown error')}"

            # Delete task
            if "delete" in query_lower or "remove" in query_lower:
                # Extract title
                title_to_delete = None
                for word in ["delete", "remove", "task"]:
                    if word in query_lower:
                        parts = user_query.split(word, 1)
                        if len(parts) > 1:
                            title_to_delete = parts[1].strip().strip('"').strip()
                            break

                if title_to_delete:
                    result = await delete_task(self.user_id, title=title_to_delete)
                    data = json.loads(result)
                    if data["success"]:
                        return f"✅ Deleted task: **{title_to_delete}**"
                    return f"❌ Could not find task titled '{title_to_delete}'"
                return "❌ Please specify which task to delete."

            # Complete task
            if "complete" in query_lower or "done" in query_lower or "finish" in query_lower:
                # Extract title
                title_to_complete = None
                for word in ["complete", "done", "finish", "mark", "task"]:
                    if word in query_lower:
                        parts = user_query.split(word, 1)
                        if len(parts) > 1:
                            title_to_complete = parts[1].strip().strip('"').strip().replace("as done", "").replace("as complete", "").strip()
                            if title_to_complete:
                                break

                if title_to_complete:
                    result = await complete_task(self.user_id, title=title_to_complete)
                    data = json.loads(result)
                    if data["success"]:
                        return f"✅ Marked **{title_to_complete}** as complete!"
                    return f"❌ Could not find task titled '{title_to_complete}'"
                return "❌ Please specify which task to complete."

            # Update task
            if "update" in query_lower or "change" in query_lower:
                # Parse old title and new title
                old_title = None
                new_title = None

                if " to " in query_lower:
                    parts = user_query.split(" to ", 1)
                    old_part = parts[0].replace("update", "").replace("change", "").replace("task", "").strip().strip('"')
                    new_title = parts[1].strip().strip('"')
                    old_title = old_part

                if old_title and new_title:
                    result = await update_task(
                        self.user_id, old_title=old_title, title=new_title
                    )
                    data = json.loads(result)
                    if data["success"]:
                        return f"✅ Updated task from **{old_title}** to **{new_title}**"
                    return f"❌ Could not find task titled '{old_title}'"
                return "❌ Please specify old title and new title (e.g., 'update abc to xyz')"

            # Default response
            return "I can help you manage tasks! Try: 'list my tasks', 'create task...', 'delete task...', 'complete task...', or 'update task...'"

        except Exception as e:
            logger.error(f"Error in mock agent: {e}", exc_info=True)
            return f"❌ Error: {str(e)}"
