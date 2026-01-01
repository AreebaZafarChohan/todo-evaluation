# Implementation Plan: Interactive Todo CLI Application

**Feature**: Interactive Menu-Based Todo CLI
**Created**: 2026-01-01
**Status**: Active

## 1. Technical Context

- **Project Phase**: Phase I (Interactive CLI)
- **Language**: Python 3.11+
- **Key Libraries**: `colorama` for colored output
- **Persistence**: In-memory dictionary
- **Testing**: `pytest` for unit and integration tests
- **Tooling**: `black` for formatting, `ruff` for linting

## 2. Constitution Check

This plan adheres to `.specify/memory/constitution.md`:

- **Spec-Driven Development**: Derived from `specs/todo-cli/spec.md`
- **Lifecycle Enforcement**: Follows Specify → Plan → Tasks workflow
- **Traceability**: Task IDs will be used in all code comments and commits
- **Layer Separation**: Clear UI/Service/Storage architecture
- **Language Requirements**: Python 3.11+ with type hints
- **Phase Boundaries**: Strictly Phase I interactive CLI with in-memory storage

No constitution violations identified.

## 3. Architecture Overview

### Component Diagram

```
┌─────────────────────────────────────────┐
│      Main Application (main.py)         │
│   while True: display_menu()            │
└──────────────┬──────────────────────────┘
               │
       ┌───────┴────────┐
       │                │
┌──────▼──────┐  ┌──────▼──────────┐
│  UI Module  │  │  Service Layer  │
│  (ui.py)    │──│  (service.py)   │
│             │  │                 │
│ - clear()   │  │ - add_task()    │
│ - display() │  │ - get_tasks()   │
│ - menu()    │  │ - update_task() │
│ - prompt()  │  │ - complete()    │
│ - colors    │  │ - delete_task() │
└─────────────┘  └──────┬──────────┘
                        │
                  ┌─────▼─────────┐
                  │ Storage Layer │
                  │ (storage.py)  │
                  │               │
                  │ _tasks: dict  │
                  │ _next_id: int │
                  └───────────────┘
```

### Layer Responsibilities

#### Main Application Loop (`main.py`)
- Initialize colorama for cross-platform color support
- Run infinite loop until user selects Exit
- Handle menu selection routing
- Coordinate UI and Service layers
- Global exception handling

#### UI Layer (`ui.py`)
**Responsibilities**:
- Clear terminal screen (cross-platform)
- Display formatted task list with:
  - Colored status icons (✓ green, ○ gray)
  - Borders and separators
  - Task details (ID, title, description, status)
- Show main menu (6 options)
- Get user input with validation
- Display success/error messages with colors
- Handle prompts for task details

**Key Functions**:
- `clear_screen()`: OS-specific screen clearing
- `display_tasks(tasks)`: Format and print all tasks
- `show_menu()`: Display numbered menu options
- `get_menu_choice()`: Get and validate menu selection (1-6)
- `prompt_task_details()`: Get title and description from user
- `show_success(message)`: Green success message
- `show_error(message)`: Red error message

#### Service Layer (`service.py`)
**Responsibilities**:
- Business logic for all operations
- Input validation (title length, ID existence)
- Orchestrate storage operations
- Return structured data to UI layer

**Key Methods**:
- `add_task(title, description)`: Validate and create task
- `get_tasks()`: Retrieve all tasks
- `get_task(id)`: Get single task, raise TaskNotFound if missing
- `update_task(id, title, description)`: Update with partial support
- `complete_task(id)`: Toggle task status to complete
- `delete_task(id)`: Remove task from storage

#### Storage Layer (`storage.py`)
**Responsibilities**:
- In-memory task dictionary
- Auto-incrementing ID generation
- Basic CRUD operations
- No business logic

**Data Structure**:
```python
_tasks: dict[int, Task] = {}
_next_id: int = 1
```

