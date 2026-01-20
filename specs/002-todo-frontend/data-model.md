# Data Model: Frontend for Todo Full-Stack Web Application (Phase II)

This document outlines the key data entities and their attributes relevant to the frontend application. These models represent the data consumed and displayed by the frontend, primarily interacting with the FastAPI backend.

## Entities

### User

Represents an authenticated individual within the system. Frontend interacts with User data indirectly through authentication mechanisms (Better Auth) and relies on the backend to manage user identity.

**Attributes**:

-   `id`: Unique identifier for the user (string). This ID is derived implicitly from the JWT on the backend and is not directly exposed or managed by the frontend in API paths.
-   `email`: User's email address (string). Used for authentication.
-   `password`: User's password (string). Handled securely by Better Auth during authentication flow.

**Relationships**:

-   A `User` can have multiple `Task`s.

### Task

Represents a single to-do item belonging to a user. This is the core domain object for the application.

**Attributes**:

-   `id`: Unique identifier for the task (string).
-   `title`: A brief description or title of the task (string).
-   `description`: Optional, more detailed description of the task (string).
-   `completed`: Boolean indicating if the task is completed (`true`) or not (`false`).
-   `user_id`: Identifier of the `User` to whom this task belongs (string). This is managed implicitly by the backend based on the authenticated user.

**Relationships**:

-   Each `Task` belongs to one `User`.

## Data Validation Rules (Frontend Perspective)

-   **Task Title**: MUST be a non-empty string.
-   **Task Status**: MUST be a boolean (`true` for completed, `false` for incomplete).

## Lifecycle / State Transitions (Task)

-   **Created**: Initial state when a new task is added.
-   **Updated**: State after a task's title or description is modified.
-   **Completed**: State when `completed` attribute is set to `true`.
-   **Incomplete**: State when `completed` attribute is set to `false`.
-   **Deleted**: Final state when a task is removed from the system.
