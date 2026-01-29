# Data Model: AI-Powered Todo Chatbot Backend

## Entities

### User

-   **Description**: Represents a user of the application.
-   **Attributes**:
    -   `user_id` (string): Unique identifier for the user.

### Task

-   **Description**: Represents a todo item.
-   **Attributes**:
    -   `task_id` (string): Unique identifier for the task.
    -   `user_id` (string): Foreign key referencing the User entity.
    -   `description` (string): The description of the todo item.
    -   `completed` (boolean): Flag indicating if the task is completed.
    -   `due_date` (datetime, optional): The due date for the task.
    -   `priority` (integer): Priority level from 1 (lowest) to 5 (highest).

### Conversation

-   **Description**: Represents a chat history between a user and the chatbot.
-   **Attributes**:
    -   `conversation_id` (string): Unique identifier for the conversation.
    -   `user_id` (string): Foreign key referencing the User entity.
    -   `messages` (array of Message): A list of messages in the conversation.

### Message

-   **Description**: Represents a single message in a conversation.
-   **Attributes**:
    -   `message_id` (string): Unique identifier for the message.
    -   `conversation_id` (string): Foreign key referencing the Conversation entity.
    -   `role` (string): The role of the sender (e.g., "user", "assistant").
    -   `content` (string): The content of the message.
