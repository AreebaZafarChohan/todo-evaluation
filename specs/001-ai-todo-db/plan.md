# Implementation Plan: AI-Powered Todo Chatbot Database

**Branch**: `001-ai-todo-db` | **Date**: 2026-01-29 | **Spec**: [specs/001-ai-todo-db/spec.md](specs/001-ai-todo-db/spec.md)
**Input**: Feature specification from `/specs/001-ai-todo-db/spec.md`

## Summary

This plan details the database design and implementation strategy for Phase III of the AI-Powered Todo Chatbot. The primary goal is to provide persistent storage for chatbot conversations, messages, and tasks, including reminder capabilities, supporting a stateless backend architecture using Neon Serverless PostgreSQL and SQLModel ORM.

## Technical Context

**Language/Version**: Python 3.11+
**Primary Dependencies**: FastAPI, SQLModel
**Storage**: Neon Serverless PostgreSQL
**Testing**: pytest
**Target Platform**: Linux server
**Project Type**: Web application (backend-focused)
**Performance Goals**:
- Retrieval of a complete conversation history (all messages for a given conversation ID) MUST be achieved within 500ms for 95% of requests.
- Creation and update operations for tasks MUST complete within 200ms for 95% of requests.
- Querying for active reminders within a 24-hour window MUST complete within 300ms for 95% of requests.
**Constraints**:
- Stateless backend architecture.
- Authentication via Better Auth (user_id is trusted after JWT verification).
- Do NOT write SQL or ORM code within the spec or plan (focus on design).
- No migration scripts or deployment steps in this plan.
**Scale/Scope**:
- Maximum expected users: 10,000
- Maximum expected tasks per user: 1,000
- Maximum expected messages per conversation: 500
- Database MUST achieve 99.9% uptime, with Recovery Point Objective (RPO) and Recovery Time Objective (RTO) both within minutes.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **SDD Mandate**: Passed. This plan is derived directly from an approved specification.
- **Lifecycle Enforcement**: Passed. This is the 'Plan' stage, following 'Specify'.
- **Traceability Requirement**: Passed. All work will be linked to tasks and the spec.
- **Agent Authority Limits**: Passed. Plan adheres to spec, proposes no unapproved architectural decisions.
- **Spec Completeness Protocol**: Passed. Spec was clarified using `/sp.clarify`.
- **Phase Boundaries**: Passed. Focus is strictly on Phase III database components.
- **Language Requirements**: Passed. Adhering to Python 3.11+, type hints, PEP 8, Black, Ruff.
- **Async-First Mindset**: Passed. Database interactions will leverage async capabilities of SQLModel/FastAPI.
- **Framework Mandates**: Passed. Using FastAPI, Pydantic, SQLModel.
- **Data Modeling Standards**: Passed. Will use SQLModel for data models.
- **Contract-First Development**: Passed. API contracts will be defined for database interactions.
- **Dependency Management**: Passed. Will add dependencies judiciously and pin versions.
- **Layer Separation (Strict)**: Passed. Database layer will be separated from domain logic.
- **Layer Dependency Direction**: Passed. Persistence layer will be an inward dependency.
- **Architectural Evolution**: Passed. Incremental evolution, no major rewrites.
- **Code Organization**: Passed. Will follow the `src/project_name/interface/domain/persistence/integration/` model.
- **Modularity**: Passed. Features will be modular.

## Project Structure

### Documentation (this feature)

```text
specs/001-ai-todo-db/
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
│   ├── persistence/      # Database models, ORM setup, and session management
│   ├── domain/           # Core business logic for tasks, conversations, messages, reminders
│   └── api/              # FastAPI routes (interface layer)
└── tests/
    ├── unit/
    ├── integration/
    └── contracts/
```

**Structure Decision**: The project will utilize the "Web application" structure with a focus on the `backend` directory. Within `backend/src`, `persistence` will house the SQLModel definitions and database interaction logic, `domain` will contain the core business logic (e.g., managing tasks, conversations), and `api` will expose FastAPI endpoints. This aligns with the specified layer separation.

## Database Implementation Plan

### 1. Database Organization Strategy

1.1.  **Logical Separation**: All Phase III database components (conversations, messages, reminders) will reside within the Neon Serverless PostgreSQL instance, logically distinct from any Phase II data if a separate database is used, but connected via `user_id`.
1.2.  **Existing Task Table Reuse**: The `tasks` table from Phase II will be extended with the necessary `priority` and `due_date` columns as per Phase III requirements. This implies an alteration to the existing table schema.

### 2. Table Planning

2.1.  **`tasks` Table**:
    *   **Extensions**: Add `priority` (string, enum-like: low/medium/high), `due_date` (timestamp).
    *   **Implicit**: `id` (PK), `user_id` (indexed), `title`, `description`, `completed`, `created_at`, `updated_at` remain.
2.2.  **`conversations` Table**:
    *   `id` (integer, Primary Key)
    *   `user_id` (string, Indexed, Foreign Key referencing `users` or implicitly handled by application logic if `users` table is external to this scope)
    *   `created_at` (timestamp)
    *   `updated_at` (timestamp)
    *   `is_deleted` (boolean, default false - for soft deletion, as clarified in spec)
