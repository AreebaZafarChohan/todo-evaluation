import sys
import os
import pytest

# Add the backend directory to sys.path FIRST before any src imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlmodel import Session, SQLModel, create_engine
from sqlalchemy.pool import StaticPool

# Import models here once. This ensures they are registered with SQLModel.metadata.
from src.models.task import Task, User

# Fixture for a test database engine - use function scope for isolation
@pytest.fixture(name="engine")
def engine_fixture():
    # Use an in-memory SQLite for testing to ensure isolation between tests
    # StaticPool ensures the same connection is reused (important for in-memory SQLite)
    # check_same_thread=False is needed for async tests that might run across threads
    engine = create_engine(
        "sqlite:///:memory:",
        echo=False,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool
    )
    # Create tables immediately
    SQLModel.metadata.create_all(engine)
    return engine

# Fixture for a test session
@pytest.fixture(name="session")
def session_fixture(engine):
    with Session(engine) as session:
        yield session