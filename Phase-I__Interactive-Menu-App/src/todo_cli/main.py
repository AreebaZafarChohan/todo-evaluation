"""Main application loop - Task-ID: T030-T038, T058-T150"""

from datetime import date
from .service import TodoService
from .ui import (
    clear_screen,
    display_tasks,
    show_menu,
    get_menu_choice,
    prompt_title,
    prompt_description,
    prompt_task_id,
    show_success,
    show_error,
    confirm_delete,
    prompt_priority,
    prompt_due_date,
    prompt_category,
    prompt_keyword,
    highlight_keyword,
    display_statistics,
    prompt_task_note,
    prompt_subtask_title,
    prompt_theme,
    prompt_filename
)
from .exceptions import TaskNotFound, ValidationError
from .models import TaskStatus
from colorama import Fore, Style


def handle_add_task(service: TodoService):
    """
    Handle add task flow.
    Task-ID: T032

    Args:
        service: TodoService instance
    """
    try:
        title = prompt_title()
        description = prompt_description()

        task = service.add_task(title, description)
        show_success(f"Task added successfully! (ID: {task.id})")

    except ValidationError as e:
        show_error(str(e))
    except KeyboardInterrupt:
        print()
        show_error("Operation cancelled")


def handle_view_tasks(service: TodoService):
    """
    Handle view tasks flow (detailed view).
    Task-ID: T033

    Args:
        service: TodoService instance
    """
    from .ui import console  # Import Rich console

    tasks = service.get_tasks()

    clear_screen()
    display_tasks(tasks)

    console.input("\n[bold yellow]Press Enter to return to menu...[/bold yellow]")
    try:
        pass  # Input already handled above
    except KeyboardInterrupt:
        print()


def handle_complete_task(service: TodoService):
    """
    Handle complete task flow.
    Task-ID: T034

    Args:
        service: TodoService instance
    """
    try:
        task_id = prompt_task_id()
        task = service.complete_task(task_id)
        show_success(f"Task {task_id} marked as complete!")

    except TaskNotFound as e:
        show_error(str(e))
    except KeyboardInterrupt:
        print()
        show_error("Operation cancelled")


def handle_update_task(service: TodoService):
    """
    Handle update task flow.
    Task-ID: T035

    Args:
        service: TodoService instance
    """
    try:
        task_id = prompt_task_id()

        # Get current task to show user
        current_task = service.get_task(task_id)

        print(f"\nCurrent title: {current_task.title}")
        title_input = input(Fore.YELLOW + "New title (press Enter to keep current): ").strip()
        new_title = title_input if title_input else None

        print(f"\nCurrent description: {current_task.description or 'No description'}")
        desc_input = input(Fore.YELLOW + "New description (press Enter to keep current): ").strip()
        new_description = desc_input if desc_input else None

        if new_title is None and new_description is None:
            show_error("No changes made")
            return

        task = service.update_task(task_id, new_title, new_description)
        show_success(f"Task {task_id} updated successfully!")

    except TaskNotFound as e:
        show_error(str(e))
    except ValidationError as e:
        show_error(str(e))
    except KeyboardInterrupt:
        print()
        show_error("Operation cancelled")


def handle_delete_task(service: TodoService):
    """
    Handle delete task flow with confirmation.
    Task-ID: T036

    Args:
        service: TodoService instance
    """
    try:
        task_id = prompt_task_id()

        # Show task details before deletion
        task = service.get_task(task_id)
        print(f"\nTask to delete: {task.title}")

        if confirm_delete():
            service.delete_task(task_id)
            show_success(f"Task {task_id} deleted successfully!")
        else:
            show_error("Deletion cancelled")

    except TaskNotFound as e:
        show_error(str(e))
    except KeyboardInterrupt:
        print()
        show_error("Operation cancelled")


