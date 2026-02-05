"""Chat API endpoint for the AI-powered todo chatbot - Compatible with Phase 2."""
import json
import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.auth import AuthenticatedUser, validate_user_access
from src.core.database import get_db
from src.domain.agent.simple_agent import SimpleTodoAgent
from src.persistence.repositories.conversation_repository import ConversationRepository
from src.persistence.repositories.user_repository import UserRepository

router = APIRouter(prefix="/api", tags=["Chat"])
logger = logging.getLogger(__name__)


class ChatRequest(BaseModel):
    """Request model for chat endpoint."""

    message: str = Field(
        ...,
        min_length=1,
        max_length=10000,
        description="The natural language message from the user",
        examples=["Hello, what tasks do I have today?"],
    )
    conversation_id: str | None = Field(
        None,
        description="Optional conversation ID to continue existing conversation. If not provided, creates new conversation.",
    )


class ToolSummary(BaseModel):
    """Summary of a tool invocation."""

    tool_name: str
    arguments: dict


class ChatResponse(BaseModel):
    """Response model for non-streaming chat endpoint."""

    response: str
    conversation_id: str
    tool_summary: list[ToolSummary] = []


@router.post(
    "/{user_id}/chat",
    summary="Send a message to the chatbot",
    description="Send a natural language message and receive a JSON response.",
    response_model=ChatResponse,
)
async def chat(
    user_id: str,
    request: ChatRequest,
    current_user: Annotated[AuthenticatedUser, Depends(validate_user_access)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> ChatResponse:
    """Handle chat request with simple JSON response.

    This endpoint accepts a user message, processes it through the AI agent,
    and returns the complete response as JSON.

    Args:
        user_id: User ID from URL path
        request: Chat request with user message
        current_user: Validated authenticated user
        db: Database session

    Returns:
        ChatResponse with AI response

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

    # If conversation_id provided, use that conversation
    if request.conversation_id:
        conversation = await conversation_repo.get_by_id(request.conversation_id)
        if conversation is None or conversation.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found or access denied",
            )
    else:
        # Create new conversation for new chat
        conversation = await conversation_repo.create(user_id)

    logger.info(f"Processing chat for user {user_id}, conversation {conversation.id}")

    try:
        # Create simple agent with OpenAI Agents SDK
        agent = SimpleTodoAgent(user_id)

        # Run agent and get response
        response_text = await agent.run(message)

        # Persist messages
        await conversation_repo.add_message(
            conversation_id=conversation.id,
            role="user",
            content=message,
        )
        await conversation_repo.add_message(
            conversation_id=conversation.id,
            role="assistant",
            content=response_text,
        )
        await db.commit()

        return ChatResponse(
            response=response_text,
            conversation_id=conversation.id,
            tool_summary=[]
        )

    except Exception as e:
        logger.error(f"Error processing chat for user {user_id}: {e}", exc_info=True)

        # Extract user-friendly error message
        error_str = str(e)
        user_message = "An error occurred while processing your request."

        if "429" in error_str or "quota" in error_str.lower() or "rate limit" in error_str.lower():
            user_message = "The AI service is currently at capacity. Please try again in a few moments."
        elif "403" in error_str or "api key" in error_str.lower() or "leaked" in error_str.lower():
            user_message = "There is an issue with the AI service configuration. Please contact support."
        elif "404" in error_str or "not found" in error_str.lower():
            user_message = "The requested resource was not found."

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=user_message,
        )


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


@router.delete(
    "/{user_id}/conversations/{conversation_id}/messages",
    summary="Clear chat session",
    description="Clear all messages from the current conversation (keeps the conversation).",
)
async def clear_chat_session(
    user_id: str,
    conversation_id: str,
    current_user: Annotated[AuthenticatedUser, Depends(validate_user_access)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """Clear all messages from a conversation.

    Args:
        user_id: User ID from URL path
        conversation_id: Conversation ID from URL path
        current_user: Validated authenticated user
        db: Database session

    Returns:
        Success message

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

    success = await conversation_repo.clear_messages(conversation_id)
    await db.commit()

    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to clear messages",
        )

    return {"message": "Chat session cleared successfully"}


@router.delete(
    "/{user_id}/conversations/{conversation_id}",
    summary="Delete a conversation",
    description="Delete a specific conversation and all its messages.",
)
async def delete_conversation(
    user_id: str,
    conversation_id: str,
    current_user: Annotated[AuthenticatedUser, Depends(validate_user_access)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """Delete a specific conversation.

    Args:
        user_id: User ID from URL path
        conversation_id: Conversation ID from URL path
        current_user: Validated authenticated user
        db: Database session

    Returns:
        Success message

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

    success = await conversation_repo.delete_conversation(conversation_id)
    await db.commit()

    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete conversation",
        )

    return {"message": "Conversation deleted successfully"}


@router.delete(
    "/{user_id}/conversations",
    summary="Clear all history",
    description="Delete all conversations and messages for the user.",
)
async def clear_all_history(
    user_id: str,
    current_user: Annotated[AuthenticatedUser, Depends(validate_user_access)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """Delete all conversations for a user.

    Args:
        user_id: User ID from URL path
        current_user: Validated authenticated user
        db: Database session

    Returns:
        Success message with count of deleted conversations
    """
    conversation_repo = ConversationRepository(db)
    count = await conversation_repo.delete_all_for_user(user_id)
    await db.commit()

    return {
        "message": f"Successfully deleted {count} conversation(s)",
        "deleted_count": count,
    }