#### Models (`models.py`)
```python
@dataclass
class Task:
    id: int
    title: str
    description: str
    status: TaskStatus

class TaskStatus(Enum):
    INCOMPLETE = "incomplete"
    COMPLETE = "complete"
```

## 4. Technical Decisions

### Decision 1: Color Library
**Choice**: colorama
**Rationale**:
- Cross-platform (Windows, Mac, Linux)
- Lightweight and simple API
- Auto-initializes ANSI support on Windows
- Minimal dependency

**Alternatives Considered**:
- Raw ANSI codes: Not cross-platform
- Rich library: Too heavy for simple CLI
- Termcolor: Similar but colorama has better Windows support

### Decision 2: Screen Clearing
**Choice**: `os.system('cls' if os.name == 'nt' else 'clear')`
**Rationale**:
- Standard library only
- Fast and reliable
- Cross-platform compatible

**Fallback**: Print 50 newlines if os.system fails

### Decision 3: Interactive Loop vs Command Args
**Choice**: Continuous interactive loop (no Click)
**Rationale**:
- Matches reference design requirement
- Single session reduces user typing
- Better UX for repetitive operations
- Immediate visual feedback

**Trade-off**: Cannot pipe commands or script operations, but this is acceptable for Phase I

### Decision 4: Input Validation
**Choice**: Validate in service layer, re-prompt in UI layer
**Rationale**:
- Clear separation of concerns
- Service layer remains testable
- UI handles user interaction loop

## 5. Data Flow Diagrams

### Add Task Flow
```
1. User sees menu → Selects 1 (Add Task)
                         ↓
2. UI prompts: "Enter title: " → User inputs
                                       ↓
3. Service validates (1-200 chars) → If invalid: error, re-prompt
                                    → If valid: continue
                                               ↓
4. UI prompts: "Description (Enter to skip): " → User inputs
                                                       ↓
5. Service creates Task(id=auto, status=incomplete)
                         ↓
6. Storage saves task, returns with assigned ID
                   ↓
7. UI shows: "✓ Task added successfully!"
                   ↓
8. Clear screen → Redisplay menu with new task in list
```

### Complete Task Flow
```
1. User sees menu → Selects 4 (Complete Task)
                         ↓
2. UI prompts: "Enter task ID: " → User inputs
                                       ↓
3. Service gets task by ID → If not found: error
                           → If found: toggle to complete
                                       ↓
4. Storage updates task
             ↓
5. UI shows: "✓ Task marked as complete!"
             ↓
6. Clear screen → Redisplay with green ✓ icon
```

## 6. File Structure

```
Phase-I__Interactive-Menu-App/
├── src/
│   └── todo_cli/
│       ├── __init__.py
│       ├── main.py         # Application loop
│       ├── ui.py           # Display & input functions
│       ├── service.py      # Business logic
│       ├── storage.py      # In-memory storage
│       ├── models.py       # Task dataclass
│       └── exceptions.py   # Custom exceptions
├── tests/
│   ├── conftest.py         # Fixtures (storage reset)
│   ├── unit/
│   │   ├── test_service.py # Service tests
│   │   └── test_ui.py      # UI formatting tests
│   └── integration/
│       └── test_app.py     # Full flow tests
├── requirements.txt
├── pyproject.toml
├── README.md
└── demo_session.txt        # Example session transcript
```

## 7. UI/UX Specifications

### Main Screen Layout
```
================================================================================
                           MY TODO LIST
================================================================================

[1] ○ Buy groceries
    Status: Incomplete
    Description: Milk, eggs, bread

[2] ✓ Call dentist
    Status: Complete
    Description: No description

================================================================================
Total: 2 tasks

What would you like to do?
1. Add Task
2. View Tasks (detailed view)
3. Update Task
4. Complete Task
5. Delete Task
6. Exit

Enter your choice (1-6): _
```

