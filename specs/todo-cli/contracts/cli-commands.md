# CLI Contracts: Todo CLI Application

This document defines the contract for all user-facing CLI commands.

## Command: `add`

- **Description**: Adds a new task to the list.
- **Usage**: `todo_cli add <TITLE> [OPTIONS]`
- **Arguments**:
  - `TITLE` (string, required): The title of the task. Must be enclosed in quotes if it contains spaces.
- **Options**:
  - `--description TEXT`: An optional description for the task.
- **Success Output**:
  - Prints a confirmation message, e.g., `Success: Added task 1: "Buy milk"`.
- **Error Output**:
  - If title is missing or empty: Prints a validation error.
  - If title exceeds 200 characters: Prints a validation error.

## Command: `list`

- **Description**: Displays all tasks in the list.
- **Usage**: `todo_cli list`
- **Output**:
  - Prints a formatted table with columns: `ID`, `Title`, `Description`, `Status`.
  - Tasks are sorted by ID in ascending order.
  - If no tasks exist, prints a message like `No tasks found.`.

## Command: `update`

- **Description**: Updates the title and/or description of an existing task.
- **Usage**: `todo_cli update <TASK_ID> [OPTIONS]`
- **Arguments**:
  - `TASK_ID` (integer, required): The ID of the task to update.
- **Options**:
  - `--title TEXT`: The new title for the task.
  - `--description TEXT`: The new description for the task.
- **Success Output**:
  - Prints a confirmation message, e.g., `Success: Updated task 1.`.
- **Error Output**:
  - If `TASK_ID` is not found: Prints an error, e.g., `Error: Task with ID 1 not found.`.
  - If no update options (`--title` or `--description`) are provided: Prints a usage error.

## Command: `delete`

- **Description**: Deletes a task from the list.
- **Usage**: `todo_cli delete <TASK_ID>`
- **Arguments**:
  - `TASK_ID` (integer, required): The ID of the task to delete.
- **Success Output**:
  - Prints a confirmation message, e.g., `Success: Deleted task 1.`.
- **Error Output**:
  - If `TASK_ID` is not found: Prints an error, e.g., `Error: Task with ID 1 not found.`.

## Command: `toggle`

- **Description**: Toggles the status of a task (incomplete <-> complete).
- **Usage**: `todo_cli toggle <TASK_ID>`
- **Arguments**:
  - `TASK_ID` (integer, required): The ID of the task to toggle.
- **Success Output**:
  - Prints a confirmation message, e.g., `Success: Task 1 marked as complete.`.
- **Error Output**:
  - If `TASK_ID` is not found: Prints an error, e.g., `Error: Task with ID 1 not found.`.
