# Tasks: Database Specification for Todo Full-Stack Web Application

**Feature**: 001-todo-db-spec
**Created**: Monday, January 19, 2026
**Status**: Draft
**Input**: Feature specification from `/specs/001-todo-db-spec/spec.md`

## Summary

This document outlines the implementation tasks for the Todo Full-Stack Web Application database. The tasks are organized by user story priority and include all necessary steps to implement the database schema with Neon PostgreSQL, SQLModel ORM, and support for Better Auth JWT-based authentication.

## Dependencies

- User Story 2 (DB schema for JWT auth) must be completed before User Story 1 (CRUD operations) can be fully tested
- Foundational database setup must be completed before any user story-specific tasks

## Parallel Execution Examples

- [P] tasks can be executed in parallel as they work on different files/components
- User Story 3 tasks can be worked on after foundational setup is complete

---

## Phase 1: Setup

### Goal
Establish the project structure and foundational dependencies for the database implementation.

### Independent Test Criteria
A developer can run the project setup commands and verify that all dependencies are properly installed and the project structure is in place.

### Tasks

- [X] T001 Create project directory structure: `backend/src/todo_app/database/`, `backend/tests/unit/`, `backend/tests/integration/`
- [X] T002 Set up Python virtual environment and install dependencies: `sqlmodel`, `fastapi`, `uvicorn`, `pytest`, `psycopg2-binary`, `asyncpg`
- [X] T003 Create pyproject.toml with project metadata and dependencies
- [X] T004 Create .env file template with DATABASE_URL placeholder

---

## Phase 2: Foundational

### Goal
Implement the core database infrastructure including connection management and engine setup.

### Independent Test Criteria
A developer can initialize the database engine and establish a connection to the PostgreSQL instance.

### Tasks

- [X] T005 [P] Create database configuration file `backend/src/todo_app/database/config.py` with settings for DATABASE_URL
- [X] T006 [P] Create database engine file `backend/src/todo_app/database/engine.py` with async engine and session setup
- [X] T007 [P] Create database initialization function in `backend/src/todo_app/database/__init__.py`
- [X] T008 Create database dependency injection in `backend/src/todo_app/api/deps.py`
- [X] T009 Create main FastAPI app in `backend/src/todo_app/main.py` with database dependency
- [X] T010 Write basic tests for database connectivity in `backend/tests/integration/test_database.py`

---

## Phase 3: User Story 1 - Backend can fully CRUD tasks per user (Priority: P1)

### Goal
Implement the database schema to support Create, Read, Update, and Delete operations for tasks, ensuring each operation is isolated to a specific user.

### Independent Test Criteria
A developer can write and execute unit tests for a tasks API endpoint that perform CRUD operations for a given user, verifying data integrity and isolation.

### Acceptance Scenarios
1. Given a user U1 exists, When U1 creates a new task, Then the task is stored in the database associated with U1 and U1 can retrieve it.
2. Given user U1 has a task T1, When U1 updates T1, Then T1's details are modified in the database.
3. Given user U1 has a task T1, When U1 deletes T1, Then T1 is removed from the database.
4. Given user U1 has a task T1 and user U2 exists, When U2 attempts to access T1, Then U2 is denied access to T1.

### Tasks

- [X] T011 [P] [US1] Create Task model in `backend/src/todo_app/database/models.py` with required fields: id (int, PK), user_id (str, FK), title (str, 1-200 chars), description (text, nullable), completed (bool, default false), created_at, updated_at
- [X] T012 [P] [US1] Add foreign key constraint between Task.user_id and User.id in models.py
- [X] T013 [P] [US1] Add indexes to Task model: user_id, completed, created_at in models.py
- [X] T014 [P] [US1] Add validation constraints to Task model: title length (1-200), description length (max 1000), completed default to false
- [X] T015 [US1] Create task service functions for CRUD operations in `backend/src/todo_app/services/task_service.py`
- [X] T016 [US1] Implement user-level isolation in task service functions
- [X] T017 [US1] Write unit tests for task CRUD operations in `backend/tests/unit/test_task_service.py`
- [X] T018 [US1] Write integration tests for task CRUD operations in `backend/tests/integration/test_task_crud.py`