### Color Scheme (using colorama)
- **Fore.GREEN**: Complete status, ✓ icon, success messages
- **Fore.YELLOW**: Prompts, menu headers, "MY TODO LIST"
- **Fore.RED**: Errors, validation failures
- **Fore.WHITE**: Incomplete status, ○ icon, normal text
- **Fore.CYAN**: Borders (===), "Total: X tasks"

### Icons
- **Complete**: ✓ (Fore.GREEN)
- **Incomplete**: ○ (Fore.WHITE)

## 8. Implementation Phases

### Phase 1: Core Infrastructure (Tasks T001-T011)
- Project structure
- Task model and TaskStatus enum
- Custom exceptions
- In-memory storage with CRUD operations
- Service layer implementation
- Test setup

### Phase 2: UI Layer (Tasks T012-T018)
- Screen clearing utility
- Colorama initialization
- Task display formatter with colors and icons
- Menu display function
- Input prompt functions
- Success/error message displays

### Phase 3: Main Loop (Tasks T019-T024)
- Application loop implementation
- Menu selection handler
- Wire menu options to service methods
- Add task flow (prompts + validation)
- Complete task flow
- Update task flow
- Delete task flow (with confirmation)
- Exit handling

### Phase 4: Testing & Polish (Tasks T025-T030)
- Unit tests for service layer
- Integration tests for complete flows
- Manual testing across platforms
- Edge case handling
- README and documentation

## 9. Dependencies

### Production
```
colorama>=0.4.6  # Cross-platform colored terminal output
```

### Development
```
pytest>=7.4.0    # Testing framework
black>=23.0.0    # Code formatting
ruff>=0.1.0      # Linting
```

## 10. Error Handling Strategy

| Error Type | Detection | Handling | User Feedback |
|------------|-----------|----------|---------------|
| Invalid menu choice | UI layer | Re-prompt | Red: "Invalid choice. Please enter 1-6." |
| Empty title | Service validation | Raise ValidationError | Red: "Title cannot be empty. Please try again." |
| Title too long | Service validation | Raise ValidationError | Red: "Title must be 1-200 characters." |
| Task not found | Service lookup | Raise TaskNotFound | Red: "Task ID X not found." |
| Invalid ID input | UI input parsing | Catch exception, re-prompt | Red: "Please enter a valid number." |

## 11. Testing Strategy

### Unit Tests (test_service.py)
- Add task: valid inputs, validation failures
- Get tasks: empty list, multiple tasks
- Get task by ID: found, not found
- Update task: full update, partial update, validation
- Complete task: toggle status, not found
- Delete task: success, not found

### Integration Tests (test_app.py)
- Full add flow: menu → prompts → display
- Full complete flow: select → enter ID → update
- Error scenarios: invalid ID, validation failures
- Menu navigation: invalid choices, exit

### Manual Test Checklist
- [ ] App launches with menu
- [ ] Add task with description works
- [ ] Add task without description works
- [ ] Tasks display with correct colors/icons
- [ ] Complete task changes ○ to ✓
- [ ] Update task modifies title/description
- [ ] Delete task with confirmation removes task
- [ ] Invalid inputs show red errors
- [ ] Exit option terminates cleanly
- [ ] Works on Windows
- [ ] Works on Mac/Linux

## 12. Performance Considerations

- **Screen Clearing**: Use OS-native commands for speed
- **Color Rendering**: colorama adds minimal overhead
- **In-Memory Operations**: All CRUD operations are O(1) or O(n) for small n
- **Expected Performance**: < 100ms for any operation

## 13. Cross-Platform Compatibility

| Feature | Windows | Mac | Linux |
|---------|---------|-----|-------|
| Screen Clear | `cls` | `clear` | `clear` |
| Colors | colorama.init() | Native ANSI | Native ANSI |
| Input | input() | input() | input() |

## 14. Risk Analysis

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| colorama not installed | High | Low | Add to requirements.txt, document in README |
| ANSI not supported | Medium | Low | colorama handles Windows automatically |
| Screen clear fails | Low | Low | Fallback to printing newlines |
| User Ctrl+C crashes | Medium | Medium | Wrap in try-except, handle KeyboardInterrupt |

