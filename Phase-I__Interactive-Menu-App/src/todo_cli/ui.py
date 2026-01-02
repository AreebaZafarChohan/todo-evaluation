"""UI Layer - Display and input functions - Task-ID: T018-T029, T063-T142"""

import os
import platform
import time
from datetime import date
from colorama import Fore, Style, init
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.text import Text
from rich.prompt import Prompt
from rich.progress import Progress, SpinnerColumn, TextColumn
from .models import Task, TaskStatus, TaskPriority, TaskCategory, ColorTheme, ThemeManager


# Initialize colorama for cross-platform color support - Task-ID: T019
init(autoreset=True)

# Create a global theme manager instance
theme_manager = ThemeManager()

# Create a Rich console instance
console = Console()


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
    # Use Rich to create a beautiful header
    console.print(Panel("🌱 [bold green]MY TODO LIST[/bold green]", expand=False, border_style="cyan"))


def display_tasks(tasks: list[Task]):
    """
    Display all tasks with formatted output.
    Task-ID: T021, T063, T075, T085

    Args:
        tasks: List of tasks to display
    """
    clear_screen()
    display_header()

    if not tasks:
        console.print(Panel("[yellow]📭 No tasks yet! Add your first task to get started.[/yellow]", expand=False))
        return

    from rich import box

    # Create a table for tasks with grid lines
    table = Table(
        title="📋 Your Tasks",
        show_header=True,
        header_style="bold magenta",
        show_lines=True,  # This adds lines between rows
        box=box.ROUNDED  # Using a rounded box style for better visual separation
    )
    table.add_column("ID", style="dim", width=5)
    table.add_column("Priority", width=10)
    table.add_column("Title", width=20)
    table.add_column("Description", width=25)
    table.add_column("Status", width=12)
    table.add_column("Due Date", width=12)
    table.add_column("Category", width=10)
    table.add_column("Notes", width=8)
    table.add_column("Subtasks", width=10)

    for task in tasks:
        # Determine status text and color
        if task.status == TaskStatus.COMPLETE:
            status_text = "[green]✅ Complete[/green]"
        else:
            if task.due_date and task.due_date < date.today():
                status_text = "[red]❌ Overdue[/red]"
            elif task.due_date and task.due_date == date.today():
                status_text = "[yellow]⚠️ Due Today[/yellow]"
            else:
                status_text = "[blue]⏳ Incomplete[/blue]"

        # Format due date
        due_date_str = task.due_date.strftime("%Y-%m-%d") if task.due_date else "None"

        # Format description
        description = task.description[:20] + "..." if len(task.description) > 20 else task.description

        # Format notes count
        notes_count = f"[cyan]{len(task.notes)}[/cyan]" if task.notes else "[dim]-[/dim]"

        # Format subtasks count
        if task.subtasks:
            completed_subtasks = len([s for s in task.subtasks if s.status == TaskStatus.COMPLETE])
            total_subtasks = len(task.subtasks)
            subtasks_count = f"[cyan]{completed_subtasks}/{total_subtasks}[/cyan]"
        else:
            subtasks_count = "[dim]-[/dim]"

        # Add row to table
        table.add_row(
            str(task.id),
            task.priority.icon,
            task.title,
            description or "[italic]No description[/italic]",
            status_text,
            due_date_str,
            task.category.label,
            notes_count,
            subtasks_count
        )

    console.print(table)

    # Show completion stats
    completed_count = len([t for t in tasks if t.status == TaskStatus.COMPLETE])
    total_count = len(tasks)
    if tasks:
        completion_rate = (completed_count / total_count) * 100
        console.print(f"\n[bold cyan]📊 Total: {total_count} task(s)[/bold cyan] | [bold green]✅ Completed: {completed_count} ({completion_rate:.1f}%)[/bold green]")


def show_menu():
    """
    Display main menu with numbered options.
    Task-ID: T022
    """
    # Create a beautiful menu using Rich
    menu_text = Text()
    menu_text.append("What would you like to do?\n\n", style="bold yellow")

    # Core features
    menu_text.append("Core Features:\n", style="bold blue")
    menu_text.append("1. 📝 Add Task\n", style="cyan")
    menu_text.append("2. 📋 View Tasks\n", style="cyan")
    menu_text.append("3. ✏️  Update Task\n", style="cyan")
    menu_text.append("4. ✅ Complete Task\n", style="cyan")
    menu_text.append("5. 🗑️  Delete Task\n", style="cyan")
    menu_text.append("6. 🚪 Exit\n\n", style="cyan")

    # Optional features
    menu_text.append("Optional Features:\n", style="bold blue")
    menu_text.append("7. 📊 Sort by Priority\n", style="green")
    menu_text.append("8. 📅 Sort by Due Date\n", style="green")
    menu_text.append("9. 🏷️  Filter by Category\n", style="green")
    menu_text.append("10. 🔄 Clear Filter\n", style="green")
    menu_text.append("11. 🔍 Search Tasks\n", style="green")
    menu_text.append("12. 📈 View Statistics\n", style="green")
    menu_text.append("13. 🎯 Complete All Tasks\n", style="green")
    menu_text.append("14. 🧹 Delete Completed Tasks\n", style="green")
    menu_text.append("15. 💬 Add Note to Task\n", style="green")
    menu_text.append("16. 📌 Add Subtask\n", style="green")
    menu_text.append("17. 🎨 Change Theme\n", style="green")
    menu_text.append("18. 💾 Export Tasks\n", style="green")
    menu_text.append("19. 📥 Import Tasks\n", style="green")

    console.print(Panel(menu_text, title="Menu", border_style="blue"))


