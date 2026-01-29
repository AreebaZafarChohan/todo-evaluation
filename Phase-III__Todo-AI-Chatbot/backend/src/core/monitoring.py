"""Performance monitoring for the AI chatbot backend.

This module implements monitoring to track SC-001 (streaming latency)
and SC-002 (tool invocation time) success criteria.
"""
import time
from collections.abc import Callable
from contextlib import asynccontextmanager
from dataclasses import dataclass, field
from datetime import datetime
from functools import wraps
from typing import Any


@dataclass
class MetricRecord:
    """Record of a single metric measurement."""

    name: str
    value: float
    unit: str
    timestamp: datetime = field(default_factory=datetime.utcnow)
    tags: dict[str, str] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary for logging/export."""
        return {
            "name": self.name,
            "value": self.value,
            "unit": self.unit,
            "timestamp": self.timestamp.isoformat(),
            "tags": self.tags,
        }


class MetricsCollector:
    """Collects and stores performance metrics.

    This is an in-memory collector for development/testing.
    In production, this would integrate with external monitoring systems.
    """

    def __init__(self, max_records: int = 1000):
        self._records: list[MetricRecord] = []
        self._max_records = max_records

    def record(
        self,
        name: str,
        value: float,
        unit: str = "ms",
        tags: dict[str, str] | None = None,
    ) -> None:
        """Record a metric measurement.

        Args:
            name: Metric name
            value: Measured value
            unit: Unit of measurement (default: ms)
            tags: Optional tags for categorization
        """
        record = MetricRecord(
            name=name,
            value=value,
            unit=unit,
            tags=tags or {},
        )
        self._records.append(record)

        # Trim old records if over limit
        if len(self._records) > self._max_records:
            self._records = self._records[-self._max_records:]

    def get_records(
        self,
        name: str | None = None,
        since: datetime | None = None,
    ) -> list[MetricRecord]:
        """Get recorded metrics.

        Args:
            name: Filter by metric name (optional)
            since: Filter to records after this time (optional)

        Returns:
            List of matching metric records
        """
        records = self._records
        if name:
            records = [r for r in records if r.name == name]
        if since:
            records = [r for r in records if r.timestamp >= since]
        return records

    def get_stats(self, name: str) -> dict[str, float]:
        """Get statistics for a metric.

        Args:
            name: Metric name

        Returns:
            Dictionary with min, max, avg, count
        """
        records = self.get_records(name)
        if not records:
            return {"min": 0, "max": 0, "avg": 0, "count": 0}

        values = [r.value for r in records]
        return {
            "min": min(values),
            "max": max(values),
            "avg": sum(values) / len(values),
            "count": len(values),
        }

    def clear(self) -> None:
        """Clear all recorded metrics."""
        self._records = []


# Global metrics collector instance
metrics = MetricsCollector()


# SC-001: Streaming latency threshold (500ms)
STREAMING_LATENCY_THRESHOLD_MS = 500

# SC-002: Tool invocation threshold (1000ms)
TOOL_INVOCATION_THRESHOLD_MS = 1000


@asynccontextmanager
async def track_streaming_latency(user_id: str):
    """Context manager to track streaming response latency.

    Measures time from receiving user message to first token.

    Args:
        user_id: User ID for tagging

    Yields:
        Control back to caller
    """
    start_time = time.perf_counter()
    first_token_time: float | None = None

    def mark_first_token():
        nonlocal first_token_time
        if first_token_time is None:
            first_token_time = time.perf_counter()

    try:
        yield mark_first_token
    finally:
        if first_token_time:
            latency_ms = (first_token_time - start_time) * 1000
            metrics.record(
                name="streaming_latency",
                value=latency_ms,
                unit="ms",
                tags={"user_id": user_id},
            )

            if latency_ms > STREAMING_LATENCY_THRESHOLD_MS:
                # Log warning for SC-001 violation
                pass  # In production: logger.warning(...)


@asynccontextmanager
async def track_tool_invocation(tool_name: str, user_id: str):
    """Context manager to track tool invocation time.

    Args:
        tool_name: Name of the tool being invoked
        user_id: User ID for tagging

    Yields:
        Control back to caller
    """
    start_time = time.perf_counter()

    try:
        yield
    finally:
        elapsed_ms = (time.perf_counter() - start_time) * 1000
        metrics.record(
            name="tool_invocation_time",
            value=elapsed_ms,
            unit="ms",
            tags={"tool_name": tool_name, "user_id": user_id},
        )

        if elapsed_ms > TOOL_INVOCATION_THRESHOLD_MS:
            # Log warning for SC-002 violation
            pass  # In production: logger.warning(...)


def monitor_tool(tool_name: str) -> Callable:
    """Decorator to monitor tool invocation time.

    Args:
        tool_name: Name of the tool

    Returns:
        Decorator function
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args: Any, **kwargs: Any) -> Any:
            start_time = time.perf_counter()
            try:
                result = await func(*args, **kwargs)
                return result
            finally:
                elapsed_ms = (time.perf_counter() - start_time) * 1000
                metrics.record(
                    name="tool_invocation_time",
                    value=elapsed_ms,
                    unit="ms",
                    tags={"tool_name": tool_name},
                )
        return wrapper
    return decorator


def get_performance_report() -> dict[str, Any]:
    """Generate a performance report.

    Returns:
        Dictionary with performance statistics
    """
    return {
        "streaming_latency": {
            **metrics.get_stats("streaming_latency"),
            "threshold_ms": STREAMING_LATENCY_THRESHOLD_MS,
        },
        "tool_invocation_time": {
            **metrics.get_stats("tool_invocation_time"),
            "threshold_ms": TOOL_INVOCATION_THRESHOLD_MS,
        },
    }
