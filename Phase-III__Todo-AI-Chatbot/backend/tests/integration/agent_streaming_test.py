"""Integration tests for agent streaming execution."""
import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from src.domain.agent.context import UserContext
from src.domain.agent.streaming import (
    StreamEvent,
    StreamingResponse,
    run_agent_streamed,
    execute_agent_simple,
)


class TestStreamEvent:
    """Tests for StreamEvent class."""

    def test_to_sse_token_event(self):
        """Test SSE formatting for token events."""
        event = StreamEvent(
            event_type="token",
            data={"type": "token", "value": "Hello"},
        )
        sse = event.to_sse()
        assert "event: message" in sse
        assert '"type": "token"' in sse
        assert '"value": "Hello"' in sse

    def test_to_sse_final_response(self):
        """Test SSE formatting for final response events."""
        event = StreamEvent(
            event_type="final_response",
            data={
                "type": "final_response",
                "value": "Complete response",
                "tool_summary": [],
            },
        )
        sse = event.to_sse()
        assert "event: message" in sse
        assert '"type": "final_response"' in sse

    def test_to_sse_error_event(self):
        """Test SSE formatting for error events."""
        event = StreamEvent(
            event_type="error",
            data={"type": "error", "value": "Something went wrong"},
        )
        sse = event.to_sse()
        assert "event: message" in sse
        assert '"type": "error"' in sse


class TestStreamingResponse:
    """Tests for StreamingResponse class."""

    def test_full_text_property(self):
        """Test that full_text concatenates all tokens."""
        response = StreamingResponse()
        response.tokens = ["Hello", ", ", "world", "!"]
        assert response.full_text == "Hello, world!"

    def test_empty_response(self):
        """Test empty response defaults."""
        response = StreamingResponse()
        assert response.full_text == ""
        assert response.tool_calls == []
        assert response.final_response == ""
        assert response.error is None


class TestUserContext:
    """Tests for UserContext dataclass."""

    def test_to_dict(self):
        """Test converting context to dictionary."""
        context = UserContext(
            user_id="user-123",
            conversation_id="conv-456",
            email="test@example.com",
        )
        result = context.to_dict()

        assert result["user_id"] == "user-123"
        assert result["conversation_id"] == "conv-456"
        assert result["email"] == "test@example.com"

    def test_from_dict(self):
        """Test creating context from dictionary."""
        data = {
            "user_id": "user-789",
            "conversation_id": "conv-012",
            "email": "another@example.com",
        }
        context = UserContext.from_dict(data)

        assert context.user_id == "user-789"
        assert context.conversation_id == "conv-012"
        assert context.email == "another@example.com"


class TestRunAgentStreamed:
    """Tests for run_agent_streamed function."""

    @pytest.mark.asyncio
    async def test_streaming_yields_events(self):
        """Test that streaming yields events."""
        # Create mock agent
        mock_agent = MagicMock()

        # Create mock context
        context = UserContext(
            user_id="test-user",
            conversation_id="test-conv",
        )

        # Create mock streaming result
        mock_result = AsyncMock()
        mock_events = []

        async def mock_stream_events():
            for event in mock_events:
                yield event

        mock_result.stream_events = mock_stream_events

        with patch("src.domain.agent.streaming.Runner") as mock_runner:
            mock_runner.run_streamed.return_value = mock_result

            events = []
            async for event in run_agent_streamed(
                mock_agent,
                "Hello",
                context,
            ):
                events.append(event)

            # Should at least have a final_response event
            assert any(e.event_type == "final_response" for e in events)


class TestExecuteAgentSimple:
    """Tests for execute_agent_simple function."""

    @pytest.mark.asyncio
    async def test_returns_streaming_response(self):
        """Test that simple execution returns a StreamingResponse."""
        mock_agent = MagicMock()
        context = UserContext(
            user_id="test-user",
            conversation_id="test-conv",
        )

        # Mock the streaming function
        async def mock_stream(*args, **kwargs):
            yield StreamEvent("token", {"type": "token", "value": "Hi"})
            yield StreamEvent("final_response", {
                "type": "final_response",
                "value": "Hi",
                "tool_summary": [],
            })

        with patch(
            "src.domain.agent.streaming.run_agent_streamed",
            side_effect=mock_stream,
        ):
            response = await execute_agent_simple(
                mock_agent,
                "Hello",
                context,
            )

        assert isinstance(response, StreamingResponse)
