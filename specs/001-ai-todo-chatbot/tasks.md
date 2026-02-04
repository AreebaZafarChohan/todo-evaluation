# Tasks: AI-Powered Todo Chatbot Frontend

**Branch**: `001-ai-todo-chatbot` | **Date**: 2026-01-29 | **Spec**: ./specs/001-ai-todo-chatbot/spec.md
**Plan**: ./specs/001-ai-todo-chatbot/plan.md

## Overview

This document outlines the implementation tasks for the AI-Powered Todo Chatbot Frontend feature, organized into phases based on user stories and their priorities. The tasks are designed to be atomic, sequential, and testable, facilitating an incremental delivery approach.

## Dependencies and Completion Order

The user stories are prioritized as follows, defining the overall completion order:

1.  **User Story 1 (P1)**: Conversational Task Management
2.  **User Story 2 (P2)**: Conversation Continuity
3.  **User Story 3 (P2)**: Real-time AI Feedback
4.  **User Story 4 (P3)**: Notification for Reminders

Foundational tasks must be completed before any user story tasks. Polish and cross-cutting concerns can be addressed throughout or in a final phase.

## Parallel Execution Opportunities

Tasks marked with `[P]` can potentially be worked on in parallel, provided their direct dependencies are met. This is particularly relevant for UI components or independent utility functions.

## Implementation Strategy

An MVP-first approach is recommended, focusing on delivering User Story 1 (Conversational Task Management) as the initial functional increment. Subsequent user stories can then be integrated incrementally.

---

## Phase 1: Setup

*   `T001` [X] Review existing Phase II frontend project structure, dependencies, and build process (`frontend/`).
*   `T002` [X] Install OpenAI ChatKit UI library in `frontend/`.
*   `T003` [X] Verify ChatKit installation by running a simple test component (`frontend/src/app/chat/test-chatkit.tsx`).

## Phase 2: Foundational

*   `T004` [X] Create dedicated chatbot route `frontend/src/app/chat/page.tsx` and `frontend/src/app/chat/layout.tsx`.
*   `T005` [X] Integrate Phase II layout and navigation into `frontend/src/app/chat/layout.tsx`.
*   `T006` [X] Add a navigation link/button to the chatbot page from an existing suitable location (e.g., header, sidebar) in `frontend/src/components/layout/main-nav.tsx` (example path).
*   `T007` [X] Implement authentication guard for the `/chat` route in `frontend/src/middleware.ts` (example path) to redirect unauthenticated users.

## Phase 3: User Story 1 - Conversational Task Management (P1) `[US1]`

**Goal**: Enable users to manage todo tasks using natural language via the chatbot.
**Independent Test Criteria**: A user can open the chat interface, initiate a conversation to create a task, see the task confirmation in the chat, and then verify the task appears in their todo list.

*   `T008` [X] `[US1]` Create base Chat UI component in `frontend/src/components/chat/ChatWindow.tsx`.
*   `T009` [X] `[US1]` Implement message list container within `ChatWindow.tsx` to display messages.
*   `T010` [X] `[US1]` Implement input field with send action (Enter key) and multiline support (Shift+Enter) in `frontend/src/components/chat/ChatInput.tsx`.
*   `T011` [X] `[US1]` Implement client-side logic to connect `ChatInput.tsx` to existing API client patterns for `POST /api/{user_id}/chat` in `frontend/src/lib/chat-api.ts` (example path).
*   `T012` [X] `[US1]` Attach JWT token from existing Better Auth session to chat API requests in `frontend/src/lib/chat-api.ts`.
*   `T013` [X] `[US1]` Display user messages in `ChatWindow.tsx` immediately after sending.
*   `T014` [X] `[US1]` Implement displaying AI confirmations (concise, consistent, action-oriented) for task operations in `ChatWindow.tsx`.
*   `T015` [X] `[US1]` Implement displaying tool actions summaries (concise, consistent, action-oriented) in `ChatWindow.tsx`.
*   `T016` [X] `[US1]` Implement displaying friendly confirmations (concise, consistent, action-oriented) after task operations in `ChatWindow.tsx`.

## Phase 4: User Story 2 - Conversation Continuity (P2) `[US2]`

**Goal**: Preserve chatbot conversations across sessions for context.
**Independent Test Criteria**: A user can start a conversation, close and reopen the application, and then see the previously started conversation loaded in the chat interface.

*   `T017` [X] `[US2]` Implement conversation initialization logic on page load (`frontend/src/app/chat/page.tsx`) to check for existing conversation ID.
*   `T018` [X] `[US2]` Implement runtime state management for `conversation_id` (e.g., React Context or Zustand) in `frontend/src/context/ChatContext.tsx` (example path).
*   `T019` [X] `[US2]` If no `conversation_id` exists, send an initial message to the backend to create a new conversation and get an ID (`frontend/src/lib/chat-api.ts`).
*   `T020` [X] `[US2]` Display previous conversation history in `ChatWindow.tsx` upon loading an existing conversation.
*   `T021` [X] `[US2]` Implement "New Chat" user action to reset `conversation_id` and start a fresh conversation.

