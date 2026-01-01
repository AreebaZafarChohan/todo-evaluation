"""Custom exceptions for the todo application - Task-ID: T008"""


class TaskNotFound(Exception):
    """Raised when a task with the given ID does not exist - Task-ID: T008"""
    def __init__(self, task_id: int) -> None:
        self.task_id = task_id
        super().__init__(f"Task with ID {task_id} not found")


class ValidationError(Exception):
    """Raised when input validation fails - Task-ID: T008"""
    pass
