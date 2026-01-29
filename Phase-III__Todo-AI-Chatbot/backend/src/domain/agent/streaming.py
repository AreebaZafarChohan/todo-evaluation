"""Streaming agent execution using OpenAI Agents SDK Runner.

This module handles the streaming execution of the AI agent, capturing
events and forwarding them to the client via SSE.
"""
import json
from collections.abc import AsyncGenerator
from dataclasses import dataclass, field
from typing import Any

from agents import Agent, Runner
from agents.result import RunResultStreaming
from agents.stream_events import (
    RawResponsesStreamEvent,
    RunItemStreamEvent,
)

from src.domain.agent.context import UserContext


@dataclass
class StreamingResponse:
    """Container for streaming response data."""

    tokens: list[str] = field(default_factory=list)
    tool_calls: list[dict[str, Any]] = field(default_factory=list)
    final_response: str = ""
    error: str | None = None

    @property
    def full_text(self) -> str:
        """Get the complete response text."""
        return "".join(self.tokens)


@dataclass
class StreamEvent:
    """Event emitted during streaming."""

    event_type: str  # 'token', 'tool_call', 'final_response', 'error'
    data: dict[str, Any]

    def to_sse(self) -> str:
        """Format as Server-Sent Event.

        Returns:
            SSE formatted string
        """
        return f"event: message\ndata: {json.dumps(self.data)}\n\n"


async def run_agent_streamed(
    agent: Agent,
    user_message: str,
    context: UserContext,
    conversation_history: list[dict[str, str]] | None = None,
) -> AsyncGenerator[StreamEvent, None]:
    """Execute the agent with streaming and yield events.

    Args:
        agent: The configured Agent instance
        user_message: User's input message
        context: User context for the conversation
        conversation_history: Optional list of previous messages

    Yields:
        StreamEvent objects for each streaming event
    """
    # Build input messages from history
    input_messages: list[dict[str, str]] = []
    if conversation_history:
        for msg in conversation_history:
            input_messages.append({
                "role": msg["role"],
                "content": msg["content"],
            })

    # Add the current user message
    input_messages.append({
        "role": "user",
        "content": user_message,
    })

    accumulated_response = StreamingResponse()
    tool_calls_pending: list[dict[str, Any]] = []

    try:
        # Run the agent with streaming
        result: RunResultStreaming = Runner.run_streamed(
            agent,
            input=input_messages,
        )

        async for event in result.stream_events():
            if isinstance(event, RawResponsesStreamEvent):
                # Handle raw response chunks (tokens)
                response = event.data
                if hasattr(response, "choices") and response.choices:
                    delta = response.choices[0].delta
                    if hasattr(delta, "content") and delta.content:
                        token = delta.content
                        accumulated_response.tokens.append(token)
                        yield StreamEvent(
                            event_type="token",
                            data={"type": "token", "value": token},
                        )

                    # Check for tool calls in the delta
                    if hasattr(delta, "tool_calls") and delta.tool_calls:
                        for tool_call in delta.tool_calls:
                            if hasattr(tool_call, "function"):
                                tool_info = {
                                    "name": tool_call.function.name,
                                    "arguments": tool_call.function.arguments,
                                }
                                tool_calls_pending.append(tool_info)
                                yield StreamEvent(
                                    event_type="tool_call",
                                    data={"type": "tool_call", "value": tool_info},
                                )

            elif isinstance(event, RunItemStreamEvent):
                # Handle run item events (tool results, etc.)
                pass

        # Finalize the response
        accumulated_response.final_response = accumulated_response.full_text
        accumulated_response.tool_calls = tool_calls_pending

        yield StreamEvent(
            event_type="final_response",
            data={
                "type": "final_response",
                "value": accumulated_response.final_response,
                "tool_summary": [
                    {"tool_name": tc.get("name"), "arguments": tc.get("arguments")}
                    for tc in accumulated_response.tool_calls
                ],
            },
        )

    except Exception as e:
        accumulated_response.error = str(e)
        yield StreamEvent(
            event_type="error",
            data={"type": "error", "value": str(e)},
        )


async def execute_agent_simple(
    agent: Agent,
    user_message: str,
    context: UserContext,
    conversation_history: list[dict[str, str]] | None = None,
) -> StreamingResponse:
    """Execute the agent and return the complete response (non-streaming).

    Args:
        agent: The configured Agent instance
        user_message: User's input message
        context: User context for the conversation
        conversation_history: Optional list of previous messages

    Returns:
        StreamingResponse with the complete agent response
    """
    response = StreamingResponse()

    async for event in run_agent_streamed(
        agent, user_message, context, conversation_history
    ):
        if event.event_type == "token":
            response.tokens.append(event.data["value"])
        elif event.event_type == "tool_call":
            response.tool_calls.append(event.data["value"])
        elif event.event_type == "final_response":
            response.final_response = event.data["value"]
        elif event.event_type == "error":
            response.error = event.data["value"]

    return response
