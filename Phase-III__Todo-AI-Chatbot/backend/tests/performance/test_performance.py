"""Performance tests for SC-001 and SC-002 success criteria."""
import asyncio
import time
from datetime import datetime

import pytest

from src.core.monitoring import (
    metrics,
    MetricsCollector,
    track_streaming_latency,
    track_tool_invocation,
    get_performance_report,
    STREAMING_LATENCY_THRESHOLD_MS,
    TOOL_INVOCATION_THRESHOLD_MS,
)


class TestMetricsCollector:
    """Tests for the MetricsCollector class."""

    @pytest.fixture
    def collector(self):
        """Create a fresh metrics collector."""
        return MetricsCollector()

    def test_record_metric(self, collector):
        """Test recording a metric."""
        collector.record("test_metric", 100.5, "ms")

        records = collector.get_records("test_metric")
        assert len(records) == 1
        assert records[0].value == 100.5
        assert records[0].unit == "ms"

    def test_record_with_tags(self, collector):
        """Test recording a metric with tags."""
        collector.record(
            "test_metric",
            200.0,
            "ms",
            tags={"user_id": "user-123"},
        )

        records = collector.get_records("test_metric")
        assert records[0].tags["user_id"] == "user-123"

    def test_get_stats_empty(self, collector):
        """Test getting stats for empty metrics."""
        stats = collector.get_stats("nonexistent")

        assert stats["count"] == 0
        assert stats["min"] == 0
        assert stats["max"] == 0
        assert stats["avg"] == 0

    def test_get_stats_with_data(self, collector):
        """Test getting stats with recorded data."""
        collector.record("latency", 100.0, "ms")
        collector.record("latency", 200.0, "ms")
        collector.record("latency", 300.0, "ms")

        stats = collector.get_stats("latency")

        assert stats["count"] == 3
        assert stats["min"] == 100.0
        assert stats["max"] == 300.0
        assert stats["avg"] == 200.0

    def test_max_records_limit(self):
        """Test that old records are trimmed."""
        collector = MetricsCollector(max_records=5)

        for i in range(10):
            collector.record("test", float(i), "ms")

        records = collector.get_records("test")
        assert len(records) == 5
        # Should keep the last 5 records
        assert records[0].value == 5.0

    def test_clear_metrics(self, collector):
        """Test clearing all metrics."""
        collector.record("test", 100.0, "ms")
        collector.clear()

        records = collector.get_records()
        assert len(records) == 0


class TestStreamingLatencyTracking:
    """Tests for streaming latency tracking (SC-001)."""

    @pytest.mark.asyncio
    async def test_track_streaming_latency(self):
        """Test tracking streaming latency."""
        metrics.clear()

        async with track_streaming_latency("test-user") as mark_first_token:
            await asyncio.sleep(0.01)  # Simulate 10ms delay
            mark_first_token()

        records = metrics.get_records("streaming_latency")
        assert len(records) == 1
        assert records[0].value >= 10  # At least 10ms

    @pytest.mark.asyncio
    async def test_streaming_latency_threshold(self):
        """Test that streaming latency threshold is reasonable."""
        assert STREAMING_LATENCY_THRESHOLD_MS == 500

    @pytest.mark.asyncio
    async def test_no_recording_without_first_token(self):
        """Test that no metric is recorded if first token not marked."""
        metrics.clear()

        async with track_streaming_latency("test-user"):
            await asyncio.sleep(0.01)
            # Don't call mark_first_token

        # No record should be created
        records = metrics.get_records("streaming_latency")
        assert len(records) == 0


class TestToolInvocationTracking:
    """Tests for tool invocation time tracking (SC-002)."""

    @pytest.mark.asyncio
    async def test_track_tool_invocation(self):
        """Test tracking tool invocation time."""
        metrics.clear()

        async with track_tool_invocation("add_task", "test-user"):
            await asyncio.sleep(0.01)  # Simulate 10ms operation

        records = metrics.get_records("tool_invocation_time")
        assert len(records) == 1
        assert records[0].tags["tool_name"] == "add_task"

    @pytest.mark.asyncio
    async def test_tool_invocation_threshold(self):
        """Test that tool invocation threshold is reasonable."""
        assert TOOL_INVOCATION_THRESHOLD_MS == 1000

    @pytest.mark.asyncio
    async def test_tool_invocation_with_exception(self):
        """Test that metrics are recorded even on exception."""
        metrics.clear()

        with pytest.raises(ValueError):
            async with track_tool_invocation("failing_tool", "test-user"):
                raise ValueError("Test error")

        # Metric should still be recorded
        records = metrics.get_records("tool_invocation_time")
        assert len(records) == 1


class TestPerformanceReport:
    """Tests for performance report generation."""

    def test_get_performance_report_empty(self):
        """Test performance report with no data."""
        metrics.clear()
        report = get_performance_report()

        assert "streaming_latency" in report
        assert "tool_invocation_time" in report
        assert report["streaming_latency"]["count"] == 0
        assert report["tool_invocation_time"]["count"] == 0

    def test_get_performance_report_with_data(self):
        """Test performance report with recorded data."""
        metrics.clear()

        # Simulate some metrics
        metrics.record("streaming_latency", 100.0, "ms")
        metrics.record("streaming_latency", 150.0, "ms")
        metrics.record("tool_invocation_time", 50.0, "ms")
        metrics.record("tool_invocation_time", 75.0, "ms")

        report = get_performance_report()

        assert report["streaming_latency"]["count"] == 2
        assert report["streaming_latency"]["avg"] == 125.0
        assert report["tool_invocation_time"]["count"] == 2


class TestSC001StreamingLatency:
    """Success Criteria SC-001: Streaming latency < 500ms."""

    @pytest.mark.asyncio
    async def test_simulated_streaming_within_threshold(self):
        """Test that simulated streaming is within threshold."""
        metrics.clear()

        # Simulate a fast response (should pass SC-001)
        async with track_streaming_latency("sc001-test") as mark_first_token:
            await asyncio.sleep(0.05)  # 50ms
            mark_first_token()

        records = metrics.get_records("streaming_latency")
        assert records[0].value < STREAMING_LATENCY_THRESHOLD_MS


class TestSC002ToolInvocation:
    """Success Criteria SC-002: Tool invocation < 1000ms."""

    @pytest.mark.asyncio
    async def test_simulated_tool_within_threshold(self):
        """Test that simulated tool invocation is within threshold."""
        metrics.clear()

        # Simulate a fast tool (should pass SC-002)
        async with track_tool_invocation("test_tool", "sc002-test"):
            await asyncio.sleep(0.05)  # 50ms

        records = metrics.get_records("tool_invocation_time")
        assert records[0].value < TOOL_INVOCATION_THRESHOLD_MS