def handle_add_task(service: TodoService):
    """
    Handle add task flow with priority, due date, and category.
    Task-ID: T032, T065, T076, T089

    Args:
        service: TodoService instance
    """
    try:
        title = prompt_title()
        description = prompt_description()

        # Get priority
        priority = prompt_priority()

        # Get due date
        due_date = prompt_due_date()

        # Get category
        category = prompt_category()

        task = service.add_task(title, description, priority, due_date, category)
        show_success(f"Task added successfully! (ID: {task.id})")

    except ValidationError as e:
        show_error(str(e))
    except KeyboardInterrupt:
        print()
        show_error("Operation cancelled")


def handle_update_task(service: TodoService):
    """
    Handle update task flow with priority, due date, and category.
    Task-ID: T035, T066, T076, T089

    Args:
        service: TodoService instance
    """
    try:
        task_id = prompt_task_id()

        # Get current task to show user
        current_task = service.get_task(task_id)

        print(f"\nCurrent title: {current_task.title}")
        title_input = input(Fore.YELLOW + "New title (press Enter to keep current): ").strip()
        new_title = title_input if title_input else None

        print(f"\nCurrent description: {current_task.description or 'No description'}")
        desc_input = input(Fore.YELLOW + "New description (press Enter to keep current): ").strip()
        new_description = desc_input if desc_input else None

        print(f"\nCurrent priority: {current_task.priority.value.title()}")
        priority_input = input(Fore.YELLOW + "Change priority? (y/n): ").strip().lower()
        if priority_input in ['y', 'yes']:
            new_priority = prompt_priority()
        else:
            new_priority = None

        print(f"\nCurrent due date: {current_task.due_date or 'No due date'}")
        due_date_input = input(Fore.YELLOW + "Change due date? (y/n): ").strip().lower()
        if due_date_input in ['y', 'yes']:
            new_due_date = prompt_due_date()
        else:
            new_due_date = None

        print(f"\nCurrent category: {current_task.category.label}")
        category_input = input(Fore.YELLOW + "Change category? (y/n): ").strip().lower()
        if category_input in ['y', 'yes']:
            new_category = prompt_category()
        else:
            new_category = None

        if new_title is None and new_description is None and new_priority is None and new_due_date is None and new_category is None:
            show_error("No changes made")
            return

        task = service.update_task(task_id, new_title, new_description, new_priority, new_due_date, new_category)
        show_success(f"Task {task_id} updated successfully!")

    except TaskNotFound as e:
        show_error(str(e))
    except ValidationError as e:
        show_error(str(e))
    except KeyboardInterrupt:
        print()
        show_error("Operation cancelled")


def handle_sort_by_priority(service: TodoService):
    """
    Handle sorting tasks by priority.
    Task-ID: T067

    Args:
        service: TodoService instance
    """
    from .ui import console  # Import Rich console

    tasks = service.get_tasks()
    sorted_tasks = service.sort_tasks_by_priority(tasks)

    clear_screen()
    display_tasks(sorted_tasks)

    console.input("\n[bold yellow]Press Enter to return to menu...[/bold yellow]")
    try:
        pass  # Input already handled above
    except KeyboardInterrupt:
        print()


def handle_sort_by_due_date(service: TodoService):
    """
    Handle sorting tasks by due date.
    Task-ID: T077

    Args:
        service: TodoService instance
    """
    from .ui import console  # Import Rich console

    tasks = service.get_tasks()
    sorted_tasks = service.sort_tasks_by_due_date(tasks)

    clear_screen()
    display_tasks(sorted_tasks)

    console.input("\n[bold yellow]Press Enter to return to menu...[/bold yellow]")
    try:
        pass  # Input already handled above
    except KeyboardInterrupt:
        print()


def handle_filter_by_category(service: TodoService):
    """
    Handle filtering tasks by category.
    Task-ID: T086

    Args:
        service: TodoService instance
    """
    from .ui import console  # Import Rich console

    try:
        category = prompt_category()
        tasks = service.get_tasks_by_category(category)

        clear_screen()
        display_tasks(tasks)

        console.input("\n[bold yellow]Press Enter to return to menu...[/bold yellow]")
        try:
            pass  # Input already handled above
        except KeyboardInterrupt:
            print()
    except KeyboardInterrupt:
        print()
        show_error("Operation cancelled")


