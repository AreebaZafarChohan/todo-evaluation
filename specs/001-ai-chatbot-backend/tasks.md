# Tasks: AI-Powered Todo Chatbot Backend

**Branch**: `001-ai-chatbot-backend` | **Date**: 2026-01-26 | **Plan**: /mnt/d/Gemini_Cli/hackathon/hackathon_2/specs/001-ai-chatbot-backend/plan.md

## Phase 1: Setup (Project Initialization)

This phase covers the initial setup of the backend project, including directory structure, dependency management, and database migration setup.

- [ ] T001 Create `backend/` directory structure: `backend/src/{api,core,domain,persistence,integration}`, `backend/tests/{unit,integration,contract}`
- [ ] T002 Initialize Python project with `poetry` in `backend/`
- [ ] T003 Create `backend/.env` with placeholder variables (`GEMINI_API_KEY`, `BETTER_AUTH_SECRET`, `DATABASE_URL`)
- [ ] T004 Create `backend/requirements.txt` (or update `pyproject.toml`) for initial dependencies (FastAPI, Uvicorn, SQLModel, AsyncPG, OpenAI Agents SDK, python-jose, passlib, alembic, tenacity)
- [ ] T005 Initialize Alembic for database migrations in `backend/`

## Phase 2: Foundational (Authentication, Database Integration, MCP Server Setup)

This phase establishes core components that are prerequisites for implementing specific user stories, including database connectivity, authentication middleware, and the MCP server.

- [ ] T006 [P] Implement base SQLModel for `backend/src/core/database.py` (engine, session management)
- [ ] T007 [P] Implement JWT verification and user extraction middleware in `backend/src/api/auth.py`
- [ ] T008 [P] Initialize MCP Server using Official MCP SDK in `backend/src/core/mcp.py`
- [ ] T009 [P] Define and register placeholder MCP task tools (`add_task`, `list_tasks`, etc.) in `backend/src/integration/mcp_tools.py`
- [ ] T010 [P] Implement basic health check endpoint in `backend/src/api/health.py`

## Phase 3: User Story 1 - Basic Chat Interaction [P1]

**Story Goal**: A user can send a natural language message to the chatbot and receive a streaming response.
**Independent Test Criteria**: A POST request to the chat endpoint successfully returns a streaming response.

- [ ] T011 [P] [US1] Define `User` SQLModel in `backend/src/persistence/models/user.py`
- [ ] T012 [P] [US1] Implement user persistence operations in `backend/src/persistence/repositories/user_repository.py`
- [ ] T013 [P] [US1] Define `Message` and `Conversation` SQLModels in `backend/src/persistence/models/conversation.py`
- [ ] T014 [P] [US1] Implement conversation and message persistence operations in `backend/src/persistence/repositories/conversation_repository.py`
- [ ] T015 [P] [US1] Create FastAPI app instance and include routers in `backend/src/main.py`
- [ ] T016 [P] [US1] Define `UserContext` dataclass for agent in `backend/src/domain/agent/context.py`
- [ ] T017 [P] [US1] Configure Gemini model (`AsyncOpenAI`, `OpenAIChatCompletionsModel`) in `backend/src/integration/llm_client.py`
- [ ] T018 [P] [US1] Define core agent instructions and behavior in `backend/src/domain/agent/main.py`
- [ ] T019 [P] [US1] Implement streaming agent execution (`Runner.run_streamed`, `RunResultStreaming`) in `backend/src/domain/agent/streaming.py`
- [ ] T020 [P] [US1] Implement `POST /api/{user_id}/chat` endpoint in `backend/src/api/chat.py` to handle user input, run agent, and stream responses
- [ ] T021 [US1] Ensure stateless conversation handling strategy is implemented in `backend/src/domain/agent/main.py`

## Phase 4: User Story 2 - Task Management via Chat [P1]

**Story Goal**: A user can manage their tasks (add, list, update, complete, delete) by conversing with the chatbot.
**Independent Test Criteria**: Sending messages to the chatbot to perform task management operations correctly manipulates tasks in the database.

