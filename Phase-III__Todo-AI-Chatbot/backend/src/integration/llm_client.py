"""Gemini LLM client configuration using AsyncOpenAI with OpenAI-compatible endpoint."""
from functools import lru_cache
from typing import Any
import logging

from openai import AsyncOpenAI

from src.core.config import settings

logger = logging.getLogger(__name__)


@lru_cache
def get_llm_client() -> AsyncOpenAI:
    """Get configured AsyncOpenAI client for Gemini.

    This client is configured to use Gemini's OpenAI-compatible API endpoint.
    The client is cached to reuse connections efficiently.

    Returns:
        Configured AsyncOpenAI client with Gemini-compatible wrapper
    """
    client = AsyncOpenAI(
        api_key=settings.gemini_api_key,
        base_url=settings.gemini_base_url,
    )

    # Wrap the post method to strip Gemini-incompatible parameters
    original_post = client.post

    async def patched_post(
        path,
        *,
        cast_to=None,
        body=None,
        options=None,
        files=None,
        stream=False,
        stream_cls=None,
    ):
        """Patched post that removes Gemini-incompatible parameters."""
        # Remove unsupported parameters from body if present
        if body and isinstance(body, dict):
            body.pop('metadata', None)
            body.pop('store', None)
            body.pop('parallel_tool_calls', None)
            logger.debug(f"Patched request body, removed Gemini-incompatible params")

        return await original_post(
            path,
            cast_to=cast_to,
            body=body,
            options=options,
            files=files,
            stream=stream,
            stream_cls=stream_cls,
        )

    # Replace the post method
    client.post = patched_post

    return client


def get_model_name() -> str:
    """Get the configured Gemini model name.

    Returns:
        Model name string (e.g., 'gemini-2.0-flash')
    """
    return settings.gemini_model