2.3.  **`messages` Table**:
    *   `id` (integer, Primary Key)
    *   `conversation_id` (integer, Foreign Key referencing `conversations.id`, Indexed)
    *   `user_id` (string, Indexed) - Redundant for foreign key, but useful for quick access to message sender for given user context.
    *   `role` (string, enum-like: 'user', 'assistant', 'system', 'tool')
    *   `content` (text)
    *   `metadata` (JSONB, optional - for tool calls and other structured data, as clarified in spec)
    *   `created_at` (timestamp)
2.4.  **`reminders` Table**:
    *   `id` (integer, Primary Key)
    *   `task_id` (integer, Foreign Key referencing `tasks.id`)
    *   `user_id` (string, Indexed)
    *   `next_trigger_at` (timestamp, Indexed)
    *   `repeat_interval_minutes` (integer)
    *   `active` (boolean)

### 3. Relationship Planning

3.1.  **User (External) → `tasks`**: One user has many tasks. `user_id` in `tasks` table.
3.2.  **User (External) → `conversations`**: One user has many conversations. `user_id` in `conversations` table.
3.3.  **`conversations` → `messages`**: One conversation has many messages. `conversation_id` in `messages` table.
3.4.  **`tasks` → `reminders`**: One task has zero or more reminders. `task_id` in `reminders` table.

### 4. Timestamp Strategy

4.1.  **`created_at`**: Timestamp of record creation. Automatically set on insert.
4.2.  **`updated_at`**: Timestamp of last record modification. Automatically updated on record update.
4.3.  **`next_trigger_at`**: Specific timestamp for the next scheduled reminder trigger. Essential for querying upcoming reminders.

### 5. Indexing Strategy

5.1.  **User-based Isolation**:
    *   `tasks.user_id`
    *   `conversations.user_id`
    *   `messages.user_id`
    *   `reminders.user_id`
    *   (Consider composite indexes with `user_id` and `created_at` or `updated_at` for common time-based queries).
5.2.  **Fast Lookup**:
    *   `reminders.next_trigger_at` (for pending reminders).
    *   `conversations.user_id` (for active conversations, combined with a potential `is_active` or `is_deleted` flag).
    *   `tasks.user_id`, `tasks.completed`, `tasks.due_date` (for user task filtering).
    *   `messages.conversation_id` (for chat history retrieval).
    *   `messages.created_at` (for ordering chat history).

### 6. Data Integrity Enforcement

6.1.  **Foreign Key Constraints**:
    *   `messages.conversation_id` references `conversations.id`.
    *   `reminders.task_id` references `tasks.id`.
    *   Consider `conversations.user_id` and `tasks.user_id` referencing a conceptual (or actual) `users` table, ensuring users are valid.
6.2.  **Cascade vs. Restrict Delete**:
    *   **`messages` on `conversations` deletion**: `ON DELETE CASCADE`. Deleting a conversation should delete all associated messages.
    *   **`reminders` on `tasks` deletion**: `ON DELETE CASCADE`. Deleting a task should delete all associated reminders.
    *   **`tasks` or `conversations` on `user` deletion**: `ON DELETE RESTRICT` (or application-level soft deletion). Prevent accidental user data loss.
6.3.  **Prevention of Orphan Messages and Reminders**: Enforced by foreign key constraints with `ON DELETE CASCADE` where appropriate.

### 7. Stateless Architecture Support

7.1.  **Conversation History Reconstruction**: Backend will query `messages` table using `conversation_id` to reconstruct the full conversation history for each request, avoiding server-side session state.
7.2.  **Reminder Evaluation**: A separate (potentially serverless) process will periodically query `reminders` table based on `next_trigger_at` to identify and process due reminders, without relying on active server memory.

### 8. Reminder Scheduling Support

8.1.  **`next_trigger_at` Logic**: When a reminder is set, `next_trigger_at` is calculated based on current time + `repeat_interval_minutes`.
8.2.  **Repeat Interval Handling**: If `repeat_interval_minutes` is defined (>0), after a reminder is triggered, `next_trigger_at` is updated for the next occurrence. If 0 or null, it's a one-time reminder.
8.3.  **Activation/Deactivation Strategy**: The `active` boolean flag will control whether a reminder is considered for triggering. Application logic will manage setting/unsetting this flag.

### 9. Scalability Considerations

9.1.  **Neon Serverless Behavior**: Leverage Neon's auto-scaling capabilities for connection pooling and compute resources to handle variable load, especially for chat history retrieval.
9.2.  **Read-Heavy Chat History Optimization**: Strategic indexing on `messages.conversation_id` and `messages.created_at` will optimize read performance for chat history. Consider materialized views or caching for frequently accessed conversation summaries if performance becomes an issue (beyond this plan's scope but noted).
9.3.  **Future Extensibility for Advanced AI Features**: The `messages.metadata` JSONB field allows flexible storage of structured tool call data or other AI-specific attributes without schema changes, supporting future AI feature integration.

### 10. Testing & Validation Strategy

10.1. **Schema Validation**: Develop tests to verify the correctness of SQLModel definitions against the planned schema (column types, primary keys, defaults).
10.2. **Relationship Integrity Tests**: Implement tests to confirm foreign key constraints prevent invalid data operations (e.g., adding a message to a non-existent conversation).
10.3. **Reminder Timing Edge Cases**: Create tests for various reminder scenarios, including one-time, repeating, and reminders near `next_trigger_at` boundaries, to ensure accurate triggering logic.
10.4. **Soft Deletion Validation**: Tests to ensure soft-deleted conversations are excluded from active queries but remain retrievable.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [N/A] | [N/A] | [N/A] |