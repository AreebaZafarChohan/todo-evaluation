# Feature Specification: AI-Powered Todo Chatbot Database

**Feature Branch**: `001-ai-todo-db`
**Created**: 2026-01-29
**Status**: Draft
**Input**: User description: "You are Spec-Kit Plus acting as a senior database architect. Create a database specification for Phase III: AI-Powered Todo Chatbot. Scope: - DATABASE ONLY - Phase III ONLY - Neon Serverless PostgreSQL - SQLModel ORM (Python) - Stateless backend architecture - Used by FastAPI + MCP + AI Agent - Authentication via Better Auth (user_id is trusted after JWT verification) Goals: - Persist chatbot conversations - Persist messages for stateless chat - Support AI-driven task management - Support reminders and notifications - Support streaming AI responses (final output persistence) Database Requirements: ### Core Tables 1. tasks - id (integer, primary key) - user_id (string, indexed) - title (string, required) - description (text, optional) - completed (boolean, default false) - priority (string, optional: low | medium | high) - due_date (timestamp, optional) - created_at (timestamp) - updated_at (timestamp) 2. conversations - id (integer, primary key) - user_id (string, indexed) - created_at (timestamp) - updated_at (timestamp) 3. messages - id (integer, primary key) - conversation_id (integer, foreign key) - user_id (string, indexed) - role (string: user | assistant | system | tool) - content (text) - created_at (timestamp) 4. reminders - id (integer, primary key) - task_id (integer, foreign key) - user_id (string, indexed) - next_trigger_at (timestamp) - repeat_interval_minutes (integer) - active (boolean) ### Relationships - One user → many tasks - One user → many conversations - One conversation → many messages - One task → zero or more reminders ### Indexing Requirements - tasks.user_id - tasks.completed - tasks.due_date - conversations.user_id - messages.conversation_id - reminders.next_trigger_at ### Data Integrity Rules - Tasks must always belong to a user - Conversations are isolated per user - Messages cannot exist without conversation - Reminders must reference a valid task ### AI & Streaming Considerations - Streaming tokens are NOT stored individually - Only final assistant message is persisted - Tool calls may be stored as structured metadata (optional JSON field) ### Out of Scope - Database migrations tooling - Seeding scripts - Analytics tables - Frontend concerns Constraints: - Do NOT write SQL or ORM code - Do NOT include backend logic - Focus on structure, relations, and constraints only Output Format: - Clear table definitions - Field descriptions - Relationships - Indexing strategy - Ready for Phase III planning"

## User Scenarios & Testing

### User Story 1 - Persist Chatbot Conversations and Messages (Priority: P1)

The AI-Powered Todo Chatbot system needs to store and retrieve entire conversation histories, including all user and assistant messages, to maintain context for stateless chat sessions. This ensures a continuous and coherent user experience.

**Why this priority**: Core functionality for any chatbot to be useful and maintain conversation context. Without this, the chatbot cannot function effectively.

**Independent Test**: Can be fully tested by initiating a conversation, exchanging multiple messages, and then retrieving the entire conversation history to verify all messages are present and ordered correctly.

**Acceptance Scenarios**:

1.  **Given** a new user-AI interaction, **When** the AI chatbot starts a conversation, **Then** a new conversation record is created, linked to the user.
2.  **Given** an active conversation, **When** a user sends a message, **Then** the message is stored, linked to the conversation and user, with the correct role and content.
3.  **Given** an active conversation, **When** the AI sends a final response, **Then** the final assistant message is stored, linked to the conversation and user, with the correct role and content.
4.  **Given** a user with existing conversations, **When** the system requests conversation history, **Then** all messages for that conversation are retrieved in chronological order.

### User Story 2 - AI-Driven Task Management (Priority: P1)

The AI-Powered Todo Chatbot system must reliably store, retrieve, and update tasks that users create, modify, or mark as complete through natural language interactions.

**Why this priority**: Central to the "Todo" aspect of the chatbot, enabling users to manage their tasks effectively.

**Independent Test**: Can be fully tested by interacting with the chatbot to create a task, update its properties (e.g., priority, due date), mark it as completed, and then querying for the task's state.

**Acceptance Scenarios**:

1.  **Given** a user input to create a task, **When** the AI identifies a new task, **Then** a new task record is created with the provided details, linked to the user.
2.  **Given** an existing task, **When** a user provides an update (e.g., change priority, set due date, mark complete), **Then** the corresponding task record is updated with the new details.
3.  **Given** a user requests their tasks, **When** the system queries for tasks, **Then** all tasks belonging to the user are retrieved with their current status.

### User Story 3 - Manage Reminders and Notifications (Priority: P2)

The AI-Powered Todo Chatbot system needs to persist and retrieve reminders associated with tasks, allowing for future notification mechanisms.

**Why this priority**: Enhances the utility of task management by providing proactive alerts, but is not as critical as basic conversation and task persistence.

**Independent Test**: Can be fully tested by creating a task, setting a reminder for it via the chatbot, and then retrieving the reminder details.

**Acceptance Scenarios**:

1.  **Given** a user input to set a reminder for a task, **When** the AI chatbot processes the request, **Then** a new reminder record is created, linked to the specified task and user, with its trigger time and recurrence.
2.  **Given** an active reminder, **When** the system checks for upcoming triggers, **Then** relevant reminder records are retrieved based on `next_trigger_at`.
3.  **Given** an active reminder, **When** the system needs to deactivate it, **Then** the reminder record's `active` status is updated.

### Edge Cases

-   What happens when a user attempts to create a task without a title? (System should prevent creation or prompt for title).
-   How does the system handle concurrent updates to the same conversation or task? (Database concurrency control mechanisms should ensure data integrity).
-   What happens if a `task_id` referenced by a `reminder` no longer exists? (Database integrity rules should prevent orphaned reminders or handle deletion).

## Assumptions

### Data Volume Assumptions

-   Maximum expected users: 10,000
-   Maximum expected tasks per user: 1,000
-   Maximum expected messages per conversation: 500

## Requirements

### Functional Requirements

-   **FR-001**: System MUST store `tasks` with the following attributes:
    -   `id`: unique identifier (integer, primary key).
    -   `user_id`: identifier for the owning user (string, indexed).
    -   `title`: a descriptive name for the task (string, required).
    -   `description`: optional detailed description (text).
    -   `completed`: status indicating if the task is finished (boolean, default false).
    -   `priority`: importance level of the task (string, optional: 'low', 'medium', 'high').
    -   `due_date`: target completion date/time (timestamp, optional).
    -   `created_at`: timestamp of task creation.
    -   `updated_at`: timestamp of the last task update.
-   **FR-002**: System MUST store `conversations` with the following attributes:
    -   `id`: unique identifier (integer, primary key).
    -   `user_id`: identifier for the owning user (string, indexed).
    -   `created_at`: timestamp of conversation creation.
    -   `updated_at`: timestamp of the last conversation update.
-   **FR-003**: System MUST store `messages` with the following attributes:
    -   `id`: unique identifier (integer, primary key).
    -   `conversation_id`: foreign key linking to `conversations` (integer).
    -   `user_id`: identifier for the sending user (string, indexed).
    -   `role`: originator of the message ('user', 'assistant', 'system', 'tool').
    -   `content`: the message text (text).
    -   `created_at`: timestamp of message creation.
-   **FR-004**: System MUST store `reminders` with the following attributes:
    -   `id`: unique identifier (integer, primary key).
    -   `task_id`: foreign key linking to `tasks` (integer).
    -   `user_id`: identifier for the owning user (string, indexed).
    -   `next_trigger_at`: timestamp for the next scheduled alert.
    -   `repeat_interval_minutes`: duration between repeating reminders (integer).
    -   `active`: status indicating if the reminder is currently enabled (boolean).
