# Data Model: Backend JWT and Task Management

## Entities

### User

-   **Description**: Represents a user of the application.
-   **Attributes**:
    *   `user_id`: Unique identifier for the user (type will be determined by Better Auth, likely a string).

### Task

-   **Description**: Represents a single to-do item.
-   **Attributes**:
    *   `id`: Unique identifier for the task (UUID).
    *   `title`: The title of the task (string).
    *   `description`: A detailed description of the task (string, optional).
    *   `completed`: Boolean indicating if the task is completed (boolean, default: `false`).
-   **Relationships**:
    *   Belongs to exactly one `User` via `user_id`.