def handle_search_tasks(service: TodoService):
    """
    Handle searching tasks by keyword.
    Task-ID: T093, T095

    Args:
        service: TodoService instance
    """
    from .ui import display_header, highlight_keyword, console, Panel, Table, TaskStatus, TaskCategory  # Import necessary UI components

    try:
        keyword = prompt_keyword()
        tasks = service.search_tasks(keyword)

        clear_screen()
        display_header()

        if tasks:
            from rich import box

            # Create a table for search results with grid lines
            table = Table(
                title=f"🔍 Search Results for: '{keyword}'",
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
            table.add_column("Category", width=10)
            table.add_column("Notes", width=8)
            table.add_column("Subtasks", width=10)

            for task in tasks:
                # Highlight keyword in title and description
                highlighted_title = highlight_keyword(task.title, keyword)
                highlighted_description = highlight_keyword(task.description, keyword)

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

                # Format description
                description = highlighted_description[:20] + "..." if len(highlighted_description) > 20 else highlighted_description

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
                    highlighted_title,
                    description or "[italic]No description[/italic]",
                    status_text,
                    task.category.label,
                    notes_count,
                    subtasks_count
                )

            console.print(table)
        else:
            console.print(Panel(f"[yellow]📭 No tasks found matching '{keyword}'[/yellow]", expand=False))

        console.input("\n[bold yellow]Press Enter to return to menu...[/bold yellow]")

    except KeyboardInterrupt:
        print()
        show_error("Operation cancelled")


def handle_view_statistics(service: TodoService):
    """
    Handle viewing task statistics.
    Task-ID: T101

    Args:
        service: TodoService instance
    """
    stats = service.get_statistics()
    display_statistics(stats)


def handle_complete_all_tasks(service: TodoService):
    """
    Handle completing all tasks.
    Task-ID: T108

    Args:
        service: TodoService instance
    """
    try:
        # Confirm action
        print(Fore.YELLOW + "This will mark ALL incomplete tasks as complete.")
        confirm = input("Are you sure you want to proceed? (y/n): ").strip().lower()

        if confirm in ['y', 'yes']:
            count = service.complete_all_tasks()
            show_success(f"Completed {count} tasks!")
        else:
            show_error("Operation cancelled")
    except KeyboardInterrupt:
        print()
        show_error("Operation cancelled")


def handle_delete_completed_tasks(service: TodoService):
    """
    Handle deleting completed tasks.
    Task-ID: T109

    Args:
        service: TodoService instance
    """
    try:
        # Confirm action
        print(Fore.YELLOW + "This will delete ALL completed tasks.")
        confirm = input("Are you sure you want to proceed? (y/n): ").strip().lower()

        if confirm in ['y', 'yes']:
            count = service.delete_completed_tasks()
            show_success(f"Deleted {count} completed tasks!")
        else:
            show_error("Operation cancelled")
    except KeyboardInterrupt:
        print()
        show_error("Operation cancelled")


def handle_add_note(service: TodoService):
    """
    Handle adding a note to a task.
    Task-ID: T119

    Args:
        service: TodoService instance
    """
    try:
        task_id = prompt_task_id()
        note_text = prompt_task_note()

        if not note_text:
            show_error("Note cannot be empty")
            return

        task = service.add_note(task_id, note_text)
        show_success(f"Note added to task {task_id} successfully!")
    except TaskNotFound as e:
        show_error(str(e))
    except KeyboardInterrupt:
        print()
        show_error("Operation cancelled")


def handle_add_subtask(service: TodoService):
    """
    Handle adding a subtask to a task.
    Task-ID: T130

    Args:
        service: TodoService instance
    """
    try:
        task_id = prompt_task_id()
        subtask_title = prompt_subtask_title()

        if not subtask_title:
            show_error("Subtask title cannot be empty")
            return

        task = service.add_subtask(task_id, subtask_title)
        show_success(f"Subtask added to task {task_id} successfully!")
    except TaskNotFound as e:
        show_error(str(e))
    except KeyboardInterrupt:
        print()
        show_error("Operation cancelled")


