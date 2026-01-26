# Feature Specification: AI-Powered Todo Chatbot Backend

**Feature Branch**: `001-ai-chatbot-backend`
**Created**: 2026-01-26
**Status**: Draft
**Input**: User description: "You are Spec-Kit Plus acting as a senior AI backend architect. Create a backend specification for Phase III: AI-Powered Todo Chatbot. Scope: - Backend ONLY - Phase III only - Python FastAPI - OpenAI Agents SDK (mandatory) - Gemini LLM used via OpenAI-compatible API - Streaming responses required - Official MCP SDK - Better Auth authentication - Stateless server architecture LLM & Agent Requirements: 1. Use OpenAI Agents SDK for agent orchestration 2. Do NOT use OpenAI-hosted models 3. Use Gemini model (e.g. gemini-2.0-flash) via OpenAI-compatible base_url 4. Use AsyncOpenAI client with custom base_url 5. Agent execution MUST support streaming using: - Runner.run_streamed - RunResultStreaming 6. Streaming events must be captured and forwarded to the client Core Responsibilities: 1. Stateless chat API endpoint: - POST /api/{user_id}/chat - Accepts natural language input - Streams AI responses token-by-token - Returns final response + tool invocation summary 2. AI Agent: - Built using OpenAI Agents SDK - Uses Gemini model via OpenAIChatCompletionsModel - Supports streamed execution - Interprets user intent - Uses MCP tools for task operations - Can chain multiple tools in a single request - Always confirms actions in natural language 3. MCP Server: - Built using Official MCP SDK - Exposes task tools: - add_task - list_tasks - update_task - complete_task - delete_task - Tools are stateless - All persistence via database 4. Conversation Handling: - Conversation state stored in database - Server fetches conversation history per request - User and assistant messages stored - Streaming output also persisted after completion - Server holds NO in-memory state between requests 5. Reminder & Notification Logic: - Tasks may include due_date and priority - Backend schedules reminders: - First notification at 5 hours remaining - Repeated notification every 15 minutes - Reminder logic is backend-only 6. Security: - Better Auth for authentication - user_id validated against JWT - MCP tools require authenticated user Out of Scope: - Frontend UI - Database schema design - Deployment - Manual coding Success Criteria: - Gemini-powered agent streams responses - MCP tools invoked correctly - Conversation resumes after server restart - Server remains fully stateless Remember that when you create specs firstly create a folder in specs folder named phase3 and also in history/prompts you will create a folder named also phase3 then you create subfolders according to your specs"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Basic Chat Interaction (Priority: P1)

A user sends a natural language message to the chatbot and receives a streaming response.

**Why this priority**: This is the core functionality of the chatbot.

**Independent Test**: Can be tested by sending a POST request to the chat endpoint and verifying that a response is streamed back.

**Acceptance Scenarios**:

1.  **Given** a user is authenticated, **When** the user sends a message "Hello", **Then** the system streams back a greeting message.
2.  **Given** a user is authenticated, **When** the user sends an empty message, **Then** the system returns an error indicating an empty message is not allowed.

### User Story 2 - Task Management via Chat (Priority: P1)

A user manages their tasks (add, list, update, complete, delete) by conversing with the chatbot.

**Why this priority**: This is the primary purpose of the chatbot.

**Independent Test**: Can be tested by sending messages to the chatbot to perform each of the task management operations and verifying the tasks are manipulated correctly in the database.

**Acceptance Scenarios**:

1.  **Given** a user is authenticated, **When** the user sends "add a task to buy milk", **Then** the system creates a new task "buy milk" and confirms with the user.
2.  **Given** a user is authenticated and has existing tasks, **When** the user sends "list my tasks", **Then** the system returns a list of the user's tasks.
3.  **Given** a user is authenticated and has a task "buy milk", **When** the user sends "complete the task to buy milk", **Then** the system marks the task as complete and confirms with the user.

### User Story 3 - Conversation History (Priority: P2)

A user's conversation with the chatbot is persisted and can be retrieved.

**Why this priority**: This allows for context-aware conversations and a better user experience.

**Independent Test**: Can be tested by having a conversation, restarting the server, and then continuing the conversation to see if the chatbot remembers the context.

**Acceptance Scenarios**:

1.  **Given** a user has had a previous conversation, **When** the user starts a new session, **Then** the system loads the previous conversation history.

### User Story 4 - Task Reminders (Priority: P3)

The system sends reminders to the user for tasks with due dates.

**Why this priority**: This is a value-add feature that enhances the usefulness of the todo app.

**Independent Test**: Can be tested by creating a task with a due date and verifying that reminders are sent at the correct times.

**Acceptance Scenarios**:

1.  **Given** a task has a due date set to 6 hours from now, **When** there are 5 hours remaining, **Then** the system sends a reminder.
2.  **Given** a task has a due date and a reminder has been sent, **When** another 15 minutes passes, **Then** the system sends another reminder.

### Edge Cases

-   What happens when the user's authentication token expires mid-conversation?
-   How does the system handle concurrent requests from the same user?
-   What happens if the underlying LLM API is unavailable?
-   How does the system handle malformed input from the user?

## Requirements *(mandatory)*

### Functional Requirements

-   **FR-001**: The system MUST provide a stateless chat API endpoint at `/api/{user_id}/chat`.
-   **FR-002**: The chat endpoint MUST accept natural language input.
-   **FR-003**: The chat endpoint MUST stream AI responses token-by-token.
-   **FR-004**: The system MUST use an AI agent built with the OpenAI Agents SDK.
-   **FR-005**: The AI agent MUST use a Gemini model via an OpenAI-compatible API.
-   **FR-006**: The AI agent MUST support streamed execution.
-   **FR-007**: The system MUST use MCP tools for task operations (add, list, update, complete, delete).
-   **FR-008**: Conversation state MUST be stored in a database.
-   **FR-009**: The server MUST remain fully stateless, holding no in-memory state between requests.
-   **FR-010**: The system MUST schedule and send reminders for tasks with due dates.
-   **FR-011**: The system MUST use Better Auth for authentication and validate the `user_id` against the JWT.
-   **FR-012**: The chat endpoint MUST return a detailed summary of tool invocations, including the tool name and the arguments it was called with.
-   **FR-013**: The reminder notification delivery mechanism is out of scope for the backend and will be handled by a separate service.

### Key Entities

-   **User**: Represents a user of the application. Attributes: `user_id`.
-   **Task**: Represents a todo item. Attributes: `task_id`, `user_id`, `description`, `completed`, `due_date`, `priority`.
-   **Conversation**: Represents a chat history between a user and the chatbot. Attributes: `conversation_id`, `user_id`, `messages`.
-   **Message**: Represents a single message in a conversation. Attributes: `message_id`, `conversation_id`, `role` (user or assistant), `content`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

-   **SC-001**: The Gemini-powered agent MUST stream responses with a perceived latency of less than 500ms from the user's message being sent.
-   **SC-002**: All MCP tool invocations for task management MUST be completed successfully within 1 second.
-   **SC-003**: The server MUST be able to be restarted without any loss of conversation state for any user.
-   **SC-004**: The server MUST demonstrate statelessness by successfully handling requests from multiple users concurrently without any data leakage or state corruption.