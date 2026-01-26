# Implementation Plan: AI-Powered Todo Chatbot Backend

**Branch**: `001-ai-chatbot-backend` | **Date**: 2026-01-26 | **Spec**: /mnt/d/Gemini_Cli/hackathon/hackathon_2/specs/001-ai-chatbot-backend/spec.md
**Input**: Feature specification from `/specs/001-ai-chatbot-backend/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

The backend for Phase III: AI-Powered Todo Chatbot will provide a stateless chat API endpoint using Python FastAPI, orchestrated by OpenAI Agents SDK with a Gemini LLM via an OpenAI-compatible endpoint. It will support streaming responses, manage todo tasks via MCP tools, persist conversation state in a database, and include reminder scheduling logic. Authentication will be handled by Better Auth using JWT.

## Technical Context

**Language/Version**: Python 3.11+
**Primary Dependencies**: FastAPI, OpenAI Agents SDK, AsyncOpenAI, SQLModel, Better Auth, Official MCP SDK
**Storage**: PostgreSQL (SQLModel will be used for interactions)
**Testing**: pytest (for MCP tool tests, agent streaming tests, chat endpoint tests)
**Target Platform**: Linux server
**Project Type**: Web application (backend only)
**Performance Goals**:
    - SC-001: Gemini-powered agent streams responses with perceived latency < 500ms from the user's message being sent.
    - SC-002: All MCP tool invocations for task management MUST be completed successfully within 1 second.
**Constraints**:
    - Stateless server architecture
    - No frontend UI
    - No database schema design (for this plan)
    - No deployment steps (for this plan)
    - No manual coding (for this plan)
**Scale/Scope**: Handling individual user conversations with task management for a single user at a time. The system will handle concurrent requests from the same user by processing them sequentially.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [X] Python 3.11+ is used.
- [X] FastAPI is mandatory for HTTP APIs.
- [X] Pydantic is mandatory for data validation (implicitly via SQLModel and FastAPI).
- [X] SQLModel is mandatory for database interactions.
- [X] Asynchronous code is preferred where I/O operations are involved (LLM calls, database operations).
- [X] Strict separation of layers will be maintained (Interface, Domain, Persistence, Integration).
- [X] Dependencies flow inward: Interface → Domain → Persistence; Domain → Integration.
- [X] AI agents are executors, not decision-makers; they will follow specifications exactly.
- [X] No future-phase features (e.g., Kubernetes, Cloud-Native) are implemented in this phase.
- [X] OpenAPI/Swagger specifications will be maintained (via FastAPI).
- [X] All dependencies will be explicitly declared and pinned.

## Project Structure

### Documentation (this feature)

```text
specs/001-ai-chatbot-backend/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── api/             # FastAPI endpoints (chat, health check, authentication)
│   ├── core/            # Core utilities, configuration, database session management, dependency injection
│   ├── domain/          # Business logic for tasks, conversation, reminders, agent orchestration
│   ├── persistence/     # SQLModel models, CRUD operations for tasks and conversations
│   ├── integration/     # External integrations: LLM client, MCP server client, Better Auth client
│   └── main.py          # Application entry point
├── tests/
│   ├── unit/            # Unit tests for individual components
│   ├── integration/     # Integration tests for interactions between components (e.g., API to domain, domain to persistence)
│   └── contract/        # Tests to ensure API contracts are met
├── .env                 # Environment variables (GEMINI_API_KEY, BETTER_AUTH_SECRET, DATABASE_URL)
├── requirements.txt     # Python dependencies
├── Dockerfile           # Dockerization for the backend service
├── alembic/             # Database migrations setup (managed by Alembic)
└── alembic.ini          # Alembic configuration
```

**Structure Decision**: The selected structure is a web application backend with distinct layers for API, core utilities, domain logic, persistence, and external integrations, as per the Constitution's layer separation principle. This structure supports modularity, testability, and clear separation of concerns.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |