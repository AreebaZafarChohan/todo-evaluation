#!/usr/bin/env python3
"""
Demo script showing Interactive Todo CLI.
Task-ID: T052

Run this to see the application in action.
"""

import sys
import time
sys.path.insert(0, 'src')

from todo_cli.service import TodoService
from todo_cli.ui import (
    clear_screen,
    display_tasks,
    show_menu,
    show_success,
    show_error
)
from colorama import Fore, Style

def demo():
    """Run automated demo of all features"""
    service = TodoService()

    print(Fore.YELLOW + Style.BRIGHT + "=== Interactive Todo CLI Demo ===\n")
    time.sleep(1)

    # Add tasks
    print(Fore.CYAN + "Adding tasks...")
    task1 = service.add_task("Buy groceries", "Milk, eggs, bread, cheese")
    print(f"✓ Added: {task1.title}")

    task2 = service.add_task("Finish report", "Quarterly review due Friday")
    print(f"✓ Added: {task2.title}")

    task3 = service.add_task("Call dentist", "Schedule checkup appointment")
    print(f"✓ Added: {task3.title}")

    task4 = service.add_task("Exercise", "")
    print(f"✓ Added: {task4.title} (no description)")

    time.sleep(2)

    # Display all tasks
    clear_screen()
    display_tasks(service.get_tasks())
    print(Fore.CYAN + "Press Enter to continue...")
    input()

    # Complete some tasks
    print(Fore.CYAN + "\nMarking tasks as complete...")
    service.complete_task(1)
    print(f"✓ Completed: Task 1")

    service.complete_task(3)
    print(f"✓ Completed: Task 3")

    time.sleep(2)

    # Display updated tasks
    clear_screen()
    display_tasks(service.get_tasks())
    print(Fore.CYAN + "Notice the green checkmarks! Press Enter to continue...")
    input()

    # Update a task
    print(Fore.CYAN + "\nUpdating task 4...")
    service.update_task(4, description="30 minutes cardio at gym")
    print("✓ Updated task 4 description")

    time.sleep(2)

    # Final display
    clear_screen()
    display_tasks(service.get_tasks())

    # Summary
    tasks = service.get_tasks()
    completed = sum(1 for t in tasks if t.status.value == "complete")
    incomplete = sum(1 for t in tasks if t.status.value == "incomplete")

    print(Fore.YELLOW + Style.BRIGHT + "\n=== Demo Summary ===")
    print(f"Total tasks: {len(tasks)}")
    print(Fore.GREEN + f"✓ Completed: {completed}")
    print(Fore.WHITE + f"○ Incomplete: {incomplete}")
    print()
    print(Fore.YELLOW + "Demo complete! Run 'python3 src/todo_cli/main.py' for interactive mode.")
    print()

if __name__ == "__main__":
    demo()
