"""Health check endpoint for the API."""
from fastapi import APIRouter, status
from pydantic import BaseModel
from sqlalchemy import text

from src.core.database import async_session_maker

router = APIRouter(tags=["Health"])


class HealthResponse(BaseModel):
    """Health check response model."""

    status: str
    database: str
    version: str = "1.0.0"


@router.get(
    "/health",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
    summary="Health check endpoint",
    description="Check the health status of the API and its dependencies.",
)
async def health_check() -> HealthResponse:
    """Check the health status of the application.

    Returns:
        HealthResponse with status of the API and database connection.
    """
    db_status = "unhealthy"

    try:
        async with async_session_maker() as session:
            await session.execute(text("SELECT 1"))
            db_status = "healthy"
    except Exception:
        db_status = "unhealthy"

    return HealthResponse(
        status="healthy" if db_status == "healthy" else "degraded",
        database=db_status,
    )


@router.get(
    "/",
    status_code=status.HTTP_200_OK,
    summary="Root endpoint",
    description="Welcome message for the API.",
)
async def root() -> dict[str, str]:
    """Return a welcome message."""
    return {
        "message": "AI-Powered Todo Chatbot API",
        "docs": "/docs",
        "health": "/health",
    }
