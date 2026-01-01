#!/usr/bin/env python3
"""
Test script to verify the enhanced features of the todo CLI application.
Task-ID: T152-T161
"""

import sys
import os
from datetime import date

# Add the src directory to the path so we can import the modules
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from todo_cli.service import TodoService
from todo_cli.models import TaskPriority, TaskCategory


def test_priority_features():
    """Test priority-related features"""
    print("Testing Priority Features...")
    service = TodoService()
    
    # Add a task with high priority
    task = service.add_task("Test priority task", "Test description", priority=TaskPriority.HIGH)
    assert task.priority == TaskPriority.HIGH
    print(f"✓ Added task with ID {task.id} and priority {task.priority.value}")
    
    # Update task priority to low
    updated_task = service.set_task_priority(task.id, TaskPriority.LOW)
    assert updated_task.priority == TaskPriority.LOW
    print(f"✓ Updated task priority to {updated_task.priority.value}")
    
    # Test filtering by priority
    low_priority_tasks = service.get_tasks_by_priority(TaskPriority.LOW)
    assert len(low_priority_tasks) == 1
    print(f"✓ Found {len(low_priority_tasks)} task(s) with low priority")
    
    # Test sorting by priority
    service.add_task("Medium priority task", priority=TaskPriority.MEDIUM)
    service.add_task("High priority task", priority=TaskPriority.HIGH)
    
    all_tasks = service.get_tasks()
    sorted_tasks = service.sort_tasks_by_priority(all_tasks)
    
    # High priority should come first
    assert sorted_tasks[0].priority == TaskPriority.HIGH
    print("✓ Tasks sorted by priority correctly")
    

def test_due_date_features():
    """Test due date-related features"""
    print("\nTesting Due Date Features...")
    service = TodoService()
    
    # Add a task with a due date
    due_date = date.today()
    task = service.add_task("Test due date task", "Test description", due_date=due_date)
    assert task.due_date == due_date
    print(f"✓ Added task with due date {task.due_date}")
    
    # Update due date
    new_due_date = date.today().replace(year=date.today().year + 1)
    updated_task = service.set_due_date(task.id, new_due_date)
    assert updated_task.due_date == new_due_date
    print(f"✓ Updated due date to {updated_task.due_date}")
    
    # Test getting tasks due today
    today_tasks = service.get_tasks_due_today()
    print(f"✓ Found {len(today_tasks)} task(s) due today")
    
    # Add a task with past due date to test overdue
    past_date = date.today().replace(year=date.today().year - 1)
    overdue_task = service.add_task("Overdue task", due_date=past_date)
    overdue_tasks = service.get_overdue_tasks()
    print(f"✓ Found {len(overdue_tasks)} overdue task(s)")


def test_category_features():
    """Test category-related features"""
    print("\nTesting Category Features...")
    service = TodoService()
    
    # Add a task with work category
    task = service.add_task("Test category task", "Test description", category=TaskCategory.WORK)
    assert task.category == TaskCategory.WORK
    print(f"✓ Added task with category {task.category.label}")
    
    # Update category
    updated_task = service.set_category(task.id, TaskCategory.PERSONAL)
    assert updated_task.category == TaskCategory.PERSONAL
    print(f"✓ Updated category to {updated_task.category.label}")
    
    # Test filtering by category
    personal_tasks = service.get_tasks_by_category(TaskCategory.PERSONAL)
    assert len(personal_tasks) == 1
    print(f"✓ Found {len(personal_tasks)} task(s) in personal category")
    
    # Test category statistics
    stats = service.get_category_statistics()
    print(f"✓ Category statistics: {stats}")


def test_search_features():
    """Test search functionality"""
    print("\nTesting Search Features...")
    service = TodoService()
    
    # Add some tasks for searching
    service.add_task("Buy groceries", "Milk, eggs, bread")
    service.add_task("Finish report", "Complete the quarterly report")
    service.add_task("Call mom", "Check on her health")
    
    # Search for "groceries"
    results = service.search_tasks("groceries")
    assert len(results) == 1
    assert results[0].title == "Buy groceries"
    print(f"✓ Found {len(results)} task(s) matching 'groceries'")
    
    # Search for "report"
    results = service.search_tasks("report")
    assert len(results) == 1
    assert results[0].title == "Finish report"
    print(f"✓ Found {len(results)} task(s) matching 'report'")


