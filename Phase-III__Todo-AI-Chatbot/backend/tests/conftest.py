"""Pytest configuration and fixtures for the test suite."""
import asyncio
from collections.abc import AsyncGenerator
from typing import Any
from unittest.mock import AsyncMock, MagicMock

import pytest
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlmodel import SQLModel

from src.core.config import Settings


@pytest.fixture(scope="session")
def event_loop():
    """Create an event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
def test_settings() -> Settings:
    """Create test settings."""
    return Settings(
        gemini_api_key="test-api-key",
        gemini_base_url="https://test.example.com/v1/",
        gemini_model="test-model",
        better_auth_secret="test-secret-key",
        database_url="sqlite+aiosqlite:///:memory:",
        debug=True,
    )


@pytest.fixture
async def test_engine():
    """Create a test database engine with SQLite."""
    engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:",
        echo=False,
    )

    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)

    yield engine

    await engine.dispose()


@pytest.fixture
async def test_session(test_engine) -> AsyncGenerator[AsyncSession, None]:
    """Create a test database session."""
    async_session = async_sessionmaker(
        test_engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )

    async with async_session() as session:
        yield session


@pytest.fixture
def mock_llm_client():
    """Create a mock LLM client."""
    client = AsyncMock()
    return client


@pytest.fixture
def sample_user_id() -> str:
    """Return a sample user ID for testing."""
    return "test-user-123"


@pytest.fixture
def sample_task_data() -> dict[str, Any]:
    """Return sample task data for testing."""
    return {
        "description": "Test task description",
        "priority": 3,
        "due_date": None,
    }


@pytest.fixture
def sample_jwt_token(test_settings) -> str:
    """Generate a sample JWT token for testing."""
    from jose import jwt
    from datetime import datetime, timedelta

    payload = {
        "sub": "test-user-123",
        "email": "test@example.com",
        "exp": datetime.utcnow() + timedelta(hours=1),
    }
    return jwt.encode(payload, test_settings.better_auth_secret, algorithm="HS256")


@pytest.fixture
def auth_headers(sample_jwt_token) -> dict[str, str]:
    """Return authorization headers for testing."""
    return {"Authorization": f"Bearer {sample_jwt_token}"}
