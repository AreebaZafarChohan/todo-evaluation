"""UI Layer - Display and input functions - Task-ID: T018-T029, T063-T142"""

import os
import platform
import time
from datetime import date
from colorama import Fore, Style, init
from .models import Task, TaskStatus, TaskPriority, TaskCategory, ColorTheme


# Initialize colorama for cross-platform color support - Task-ID: T019
init(autoreset=True)


def clear_screen():
    """
    Clear terminal screen (cross-platform).
    Task-ID: T018
    """
    try:
        if platform.system() == "Windows":
            os.system('cls')
        else:
            os.system('clear')
    except:
        # Fallback: print newlines
        print('\n' * 50)


def display_header():
    """
    Display application header with borders.
    Task-ID: T020
    """
    print(Fore.CYAN + "=" * 80)
    print(Fore.YELLOW + Style.BRIGHT + "MY TODO LIST".center(80))
    print(Fore.CYAN + "=" * 80)


def display_tasks(tasks: list[Task]):
    """
    Display all tasks with formatted output.
    Task-ID: T021, T063, T075, T085

    Args:
        tasks: List of tasks to display
    """
    clear_screen()
    display_header()
    print()

    if not tasks:
        print(Fore.YELLOW + "No tasks yet! Add your first task to get started.".center(80))
        print()
    else:
        for task in tasks:
            # Priority icon
            priority_icon = task.priority.icon

            # Status icon and color
            if task.status == TaskStatus.COMPLETE:
                status_icon = Fore.GREEN + "✓"
                status_text = Fore.GREEN + "Complete"
            else:
                status_icon = Fore.WHITE + "○"
                status_text = Fore.WHITE + "Incomplete"

            # Category badge
            category_badge = f"[{task.category.label}]"
            category_color = task.category.color

            # Display task with priority icon first
            print(f"{priority_icon} {status_icon} [{task.id}] {Style.BRIGHT}{task.title} {category_color}{category_badge}")
            print(f"    Status: {status_text}")

            # Display due date if exists
            if task.due_date:
                due_date_str = task.due_date.strftime("%Y-%m-%d")
                if task.due_date < date.today() and task.status == TaskStatus.INCOMPLETE:
                    # Overdue
                    print(f"    {Fore.RED}Overdue: {due_date_str}")
                elif task.due_date == date.today() and task.status == TaskStatus.INCOMPLETE:
                    # Due today
                    print(f"    {Fore.YELLOW}Due: Today ({due_date_str})")
                else:
                    # Future due date
                    print(f"    {Fore.WHITE}Due: {due_date_str}")

            if task.description:
                print(f"    Description: {task.description}")
            else:
                print(Fore.WHITE + Style.DIM + "    Description: No description")

            # Show notes indicator if task has notes
            if task.notes:
                print(f"    {Fore.CYAN}Notes: {len(task.notes)}")

            # Show subtasks if any
            if task.subtasks:
                completed, total = len([s for s in task.subtasks if s.status == TaskStatus.COMPLETE]), len(task.subtasks)
                print(f"    {Fore.MAGENTA}Subtasks: {completed}/{total} complete")

                # Show subtasks indented
                for i, subtask in enumerate(task.subtasks):
                    sub_status = "✓" if subtask.status == TaskStatus.COMPLETE else "○"
                    prefix = "    ├─ " if i < len(task.subtasks) - 1 else "    └─ "
                    print(f"    {prefix}{sub_status} {subtask.title}")

            print()

    # Task count
    print(Fore.CYAN + "=" * 80)
    print(Fore.CYAN + f"Total: {len(tasks)} task(s)")
    print()


def show_menu():
    """
    Display main menu with numbered options.
    Task-ID: T022
    """
    print(Fore.YELLOW + Style.BRIGHT + "What would you like to do?")
    print()
    print("1. Add Task")
    print("2. View Tasks")
    print("3. Update Task")
    print("4. Complete Task")
    print("5. Delete Task")
    print("6. Exit")
    print()
    print("--- Optional Features ---")
    print("7. Sort by Priority")
    print("8. Sort by Due Date")
    print("9. Filter by Category")
    print("10. Clear Filter")
    print("11. Search Tasks")
    print("12. View Statistics")
    print("13. Complete All Tasks")
    print("14. Delete Completed Tasks")
    print("15. Add Note to Task")
    print("16. Add Subtask")
    print("17. Change Theme")
    print("18. Export Tasks")
    print("19. Import Tasks")
    print()


