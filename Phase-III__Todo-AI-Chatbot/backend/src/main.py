"""FastAPI application entry point for AI-Powered Todo Chatbot Backend.

This backend integrates with Phase 2's existing database and authentication.
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api.chat import router as chat_router
from src.api.health import router as health_router
from src.core.config import settings
from src.core.database import close_db, async_session_maker
from src.integration.mcp_tools import register_placeholder_tools, set_session_provider


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager for startup and shutdown.

    Handles initialization and cleanup of:
    - Database connections
    - MCP tool registration

    Note: We do NOT call init_db() here because Phase 2 tables already exist.
    Use Alembic migrations for Phase 3 tables: `alembic upgrade head`
    """
    # Startup - just set up session provider and register tools
    # Database tables are managed by Alembic migrations
    set_session_provider(async_session_maker)
    register_placeholder_tools()

    yield

    # Shutdown
    await close_db()


# Create FastAPI application
app = FastAPI(
    title="AI-Powered Todo Chatbot API",
    description="""
Backend API for the AI-powered todo chatbot using Gemini LLM and MCP tools.

## Integration with Phase 2
- Uses the same PostgreSQL database (Neon)
- Uses the same Better Auth for JWT validation
- Reads from Phase 2's user and task tables
- Adds conversation and message tables for chat history

## Authentication
All endpoints require a valid JWT token from Better Auth.
The token must be passed in the Authorization header as: `Bearer <token>`
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# Configure CORS - Allow Phase 2 frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Phase 2 frontend (Next.js dev)
        "http://localhost:3001",  # Alternative frontend port
        "*",  # Allow all for development - configure for production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health_router)
app.include_router(chat_router)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "src.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
    )
