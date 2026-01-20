"""Database engine setup for the Todo application."""
from sqlmodel import create_engine, Session
from .db_config import config
from typing import Generator

# Create the database engine
engine = create_engine(
    config.database_url,
    echo=True,  # Set to False in production
    pool_size=config.POOL_SIZE,
    max_overflow=config.MAX_OVERFLOW,
    pool_timeout=config.POOL_TIMEOUT,
    pool_recycle=config.POOL_RECYCLE,
)

def get_session() -> Generator:
    """Provide a database session for FastAPI dependency injection.

    This is a generator function (without @contextmanager decorator) that FastAPI
    can use for dependency injection. FastAPI will automatically handle entering
    and exiting the context manager.
    """
    with Session(engine) as session:
        yield session
        # The session is automatically closed when exiting the with block


async def get_session_async():
    """Async generator version for FastAPI dependencies (if needed)."""
    with Session(engine) as session:
        yield session


from typing import AsyncGenerator


async def get_session_async_gen() -> AsyncGenerator:
    """Provide an async generator for database sessions."""
    with Session(engine) as session:
        yield session


from contextlib import asynccontextmanager


@asynccontextmanager
async def get_db_session():
    """Async context manager for database sessions."""
    with Session(engine) as session:
        yield session
