# Data Model: AI-Powered Todo Chatbot Frontend

**Date**: 2026-01-29
**Feature**: AI-Powered Todo Chatbot Frontend
**Spec**: ./specs/001-ai-todo-chatbot/spec.md
**Plan**: ./specs/001-ai-todo-chatbot/plan.md

## Overview

As a stateless frontend, this project primarily consumes and displays data managed by the backend. The following data models represent the structure of information exchanged with the FastAPI backend API.

## Entities

### 1. Conversation

Represents a continuous dialogue between the user and the AI chatbot.

*   **`id`** (`string`, unique): Unique identifier for the conversation.
*   **`user_id`** (`string`): Identifier of the user associated with the conversation.
*   **`messages`** (`array` of `Message` objects): A chronologically ordered list of messages in the conversation.
*   **`created_at`** (`datetime`): Timestamp when the conversation was initiated.
*   **`updated_at`** (`datetime`): Timestamp when the conversation was last updated.

### 2. Message

Represents an individual turn within a conversation, from either the user or the AI assistant.

*   **`id`** (`string`, unique): Unique identifier for the message.
*   **`conversation_id`** (`string`): Identifier of the conversation this message belongs to.
*   **`role`** (`enum`: "user", "assistant"): Indicates whether the message is from the user or the AI assistant.
*   **`content`** (`string`): The text content of the message.
*   **`timestamp`** (`datetime`): Timestamp when the message was created.
*   **`tool_calls`** (`array` of `ToolCall` objects, optional): If the assistant's message involved tool usage, details of the tool calls.
*   **`tool_outputs`** (`array` of `ToolOutput` objects, optional): If the assistant's message contains output from tool usage, details of the tool outputs.

### 3. Task (Simplified Frontend View)

Represents a todo item managed by the Phase II application. The frontend interacts with this via AI commands, but the full task details are managed by the backend. This model reflects the essential information the frontend might display or use for basic operations.

*   **`id`** (`string`, unique): Unique identifier for the task.
*   **`title`** (`string`): The title or description of the task.
*   **`status`** (`enum`: "pending", "completed"): The current status of the task.
*   **`due_date`** (`datetime`, optional): The due date for the task.
*   **`reminder_set`** (`boolean`): Indicates if a reminder is active for this task.

## Relationships

*   A `Conversation` contains many `Message`s.
*   A `Message` belongs to one `Conversation`.
*   AI interactions can create, update, or reference `Task`s.

---
**End of Data Model**
