"""User context dataclass for agent execution."""
from dataclasses import dataclass
from typing import Any


@dataclass
class UserContext:
    """Context object passed to the agent during execution.

    This dataclass holds all user-specific information needed by the agent
    to execute tools and maintain context during a conversation.

    Attributes:
        user_id: Unique identifier of the authenticated user
        conversation_id: ID of the current conversation
        email: Optional email address of the user
        metadata: Optional additional metadata
    """

    user_id: str
    conversation_id: str
    email: str | None = None
    metadata: dict[str, Any] | None = None

    def to_dict(self) -> dict[str, Any]:
        """Convert context to dictionary for serialization.

        Returns:
            Dictionary representation of the context
        """
        return {
            "user_id": self.user_id,
            "conversation_id": self.conversation_id,
            "email": self.email,
            "metadata": self.metadata or {},
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "UserContext":
        """Create context from dictionary.

        Args:
            data: Dictionary containing context data

        Returns:
            UserContext instance
        """
        return cls(
            user_id=data["user_id"],
            conversation_id=data["conversation_id"],
            email=data.get("email"),
            metadata=data.get("metadata"),
        )