## 15. Acceptance Criteria

**Must Have** (P1):
- ✓ Interactive menu displays with 6 options
- ✓ Tasks show with colored status icons
- ✓ Add task flow: prompts, validation, display
- ✓ Complete task flow: ID input, status change
- ✓ Screen clears between operations
- ✓ Errors show in red, success in green

**Should Have** (P2):
- ✓ Update task with partial field updates
- ✓ Delete task with confirmation prompt
- ✓ Friendly error messages for all failures

**Nice to Have** (P3):
- View Tasks option (detailed display)
- Task count display
- Formatted borders and spacing

## 16. Implementation Notes

### Screen Clearing
```python
import os
import platform

def clear_screen():
    """Clear terminal screen (cross-platform)"""
    if platform.system() == "Windows":
        os.system('cls')
    else:
        os.system('clear')
```

### Color Usage
```python
from colorama import Fore, Style, init

# Initialize colorama
init(autoreset=True)

# Examples
print(Fore.GREEN + "✓ Task completed!")
print(Fore.RED + "✗ Error: Task not found")
print(Fore.YELLOW + "What would you like to do?")
```

### Menu Loop Structure
```python
def main():
    init()  # colorama init
    service = TodoService()

    while True:
        clear_screen()
        display_tasks(service.get_tasks())
        show_menu()

        choice = get_menu_choice()

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
            print(Fore.YELLOW + "\nGoodbye! 👋")
            break
```

## 17. Future Enhancements (Out of Scope for Phase I)

- File persistence (JSON/SQLite)
- Task priorities
- Due dates
- Categories/tags
- Search and filter
- Undo/redo functionality
- Multi-user support

## 18. Optional Features Architecture

### Optional Feature 1: Task Priority Levels

**Enhanced Task Model**:
```python
class TaskPriority(Enum):
    HIGH = ("high", "🔴")
    MEDIUM = ("medium", "🟡")
    LOW = ("low", "🟢")

@dataclass
class Task:
    id: int
    title: str
    description: str
    status: TaskStatus
    priority: TaskPriority = TaskPriority.MEDIUM  # NEW
```

**New Service Methods**:
- `set_task_priority(task_id, priority)`: Update task priority
- `get_tasks_by_priority(priority)`: Filter by priority
- `sort_tasks_by_priority(tasks)`: Sort High → Medium → Low

**UI Changes**:
- Display priority icon before status icon: 🔴 ✓ Task Title
- Add menu option: "7. Sort by Priority"
- Prompt during add/update: "Priority (1=High, 2=Medium, 3=Low):"

### Optional Feature 2: Task Due Dates

**Enhanced Task Model**:
```python
from datetime import date

@dataclass
class Task:
    # ... existing fields
    due_date: date | None = None  # NEW
```

**New Service Methods**:
- `set_due_date(task_id, due_date)`: Update due date
- `get_overdue_tasks()`: Return tasks past due date
- `get_tasks_due_today()`: Return today's tasks
- `sort_tasks_by_due_date(tasks)`: Sort by nearest deadline

**UI Changes**:
- Display due date with color coding:
  - Past: RED "Overdue: 2025-12-25"
  - Today: YELLOW "Due: Today"
  - Future: WHITE "Due: 2025-12-30"
- Add menu option: "8. Sort by Due Date"
- Prompt during add/update: "Due date (YYYY-MM-DD or Enter to skip):"

### Optional Feature 3: Task Categories/Tags

**Enhanced Task Model**:
```python
class TaskCategory(Enum):
    WORK = ("Work", Fore.BLUE)
    PERSONAL = ("Personal", Fore.MAGENTA)
    SHOPPING = ("Shopping", Fore.CYAN)
    HEALTH = ("Health", Fore.GREEN)
    OTHER = ("Other", Fore.WHITE)

@dataclass
class Task:
    # ... existing fields
    category: TaskCategory = TaskCategory.OTHER  # NEW
```

