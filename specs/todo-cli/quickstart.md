# Quickstart: Todo CLI Application (Phase I)

This guide provides instructions on how to set up and run the Todo CLI application.

## 1. Prerequisites

- Python 3.11 or higher
- `pip` for package installation

## 2. Setup

1.  **Clone the repository** (if you haven't already):
    ```bash
    git clone <repository-url>
    cd <repository-name>
    ```

2.  **Create a virtual environment**:
    ```bash
    python -m venv .venv
    source .venv/bin/activate
    ```
    *(On Windows, use `.venv\Scripts\activate`)*

3.  **Install dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

## 3. Running the Application

The application is run from the command line using the `todo_cli` module.

### Add a new task
```bash
python -m todo_cli add "My first task" --description "This is a test task."
```

### List all tasks
```bash
python -m todo_cli list
```

### Update a task
```bash
python -m todo_cli update 1 --title "My updated task"
```

### Toggle a task's status
```bash
python -m todo-cli toggle 1
```

### Delete a task
```bash
python -m todo_cli delete 1
```

## 4. Running Tests

To run the test suite, use `pytest`:

```bash
pytest
```
