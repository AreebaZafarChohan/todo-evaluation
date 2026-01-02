"""Business logic and use cases - Task-ID: T011-T017, T058-T146"""

import json
from datetime import date
from pathlib import Path
from typing import Optional
from .exceptions import ValidationError, TaskNotFound
from .models import Task, TaskStatus, TaskPriority, TaskCategory, TaskNote, Subtask, ThemeManager
from . import storage

# Global variable to store the current theme
current_theme = "default"
theme_manager = ThemeManager(current_theme)


class TodoService:
    """
    Service layer for todo operations.
    Task-ID: T011

    Handles business logic and orchestrates storage operations.
    """

    def __init__(self) -> None:
        """Initialize the service - Task-ID: T011"""
        global current_theme, theme_manager
        # Load the saved theme from config
        saved_theme = self._load_theme_config()
        current_theme = saved_theme
        theme_manager = ThemeManager(saved_theme)

    def add_task(self, title: str, description: str = "", priority: TaskPriority = TaskPriority.MEDIUM,
                 due_date: Optional[date] = None, category: TaskCategory = TaskCategory.OTHER) -> Task:
        """
        Add a new task.
        Task-ID: T012, T059, T069, T080

        Args:
            title: Task title (1-200 characters)
            description: Optional task description
            priority: Task priority level (defaults to MEDIUM)
            due_date: Optional due date
            category: Task category (defaults to OTHER)

        Returns:
            The created task

        Raises:
            ValidationError: If title is invalid
        """
        # Validate title
        if not title or len(title.strip()) == 0:
            raise ValidationError("Title cannot be empty")
        if len(title) > 200:
            raise ValidationError("Title must be 1-200 characters")

        # Create and store task
        task = Task(
            id=0,  # Will be assigned by storage
            title=title.strip(),
            description=description.strip() if description else "",
            status=TaskStatus.INCOMPLETE,
            priority=priority,
            due_date=due_date,
            category=category
        )
        return storage.add_task(task)

    def get_tasks(self) -> list[Task]:
        """
        Get all tasks.
        Task-ID: T013

        Returns:
            List of all tasks
        """
        return storage.get_all_tasks()

    def get_task(self, task_id: int) -> Task:
        """
        Get a task by ID.
        Task-ID: T014

        Args:
            task_id: The ID of the task to retrieve

        Returns:
            The task

        Raises:
            TaskNotFound: If task with given ID does not exist
        """
        task = storage.get_task(task_id)
        if task is None:
            raise TaskNotFound(task_id)
        return task

    def complete_task(self, task_id: int) -> Task:
        """
        Mark a task as complete.
        Task-ID: T015

        Args:
            task_id: The ID of the task to complete

        Returns:
            The updated task

        Raises:
            TaskNotFound: If task with given ID does not exist
        """
        task = self.get_task(task_id)
        task.status = TaskStatus.COMPLETE
        return storage.update_task(task)

    def update_task(self, task_id: int, title: str = None, description: str = None,
                    priority: TaskPriority = None, due_date: Optional[date] = None,
                    category: TaskCategory = None) -> Task:
        """
        Update a task's title, description, priority, due date, and/or category.
        Task-ID: T016, T060, T070, T081

        Args:
            task_id: The ID of the task to update
            title: New title (optional, must be 1-200 characters if provided)
            description: New description (optional)
            priority: New priority level (optional)
            due_date: New due date (optional)
            category: New category (optional)

        Returns:
            The updated task

        Raises:
            TaskNotFound: If task with given ID does not exist
            ValidationError: If title is invalid
        """
        task = self.get_task(task_id)

        # Update title if provided
        if title is not None:
            if not title or len(title.strip()) == 0:
                raise ValidationError("Title cannot be empty")
            if len(title) > 200:
                raise ValidationError("Title must be 1-200 characters")
            task.title = title.strip()

        # Update description if provided
        if description is not None:
            task.description = description.strip()

        # Update priority if provided
        if priority is not None:
            task.priority = priority

        # Update due date if provided
        if due_date is not None:
            task.due_date = due_date

        # Update category if provided
        if category is not None:
            task.category = category

        return storage.update_task(task)

    def delete_task(self, task_id: int) -> None:
        """
        Delete a task.
        Task-ID: T017

        Args:
            task_id: The ID of the task to delete

        Raises:
            TaskNotFound: If task with given ID does not exist
        """
        # Check if task exists first
        task = storage.get_task(task_id)
        if task is None:
            raise TaskNotFound(task_id)

        storage.delete_task(task_id)

    def set_task_priority(self, task_id: int, priority: TaskPriority) -> Task:
        """
        Set the priority of a task.
        Task-ID: T060

        Args:
            task_id: The ID of the task to update
            priority: The new priority level

        Returns:
            The updated task

        Raises:
            TaskNotFound: If task with given ID does not exist
        """
        task = self.get_task(task_id)
        task.priority = priority
        return storage.update_task(task)

    def get_tasks_by_priority(self, priority: TaskPriority) -> list[Task]:
        """
        Get all tasks with a specific priority.
        Task-ID: T061

        Args:
            priority: The priority level to filter by

        Returns:
            List of tasks with the specified priority
        """
        return [task for task in self.get_tasks() if task.priority == priority]

    def sort_tasks_by_priority(self, tasks: list[Task]) -> list[Task]:
        """
        Sort tasks by priority (High -> Medium -> Low).
        Task-ID: T062

        Args:
            tasks: List of tasks to sort

        Returns:
            Sorted list of tasks by priority
        """
        priority_order = {TaskPriority.HIGH: 0, TaskPriority.MEDIUM: 1, TaskPriority.LOW: 2}
        return sorted(tasks, key=lambda task: priority_order[task.priority])

    def set_due_date(self, task_id: int, due_date: Optional[date]) -> Task:
        """
        Set the due date of a task.
        Task-ID: T070

        Args:
            task_id: The ID of the task to update
            due_date: The new due date (None to clear)

        Returns:
            The updated task

        Raises:
            TaskNotFound: If task with given ID does not exist
        """
        task = self.get_task(task_id)
        task.due_date = due_date
        return storage.update_task(task)

    def get_overdue_tasks(self) -> list[Task]:
        """
        Get all tasks that are overdue.
        Task-ID: T071

        Returns:
            List of overdue tasks
        """
        today = date.today()
        return [task for task in self.get_tasks()
                if task.due_date and task.due_date < today and task.status == TaskStatus.INCOMPLETE]

    def get_tasks_due_today(self) -> list[Task]:
        """
        Get all tasks due today.
        Task-ID: T072

        Returns:
            List of tasks due today
        """
        today = date.today()
        return [task for task in self.get_tasks()
                if task.due_date and task.due_date == today]

    def sort_tasks_by_due_date(self, tasks: list[Task]) -> list[Task]:
        """
        Sort tasks by due date (nearest to farthest).
        Task-ID: T073

        Args:
            tasks: List of tasks to sort

        Returns:
            Sorted list of tasks by due date (None dates go to end)
        """
        def sort_key(task):
            if task.due_date is None:
                # Put tasks without due dates at the end
                return (1, date.max)
            else:
                return (0, task.due_date)

        return sorted(tasks, key=sort_key)

    def set_category(self, task_id: int, category: TaskCategory) -> Task:
        """
        Set the category of a task.
        Task-ID: T081

        Args:
            task_id: The ID of the task to update
            category: The new category

        Returns:
            The updated task

        Raises:
            TaskNotFound: If task with given ID does not exist
        """
        task = self.get_task(task_id)
        task.category = category
        return storage.update_task(task)

    def get_tasks_by_category(self, category: TaskCategory) -> list[Task]:
        """
        Get all tasks in a specific category.
        Task-ID: T082

        Args:
            category: The category to filter by

        Returns:
            List of tasks in the specified category
        """
        return [task for task in self.get_tasks() if task.category == category]

    def get_category_statistics(self) -> dict[TaskCategory, int]:
        """
        Get statistics for tasks by category.
        Task-ID: T083

        Returns:
            Dictionary mapping categories to their task counts
        """
        stats = {category: 0 for category in TaskCategory}
        for task in self.get_tasks():
            stats[task.category] += 1
        return stats

    def search_tasks(self, keyword: str) -> list[Task]:
        """
        Search tasks by keyword in title and description.
        Task-ID: T091

        Args:
            keyword: The keyword to search for (case-insensitive)

        Returns:
            List of tasks that match the keyword
        """
        keyword_lower = keyword.lower()
        return [
            task for task in self.get_tasks()
            if keyword_lower in task.title.lower()
            or keyword_lower in task.description.lower()
        ]

    def get_statistics(self) -> dict:
        """
        Get task statistics.
        Task-ID: T099

        Returns:
            Dictionary containing various task statistics
        """
        tasks = self.get_tasks()
        total = len(tasks)
        completed = sum(1 for t in tasks if t.status == TaskStatus.COMPLETE)
        incomplete = total - completed
        completion_rate = (completed / total * 100) if total > 0 else 0

        # Priority breakdown
        priority_counts = {priority: 0 for priority in TaskPriority}
        for task in tasks:
            priority_counts[task.priority] += 1

        # Category breakdown
        category_counts = self.get_category_statistics()

        return {
            "total": total,
            "completed": completed,
            "incomplete": incomplete,
            "completion_rate": completion_rate,
            "by_priority": priority_counts,
            "by_category": category_counts
        }

    def complete_all_tasks(self) -> int:
        """
        Mark all incomplete tasks as complete.
        Task-ID: T105

        Returns:
            Number of tasks that were completed
        """
        tasks = self.get_tasks()
        incomplete_tasks = [task for task in tasks if task.status == TaskStatus.INCOMPLETE]

        completed_count = 0
        for task in incomplete_tasks:
            task.status = TaskStatus.COMPLETE
            storage.update_task(task)
            completed_count += 1

        return completed_count

    def delete_completed_tasks(self) -> int:
        """
        Delete all completed tasks.
        Task-ID: T106

        Returns:
            Number of tasks that were deleted
        """
        tasks = self.get_tasks()
        completed_tasks = [task for task in tasks if task.status == TaskStatus.COMPLETE]

        deleted_count = 0
        for task in completed_tasks:
            storage.delete_task(task.id)
            deleted_count += 1

        return deleted_count

    def delete_all_tasks(self) -> int:
        """
        Delete all tasks.
        Task-ID: T107

        Returns:
            Number of tasks that were deleted
        """
        tasks = self.get_tasks()
        task_count = len(tasks)

        for task in tasks:
            storage.delete_task(task.id)

        return task_count

    def add_note(self, task_id: int, note_text: str) -> Task:
        """
        Add a note to a task.
        Task-ID: T115

        Args:
            task_id: The ID of the task to add note to
            note_text: The text of the note

        Returns:
            The updated task with the new note

        Raises:
            TaskNotFound: If task with given ID does not exist
        """
        task = self.get_task(task_id)
        note = TaskNote(text=note_text)
        task.notes.append(note)
        return storage.update_task(task)

    def get_task_notes(self, task_id: int) -> list[TaskNote]:
        """
        Get all notes for a task.
        Task-ID: T116

        Args:
            task_id: The ID of the task to get notes for

        Returns:
            List of notes for the task

        Raises:
            TaskNotFound: If task with given ID does not exist
        """
        task = self.get_task(task_id)
        return task.notes

    def add_subtask(self, parent_task_id: int, subtask_title: str) -> Task:
        """
        Add a subtask to a parent task.
        Task-ID: T125

        Args:
            parent_task_id: The ID of the parent task
            subtask_title: The title of the subtask

        Returns:
            The updated parent task with the new subtask

        Raises:
            TaskNotFound: If parent task with given ID does not exist
        """
        parent_task = self.get_task(parent_task_id)
        # Generate a new ID for the subtask
        next_subtask_id = max([subtask.id for subtask in parent_task.subtasks], default=0) + 1
        subtask = Subtask(id=next_subtask_id, title=subtask_title)
        parent_task.subtasks.append(subtask)
        return storage.update_task(parent_task)

    def complete_subtask(self, parent_task_id: int, subtask_id: int) -> Task:
        """
        Mark a subtask as complete and check if parent should auto-complete.
        Task-ID: T126

        Args:
            parent_task_id: The ID of the parent task
            subtask_id: The ID of the subtask to complete

        Returns:
            The updated parent task

        Raises:
            TaskNotFound: If parent task with given ID does not exist
            ValueError: If subtask with given ID does not exist in parent
        """
        parent_task = self.get_task(parent_task_id)
        subtask = None
        for s in parent_task.subtasks:
            if s.id == subtask_id:
                subtask = s
                break

        if subtask is None:
            raise ValueError(f"Subtask with ID {subtask_id} not found in parent task {parent_task_id}")

        subtask.status = TaskStatus.COMPLETE

        # Check if all subtasks are complete to auto-complete parent
        all_subtasks_complete = all(s.status == TaskStatus.COMPLETE for s in parent_task.subtasks)
        if all_subtasks_complete and parent_task.subtasks:
            parent_task.status = TaskStatus.COMPLETE

        return storage.update_task(parent_task)

    def get_subtask_progress(self, task_id: int) -> tuple[int, int]:
        """
        Get the progress of subtasks for a task.
        Task-ID: T127

        Args:
            task_id: The ID of the task

        Returns:
            Tuple of (completed_count, total_count) subtasks
        """
        task = self.get_task(task_id)
        total = len(task.subtasks)
        completed = sum(1 for s in task.subtasks if s.status == TaskStatus.COMPLETE)
        return completed, total

    def set_theme(self, theme_name: str) -> None:
        """
        Set the current theme.
        Task-ID: T136

        Args:
            theme_name: The name of the theme to set
        """
        global current_theme, theme_manager
        # Validate that the theme exists
        if theme_name in ["default", "dark", "light", "colorful"]:
            current_theme = theme_name
            theme_manager.set_theme(theme_name)
            # Persist the theme to config file
            self._save_theme_config(theme_name)

    def get_current_theme(self) -> str:
        """
        Get the current theme.
        Task-ID: T137

        Returns:
            The name of the current theme
        """
        global current_theme
        return current_theme

    def _save_theme_config(self, theme_name: str) -> None:
        """
        Save the theme configuration to a file.

        Args:
            theme_name: The name of the theme to save
        """
        config_path = Path.home() / ".todo_cli_config.json"
        config = {}

        # Load existing config if it exists
        if config_path.exists():
            try:
                with config_path.open('r') as f:
                    config = json.load(f)
            except json.JSONDecodeError:
                config = {}

        # Update the theme in the config
        config['theme'] = theme_name

        # Save the config
        with config_path.open('w') as f:
            json.dump(config, f)

    def _load_theme_config(self) -> str:
        """
        Load the theme configuration from a file.

        Returns:
            The saved theme name, or "default" if no config exists
        """
        config_path = Path.home() / ".todo_cli_config.json"

        if config_path.exists():
            try:
                with config_path.open('r') as f:
                    config = json.load(f)
                    saved_theme = config.get('theme', 'default')
                    # Validate the saved theme exists
                    if saved_theme in ["default", "dark", "light", "colorful"]:
                        return saved_theme
            except json.JSONDecodeError:
                pass

        return "default"

    def export_tasks(self, filename: str) -> None:
        """
        Export all tasks to a JSON file.
        Task-ID: T145

        Args:
            filename: The name of the file to export to
        """
        import json
        from pathlib import Path
        from datetime import date

        def serialize_task(task):
            """Helper function to serialize task with date handling"""
            # Create a dictionary manually to avoid issues with nested objects
            task_dict = {
                'id': task.id,
                'title': task.title,
                'description': task.description,
                'status': task.status.value,
                'priority': task.priority.value,
                'due_date': task.due_date.isoformat() if task.due_date else None,
                'category': task.category.value,
                'notes': [
                    {'text': note.text, 'created_at': note.created_at.isoformat()}
                    for note in task.notes
                ],
                'subtasks': [
                    {'id': subtask.id, 'title': subtask.title, 'status': subtask.status.value}
                    for subtask in task.subtasks
                ]
            }
            return task_dict

        tasks = self.get_tasks()
        tasks_data = [serialize_task(task) for task in tasks]
        Path(filename).write_text(json.dumps(tasks_data, indent=2))

    def import_tasks(self, filename: str) -> int:
        """
        Import tasks from a JSON file.
        Task-ID: T146

        Args:
            filename: The name of the file to import from

        Returns:
            Number of tasks imported

        Raises:
            FileNotFoundError: If the file doesn't exist
            json.JSONDecodeError: If the file contains invalid JSON
        """
        import json
        from pathlib import Path
        from datetime import datetime
        from .models import TaskStatus, TaskPriority, TaskCategory, TaskNote, Subtask

        def deserialize_task(task_data):
            """Helper function to deserialize task with date and enum handling"""
            # Convert date strings back to date objects
            due_date = None
            if task_data['due_date']:
                due_date = datetime.fromisoformat(task_data['due_date']).date()

            # Convert string values back to enums
            status = TaskStatus(task_data['status'])

            # For TaskPriority, we need to map the string value back to the enum
            priority_map = {p.value: p for p in TaskPriority}
            priority = priority_map[task_data['priority']]

            # For TaskCategory, we need to map the string value back to the enum
            category_map = {c.value: c for c in TaskCategory}
            category = category_map[task_data['category']]

            # Handle notes
            notes = []
            for note_data in task_data['notes']:
                created_at = datetime.fromisoformat(note_data['created_at'])
                notes.append(TaskNote(text=note_data['text'], created_at=created_at))

            # Handle subtasks
            subtasks = []
            for subtask_data in task_data['subtasks']:
                subtask_status = TaskStatus(subtask_data['status'])
                subtasks.append(Subtask(
                    id=subtask_data['id'],
                    title=subtask_data['title'],
                    status=subtask_status
                ))

            return Task(
                id=0,  # Will be assigned by storage
                title=task_data['title'],
                description=task_data['description'],
                status=status,
                priority=priority,
                due_date=due_date,
                category=category,
                notes=notes,
                subtasks=subtasks
            )

        # Read the file
        file_path = Path(filename)
        if not file_path.exists():
            raise FileNotFoundError(f"File {filename} does not exist")

        content = file_path.read_text()
        tasks_data = json.loads(content)

        # Import each task
        imported_count = 0
        for task_data in tasks_data:
            # Create a temporary task object from the data
            task = deserialize_task(task_data)
            # Add the task using the existing add_task method
            # This ensures proper ID assignment
            storage.add_task(task)
            imported_count += 1

        return imported_count