**New Service Methods**:
- `set_category(task_id, category)`: Update category
- `get_tasks_by_category(category)`: Filter by category
- `get_category_statistics()`: Count tasks per category

**UI Changes**:
- Display category badge: [Work] before task title
- Add menu options:
  - "9. Filter by Category"
  - "10. Clear Filter"
- Show active filter in header: "MY TODO LIST (Filter: Work)"

### Optional Feature 4: Task Search

**New Service Methods**:
```python
def search_tasks(keyword: str) -> list[Task]:
    """Search title and description for keyword (case-insensitive)"""
    keyword_lower = keyword.lower()
    return [
        task for task in get_tasks()
        if keyword_lower in task.title.lower()
        or keyword_lower in task.description.lower()
    ]
```

**UI Changes**:
- Add menu option: "11. Search Tasks"
- Highlight matching keywords in results (different color)
- Show search query in header: "Search Results for: 'grocery'"
- "Press Enter to return to full list" prompt

### Optional Feature 5: Task Statistics

**New Service Methods**:
```python
def get_statistics() -> dict:
    tasks = get_tasks()
    total = len(tasks)
    completed = sum(1 for t in tasks if t.status == TaskStatus.COMPLETE)
    return {
        "total": total,
        "completed": completed,
        "incomplete": total - completed,
        "completion_rate": (completed / total * 100) if total > 0 else 0,
        "by_priority": {...},
        "by_category": {...}
    }
```

**UI Changes**:
- Add menu option: "12. View Statistics"
- Display formatted statistics dashboard:
  ```
  📊 TASK STATISTICS
  ═══════════════════════════════
  Total Tasks: 15
  ✓ Completed: 8 (53%)
  ○ Incomplete: 7 (47%)

  By Priority:
  🔴 High: 3    🟡 Medium: 7    🟢 Low: 5

  By Category:
  [Work]: 5    [Personal]: 4    [Shopping]: 6
  ```

### Optional Feature 6: Bulk Operations

**New Service Methods**:
- `complete_all_tasks()`: Mark all incomplete as complete
- `delete_completed_tasks()`: Remove all completed tasks
- `delete_all_tasks()`: Clear entire list

**UI Changes**:
- Add menu options:
  - "13. Complete All Tasks"
  - "14. Delete Completed Tasks"
- Double confirmation for destructive operations
- Show affected count: "✓ 5 tasks marked complete"

### Optional Feature 7: Task Notes/Comments

**Enhanced Task Model**:
```python
from datetime import datetime

@dataclass
class TaskNote:
    text: str
    created_at: datetime

@dataclass
class Task:
    # ... existing fields
    notes: list[TaskNote] = field(default_factory=list)  # NEW
```

**New Service Methods**:
- `add_note(task_id, note_text)`: Append timestamped note
- `get_task_notes(task_id)`: Return all notes for a task

**UI Changes**:
- Add menu option: "15. Add Note to Task"
- In detailed view, show:
  ```
  Notes (2):
  1. [2025-12-25 14:30] Remember to check expiration dates
  2. [2025-12-26 09:15] Store opens at 9 AM
  ```
- Show note indicator in task list: 📝 (if has notes)

### Optional Feature 8: Task Subtasks

**Enhanced Task Model**:
```python
@dataclass
class Subtask:
    id: int
    title: str
    status: TaskStatus

@dataclass
class Task:
    # ... existing fields
    subtasks: list[Subtask] = field(default_factory=list)  # NEW
```

**New Service Methods**:
- `add_subtask(parent_id, subtask_title)`: Create linked subtask
- `complete_subtask(task_id, subtask_id)`: Mark subtask complete
- `get_subtask_progress(task_id)`: Return (completed, total) count
- Auto-complete parent when all subtasks done

