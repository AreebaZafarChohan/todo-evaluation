# Data Model: Todo CLI Application

This document defines the core data entities for the application, as derived from `spec.md`.

## Task Entity

The primary entity in the system is the `Task`.

- **Entity Name**: `Task`
- **Description**: Represents a single todo item.

### Fields

| Field Name    | Type           | Constraints                               | Description                               |
|---------------|----------------|-------------------------------------------|-------------------------------------------|
| `id`          | `int`          | Required, Unique, Auto-generated          | The unique identifier for the task.       |
| `title`       | `str`          | Required, 1-200 characters                | The main title or summary of the task.    |
| `description` | `str`          | Optional, unlimited length                | A more detailed description of the task.  |
| `status`      | `TaskStatus`   | Required, Enum (`INCOMPLETE`, `COMPLETE`) | The current status of the task.           |

### `TaskStatus` Enum

- **Values**: `INCOMPLETE`, `COMPLETE`
- **Default**: `INCOMPLETE`

### State Transitions

A `Task` can transition between two states:

1.  **Creation**: A new task is always created with the status `INCOMPLETE`.
2.  **Toggle**:
    - If the status is `INCOMPLETE`, it can be toggled to `COMPLETE`.
    - If the status is `COMPLETE`, it can be toggled to `INCOMPLETE`.

### Validation Rules

- The `title` must be between 1 and 200 characters. This will be enforced by the service layer before creating or updating a task.
- The `id` is managed by the storage layer and cannot be set or modified by the user.
