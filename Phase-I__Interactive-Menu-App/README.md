# Enhanced Todo CLI Application

This is an interactive command-line todo application with enhanced features for better productivity and organization.

## Features

### Core Features
- Add, view, update, complete, and delete tasks
- Interactive menu-driven interface
- Persistent in-memory storage

### Enhanced Features
1. **Task Priority Levels** - Assign High (🔴), Medium (🟡), or Low (🟢) priority to tasks
2. **Task Due Dates** - Set due dates with visual indicators for overdue/due-today tasks
3. **Task Categories/Tags** - Organize tasks into Work, Personal, Shopping, Health, or Other
4. **Task Search** - Search tasks by keyword in title or description
5. **Task Statistics** - View comprehensive statistics dashboard
6. **Bulk Operations** - Complete all tasks or delete completed tasks at once
7. **Task Notes/Comments** - Add notes to tasks with timestamps
8. **Task Subtasks** - Break down tasks into subtasks with progress tracking
9. **Color Themes** - Choose from different color themes (Default, Dark, Light, Colorful)
10. **Export/Import** - Export tasks to JSON and import from JSON files

## Usage

Run the application with Python:

```bash
python -m src.todo_cli.main
```

## Menu Options

1. Add Task - Create a new task with title, description, priority, due date, and category
2. View Tasks - Display all tasks with detailed information
3. Update Task - Modify an existing task's details
4. Complete Task - Mark a task as complete
5. Delete Task - Remove a task from the list
6. Exit - Quit the application
7. Sort by Priority - Display tasks sorted by priority level
8. Sort by Due Date - Display tasks sorted by due date
9. Filter by Category - Show only tasks in a selected category
10. Clear Filter - Return to showing all tasks
11. Search Tasks - Find tasks by keyword
12. View Statistics - Show task statistics dashboard
13. Complete All Tasks - Mark all incomplete tasks as complete
14. Delete Completed Tasks - Remove all completed tasks
15. Add Note to Task - Add a note/comment to a task
16. Add Subtask - Add a subtask to a parent task
17. Change Theme - Select a different color theme
18. Export Tasks - Save all tasks to a JSON file
19. Import Tasks - Load tasks from a JSON file

## Architecture

The application follows a clean architecture with separation of concerns:

- **Models**: Data classes and enums for tasks, priorities, categories, etc.
- **Service**: Business logic and use cases
- **Storage**: Data persistence layer
- **UI**: User interface and display functions
- **Main**: Application entry point and menu handling

## Testing

Run the test suite to verify all functionality:

```bash
python test_enhanced_features.py
```