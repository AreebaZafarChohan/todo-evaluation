# Tasks: AI-Powered Todo Chatbot Database

**Input**: Design documents from `/specs/001-ai-todo-db/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Paths shown below assume `backend/src/persistence` for database-related files.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initial project structure for database persistence layer.

- [X] T001 Create `backend/src/persistence` directory for database models and interactions.
- [X] T002 Configure basic SQLModel setup, including database engine and session management in `backend/src/core/database.py`.

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core database elements that MUST be complete before ANY user story can be implemented.

- [X] T003 Define common base model for `SQLModel` with `id`, `created_at`, `updated_at` fields in `backend/src/persistence/base_model.py`.
- [X] T004 Review and understand existing `tasks` table schema from Phase II (external).
- [X] T005 [P] Draft a SQLModel representation of the existing `tasks` table (without extensions yet) in `backend/src/persistence/models/task.py`.

## Phase 3: User Story 2 - AI-Driven Task Management (Priority: P1) 🎯 MVP

**Goal**: Reliably store, retrieve, and update tasks, including new `priority` and `due_date` fields.

**Independent Test**: Can be tested by defining the SQLModel for tasks and verifying its schema and ability to persist/retrieve data with the extended fields, independent of conversations or reminders.

### Implementation for User Story 2

- [X] T006 [P] [US2] Extend SQLModel for `tasks` by adding `priority` (string) and `due_date` (timestamp) fields in `backend/src/persistence/models/task.py`.
- [X] T007 [US2] Implement data integrity checks for `tasks` (e.g., `priority` enum validation, `user_id` not null) within SQLModel or Pydantic validation if applicable in `backend/src/persistence/models/task.py`.
- [X] T008 [US2] Create unit tests for `Task` SQLModel schema definition and basic CRUD operations in `backend/tests/unit/test_task_model.py`.

## Phase 4: User Story 1 - Persist Chatbot Conversations and Messages (Priority: P1)

**Goal**: Store and retrieve entire conversation histories, including all user and assistant messages.

**Independent Test**: Can be tested by defining `Conversation` and `Message` SQLModels, establishing their relationship, and verifying the ability to create conversations, add messages, retrieve conversations with messages, and perform soft deletion on conversations.

### Implementation for User Story 1

- [X] T009 [P] [US1] Define SQLModel for `conversations` including `id`, `user_id`, `created_at`, `updated_at`, and `is_deleted` (boolean, default `False`) in `backend/src/persistence/models/conversation.py`.
- [X] T010 [P] [US1] Define SQLModel for `messages` including `id`, `conversation_id`, `user_id`, `role`, `content`, `metadata` (JSONB, optional), and `created_at` in `backend/src/persistence/models/message.py`.
- [X] T011 [US1] Establish `conversations` to `messages` relationship (one-to-many) with `ON DELETE CASCADE` using SQLModel in `backend/src/persistence/models/conversation.py` and `backend/src/persistence/models/message.py`.
- [X] T012 [US1] Implement data integrity checks for `conversations` and `messages` (e.g., `role` enum validation, `conversation_id` foreign key) in respective model files.
- [X] T013 [US1] Create unit tests for `Conversation` and `Message` SQLModel schemas, relationships, and basic CRUD operations, including soft deletion for conversations in `backend/tests/unit/test_conversation_message_model.py`.

## Phase 5: User Story 3 - Manage Reminders and Notifications (Priority: P2)

**Goal**: Persist and retrieve reminders associated with tasks, allowing for future notification mechanisms.

**Independent Test**: Can be tested by defining the `Reminder` SQLModel, establishing its relationship with `Task`, and verifying the ability to create reminders, retrieve them based on trigger time, and manage their active status.

### Implementation for User Story 3

- [X] T014 [P] [US3] Define SQLModel for `reminders` including `id`, `task_id`, `user_id`, `next_trigger_at`, `repeat_interval_minutes`, and `active` in `backend/src/persistence/models/reminder.py`.
- [X] T015 [US3] Establish `tasks` to `reminders` relationship (one-to-many) with `ON DELETE CASCADE` using SQLModel in `backend/src/persistence/models/task.py` and `backend/src/persistence/models/reminder.py`.
- [X] T016 [US3] Implement data integrity checks for `reminders` (e.g., `task_id` foreign key, `repeat_interval_minutes` validation) in `backend/src/persistence/models/reminder.py`.
- [X] T017 [US3] Create unit tests for `Reminder` SQLModel schema, relationships, and basic CRUD operations, including timing edge cases for `next_trigger_at` in `backend/tests/unit/test_reminder_model.py`.

## Final Phase: Polish & Cross-Cutting Concerns

**Purpose**: Overall data integrity, indexing optimization, and final validation.

- [X] T018 [P] Review and refine all indexing strategies across `tasks`, `conversations`, `messages`, and `reminders` models in `backend/src/persistence/models/*.py` to ensure optimal query performance as per plan.
- [X] T019 [P] Validate all foreign key constraints and `ON DELETE` rules across all models to ensure data integrity and prevent orphan records.
- [X] T020 [P] Conduct integration tests to validate the stateless architecture's ability to reconstruct conversation history and evaluate reminders without in-memory state.
- [X] T021 [P] Run a comprehensive suite of schema validation tests to ensure all SQLModel definitions accurately reflect the planned database schema.
- [X] T022 [P] Update `specs/001-ai-todo-db/quickstart.md` with instructions on how to set up and interact with the database models.

---

## Dependencies & Execution Order

### Phase Dependencies

-   **Setup (Phase 1)**: No dependencies - can start immediately.
-   **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories.
-   **User Stories (Phase 3+)**: All depend on Foundational phase completion.
    *   User stories can then proceed in parallel (if staffed).
    *   Or sequentially in priority order (P1 → P2 → P3).
-   **Polish (Final Phase)**: Depends on all desired user stories being complete.

### User Story Dependencies

-   **User Story 2 (P1) - AI-Driven Task Management**: Can start after Foundational (Phase 2).
-   **User Story 1 (P1) - Persist Chatbot Conversations and Messages**: Can start after Foundational (Phase 2).
-   **User Story 3 (P2) - Manage Reminders and Notifications**: Can start after Foundational (Phase 2), implicitly depends on `tasks` from US2 for `task_id` foreign key.

### Within Each User Story

-   Models before data integrity/relationship establishment.
-   Data integrity/relationships before comprehensive tests.

### Parallel Opportunities

-   All Setup tasks marked [P] can run in parallel.
-   Task T005 in Foundational phase can run in parallel.
-   Within each User Story phase, tasks marked [P] can run in parallel.
-   User Story 1 and User Story 2 can largely be developed in parallel after the Foundational phase, though US3 will depend on US2's `tasks` table being extended.
-   Tasks T018, T019, T020, T021, T022 in the Final Phase can run in parallel.

---

## Implementation Strategy

### MVP First (User Story 2 & 1)

1.  Complete Phase 1: Setup
2.  Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3.  Complete Phase 3: User Story 2 (Task Management)
4.  Complete Phase 4: User Story 1 (Conversations & Messages)
5.  **STOP and VALIDATE**: Test US2 and US1 independently and together.
6.  Deploy/demo if ready.

### Incremental Delivery

1.  Complete Setup + Foundational → Foundation ready
2.  Add User Story 2 → Test independently → Deploy/Demo
3.  Add User Story 1 → Test independently → Deploy/Demo
4.  Add User Story 3 → Test independently → Deploy/Demo
5.  Each story adds value without breaking previous stories.

### Parallel Team Strategy

With multiple developers:

1.  Team completes Setup + Foundational together.
2.  Once Foundational is done:
    *   Developer A: User Story 2 (Task Management)
    *   Developer B: User Story 1 (Conversations & Messages)
    *   Developer C: User Story 3 (Reminders) - *Note: C depends on A's `tasks` model.*
3.  Stories complete and integrate independently.

---

## Notes

-   [P] tasks = different files, no dependencies
-   [Story] label maps task to specific user story for traceability
-   Each user story should be independently completable and testable
-   Verify tests fail before implementing
-   Commit after each task or logical group
-   Stop at any checkpoint to validate story independently
-   Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
