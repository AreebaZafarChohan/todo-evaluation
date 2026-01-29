# Data Model: AI-Powered Todo Chatbot Database

This document details the logical data model for the AI-Powered Todo Chatbot Database, derived from the feature specification and implementation plan. It describes entities, their attributes, and relationships.

## Entities

### 1. Task

Represents a single to-do item for a user.

*   **id**: Integer, Primary Key. Unique identifier for the task.
*   **user_id**: String, Indexed. Identifier for the owning user. (External reference, as user management is outside database scope).
*   **title**: String, Required. A descriptive name for the task.
*   **description**: Text, Optional. Detailed description of the task.
*   **completed**: Boolean, Default: `false`. Status indicating if the task is finished.
*   **priority**: String, Optional. Importance level of the task. Expected values: 'low', 'medium', 'high'.
*   **due_date**: Timestamp, Optional. Target completion date/time for the task.
*   **created_at**: Timestamp. Timestamp of task creation.
*   **updated_at**: Timestamp. Timestamp of the last task update.

### 2. Conversation

Represents a continuous interaction history between a user and the AI chatbot.

*   **id**: Integer, Primary Key. Unique identifier for the conversation.
*   **user_id**: String, Indexed. Identifier for the owning user. (External reference, as user management is outside database scope).
*   **created_at**: Timestamp. Timestamp of conversation creation.
*   **updated_at**: Timestamp. Timestamp of the last conversation update.
*   **is_deleted**: Boolean, Default: `false`. Flag for soft deletion of the conversation.

### 3. Message

Represents a single turn of communication within a conversation.

*   **id**: Integer, Primary Key. Unique identifier for the message.
*   **conversation_id**: Integer, Foreign Key (references `Conversation.id`), Indexed. Links to the parent conversation.
*   **user_id**: String, Indexed. Identifier for the user who sent the message.
*   **role**: String, Required. Originator of the message. Expected values: 'user', 'assistant', 'system', 'tool'.
*   **content**: Text. The message text.
*   **metadata**: JSONB, Optional. Structured data, e.g., for tool calls.
*   **created_at**: Timestamp. Timestamp of message creation.

### 4. Reminder

Represents a scheduled notification associated with a task.

*   **id**: Integer, Primary Key. Unique identifier for the reminder.
*   **task_id**: Integer, Foreign Key (references `Task.id`). Links to the associated task.
*   **user_id**: String, Indexed. Identifier for the owning user. (External reference, as user management is outside database scope).
*   **next_trigger_at**: Timestamp, Indexed. The timestamp for the next scheduled alert.
*   **repeat_interval_minutes**: Integer. Duration in minutes between repeating reminders. 0 or null for one-time reminders.
*   **active**: Boolean. Status indicating if the reminder is currently enabled.

## Relationships

*   **One User to Many Tasks**: A `user_id` in the `Task` entity links a task to its owner.
*   **One User to Many Conversations**: A `user_id` in the `Conversation` entity links a conversation to its owner.
*   **One Conversation to Many Messages**: `Message.conversation_id` forms a foreign key relationship to `Conversation.id`. Deleting a Conversation should CASCADE delete associated Messages.
*   **One Task to Zero or More Reminders**: `Reminder.task_id` forms a foreign key relationship to `Task.id`. Deleting a Task should CASCADE delete associated Reminders.

## Indexing Strategy

To optimize query performance, the following indexes are planned:

*   `tasks.user_id`
*   `tasks.completed`
*   `tasks.due_date`
*   `conversations.user_id`
*   `messages.conversation_id`
*   `messages.user_id`
*   `reminders.next_trigger_at`
*   `reminders.user_id`

## Data Integrity Rules (Enforced by Foreign Keys and Application Logic)

*   Tasks must always belong to a valid user.
*   Conversations are isolated per user.
*   Messages cannot exist without a valid conversation.
*   Reminders must reference a valid task.
*   Deletion of a conversation will cascade to its messages.
*   Deletion of a task will cascade to its reminders.
*   Soft deletion for conversations will be managed via the `is_deleted` flag.