**UI Changes**:
- Add menu option: "16. Add Subtask"
- Display subtasks indented:
  ```
  [1] 🟡 ○ Plan project
      ├─ ✓ Create outline
      ├─ ○ Research topics
      └─ ○ Set timeline
      Progress: 1/3 complete
  ```

### Optional Feature 9: Color Themes

**New Theme System**:
```python
class ColorTheme(Enum):
    DEFAULT = "default"
    DARK = "dark"
    LIGHT = "light"
    COLORFUL = "colorful"

# Theme configurations
THEMES = {
    "default": {
        "complete": Fore.GREEN,
        "incomplete": Fore.WHITE,
        "header": Fore.YELLOW,
        ...
    },
    "dark": {...},
    "light": {...},
    "colorful": {...}
}
```

**New Service Methods**:
- `set_theme(theme_name)`: Store active theme
- `get_current_theme()`: Return active theme config

**UI Changes**:
- Add menu option: "17. Change Theme"
- Load colors from active theme config
- Show current theme in header: "MY TODO LIST [Theme: Dark]"

### Optional Feature 10: Export/Import

**New Service Methods**:
```python
import json
from pathlib import Path

def export_tasks(filename: str) -> None:
    """Export all tasks to JSON file"""
    tasks_data = [asdict(task) for task in get_tasks()]
    Path(filename).write_text(json.dumps(tasks_data, indent=2))

def import_tasks(filename: str) -> int:
    """Import tasks from JSON, return count imported"""
    data = json.loads(Path(filename).read_text())
    # Handle ID conflicts, merge with existing tasks
    return len(data)
```

**UI Changes**:
- Add menu options:
  - "18. Export Tasks to JSON"
  - "19. Import Tasks from JSON"
- Prompt for filename with default: "tasks_YYYY-MM-DD.json"
- Show success: "✓ Exported 10 tasks to tasks_2025-12-31.json"

## 19. Enhanced Menu Structure

With optional features, the menu expands to:

```
What would you like to do?
1. Add Task
2. View Tasks
3. Update Task
4. Complete Task
5. Delete Task
6. Exit

--- Optional Features ---
7. Sort by Priority
8. Sort by Due Date
9. Filter by Category
10. Clear Filter
11. Search Tasks
12. View Statistics
13. Complete All Tasks
14. Delete Completed Tasks
15. Add Note to Task
16. Add Subtask
17. Change Theme
18. Export Tasks
19. Import Tasks

Enter your choice (1-19): _
```

## 20. Implementation Priority

**Phase 1A (High Value, Easy)**:
1. Task Priority Levels (OF-1)
2. Task Statistics (OF-5)
3. Search (OF-4)

**Phase 1B (Medium Value, Medium Effort)**:
4. Due Dates (OF-2)
5. Bulk Operations (OF-6)
6. Export/Import (OF-10)

**Phase 1C (Nice to Have, Higher Effort)**:
7. Categories/Tags (OF-3)
8. Color Themes (OF-9)
9. Task Notes (OF-7)
10. Subtasks (OF-8)

## 21. Plan Summary

This plan transforms the command-based CLI into an interactive menu-driven application with:

1. **Continuous Session**: User stays in app, menu loops
2. **Visual Feedback**: Colored output, status icons, formatted borders
3. **Simple Navigation**: Numbered menu (1-6), minimal typing
4. **Clean Display**: Screen clears between operations
5. **User-Friendly**: Friendly errors, confirmations, re-prompts

**Plus Optional Enhancements**:
6. **Priority Management**: Focus on important tasks with visual indicators
7. **Deadline Tracking**: Never miss deadlines with due date warnings
8. **Organization**: Categories and search for better task management
9. **Productivity Insights**: Statistics dashboard for tracking progress
10. **Flexibility**: Bulk operations, themes, notes, subtasks, export/import

The architecture maintains clean separation of concerns while delivering an intuitive interactive experience matching the reference design and adding powerful optional features.