-   **FR-005**: The database MUST enforce a relationship where one user can have many tasks.
-   **FR-006**: The database MUST enforce a relationship where one user can have many conversations.
-   **FR-007**: The database MUST enforce a relationship where one conversation can have many messages.
-   **FR-008**: The database MUST enforce a relationship where one task can have zero or more reminders.
-   **FR-009**: The database MUST ensure that a `task` record always belongs to a valid `user`.
-   **FR-010**: The database MUST ensure that `conversation` records are isolated and unique per `user`.
-   **FR-011**: The database MUST ensure that `message` records cannot exist without a valid `conversation`.
-   **FR-012**: The database MUST ensure that `reminder` records must reference a valid `task`.
-   **FR-013**: The database MUST support indexing on `tasks.user_id`, `tasks.completed`, and `tasks.due_date` for efficient querying.
-   **FR-014**: The database MUST support indexing on `conversations.user_id` for efficient querying.
-   **FR-015**: The database MUST support indexing on `messages.conversation_id` for efficient querying.
-   **FR-016**: The database MUST support indexing on `reminders.next_trigger_at` for efficient querying of upcoming reminders.
-   **FR-017**: The database MUST NOT store streaming tokens individually for AI responses.
-   **FR-018**: The database MUST only persist the final complete assistant message for each AI turn.
-   **FR-019**: The database MAY include an optional field in the `messages` table to store structured metadata for tool calls (e.g., a JSON field).
-   **FR-020**: The database MUST support soft deletion for conversations, allowing records to be marked as inactive or deleted without immediate physical removal, to facilitate potential recovery or analytics.

### Key Entities

-   **Task**: Represents a single, actionable item that a user wants to track and manage. It includes details such as description, completion status, priority, and due date.
-   **Conversation**: Represents a chronological sequence of interactions between a specific user and the AI chatbot. It serves as a container for messages to maintain chat context.
-   **Message**: Represents a discrete unit of communication within a conversation. It captures who sent the message (user, assistant, system, tool) and its content.
-   **Reminder**: Represents a scheduled notification associated with a task, designed to alert the user at a specified time or interval.

## Success Criteria

### Measurable Outcomes

-   **SC-001**: Retrieval of a complete conversation history (all messages for a given conversation ID) MUST be achieved within 500ms for 95% of requests.
-   **SC-002**: Creation and update operations for tasks MUST complete within 200ms for 95% of requests.
-   **SC-003**: Querying for active reminders within a 24-hour window MUST complete within 300ms for 95% of requests.
-   **SC-004**: The database must maintain 100% data integrity for all defined relationships and constraints (e.g., no orphaned messages or reminders, all tasks linked to users).
-   **SC-005**: The database MUST achieve 99.9% uptime, with Recovery Point Objective (RPO) and Recovery Time Objective (RTO) both within minutes.

## Clarifications

### Session 2026-01-29

- Q: What are the expected maximum numbers of users, tasks per user, and messages per conversation? → A: Users: 10000, Tasks: 1000, Messages: 500
- Q: Are there requirements for database-level data encryption at rest or specific access control policies beyond application-level JWT verification? → A: No specific database-level security requirements beyond application-level controls.
- Q: How should old or inactive conversations be managed (e.g., archiving, soft deletion, hard deletion after a period)? → A: Soft deletion, retaining data for a defined period for potential recovery or analytics.
- Q: What are the target uptime percentage and recovery objectives (RPO/RTO) for the database? → A: 99.9% uptime; RPO and RTO within minutes.

### Functional Requirements

-   **FR-001**: System MUST store `tasks` with the following attributes:
    -   `id`: unique identifier (integer, primary key).
    -   `user_id`: identifier for the owning user (string, indexed).
    -   `title`: a descriptive name for the task (string, required).
    -   `description`: optional detailed description (text).
    -   `completed`: status indicating if the task is finished (boolean, default false).
    -   `priority`: importance level of the task (string, optional: 'low', 'medium', 'high').
    -   `due_date`: target completion date/time (timestamp, optional).
    -   `created_at`: timestamp of task creation.
    -   `updated_at`: timestamp of the last task update.
