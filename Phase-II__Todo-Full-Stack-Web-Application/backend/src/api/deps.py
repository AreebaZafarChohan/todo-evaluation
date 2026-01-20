"""Database dependency injection for the Todo application."""
from typing import Generator
from .db_engine import get_session

def get_db_session() -> Generator:
    """Dependency to provide database session."""
    with get_session() as session:
        yield session