def get_menu_choice() -> int:
    """
    Get and validate menu choice from user.
    Task-ID: T023

    Returns:
        Selected menu option (1-19)
    """
    while True:
        try:
            choice = console.input("[bold yellow]Enter your choice (1-19): [/bold yellow]")
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
        title = console.input("\n[bold yellow]Enter task title: [/bold yellow]").strip()

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
    description = console.input("[bold yellow]Enter description (press Enter to skip): [/bold yellow]").strip()
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
            task_id_input = console.input("\n[bold yellow]Enter task ID: [/bold yellow]").strip()
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
    console.print(f"\n[bold green]✓ {message}[/bold green]\n")
    pause()


def show_error(message: str):
    """
    Display error message in red.
    Task-ID: T028

    Args:
        message: Error message to display
    """
    console.print(f"\n[bold red]✗ {message}[/bold red]\n")


def confirm_delete() -> bool:
    """
    Confirm deletion with yes/no prompt.
    Task-ID: T029

    Returns:
        True if user confirms, False otherwise
    """
    while True:
        response = console.input("[bold yellow]Are you sure you want to delete this task? (y/n): [/bold yellow]").strip().lower()

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
        console.print("\n[bold yellow]Select priority level:[/bold yellow]")
        console.print("1. High (🔴)")
        console.print("2. Medium (🟡)")
        console.print("3. Low (🟢)")

        try:
            choice = console.input("[bold yellow]Enter choice (1-3): [/bold yellow]").strip()
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
        date_input = console.input("\n[bold yellow]Enter due date (YYYY-MM-DD) or press Enter to skip: [/bold yellow]").strip()

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
        console.print("\n[bold yellow]Select category:[/bold yellow]")
        console.print("1. Work")
        console.print("2. Personal")
        console.print("3. Shopping")
        console.print("4. Health")
        console.print("5. Other")

        try:
            choice = console.input("[bold yellow]Enter choice (1-5): [/bold yellow]").strip()
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
    menu_option_color = theme_manager.get_color("menu_option")
    keyword = input(menu_option_color + "\nEnter keyword to search: ").strip()
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
    highlighted = pattern.sub(theme_manager.get_color("info") + Style.BRIGHT + r'\g<0>' + theme_manager.get_color("task_status_incomplete"), text)
    return highlighted


def display_statistics(stats: dict):
    """
    Display task statistics in a formatted dashboard.
    Task-ID: T100

    Args:
        stats: Statistics dictionary from service
    """
    clear_screen()
    display_header()

    # Create a statistics panel using Rich
    stats_text = Text()
    stats_text.append("📊 TASK STATISTICS\n\n", style="bold yellow")

    # Overall stats
    stats_text.append("📈 Overall Statistics:\n", style="bold blue")
    stats_text.append(f"  📊 Total Tasks: {stats['total']}\n", style="cyan")
    stats_text.append(f"  ✅ Completed: {stats['completed']}\n", style="green")
    stats_text.append(f"  🔄 Incomplete: {stats['incomplete']}\n", style="magenta")
    stats_text.append(f"  📈 Completion Rate: {stats['completion_rate']:.1f}%\n\n", style="yellow")

    # By priority
    stats_text.append("🏷️  By Priority:\n", style="bold blue")
    for priority, count in stats['by_priority'].items():
        stats_text.append(f"  {priority.icon} {priority.value.title()}: {count}\n", style="cyan")
    stats_text.append("\n")

    # By category
    stats_text.append("📁 By Category:\n", style="bold blue")
    for category, count in stats['by_category'].items():
        stats_text.append(f"  [{category.label}]: {count}\n", style="cyan")

    console.print(Panel(stats_text, title="Statistics", border_style="green"))

    # Wait for user input
    try:
        console.input("\n[bold yellow]Press Enter to return to menu...[/bold yellow]")
    except KeyboardInterrupt:
        print()


def prompt_task_note() -> str:
    """
    Prompt user for task note text.
    Task-ID: T119

    Returns:
        Note text
    """
    menu_option_color = theme_manager.get_color("menu_option")
    note_text = input(menu_option_color + "\nEnter note text: ").strip()
    return note_text


def prompt_subtask_title() -> str:
    """
    Prompt user for subtask title.
    Task-ID: T130

    Returns:
        Subtask title
    """
    menu_option_color = theme_manager.get_color("menu_option")
    subtask_title = input(menu_option_color + "\nEnter subtask title: ").strip()
    return subtask_title


def prompt_theme() -> str:
    """
    Prompt user for theme selection.
    Task-ID: T139

    Returns:
        Selected theme name
    """
    menu_option_color = theme_manager.get_color("menu_option")
    while True:
        print(menu_option_color + "\nSelect theme:")
        print("1. Default")
        print("2. Dark")
        print("3. Light")
        print("4. Colorful")

        try:
            choice = input(menu_option_color + "Enter choice (1-4): ").strip()
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
    menu_option_color = theme_manager.get_color("menu_option")
    filename = input(menu_option_color + f"\nEnter filename (default: {default}): ").strip()
    return filename if filename else default
