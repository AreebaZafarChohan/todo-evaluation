"""Test that original functionality still works with themes"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from todo_cli.service import TodoService
from todo_cli.models import TaskStatus, TaskPriority, TaskCategory

def test_original_functionality():
    print("Testing that original functionality still works with themes...")
    
    # Create a service instance
    service = TodoService()
    
    # Test adding a task
    task = service.add_task("Test task", "This is a test task", TaskPriority.MEDIUM)
    print(f"Added task: ID {task.id}, Title: {task.title}")
    
    # Test getting all tasks
    tasks = service.get_tasks()
    print(f"Retrieved {len(tasks)} task(s)")
    assert len(tasks) == 1, "Should have 1 task"
    
    # Test updating a task
    updated_task = service.update_task(task.id, "Updated test task", "Updated description")
    print(f"Updated task: Title: {updated_task.title}, Description: {updated_task.description}")
    assert updated_task.title == "Updated test task", "Title not updated"
    
    # Test completing a task
    completed_task = service.complete_task(task.id)
    print(f"Completed task: Status is {completed_task.status}")
    assert completed_task.status == TaskStatus.COMPLETE, "Task not completed"
    
    # Test adding a note
    task_with_note = service.add_note(task.id, "This is a test note")
    print(f"Task has {len(task_with_note.notes)} note(s)")
    assert len(task_with_note.notes) == 1, "Note not added"
    
    # Test adding a subtask
    task_with_subtask = service.add_subtask(task.id, "Test subtask")
    print(f"Task has {len(task_with_subtask.subtasks)} subtask(s)")
    assert len(task_with_subtask.subtasks) == 1, "Subtask not added"
    
    # Test statistics
    stats = service.get_statistics()
    print(f"Statistics - Total: {stats['total']}, Completed: {stats['completed']}")
    
    # Test theme functionality still works
    service.set_theme("dark")
    print(f"Theme changed to: {service.get_current_theme()}")
    
    service.set_theme("colorful")
    print(f"Theme changed to: {service.get_current_theme()}")
    
    print("\nOriginal functionality test completed successfully!")

if __name__ == "__main__":
    test_original_functionality()