- [ ] T022 [P] [US2] Define `Task` SQLModel in `backend/src/persistence/models/task.py`
- [ ] T023 [P] [US2] Implement task persistence operations in `backend/src/persistence/repositories/task_repository.py`
- [ ] T024 [P] [US2] Implement `add_task` MCP tool in `backend/src/integration/mcp_tools.py`
- [ ] T025 [P] [US2] Implement `list_tasks` MCP tool in `backend/src/integration/mcp_tools.py`
- [ ] T026 [P] [US2] Implement `update_task` MCP tool in `backend/src/integration/mcp_tools.py`
- [ ] T027 [P] [US2] Implement `complete_task` MCP tool in `backend/src/integration/mcp_tools.py`
- [ ] T028 [P] [US2] Implement `delete_task` MCP tool in `backend/src/integration/mcp_tools.py`
- [ ] T029 [US2] Bind all MCP task tools to the AI agent in `backend/src/domain/agent/main.py`

## Phase 5: User Story 3 - Conversation History [P2]

**Story Goal**: A user's conversation with the chatbot is persisted and can be retrieved.
**Independent Test Criteria**: After a conversation and server restart, the chatbot remembers the context.

- [ ] T030 [US3] Ensure user and assistant messages are persisted after completion in `backend/src/api/chat.py` and `backend/src/persistence/repositories/conversation_repository.py`.
- [ ] T031 [US3] Implement conversation history retrieval logic for the chat endpoint in `backend/src/api/chat.py`.

## Phase 6: User Story 4 - Task Reminders [P3]

**Story Goal**: The system sends reminders to the user for tasks with due dates.
**Independent Test Criteria**: Creating a task with a due date triggers reminders at the correct times.

- [ ] T032 [US4] Implement reminder scheduling logic (5 hours before, every 15 mins) in `backend/src/domain/reminders/scheduler.py`. This will involve a background task or cron-like mechanism, but ensuring it adheres to the stateless server architecture.
- [ ] T033 [US4] Integrate reminder logic to be triggered by task updates (e.g., when `due_date` is set/updated) in `backend/src/domain/tasks/services.py`.

## Phase 7: Polish & Cross-Cutting Concerns (Error Handling, Testing)

This phase addresses error handling, comprehensive testing, and deployment preparation.

- [ ] T034 Implement error handling for task not found, invalid tool arguments, and agent/tool failures in `backend/src/domain/error_handlers.py` and `backend/src/api/chat.py`.
- [ ] T035 Implement tool-level authorization checks for MCP tools in `backend/src/integration/mcp_tools.py`.
- [ ] T036 Implement unit tests for all MCP tools in `backend/tests/unit/mcp_tools/`.
- [ ] T037 Implement integration tests for agent streaming execution in `backend/tests/integration/agent_streaming_test.py`.
- [ ] T038 Implement integration tests for the chat endpoint (including authentication) in `backend/tests/integration/chat_api_test.py`.
- [ ] T039 Create `Dockerfile` for backend service in `backend/Dockerfile`.
- [ ] T040 Update `quickstart.md` with any additional setup instructions or API examples.

## Dependencies

The phases are ordered by dependency, meaning each phase should ideally be completed before moving to the next. Within phases, tasks marked with `[P]` can often be parallelized.

## Parallel Execution Examples

- **During Phase 1 (Setup)**: Tasks T001-T005 can be executed sequentially as they set up the basic project environment.
- **During Phase 2 (Foundational)**: Tasks T006-T010 are largely independent and can be parallelized. For instance, one developer can work on database setup (T006) while another works on authentication (T007) or MCP server initialization (T008).
- **During Phase 3 (User Story 1)**: Many tasks (T011-T020) can be parallelized, such as defining models, implementing persistence operations, configuring LLM, and defining agent behavior, as long as inter-dependencies are managed. The chat endpoint (T020) can be implemented once its dependencies are ready.

## Implementation Strategy

The implementation will follow an iterative approach, delivering each user story as a complete, independently testable increment. The Minimum Viable Product (MVP) for this feature will encompass **User Story 1 - Basic Chat Interaction**, allowing users to engage with the chatbot and receive streaming responses. Subsequent user stories will build upon this foundation. Testing will be integrated throughout the development process, with unit, integration, and contract tests ensuring quality and adherence to specifications.
