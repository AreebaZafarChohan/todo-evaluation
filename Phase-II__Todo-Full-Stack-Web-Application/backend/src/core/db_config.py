"""Database configuration for the Todo application."""
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv()

class DatabaseConfig:
    """Configuration class for database settings."""

    def __init__(self):
        # Use DATABASE_URL from environment, fallback to SQLite for development/testing
        env_url = os.getenv("DATABASE_URL")
        if env_url and env_url.strip():
            self.DATABASE_URL: str = env_url.strip()
        else:
            self.DATABASE_URL: str = "sqlite:///./todo_app.db"

        # Additional database settings
        self.POOL_SIZE = 5  # Reduced for SQLite
        self.MAX_OVERFLOW = 10
        self.POOL_TIMEOUT = 30
        self.POOL_RECYCLE = 300  # 5 minutes, was 1 hour

    @property
    def database_url(self) -> str:
        """Return the database URL."""
        return self.DATABASE_URL

# Create a singleton instance
config = DatabaseConfig()