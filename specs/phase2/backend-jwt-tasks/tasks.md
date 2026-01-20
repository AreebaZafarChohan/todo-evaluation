# Tasks: Backend JWT and Task Management

This document breaks down the implementation plan into actionable tasks, organized by user story and development phase.

## Phase 1: Setup

-   [X] T001 Create project structure per implementation plan in `src/`
-   [X] T002 Create `.env` file with `DATABASE_URL` and `BETTER_AUTH_SECRET` placeholders
-   [X] T003 Implement configuration loading in `src/core/config.py`

## Phase 2: User Registration and Authentication (User Story 0)

**Goal**: As a user, I want to register an account and login so that I can securely access my tasks.

### Tasks

-   [X] T020 [US0] Update User model with `username`, `email`, `hashed_password` fields in `src/models/task.py`
-   [X] T021 [US0] Create password hashing service in `src/core/security.py`
-   [X] T022 [US0] Create JWT token generation service in `src/core/security.py`
-   [X] T023 [US0] Create auth schemas (SignupRequest, LoginRequest, AuthResponse) in `src/schemas/auth.py`
-   [X] T024 [US0] Create auth router in `src/routers/auth.py`
-   [X] T025 [US0] Implement `POST /api/auth/signup` endpoint
-   [X] T026 [US0] Implement `POST /api/auth/login` endpoint
-   [X] T027 [US0] Update middleware to skip auth for `/api/auth/*` paths
-   [X] T028 [US0] Write unit tests for password hashing and JWT generation
-   [X] T029 [US0] Write integration tests for signup and login endpoints in `tests/integration/test_auth_endpoints.py`

## Phase 3: JWT Verification (Foundational)

-   [X] T004 [P] Implement JWT verification middleware in `src/core/middleware.py`
-   [X] T005 [P] Implement authentication dependency in `src/core/auth.py`
-   [X] T006 [P] Set up database connection in `src/core/database.py`
-   [X] T007 Write unit tests for authentication components in `tests/unit/test_auth.py`

## Phase 4: User Story 1 - Secure Task Management

**Goal**: As a user, I want to manage my tasks through a secure API, ensuring that only I can access and modify my own tasks.

**Independent Test**: A user can create, read, update, and delete their own tasks. Attempts to access another user's tasks are blocked.

### Tasks

-   [X] T008 [US1] Define `User` and `Task` models in `src/models/`
-   [X] T009 [US1] Create initial database tables
-   [X] T010 [US1] Create task router in `src/routers/tasks.py`
-   [X] T011 [US1] Implement `POST /api/{user_id}/tasks` endpoint
-   [ ] T012 [US1] Implement `GET /api/{user_id}/tasks` endpoint with pagination and sorting
-   [X] T013 [US1] Implement `GET /api/{user_id}/tasks/{id}` endpoint
-   [X] T014 [US1] Implement `PUT /api/{user_id}/tasks/{id}` endpoint
-   [X] T015 [US1] Implement `DELETE /api/{user_id}/tasks/{id}` endpoint
-   [X] T016 [US1] Implement `PATCH /api/{user_id}/tasks/{id}/complete` endpoint
-   [X] T017 [US1] Implement ownership enforcement in all database queries
-   [X] T018 [US1] Implement error handling for task-related operations
-   [X] T019 [US1] Write integration tests for all task endpoints in `tests/integration/test_tasks.py`

## Dependencies

-   **User Story 1** is dependent on the completion of all **Foundational** tasks.

## Parallel Execution

-   Tasks marked with `[P]` can be worked on in parallel.
-   Within User Story 1, the model definition (T008) and router setup (T010) can be started in parallel after the foundational phase is complete. Endpoint implementation tasks (T011-T016) can be parallelized.

## Implementation Strategy

The implementation will follow a phased approach:
1.  First, the foundational authentication and database setup will be completed.
2.  Then, the tasks for User Story 1 will be implemented, delivering the core task management functionality as a single, testable unit.