-   **FR-002**: System MUST store `conversations` with the following attributes:
    -   `id`: unique identifier (integer, primary key).
    -   `user_id`: identifier for the owning user (string, indexed).
    -   `created_at`: timestamp of conversation creation.
    -   `updated_at`: timestamp of the last conversation update.
-   **FR-003**: System MUST store `messages` with the following attributes:
    -   `id`: unique identifier (integer, primary key).
    -   `conversation_id`: foreign key linking to `conversations` (integer).
    -   `user_id`: identifier for the sending user (string, indexed).
    -   `role`: originator of the message ('user', 'assistant', 'system', 'tool').
    -   `content`: the message text (text).
    -   `created_at`: timestamp of message creation.
-   **FR-004**: System MUST store `reminders` with the following attributes:
    -   `id`: unique identifier (integer, primary key).
    -   `task_id`: foreign key linking to `tasks` (integer).
    -   `user_id`: identifier for the owning user (string, indexed).
    -   `next_trigger_at`: timestamp for the next scheduled alert.
    -   `repeat_interval_minutes`: duration between repeating reminders (integer).
    -   `active`: status indicating if the reminder is currently enabled (boolean).
-   **FR-005**: The database MUST enforce a relationship where one user can have many tasks.
-   **FR-006**: The database MUST enforce a relationship where one user can have many conversations.
-   **FR-007**: The database MUST enforce a relationship where one conversation can have many messages.
-   **FR-008**: The database MUST enforce a relationship where one task can have zero or more reminders.
-   **FR-009**: The database MUST ensure that a `task` record always belongs to a valid `user`.
-   **FR-010**: The database MUST ensure that `conversation` records are isolated and unique per `user`.
-   **FR-011**: The database MUST ensure that `message` records cannot exist without a valid `conversation`.
-   **FR-012**: The database MUST ensure that `reminder` records must reference a valid `task`.
-   **FR-013**: The database MUST support indexing on `tasks.user_id`, `tasks.completed`, and `tasks.due_date` for efficient querying.
-   **FR-014**: The database MUST support indexing on `conversations.user_id` for efficient querying.
-   **FR-015**: The database MUST support indexing on `messages.conversation_id` for efficient querying.
-   **FR-016**: The database MUST support indexing on `reminders.next_trigger_at` for efficient querying of upcoming reminders.
-   **FR-017**: The database MUST NOT store streaming tokens individually for AI responses.
-   **FR-018**: The database MUST only persist the final complete assistant message for each AI turn.
-   **FR-019**: The database MAY include an optional field in the `messages` table to store structured metadata for tool calls (e.g., a JSON field).

### Key Entities

-   **Task**: Represents a single, actionable item that a user wants to track and manage. It includes details such as description, completion status, priority, and due date.
-   **Conversation**: Represents a chronological sequence of interactions between a specific user and the AI chatbot. It serves as a container for messages to maintain chat context.
-   **Message**: Represents a discrete unit of communication within a conversation. It captures who sent the message (user, assistant, system, tool) and its content.
-   **Reminder**: Represents a scheduled notification associated with a task, designed to alert the user at a specified time or interval.

## Success Criteria

### Measurable Outcomes

-   **SC-001**: Retrieval of a complete conversation history (all messages for a given conversation ID) MUST be achieved within 500ms for 95% of requests.
-   **SC-002**: Creation and update operations for tasks MUST complete within 200ms for 95% of requests.
-   **SC-003**: Querying for active reminders within a 24-hour window MUST complete within 300ms for 95% of requests.
-   **SC-004**: The database must maintain 100% data integrity for all defined relationships and constraints (e.g., no orphaned messages or reminders, all tasks linked to users).