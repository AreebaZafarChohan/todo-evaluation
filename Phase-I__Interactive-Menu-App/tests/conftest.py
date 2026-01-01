"""Test configuration and fixtures - Task-ID: T039"""

import pytest
from todo_cli import storage


@pytest.fixture(autouse=True)
def reset_storage():
    """
    Reset in-memory storage before each test.
    Task-ID: T039
    """
    storage._tasks.clear()
    storage._next_id = 1
    yield
    # Cleanup after test
    storage._tasks.clear()
    storage._next_id = 1
