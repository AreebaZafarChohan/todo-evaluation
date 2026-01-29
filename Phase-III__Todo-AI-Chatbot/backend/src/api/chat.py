"""Chat API endpoint for the AI-powered todo chatbot - Compatible with Phase 2."""
import json
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sse_starlette.sse import EventSourceResponse

from src.api.auth import AuthenticatedUser, validate_user_access
from src.core.database import get_db
from src.domain.agent.context import UserContext
from src.domain.agent.main import create_agent
from src.domain.agent.streaming import run_agent_streamed
from src.persistence.repositories.conversation_repository import ConversationRepository
from src.persistence.repositories.user_repository import UserRepository

router = APIRouter(prefix="/api", tags=["Chat"])


class ChatRequest(BaseModel):
    """Request model for chat endpoint."""

    message: str = Field(
        ...,
        min_length=1,
        max_length=10000,
        description="The natural language message from the user",
        examples=["Hello, what tasks do I have today?"],
    )


class ToolSummary(BaseModel):
    """Summary of a tool invocation."""

    tool_name: str
    arguments: dict


class ChatResponse(BaseModel):
    """Response model for non-streaming chat endpoint."""

    response: str
    tool_summary: list[ToolSummary] = []


@router.post(
    "/{user_id}/chat",
    summary="Send a message to the chatbot",
    description="Send a natural language message and receive a streaming response via SSE.",
    response_class=EventSourceResponse,
)
async def chat(
    user_id: str,
    request: ChatRequest,
    current_user: Annotated[AuthenticatedUser, Depends(validate_user_access)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> EventSourceResponse:
    """Handle chat request with streaming response.

    This endpoint accepts a user message, processes it through the AI agent,
    and streams the response token-by-token via Server-Sent Events (SSE).

    Args:
        user_id: User ID from URL path
        request: Chat request with user message
        current_user: Validated authenticated user
        db: Database session

    Returns:
        EventSourceResponse with streaming AI response

    Raises:
        HTTPException: If message is empty or processing fails
    """
    # Validate message is not empty (after stripping whitespace)
    message = request.message.strip()
    if not message:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message cannot be empty or whitespace only",
        )

    # Verify user exists in Phase 2 database (do not create - managed by Better Auth)
    user_repo = UserRepository(db)
    user_exists = await user_repo.exists(user_id)
    if not user_exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found. Please sign up through the main application.",
        )

    # Get or create conversation
    conversation_repo = ConversationRepository(db)
    conversation = await conversation_repo.get_or_create_for_user(user_id)

    # Build conversation history for context
    history = []
    messages = await conversation_repo.get_messages(conversation.id)
    for msg in messages:
        history.append({
            "role": msg.role,
            "content": msg.content,
        })

    # Create user context - use 'id' field from Phase 2 User model
    context = UserContext(
        user_id=user_id,
        conversation_id=conversation.id,  # Phase 3 uses 'id'
        email=current_user.email,
    )

    # Create agent and run streaming
    agent = create_agent(context)
    events_generator = run_agent_streamed(agent, message, context, history)

    async def event_stream():
        """Async generator for SSE events."""
        final_response = ""
        tool_summary_json = None

        async for event in events_generator:
            yield event.to_sse()

            if event.event_type == "final_response":
                final_response = event.data.get("value", "")
                tool_summary = event.data.get("tool_summary", [])
                if tool_summary:
                    tool_summary_json = json.dumps(tool_summary)

        # Persist messages after streaming completes
        await conversation_repo.add_message(
            conversation_id=conversation.id,
            role="user",
            content=message,
        )
        await conversation_repo.add_message(
            conversation_id=conversation.id,
            role="assistant",
            content=final_response,
            tool_calls=tool_summary_json,
        )
        await db.commit()

    return EventSourceResponse(event_stream())


@router.get(
    "/{user_id}/conversations",
    summary="Get user's conversation history",
    description="Retrieve the conversation history for a user.",
)
async def get_conversations(
    user_id: str,
    current_user: Annotated[AuthenticatedUser, Depends(validate_user_access)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """Get all conversations for a user.

    Args:
        user_id: User ID from URL path
        current_user: Validated authenticated user
        db: Database session

    Returns:
        Dictionary with list of conversations
    """
    conversation_repo = ConversationRepository(db)
    conversations = await conversation_repo.get_by_user_id(user_id)

    return {
        "conversations": [
            {
                "id": c.id,
                "created_at": c.created_at.isoformat(),
                "updated_at": c.updated_at.isoformat(),
            }
            for c in conversations
        ]
    }


@router.get(
    "/{user_id}/conversations/{conversation_id}",
    summary="Get a specific conversation",
    description="Retrieve a specific conversation with all its messages.",
)
async def get_conversation(
    user_id: str,
    conversation_id: str,
    current_user: Annotated[AuthenticatedUser, Depends(validate_user_access)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """Get a specific conversation with messages.

    Args:
        user_id: User ID from URL path
        conversation_id: Conversation ID from URL path
        current_user: Validated authenticated user
        db: Database session

    Returns:
        Dictionary with conversation and messages

    Raises:
        HTTPException: If conversation not found or unauthorized
    """
    conversation_repo = ConversationRepository(db)
    conversation = await conversation_repo.get_by_id(conversation_id)

    if conversation is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found",
        )

    if conversation.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )

    return {
        "id": conversation.id,
        "user_id": conversation.user_id,
        "created_at": conversation.created_at.isoformat(),
        "updated_at": conversation.updated_at.isoformat(),
        "messages": [
            {
                "id": m.id,
                "role": m.role,
                "content": m.content,
                "created_at": m.created_at.isoformat(),
                "tool_calls": json.loads(m.tool_calls) if m.tool_calls else None,
            }
            for m in conversation.messages
        ],
    }
