"""Gemini LLM client configuration using AsyncOpenAI with OpenAI-compatible endpoint."""
from functools import lru_cache

from openai import AsyncOpenAI

from src.core.config import settings


@lru_cache
def get_llm_client() -> AsyncOpenAI:
    """Get configured AsyncOpenAI client for Gemini.

    This client is configured to use Gemini's OpenAI-compatible API endpoint.
    The client is cached to reuse connections efficiently.

    Returns:
        Configured AsyncOpenAI client
    """
    return AsyncOpenAI(
        api_key=settings.gemini_api_key,
        base_url=settings.gemini_base_url,
    )


def get_model_name() -> str:
    """Get the configured Gemini model name.

    Returns:
        Model name string (e.g., 'gemini-2.0-flash')
    """
    return settings.gemini_model


# Export convenience functions
llm_client = get_llm_client()
