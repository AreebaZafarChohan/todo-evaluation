# 🚀 Interactive Todo CLI - Run Commands

## Required Installation

```bash
# First, install colorama (if not already installed)
pip3 install colorama

# Or install from requirements.txt
pip3 install -r requirements.txt
```

---

## Running the Main Application

### Method 1: Run as Module (Recommended)

```bash
# Navigate to project directory
cd /mnt/d/Gemini_Cli/hackathon/hackathon_2/Phase-I__Interactive-Menu-App

# Run the application
PYTHONPATH=src python3 -m todo_cli.main
```

### Method 2: Direct Python Execution

```bash
cd /mnt/d/Gemini_Cli/hackathon/hackathon_2/Phase-I__Interactive-Menu-App

# Run main file directly
python3 -c "import sys; sys.path.insert(0, 'src'); from todo_cli.main import main; main()"
```

### Method 3: View Automated Demo

```bash
cd /mnt/d/Gemini_Cli/hackathon/hackathon_2/Phase-I__Interactive-Menu-App

# Run quick automated demo
python3 quick_demo.py
```

---

## How to Use the Application

### Step-by-Step Guide

1. **Start the Application**
   ```bash
   PYTHONPATH=src python3 -m todo_cli.main
   ```

2. **Menu Appears** with 6 options:
   ```
   1. Add Task
   2. View Tasks
   3. Update Task
   4. Complete Task
   5. Delete Task
   6. Exit
   ```

3. **Enter a Number** (1-6) to select an option

4. **Follow the Prompts**:
   - Add Task: Enter title and description
   - Complete Task: Enter task ID
   - Update Task: Enter ID, then new title/description
   - Delete Task: Enter ID and confirm (y/n)
   - Exit: Application will close

---

## Example Interactive Session

```bash
# Step 1: Start application
$ cd Phase-I__Interactive-Menu-App
$ PYTHONPATH=src python3 -m todo_cli.main

# Screen clears and menu displays:
================================================================================
                           MY TODO LIST
================================================================================

No tasks yet! Add your first task to get started.

================================================================================
Total: 0 task(s)

What would you like to do?
1. Add Task
2. View Tasks
3. Update Task
4. Complete Task
5. Delete Task
6. Exit

Enter your choice (1-6):

# Step 2: Add a task - Enter 1
1
Enter task title: Buy groceries
Enter description (press Enter to skip): Milk, eggs, bread
✓ Task added successfully! (ID: 1)

# Screen clears, task displays:
================================================================================
                           MY TODO LIST
================================================================================

○ [1] Buy groceries
    Status: Incomplete
    Description: Milk, eggs, bread

================================================================================
Total: 1 task(s)

What would you like to do?
...

# Step 3: Complete the task - Enter 4
4
Enter task ID: 1
✓ Task 1 marked as complete!

# Task icon changes to green ✓

# Step 4: Exit - Enter 6
6
Goodbye! 👋 Thanks for using Todo CLI!
```

---

## Troubleshooting

### Problem: colorama not found
**Solution:**
```bash
pip3 install colorama
```

### Problem: Module not found error
**Solution:**
```bash
# Use PYTHONPATH
PYTHONPATH=src python3 -m todo_cli.main
```

### Problem: Colors not displaying
**Solution:**
- Restart your terminal
- Check colorama is installed: `pip3 list | grep colorama`
- Try a different terminal emulator

### Problem: Screen not clearing
**Solution:**
- Try a different terminal
- Run outside of VSCode integrated terminal
- Check your terminal supports clear/cls commands

---

## Quick Commands Cheat Sheet

```bash
# Install dependencies
pip3 install -r requirements.txt

# Run interactive app
PYTHONPATH=src python3 -m todo_cli.main

# Run demo
python3 quick_demo.py

# Run tests (when available)
PYTHONPATH=src pytest tests/ -v
```

---

## Using the Features

### ✓ Adding a Task
1. Select `1` from menu
2. Enter title (required)
3. Enter description (optional - press Enter to skip)

### ✓ Completing a Task
1. Select `4` from menu
2. Enter task ID
3. Task will show green ✓ icon

### ✓ Updating a Task
1. Select `3` from menu
2. Enter task ID
3. Enter new title (or press Enter to keep current)
4. Enter new description (or press Enter to keep current)

### ✓ Deleting a Task
1. Select `5` from menu
2. Enter task ID
3. Type `y` to confirm deletion

### ✓ Exiting
1. Select `6` from menu
2. Or press Ctrl+C

---

## Important Notes

⚠️ **No Data Persistence** - All data is lost when you close the application (in-memory storage only)

✅ **Colors Working** - Green ✓ for complete, White ○ for incomplete

✅ **Cross-Platform** - Works on Windows, Mac, and Linux

✅ **User-Friendly** - Shows errors and re-prompts for invalid input

---

**Application is fully ready! Enjoy using your interactive todo CLI! 🎉**
