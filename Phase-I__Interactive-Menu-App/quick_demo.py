#!/usr/bin/env python3
"""Quick demo without pauses - Task-ID: DEMO"""

import sys
sys.path.insert(0, 'src')

from todo_cli.service import TodoService
from todo_cli.ui import clear_screen, display_tasks
from colorama import Fore, Style

service = TodoService()

print(Fore.YELLOW + Style.BRIGHT + "\n=== DEMO: Adding Tasks ===\n")

# Add tasks
task1 = service.add_task("Buy groceries", "Milk, eggs, bread, cheese")
print(Fore.GREEN + f"✓ Added task {task1.id}: {task1.title}")

task2 = service.add_task("Finish report", "Quarterly review due Friday")
print(Fore.GREEN + f"✓ Added task {task2.id}: {task2.title}")

task3 = service.add_task("Call dentist", "")
print(Fore.GREEN + f"✓ Added task {task3.id}: {task3.title} (no description)")

print(Fore.YELLOW + Style.BRIGHT + "\n=== DEMO: Displaying All Tasks ===\n")
display_tasks(service.get_tasks())

print(Fore.YELLOW + Style.BRIGHT + "\n=== DEMO: Completing Tasks ===\n")

# Complete tasks
service.complete_task(1)
print(Fore.GREEN + f"✓ Task 1 marked as complete")

service.complete_task(3)
print(Fore.GREEN + f"✓ Task 3 marked as complete")

print(Fore.YELLOW + Style.BRIGHT + "\n=== DEMO: Final Display with Completed Tasks ===\n")
display_tasks(service.get_tasks())

# Summary
tasks = service.get_tasks()
completed = sum(1 for t in tasks if t.status.value == "complete")
incomplete = sum(1 for t in tasks if t.status.value == "incomplete")

print(Fore.YELLOW + Style.BRIGHT + "=== Summary ===")
print(f"Total: {len(tasks)} tasks")
print(Fore.GREEN + f"✓ Complete: {completed}")
print(Fore.WHITE + f"○ Incomplete: {incomplete}")
print()
print(Fore.CYAN + Style.BRIGHT + "Interactive app ready! Run: python3 src/todo_cli/main.py")
print()