def get_menu_choice() -> int:
    """
    Get and validate menu choice from user.
    Task-ID: T023

    Returns:
        Selected menu option (1-19)
    """
    while True:
        try:
            choice = input(Fore.YELLOW + "Enter your choice (1-19): ")
            choice_num = int(choice)

            if 1 <= choice_num <= 19:
                return choice_num
            else:
                show_error("Invalid choice. Please enter a number between 1 and 19.")
        except ValueError:
            show_error("Invalid input. Please enter a number.")
        except KeyboardInterrupt:
            print()
            show_error("Operation cancelled.")
            return 6  # Exit on Ctrl+C


def prompt_title() -> str:
    """
    Prompt user for task title with validation.
    Task-ID: T024

    Returns:
        Valid task title
    """
    while True:
        title = input(Fore.YELLOW + "\nEnter task title: ").strip()

        if not title:
            show_error("Title cannot be empty. Please try again.")
            continue

        if len(title) > 200:
            show_error("Title must be 1-200 characters. Please try again.")
            continue

        return title


def prompt_description() -> str:
    """
    Prompt user for task description (optional).
    Task-ID: T025

    Returns:
        Task description (may be empty)
    """
    description = input(Fore.YELLOW + "Enter description (press Enter to skip): ").strip()
    return description


def prompt_task_id() -> int:
    """
    Prompt user for task ID with numeric validation.
    Task-ID: T026

    Returns:
        Valid task ID
    """
    while True:
        try:
            task_id_input = input(Fore.YELLOW + "\nEnter task ID: ").strip()
            task_id = int(task_id_input)
            return task_id
        except ValueError:
            show_error("Please enter a valid number.")
        except KeyboardInterrupt:
            print()
            raise


def show_success(message: str):
    """
    Display success message in green.
    Task-ID: T027

    Args:
        message: Success message to display
    """
    print()
    print(Fore.GREEN + Style.BRIGHT + f"✓ {message}")
    print()
    pause()


def show_error(message: str):
    """
    Display error message in red.
    Task-ID: T028

    Args:
        message: Error message to display
    """
    print()
    print(Fore.RED + Style.BRIGHT + f"✗ {message}")
    print()


def confirm_delete() -> bool:
    """
    Confirm deletion with yes/no prompt.
    Task-ID: T029

    Returns:
        True if user confirms, False otherwise
    """
    while True:
        response = input(Fore.YELLOW + "Are you sure you want to delete this task? (y/n): ").strip().lower()

        if response in ['y', 'yes']:
            return True
        elif response in ['n', 'no']:
            return False
        else:
            show_error("Please enter 'y' for yes or 'n' for no.")


def pause():
    """Pause briefly for user to see message"""
    time.sleep(1)


def prompt_priority() -> TaskPriority:
    """
    Prompt user for task priority.
    Task-ID: T064

    Returns:
        Selected TaskPriority
    """
    while True:
        print(Fore.YELLOW + "\nSelect priority level:")
        print("1. High (🔴)")
        print("2. Medium (🟡)")
        print("3. Low (🟢)")

        try:
            choice = input(Fore.YELLOW + "Enter choice (1-3): ").strip()
            choice_num = int(choice)

            if choice_num == 1:
                return TaskPriority.HIGH
            elif choice_num == 2:
                return TaskPriority.MEDIUM
            elif choice_num == 3:
                return TaskPriority.LOW
            else:
                show_error("Invalid choice. Please enter 1, 2, or 3.")
        except ValueError:
            show_error("Invalid input. Please enter a number.")


def prompt_due_date() -> date | None:
    """
    Prompt user for task due date.
    Task-ID: T074

    Returns:
        Selected due date or None if skipped
    """
    while True:
        date_input = input(Fore.YELLOW + "\nEnter due date (YYYY-MM-DD) or press Enter to skip: ").strip()

        if not date_input:
            return None  # Skip due date

        try:
            return date.fromisoformat(date_input)
        except ValueError:
            show_error("Invalid date format. Please use YYYY-MM-DD (e.g., 2025-12-31).")