## Phase 5: User Story 3 - Real-time AI Feedback (P2) `[US3]`

**Goal**: Provide real-time streaming responses and indicators from the AI chatbot.
**Independent Test Criteria**: A user can send a message and observe the chatbot's response appearing character by character, along with a typing indicator.

*   `T022` [X] `[US3]` Implement stream reader for `text/event-stream` responses from `POST /api/{user_id}/chat` in `frontend/src/lib/chat-api.ts`.
*   `T023` [X] `[US3]` Render partial assistant messages in `ChatWindow.tsx` as they stream, updating the message bubble in real-time.
*   `T024` [X] `[US3]` Implement a typing/streaming indicator to be displayed while the AI assistant is generating a response in `ChatWindow.tsx`.
*   `T025` [X] `[US3]` Disable `ChatInput.tsx` while the AI assistant is responding.
*   `T026` [X] `[US3]` Auto-scroll `ChatWindow.tsx` to the latest message as new streamed content arrives.
*   `T027` [X] `[US3]` Finalize the assistant message in `ChatWindow.tsx` after the `end` event from the stream is received.

## Phase 6: User Story 4 - Notification for Reminders (P3) `[US4]`

**Goal**: Receive browser notifications and sound alerts for task reminders.
**Independent Test Criteria**: A user can set a reminder with the chatbot and then receive a browser notification and sound alert at the specified time, even if the browser tab is in the background.

*   `T028` [X] `[US4]` Implement logic to request browser notification permissions (`frontend/src/lib/notifications.ts`).
*   `T029` [X] `[US4]` Display browser notifications for task reminders (`frontend/src/lib/notifications.ts`).
*   `T030` [X] `[US4]` Play a default system notification sound for reminders (`frontend/src/lib/notifications.ts`).
*   `T031` [X] `[US4]` Handle cases where notification permissions are denied gracefully (`frontend/src/lib/notifications.ts`).
*   `T032` [X] `[US4]` Integrate reminder notification triggers into the chat UI based on AI responses (e.g., AI sets a reminder, frontend schedules notification) in `frontend/src/app/chat/page.tsx` and `frontend/src/lib/chat-api.ts` (for processing `tool_call`/`confirmation` event types).

## Final Phase: Polish & Cross-Cutting Concerns

*   `T033` [PARTIAL] Implement keyboard navigation support for the chat interface (e.g., tab to input, arrow keys for message history) in `frontend/src/components/chat/ChatWindow.tsx`. Note: Enter/Shift+Enter implemented; full arrow key navigation pending.
*   `T034` [X] Ensure mobile-friendly layout for the chat interface using existing Tailwind CSS utility classes in `frontend/src/app/chat/page.tsx` and `frontend/src/components/chat/ChatWindow.tsx`.
*   `T035` [X] Verify visual consistency of the chat UI with the existing Phase II UI components and styling.
*   `T036` [X] Implement appropriate loading states for initial conversation load and message sending in `frontend/src/app/chat/page.tsx` and `frontend/src/components/chat/ChatWindow.tsx`.
*   `T037` [X] Implement empty states for no messages in a new conversation in `frontend/src/components/chat/ChatWindow.tsx`.
*   `T038` [X] Implement user-friendly error messages for network failures in `frontend/src/lib/chat-api.ts` and display in `ChatWindow.tsx`.
*   `T039` [X] Implement user-friendly error messages for streaming interruptions (e.g., partial message received) and display in `ChatWindow.tsx`.
*   `T040` [X] Implement user-friendly error messages for backend errors (`type: "error"` event from stream or non-streaming API errors) and display in `ChatWindow.tsx`.
*   `T041` [X] Implement handling for expired or invalid sessions, triggering redirect to login page in `frontend/src/lib/chat-api.ts` and `frontend/src/app/chat/page.tsx`.

## Testing Tasks

*   `T042` Create unit tests for `ChatInput.tsx` for send action and multiline behavior (`frontend/src/components/chat/ChatInput.test.tsx`).
*   `T043` Create unit tests for `ChatWindow.tsx` for message rendering, typing indicator, and auto-scroll (`frontend/src/components/chat/ChatWindow.test.tsx`).
*   `T044` Create integration tests for authentication guard on `/chat` route (`frontend/tests/integration/auth-chat.test.ts`).
*   `T045` Create integration tests for streaming response handling, including partial messages and finalization (`frontend/tests/integration/streaming-chat.test.ts`).
*   `T046` Create end-to-end tests for a full conversational task management flow (`frontend/tests/e2e/conversational-tasks.test.ts`).

---
**End of Tasks**