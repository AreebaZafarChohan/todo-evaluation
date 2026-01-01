#!/usr/bin/env python3
"""
Demo script to showcase the enhanced features of the todo CLI application.
"""

import sys
import os
from datetime import date

# Add the src directory to the path so we can import the modules
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from todo_cli.service import TodoService
from todo_cli.models import TaskPriority, TaskCategory


def demo_features():
    """Demonstrate the enhanced features of the todo app"""
    print("🎯 ENHANCED TODO CLI - FEATURE DEMONSTRATION")
    print("="*60)
    
    service = TodoService()
    
    print("\n📋 1. ADDING TASKS WITH PRIORITY, DUE DATE & CATEGORY")
    print("-" * 50)
    
    # Add a high priority work task with due date
    task1 = service.add_task(
        "Complete project proposal", 
        "Finish and submit the quarterly project proposal", 
        priority=TaskPriority.HIGH,
        due_date=date.today().replace(day=date.today().day + 3),  # 3 days from now
        category=TaskCategory.WORK
    )
    print(f"✅ Added: '{task1.title}'")
    print(f"   Priority: {task1.priority.icon} {task1.priority.value.title()}")
    print(f"   Due: {task1.due_date}")
    print(f"   Category: [{task1.category.label}]")
    
    # Add a personal task with low priority
    task2 = service.add_task(
        "Buy groceries", 
        "Milk, eggs, bread, fruits", 
        priority=TaskPriority.LOW,
        due_date=date.today(),
        category=TaskCategory.SHOPPING
    )
    print(f"✅ Added: '{task2.title}'")
    print(f"   Priority: {task2.priority.icon} {task2.priority.value.title()}")
    print(f"   Due: Today ({task2.due_date})")
    print(f"   Category: [{task2.category.label}]")
    
    # Add a medium priority health task
    task3 = service.add_task(
        "Evening jog", 
        "30 minutes of jogging in the park", 
        priority=TaskPriority.MEDIUM,
        due_date=date.today(),
        category=TaskCategory.HEALTH
    )
    print(f"✅ Added: '{task3.title}'")
    print(f"   Priority: {task3.priority.icon} {task3.priority.value.title()}")
    print(f"   Due: Today ({task3.due_date})")
    print(f"   Category: [{task3.category.label}]")
    
    print("\n📊 2. VIEWING TASK STATISTICS")
    print("-" * 30)
    
    stats = service.get_statistics()
    print(f"Total Tasks: {stats['total']}")
    print(f"Completed: {stats['completed']} ({stats['completion_rate']:.1f}%)")
    print(f"Incomplete: {stats['incomplete']}")
    
    print("\nPriority Breakdown:")
    for priority, count in stats['by_priority'].items():
        print(f"  {priority.icon} {priority.value.title()}: {count}")
    
    print("\nCategory Breakdown:")
    for category, count in stats['by_category'].items():
        print(f"  [{category.label}]: {count}")
    
    print("\n🔍 3. ADDING NOTES TO TASKS")
    print("-" * 25)
    
    # Add a note to the first task
    updated_task1 = service.add_note(task1.id, "Remember to include budget breakdown in the proposal")
    print(f"📝 Added note to task '{updated_task1.title}':")
    print(f"   '{updated_task1.notes[0].text}'")
    
    print("\n📝 4. ADDING SUBTASKS")
    print("-" * 20)
    
    # Add subtasks to the first task
    service.add_subtask(task1.id, "Research market trends")
    service.add_subtask(task1.id, "Draft executive summary")
    service.add_subtask(task1.id, "Prepare budget section")
    
    # Complete one subtask
    service.complete_subtask(task1.id, 1)  # Complete first subtask
    
    # Show subtask progress
    completed, total = service.get_subtask_progress(task1.id)
    print(f"📋 Task '{task1.title}' has {total} subtasks")
    print(f"   Progress: {completed}/{total} completed")
    
    print("\n🎯 5. SEARCHING TASKS")
    print("-" * 18)
    
    # Search for tasks containing "proposal"
    search_results = service.search_tasks("proposal")
    print(f"🔍 Found {len(search_results)} task(s) containing 'proposal':")
    for task in search_results:
        print(f"   • {task.title}")
    
    # Search for tasks containing "groceries"
    search_results = service.search_tasks("groceries")
    print(f"🔍 Found {len(search_results)} task(s) containing 'groceries':")
    for task in search_results:
        print(f"   • {task.title}")
    
    print("\n📅 6. SORTING TASKS BY PRIORITY")
    print("-" * 30)
    
    all_tasks = service.get_tasks()
    sorted_tasks = service.sort_tasks_by_priority(all_tasks)
    print("Tasks sorted by priority (High → Medium → Low):")
    for i, task in enumerate(sorted_tasks, 1):
        print(f"   {i}. {task.priority.icon} [{task.id}] {task.title} - {task.priority.value.title()}")
    
    print("\n🎯 7. BULK OPERATIONS")
    print("-" * 20)
    
    print("   Before bulk operation:")
    all_tasks = service.get_tasks()
    incomplete_tasks = [t for t in all_tasks if t.status.name == 'INCOMPLETE']
    print(f"   • {len(incomplete_tasks)} incomplete tasks")
    
    # Demonstrate complete all (but don't actually do it in demo to preserve state)
    print("   • Would complete all incomplete tasks if confirmed")
    
    print("\n🎨 8. THEME MANAGEMENT")
    print("-" * 22)
    
    # Show current theme
    current_theme = service.get_current_theme()
    print(f"   Current theme: {current_theme}")
    
    # Change theme
    service.set_theme("colorful")
    new_theme = service.get_current_theme()
    print(f"   Changed theme to: {new_theme}")
    
    print("\n📥 9. EXPORT/IMPORT FUNCTIONALITY")
    print("-" * 35)
    
    # Export tasks
    service.export_tasks("demo_tasks.json")
    print("   📁 Tasks exported to 'demo_tasks.json'")
    
    # Show a preview of the exported content
    import json
    with open("demo_tasks.json", 'r') as f:
        exported_data = json.load(f)
    print(f"   📋 Exported {len(exported_data)} tasks")
    
    print("\n🎉 DEMONSTRATION COMPLETE!")
    print("="*60)
    print("The enhanced todo CLI application includes 10 powerful features:")
    print("1. 🎯 Priority Levels (High/Medium/Low)")
    print("2. 📅 Due Dates with overdue/today indicators")
    print("3. 🏷️  Categories (Work, Personal, Shopping, Health, Other)")
    print("4. 🔍 Search functionality")
    print("5. 📊 Statistics dashboard")
    print("6. ⚡ Bulk operations")
    print("7. 📝 Notes/comments system")
    print("8. 📋 Subtasks with progress tracking")
    print("9. 🎨 Color themes")
    print("10. 📁 Export/Import tasks (JSON)")
    
    # Clean up demo file
    import os
    if os.path.exists("demo_tasks.json"):
        os.remove("demo_tasks.json")
        print("\n🧹 Demo file cleaned up")


if __name__ == "__main__":
    demo_features()