---

## Phase 4: User Story 2 - DB schema supports stateless JWT auth (Priority: P1)

### Goal
Implement the database schema to support user management as required by a JWT-based authentication system (Better Auth), allowing for user creation, identification, and association with tasks.

### Independent Test Criteria
A developer can inspect the database schema to verify the existence and structure of the `users` table, ensuring it meets the basic requirements for storing user information for JWT authentication.

### Acceptance Scenarios
1. Given the database is initialized, When a user is registered via the authentication system, Then a corresponding entry is created in the `users` table with a unique ID, email, name, and creation timestamp.
2. Given a user's JWT is presented to the backend, When the backend needs to identify the user, Then the database can efficiently retrieve user information using the `id` from the token.

### Tasks

- [X] T019 [P] [US2] Create User model in `backend/src/todo_app/database/models.py` with required fields: id (str, PK), email (str, unique), name (str), created_at (timestamp)
- [X] T020 [P] [US2] Add validation constraints to User model: email uniqueness, name non-empty
- [X] T021 [US2] Create user service functions for user management in `backend/src/todo_app/services/user_service.py`
- [X] T022 [US2] Write unit tests for user operations in `backend/tests/unit/test_user_service.py`
- [X] T023 [US2] Write integration tests for user operations in `backend/tests/integration/test_user_management.py`

---

## Phase 5: User Story 3 - Easy to extend for future features (Priority: P2)

### Goal
Design the database schema to allow for easy addition of future features like task tags, reminders, and priorities without requiring major schema overhauls.

### Independent Test Criteria
A database architect can review the schema and confirm that adding new tables or columns for features like `tags`, `reminders`, or `priorities` would be straightforward and not introduce significant breaking changes or complexity.

### Acceptance Scenarios
1. Given the current database schema, When adding a `due_date` column to the `tasks` table, Then this can be done as a simple schema migration without impacting existing data or functionality.
2. Given the current database schema, When adding a `priority` column to the `tasks` table, Then this can be done as a simple schema migration without impacting existing data or functionality.

### Tasks

- [X] T024 [P] [US3] Create migration configuration using Alembic in `alembic.ini`
- [X] T025 [P] [US3] Create initial migration script for users and tasks tables in `alembic/versions/`
- [X] T026 [US3] Add extension points to Task model for future features (due_date, priority) as nullable fields
- [X] T027 [US3] Write migration test to verify schema extensibility in `backend/tests/integration/test_migrations.py`
- [X] T028 [US3] Document migration process in `backend/docs/migration_guide.md`

---

## Phase 6: Polish & Cross-Cutting Concerns

### Goal
Complete the implementation with proper error handling, validation, and documentation.

### Independent Test Criteria
All implemented functionality meets the success criteria defined in the specification, including performance and data integrity requirements.

### Tasks

- [X] T029 Add proper error handling for database operations in service layer
- [X] T030 Implement automatic timestamp management for created_at and updated_at fields
- [X] T031 Add comprehensive validation to all models based on requirements
- [X] T032 Create seed data script for local testing in `scripts/seed_data.py`
- [X] T033 Write validation tests to ensure all requirements are met in `backend/tests/unit/test_validations.py`
- [X] T034 Update quickstart documentation with implementation details
- [X] T035 Run full test suite to verify all functionality works together

---

## Implementation Strategy

### MVP Scope (Minimum Viable Product)
Focus on completing User Story 1 (CRUD operations for tasks) and User Story 2 (user management) to achieve the core functionality. This includes:
- User model with required fields
- Task model with required fields and relationship to user
- Basic CRUD operations for tasks
- Database connectivity and configuration

### Incremental Delivery
1. Complete Phase 1 and 2 (Setup and Foundational) to establish the database infrastructure
2. Complete User Story 2 (User management) to have the authentication foundation
3. Complete User Story 1 (Task CRUD) to have the core functionality
4. Complete User Story 3 (Extensibility) to ensure future growth
5. Complete Phase 6 (Polish) to finalize the implementation