def test_statistics_features():
    """Test statistics functionality"""
    print("\nTesting Statistics Features...")
    service = TodoService()
    
    # Add some tasks
    service.add_task("Task 1", "Description 1", priority=TaskPriority.HIGH)
    service.add_task("Task 2", "Description 2", priority=TaskPriority.MEDIUM)
    service.add_task("Task 3", "Description 3", priority=TaskPriority.LOW)
    
    # Complete one task
    service.complete_task(1)
    
    # Get statistics
    stats = service.get_statistics()
    print(f"✓ Total tasks: {stats['total']}")
    print(f"✓ Completed tasks: {stats['completed']}")
    print(f"✓ Incomplete tasks: {stats['incomplete']}")
    print(f"✓ Completion rate: {stats['completion_rate']:.1f}%")
    print(f"✓ Priority breakdown: {stats['by_priority']}")
    print(f"✓ Category breakdown: {stats['by_category']}")


def test_bulk_operations():
    """Test bulk operations"""
    print("\nTesting Bulk Operations...")
    service = TodoService()
    
    # Add some tasks
    service.add_task("Bulk task 1", "Description 1")
    service.add_task("Bulk task 2", "Description 2")
    service.add_task("Bulk task 3", "Description 3")
    
    # Complete all tasks
    completed_count = service.complete_all_tasks()
    print(f"✓ Completed {completed_count} tasks in bulk")
    
    # Verify all tasks are now complete
    all_tasks = service.get_tasks()
    completed_tasks = [t for t in all_tasks if t.status.name == 'COMPLETE']
    print(f"✓ Verified {len(completed_tasks)} tasks are marked as complete")


def test_notes_features():
    """Test notes functionality"""
    print("\nTesting Notes Features...")
    service = TodoService()
    
    # Add a task
    task = service.add_task("Test notes task", "Description")
    
    # Add a note to the task
    task_with_note = service.add_note(task.id, "This is a test note")
    notes = service.get_task_notes(task.id)
    
    assert len(notes) == 1
    assert notes[0].text == "This is a test note"
    print(f"✓ Added note to task: '{notes[0].text}'")


def test_subtasks_features():
    """Test subtasks functionality"""
    print("\nTesting Subtasks Features...")
    service = TodoService()
    
    # Add a parent task
    parent_task = service.add_task("Parent task", "This has subtasks")
    
    # Add subtasks
    service.add_subtask(parent_task.id, "Subtask 1")
    service.add_subtask(parent_task.id, "Subtask 2")
    
    # Check subtask progress
    completed, total = service.get_subtask_progress(parent_task.id)
    print(f"✓ Parent task has {total} subtasks, {completed} completed")
    
    # Complete one subtask
    service.complete_subtask(parent_task.id, 1)
    completed, total = service.get_subtask_progress(parent_task.id)
    print(f"✓ After completing 1 subtask: {total} total, {completed} completed")


def test_export_import():
    """Test export/import functionality"""
    print("\nTesting Export/Import Features...")
    service = TodoService()
    
    # Add some tasks
    service.add_task("Export test task", "This will be exported", priority=TaskPriority.HIGH)
    service.add_task("Another export task", "This too", category=TaskCategory.WORK)
    
    # Export tasks
    service.export_tasks("test_export.json")
    print("✓ Tasks exported to test_export.json")
    
    # Create a new service instance to test import
    new_service = TodoService()
    
    # Import tasks
    imported_count = new_service.import_tasks("test_export.json")
    print(f"✓ Imported {imported_count} tasks from test_export.json")
    
    # Verify imported tasks
    imported_tasks = new_service.get_tasks()
    print(f"✓ New service has {len(imported_tasks)} tasks after import")
    
    # Clean up
    if os.path.exists("test_export.json"):
        os.remove("test_export.json")
        print("✓ Cleaned up test export file")


def run_all_tests():
    """Run all tests"""
    print("Starting tests for enhanced todo CLI features...\n")
    
    test_priority_features()
    test_due_date_features()
    test_category_features()
    test_search_features()
    test_statistics_features()
    test_bulk_operations()
    test_notes_features()
    test_subtasks_features()
    test_export_import()
    
    print("\n🎉 All tests passed! Enhanced features are working correctly.")


if __name__ == "__main__":
    run_all_tests()