def handle_change_theme(service: TodoService):
    """
    Handle changing the application theme.
    Task-ID: T140

    Args:
        service: TodoService instance
    """
    try:
        theme = prompt_theme()
        service.set_theme(theme)
        show_success(f"Theme changed to {theme}!")
    except KeyboardInterrupt:
        print()
        show_error("Operation cancelled")


def handle_export_tasks(service: TodoService):
    """
    Handle exporting tasks to a file.
    Task-ID: T148

    Args:
        service: TodoService instance
    """
    try:
        from datetime import datetime
        default_filename = f"tasks_{datetime.now().strftime('%Y-%m-%d')}.json"
        filename = prompt_filename(default_filename)

        service.export_tasks(filename)
        show_success(f"Tasks exported to {filename} successfully!")
    except Exception as e:
        show_error(f"Export failed: {str(e)}")
    except KeyboardInterrupt:
        print()
        show_error("Operation cancelled")


def handle_import_tasks(service: TodoService):
    """
    Handle importing tasks from a file.
    Task-ID: T149

    Args:
        service: TodoService instance
    """
    try:
        filename = prompt_filename("tasks.json")

        count = service.import_tasks(filename)
        show_success(f"Imported {count} tasks from {filename} successfully!")
    except FileNotFoundError as e:
        show_error(f"File not found: {str(e)}")
    except Exception as e:
        show_error(f"Import failed: {str(e)}")
    except KeyboardInterrupt:
        print()
        show_error("Operation cancelled")


def main():
    """
    Main application loop.
    Task-ID: T030, T031, T037, T038

    Runs continuous interactive menu until user exits.
    """
    service = TodoService()

    try:
        while True:
            # Display current tasks and menu
            tasks = service.get_tasks()
            display_tasks(tasks)
            show_menu()

            # Get user choice - Task-ID: T031
            choice = get_menu_choice()

            # Route to appropriate handler
            if choice == 1:
                handle_add_task(service)
            elif choice == 2:
                handle_view_tasks(service)
            elif choice == 3:
                handle_update_task(service)
            elif choice == 4:
                handle_complete_task(service)
            elif choice == 5:
                handle_delete_task(service)
            elif choice == 6:
                # Exit handler - Task-ID: T037
                clear_screen()
                print()
                print(Fore.YELLOW + Style.BRIGHT + "Goodbye! 👋 Thanks for using Todo CLI!")
                print()
                break
            elif choice == 7:
                # Sort by priority
                handle_sort_by_priority(service)
            elif choice == 8:
                # Sort by due date
                handle_sort_by_due_date(service)
            elif choice == 9:
                # Filter by category
                handle_filter_by_category(service)
            elif choice == 10:
                # Clear filter - just show all tasks
                handle_view_tasks(service)
            elif choice == 11:
                # Search tasks
                handle_search_tasks(service)
            elif choice == 12:
                # View statistics
                handle_view_statistics(service)
            elif choice == 13:
                # Complete all tasks
                handle_complete_all_tasks(service)
            elif choice == 14:
                # Delete completed tasks
                handle_delete_completed_tasks(service)
            elif choice == 15:
                # Add note to task
                handle_add_note(service)
            elif choice == 16:
                # Add subtask
                handle_add_subtask(service)
            elif choice == 17:
                # Change theme
                handle_change_theme(service)
            elif choice == 18:
                # Export tasks
                handle_export_tasks(service)
            elif choice == 19:
                # Import tasks
                handle_import_tasks(service)

    except KeyboardInterrupt:
        # Graceful Ctrl+C handling - Task-ID: T038
        print()
        print()
        print(Fore.YELLOW + Style.BRIGHT + "Goodbye! 👋")
        print()


if __name__ == "__main__":
    main()
