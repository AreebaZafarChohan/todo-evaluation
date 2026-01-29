"""Domain error handlers for the AI chatbot backend.

This module defines custom exceptions and error handling utilities
for task management, agent operations, and tool execution.
"""
from typing import Any


class DomainError(Exception):
    """Base class for domain errors."""

    def __init__(self, message: str, code: str = "DOMAIN_ERROR", details: dict | None = None):
        self.message = message
        self.code = code
        self.details = details or {}
        super().__init__(message)

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary for API responses."""
        return {
            "error": self.code,
            "message": self.message,
            "details": self.details,
        }


class TaskNotFoundError(DomainError):
    """Raised when a task is not found or access is denied."""

    def __init__(self, task_id: str, user_id: str | None = None):
        details = {"task_id": task_id}
        if user_id:
            details["user_id"] = user_id
        super().__init__(
            message=f"Task with ID '{task_id}' not found or access denied",
            code="TASK_NOT_FOUND",
            details=details,
        )


class InvalidToolArgumentsError(DomainError):
    """Raised when tool arguments are invalid."""

    def __init__(self, tool_name: str, argument: str, reason: str):
        super().__init__(
            message=f"Invalid argument '{argument}' for tool '{tool_name}': {reason}",
            code="INVALID_TOOL_ARGUMENTS",
            details={
                "tool_name": tool_name,
                "argument": argument,
                "reason": reason,
            },
        )


class AgentExecutionError(DomainError):
    """Raised when the AI agent fails to execute."""

    def __init__(self, reason: str, original_error: Exception | None = None):
        details = {"reason": reason}
        if original_error:
            details["original_error"] = str(original_error)
        super().__init__(
            message=f"Agent execution failed: {reason}",
            code="AGENT_EXECUTION_ERROR",
            details=details,
        )


class ToolExecutionError(DomainError):
    """Raised when a tool fails to execute."""

    def __init__(self, tool_name: str, reason: str, original_error: Exception | None = None):
        details = {"tool_name": tool_name, "reason": reason}
        if original_error:
            details["original_error"] = str(original_error)
        super().__init__(
            message=f"Tool '{tool_name}' execution failed: {reason}",
            code="TOOL_EXECUTION_ERROR",
            details=details,
        )


class LLMUnavailableError(DomainError):
    """Raised when the LLM API is unavailable."""

    def __init__(self, reason: str | None = None):
        super().__init__(
            message="Service temporarily unavailable, please try again later",
            code="LLM_UNAVAILABLE",
            details={"reason": reason} if reason else {},
        )


class ConversationNotFoundError(DomainError):
    """Raised when a conversation is not found."""

    def __init__(self, conversation_id: str, user_id: str | None = None):
        details = {"conversation_id": conversation_id}
        if user_id:
            details["user_id"] = user_id
        super().__init__(
            message=f"Conversation with ID '{conversation_id}' not found",
            code="CONVERSATION_NOT_FOUND",
            details=details,
        )


class MalformedInputError(DomainError):
    """Raised when user input is malformed."""

    def __init__(self, reason: str, hint: str | None = None):
        details = {"reason": reason}
        if hint:
            details["hint"] = hint
        super().__init__(
            message=f"Input not understood: {reason}",
            code="MALFORMED_INPUT",
            details=details,
        )


def handle_domain_error(error: DomainError) -> dict[str, Any]:
    """Convert a domain error to an API-friendly response.

    Args:
        error: The domain error to handle

    Returns:
        Dictionary suitable for API error response
    """
    return {
        "success": False,
        "error": error.to_dict(),
    }


def wrap_tool_error(tool_name: str, error: Exception) -> str:
    """Wrap an exception as a tool error response.

    Args:
        tool_name: Name of the tool that failed
        error: The original exception

    Returns:
        JSON-formatted error string for agent consumption
    """
    import json

    if isinstance(error, DomainError):
        return json.dumps(error.to_dict())

    return json.dumps({
        "success": False,
        "error": {
            "code": "TOOL_ERROR",
            "message": str(error),
            "tool_name": tool_name,
        },
    })
