# Interactive Todo CLI - Usage Guide

## Quick Start

```bash
# Install dependencies
pip install colorama

# Run the application
cd Phase-I__Interactive-Menu-App
PYTHONPATH=src python3 -m todo_cli.main
```

## How to Use

### 1. Launch Application
Application opens with main menu showing your task list.

### 2. Menu Options

#### Option 1: Add Task
1. Select `1` and press Enter
2. Enter task title (required, 1-200 chars)
3. Enter description (optional, press Enter to skip)
4. Task is added and menu refreshes

**Example:**
```
Enter your choice (1-6): 1
Enter task title: Buy groceries
Enter description (press Enter to skip): Milk, eggs, bread
✓ Task added successfully! (ID: 1)
```

#### Option 2: View Tasks
- Shows detailed task list
- Pauses for review
- Press Enter to return to menu

#### Option 3: Update Task
1. Select `3` and press Enter
2. Enter task ID
3. Enter new title (or press Enter to keep current)
4. Enter new description (or press Enter to keep current)
5. Task is updated and menu refreshes

**Example:**
```
Enter task ID: 1
Current title: Buy groceries
New title (press Enter to keep current): Buy organic groceries
Current description: Milk, eggs, bread
New description (press Enter to keep current):
✓ Task 1 updated successfully!
```

#### Option 4: Complete Task
1. Select `4` and press Enter
2. Enter task ID
3. Task status changes to Complete with ✓ icon

**Example:**
```
Enter task ID: 1
✓ Task 1 marked as complete!
```

#### Option 5: Delete Task
1. Select `5` and press Enter
2. Enter task ID
3. Confirm deletion (y/n)
4. Task is deleted if confirmed

**Example:**
```
Enter task ID: 2
Task to delete: Finish report
Are you sure you want to delete this task? (y/n): y
✓ Task 2 deleted successfully!
```

#### Option 6: Exit
- Select `6` to exit application
- Shows goodbye message
- All data is lost (in-memory only)

## Visual Elements

### Status Icons
- **✓** (Green) - Task completed
- **○** (White/Gray) - Task incomplete

### Colors
- **Yellow** - Headers, prompts, menu
- **Green** - Success messages, complete status
- **Red** - Error messages
- **Cyan** - Borders, task count
- **White** - Normal text

## Error Messages

### Validation Errors
- "Title cannot be empty" - When title is blank
- "Title must be 1-200 characters" - When title too long
- "Task not found" - When invalid ID entered
- "Invalid choice. Please enter 1-6" - When invalid menu option

### Handling Errors
All errors show in **red** and application:
- Re-prompts for valid input
- Returns to menu (doesn't crash)
- Shows clear error message

## Keyboard Shortcuts

- **Ctrl+C**: Graceful exit (same as option 6)
- **Enter**: Submit input or skip optional fields

## Tips

1. **Task IDs never reuse** - Deleted task IDs won't be reassigned
2. **Press Enter to skip** - Description and update fields can be skipped
3. **Check task ID** - View tasks (option 2) to see IDs before updating/completing/deleting
4. **No undo** - Be careful with delete operations
5. **Data not saved** - All tasks lost when you exit

## Example Session

```
# Start app
$ PYTHONPATH=src python3 -m todo_cli.main

# Menu appears with empty list
# Select 1 to add first task
1
Buy groceries
Milk, eggs

# Select 1 again to add another
1
Call dentist

# Select 4 to complete task 1
4
1

# Select 6 to exit
6
Goodbye! 👋
```

## Troubleshooting

**Problem**: Colors not showing
- **Solution**: Install colorama: `pip install colorama`

**Problem**: Screen not clearing
- **Solution**: Terminal may not support clear command, try different terminal

**Problem**: Import errors
- **Solution**: Use `PYTHONPATH=src` before python command

**Problem**: EOFError
- **Solution**: Running in interactive mode requires user input, don't pipe empty input