def prompt_category() -> TaskCategory:
    """
    Prompt user for task category.
    Task-ID: T084

    Returns:
        Selected TaskCategory
    """
    while True:
        print(Fore.YELLOW + "\nSelect category:")
        print("1. Work")
        print("2. Personal")
        print("3. Shopping")
        print("4. Health")
        print("5. Other")

        try:
            choice = input(Fore.YELLOW + "Enter choice (1-5): ").strip()
            choice_num = int(choice)

            if choice_num == 1:
                return TaskCategory.WORK
            elif choice_num == 2:
                return TaskCategory.PERSONAL
            elif choice_num == 3:
                return TaskCategory.SHOPPING
            elif choice_num == 4:
                return TaskCategory.HEALTH
            elif choice_num == 5:
                return TaskCategory.OTHER
            else:
                show_error("Invalid choice. Please enter 1, 2, 3, 4, or 5.")
        except ValueError:
            show_error("Invalid input. Please enter a number.")


def prompt_keyword() -> str:
    """
    Prompt user for search keyword.
    Task-ID: T092

    Returns:
        Search keyword
    """
    keyword = input(Fore.YELLOW + "\nEnter keyword to search: ").strip()
    return keyword


def highlight_keyword(text: str, keyword: str) -> str:
    """
    Highlight keyword in text with different color.
    Task-ID: T092

    Args:
        text: Text to highlight in
        keyword: Keyword to highlight

    Returns:
        Text with highlighted keyword
    """
    if not keyword:
        return text

    # Case-insensitive search and replace
    import re
    pattern = re.compile(re.escape(keyword), re.IGNORECASE)
    highlighted = pattern.sub(Fore.CYAN + Style.BRIGHT + r'\g<0>' + Fore.WHITE, text)
    return highlighted


def display_statistics(stats: dict):
    """
    Display task statistics in a formatted dashboard.
    Task-ID: T100

    Args:
        stats: Statistics dictionary from service
    """
    clear_screen()
    print(Fore.CYAN + "=" * 80)
    print(Fore.YELLOW + Style.BRIGHT + "📊 TASK STATISTICS".center(80))
    print(Fore.CYAN + "=" * 80)
    print()

    # Overall stats
    print(f"Total Tasks: {stats['total']}")
    print(f"{Fore.GREEN}✓ Completed: {stats['completed']} ({stats['completion_rate']:.1f}%)")
    print(f"{Fore.WHITE}○ Incomplete: {stats['incomplete']}")
    print()

    # By priority
    print(Fore.YELLOW + "By Priority:")
    for priority, count in stats['by_priority'].items():
        icon = priority.icon
        print(f"  {icon} {priority.value.title()}: {count}")
    print()

    # By category
    print(Fore.YELLOW + "By Category:")
    for category, count in stats['by_category'].items():
        color = category.color
        print(f"  {color}[{category.label}]: {count}")
    print()

    print(Fore.CYAN + "=" * 80)
    print(Fore.YELLOW + "Press Enter to return to menu...")
    try:
        input()
    except KeyboardInterrupt:
        print()


def prompt_task_note() -> str:
    """
    Prompt user for task note text.
    Task-ID: T119

    Returns:
        Note text
    """
    note_text = input(Fore.YELLOW + "\nEnter note text: ").strip()
    return note_text


def prompt_subtask_title() -> str:
    """
    Prompt user for subtask title.
    Task-ID: T130

    Returns:
        Subtask title
    """
    subtask_title = input(Fore.YELLOW + "\nEnter subtask title: ").strip()
    return subtask_title


def prompt_theme() -> str:
    """
    Prompt user for theme selection.
    Task-ID: T139

    Returns:
        Selected theme name
    """
    while True:
        print(Fore.YELLOW + "\nSelect theme:")
        print("1. Default")
        print("2. Dark")
        print("3. Light")
        print("4. Colorful")

        try:
            choice = input(Fore.YELLOW + "Enter choice (1-4): ").strip()
            choice_num = int(choice)

            if choice_num == 1:
                return "default"
            elif choice_num == 2:
                return "dark"
            elif choice_num == 3:
                return "light"
            elif choice_num == 4:
                return "colorful"
            else:
                show_error("Invalid choice. Please enter 1, 2, 3, or 4.")
        except ValueError:
            show_error("Invalid input. Please enter a number.")


def prompt_filename(default: str = "") -> str:
    """
    Prompt user for filename with default.
    Task-ID: T147

    Args:
        default: Default filename

    Returns:
        Selected filename
    """
    filename = input(Fore.YELLOW + f"\nEnter filename (default: {default}): ").strip()
    return filename if filename else default
