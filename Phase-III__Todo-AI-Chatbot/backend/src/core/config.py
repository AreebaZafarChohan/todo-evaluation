"""Application configuration using Pydantic settings."""
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # Gemini API configuration
    gemini_api_key: str = ""
    gemini_base_url: str = "https://generativelanguage.googleapis.com/v1beta/openai/"
    gemini_model: str = "gemini-2.0-flash"

    # Better Auth configuration
    better_auth_secret: str = ""

    # Database configuration
    database_url: str = "postgresql+asyncpg://user:password@localhost:5432/todo_ai_chatbot"

    # Server configuration
    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = False

    @property
    def sync_database_url(self) -> str:
        """Return synchronous database URL for Alembic."""
        return self.database_url.replace("+asyncpg", "")


@lru_cache
def get_settings() -> Settings:
    """Get cached application settings."""
    return Settings()


settings = get_settings()
