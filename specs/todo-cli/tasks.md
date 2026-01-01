# Implementation Tasks: Interactive Todo CLI Application

**Feature**: Interactive Menu-Based Todo CLI
**Created**: 2026-01-01
**Status**: Active

This document contains actionable, dependency-ordered tasks for implementing the interactive menu-based todo CLI application.

## Task Format

Each task follows this format:
- Task ID (e.g., T001)
- [P] = Can be done in parallel with previous task
- [US#] = Maps to User Story # in spec.md
- Clear acceptance criteria

---

## Phase 1: Project Setup

- [X] T001 Create new project directory `Phase-I__Interactive-Menu-App`
- [X] T002 Create `src/todo_cli/` directory structure
- [X] T003 Create `tests/unit/` and `tests/integration/` directories
- [X] T004 Create `requirements.txt` with `colorama>=0.4.6` and `pytest>=7.4.0`
- [X] T005 Create `pyproject.toml` for black and ruff configuration

## Phase 2: Core Models & Storage

- [X] T006 [P] Implement `TaskStatus` enum in `src/todo_cli/models.py` (INCOMPLETE, COMPLETE)
- [X] T007 [P] Implement `Task` dataclass in `src/todo_cli/models.py` (id, title, description, status)
- [X] T008 [P] Implement custom exceptions in `src/todo_cli/exceptions.py` (TaskNotFound, ValidationError)
- [X] T009 Implement in-memory storage variables in `src/todo_cli/storage.py` (_tasks dict, _next_id counter)
- [X] T010 Implement storage functions: add_task, get_task, get_all_tasks, update_task, delete_task

## Phase 3: Service Layer

- [X] T011 [US2] Implement `TodoService` class in `src/todo_cli/service.py`
- [X] T012 [US2] Implement `add_task(title, description)` with validation (1-200 chars)
- [X] T013 [US3] Implement `get_tasks()` returning sorted list
- [X] T014 [US3] Implement `get_task(id)` raising TaskNotFound if missing
- [X] T015 [US4] Implement `complete_task(id)` toggling status to COMPLETE
- [X] T016 [US5] Implement `update_task(id, title, description)` with partial update support
- [X] T017 [US6] Implement `delete_task(id)` with existence check

## Phase 4: UI Layer - Display Functions

- [X] T018 [US1,US3] Implement `clear_screen()` in `src/todo_cli/ui.py` (cross-platform)
- [X] T019 [US1,US3] Implement colorama initialization in `ui.py`
- [X] T020 [US3] Implement `display_header()` showing "MY TODO LIST" with borders
- [X] T021 [US3] Implement `display_tasks(tasks)` with:
  - Status icons (✓ green for complete, ○ white for incomplete)
  - Formatted output: [ID] icon Title, Status, Description
  - "No tasks yet!" message for empty list
  - Task count at bottom
- [X] T022 [US1] Implement `show_menu()` displaying 6 numbered options
- [X] T023 [US1] Implement `get_menu_choice()` with input validation (1-6)

## Phase 5: UI Layer - Input & Messages

- [X] T024 [US2] Implement `prompt_title()` with validation loop
- [X] T025 [US2] Implement `prompt_description()` allowing empty input
- [X] T026 [US4,US5,US6] Implement `prompt_task_id()` with numeric validation
- [X] T027 [P] Implement `show_success(message)` in green
- [X] T028 [P] Implement `show_error(message)` in red
- [X] T029 [US6] Implement `confirm_delete()` yes/no prompt

## Phase 6: Main Application Loop

- [X] T030 [US1] Implement main application loop in `src/todo_cli/main.py`
- [X] T031 [US1] Implement menu routing (choice 1-6 to handlers)
- [X] T032 [US2] Implement `handle_add_task()` flow: prompt → validate → add → success
- [X] T033 [US3] Implement `handle_view_tasks()` flow: display detailed list, pause for input
- [X] T034 [US4] Implement `handle_complete_task()` flow: prompt ID → complete → success
- [X] T035 [US5] Implement `handle_update_task()` flow: prompt ID → prompt fields → update
- [X] T036 [US6] Implement `handle_delete_task()` flow: prompt ID → confirm → delete
- [X] T037 [US1] Implement exit handler with goodbye message
- [X] T038 Add KeyboardInterrupt handling (Ctrl+C) for graceful exit

## Phase 7: Testing

- [X] T039 Create `tests/conftest.py` with storage reset fixture
- [ ] T040 Write unit tests for `TodoService.add_task()` in `tests/unit/test_service.py`
- [ ] T041 Write unit tests for `TodoService.get_tasks()` and `get_task()`
- [ ] T042 Write unit tests for `TodoService.complete_task()`
- [ ] T043 Write unit tests for `TodoService.update_task()`
- [ ] T044 Write unit tests for `TodoService.delete_task()`
- [ ] T045 Write UI tests for display functions in `tests/unit/test_ui.py`
- [ ] T046 Write integration test for add task flow in `tests/integration/test_app.py`
- [ ] T047 Write integration test for complete task flow
- [ ] T048 Write integration test for update and delete flows
- [ ] T049 Write integration test for error handling scenarios

## Phase 8: Polish & Documentation

- [ ] T050 Update `requirements.txt` to ensure colorama is listed
- [ ] T051 Create comprehensive `README.md` with:
  - Installation instructions
  - Usage guide with screenshots/examples
  - Menu option descriptions
  - Requirements
- [ ] T052 Create example session transcript in `demo_session.txt`
- [ ] T053 Manual testing on Windows
- [ ] T054 Manual testing on Mac/Linux
- [ ] T055 Verify all colors display correctly
- [ ] T056 Verify screen clearing works on all platforms
- [ ] T057 Final code review for Task-ID comments

---

## Phase 9: Optional Features - Priority System (OF-1)

- [ ] T058 [OF-1] Add `TaskPriority` enum to `models.py` (HIGH, MEDIUM, LOW with icons)
- [ ] T059 [OF-1] Update `Task` dataclass to include `priority` field with default MEDIUM
- [ ] T060 [OF-1] Implement `set_task_priority(task_id, priority)` in service layer
- [ ] T061 [OF-1] Implement `get_tasks_by_priority(priority)` for filtering
- [ ] T062 [OF-1] Implement `sort_tasks_by_priority(tasks)` returning sorted list
- [ ] T063 [OF-1] Update `display_tasks()` to show priority icon before status icon
- [ ] T064 [OF-1] Add `prompt_priority()` in UI layer with validation (1-3)
- [ ] T065 [OF-1] Update `handle_add_task()` to include priority prompt
- [ ] T066 [OF-1] Update `handle_update_task()` to allow priority modification
- [ ] T067 [OF-1] Add menu option "7. Sort by Priority" with handler
- [ ] T068 [OF-1] Write tests for priority functionality

## Phase 10: Optional Features - Due Dates (OF-2)

- [ ] T069 [OF-2] Import `datetime.date` and add `due_date` field to Task model
- [ ] T070 [OF-2] Implement `set_due_date(task_id, due_date)` with date validation
- [ ] T071 [OF-2] Implement `get_overdue_tasks()` returning past-due tasks
- [ ] T072 [OF-2] Implement `get_tasks_due_today()` returning today's tasks
- [ ] T073 [OF-2] Implement `sort_tasks_by_due_date(tasks)` sorting nearest first
- [ ] T074 [OF-2] Add `prompt_due_date()` with format validation (YYYY-MM-DD)
- [ ] T075 [OF-2] Update `display_tasks()` to show due date with color coding:
  - RED for overdue
  - YELLOW for today
  - WHITE for future
- [ ] T076 [OF-2] Update `handle_add_task()` and `handle_update_task()` for due date
- [ ] T077 [OF-2] Add menu option "8. Sort by Due Date" with handler
- [ ] T078 [OF-2] Write tests for due date functionality

## Phase 11: Optional Features - Categories (OF-3)

- [ ] T079 [OF-3] Add `TaskCategory` enum to `models.py` (WORK, PERSONAL, SHOPPING, HEALTH, OTHER)
- [ ] T080 [OF-3] Update `Task` dataclass with `category` field defaulting to OTHER
- [ ] T081 [OF-3] Implement `set_category(task_id, category)` in service
- [ ] T082 [OF-3] Implement `get_tasks_by_category(category)` for filtering
- [ ] T083 [OF-3] Implement `get_category_statistics()` returning counts per category
- [ ] T084 [OF-3] Add `prompt_category()` with numbered selection (1-5)
- [ ] T085 [OF-3] Update `display_tasks()` to show colored category badge before title
- [ ] T086 [OF-3] Add menu option "9. Filter by Category" with submenu
- [ ] T087 [OF-3] Add menu option "10. Clear Filter" to reset view
- [ ] T088 [OF-3] Update header to show active filter when set
- [ ] T089 [OF-3] Update `handle_add_task()` and `handle_update_task()` for category
- [ ] T090 [OF-3] Write tests for category functionality

## Phase 12: Optional Features - Search (OF-4)

- [ ] T091 [OF-4] Implement `search_tasks(keyword)` in service layer
  - Search title and description (case-insensitive)
  - Return list of matching tasks
- [ ] T092 [OF-4] Add `highlight_keyword(text, keyword)` in UI for visual highlighting
- [ ] T093 [OF-4] Add `handle_search_tasks()` with keyword prompt
- [ ] T094 [OF-4] Update header to show search query when active
- [ ] T095 [OF-4] Add menu option "11. Search Tasks" with handler
- [ ] T096 [OF-4] Show "No tasks found" message for empty results
- [ ] T097 [OF-4] Add "Press Enter to return" prompt after results
- [ ] T098 [OF-4] Write tests for search functionality

## Phase 13: Optional Features - Statistics (OF-5)

- [ ] T099 [OF-5] Implement `get_statistics()` in service returning:
  - total, completed, incomplete counts
  - completion_rate percentage
  - by_priority breakdown
  - by_category breakdown
- [ ] T100 [OF-5] Add `display_statistics(stats)` in UI with formatted dashboard
- [ ] T101 [OF-5] Add `handle_view_statistics()` handler
- [ ] T102 [OF-5] Add menu option "12. View Statistics"
- [ ] T103 [OF-5] Include visual elements: 📊 icon, progress bar (█░░░░)
- [ ] T104 [OF-5] Write tests for statistics calculations

## Phase 14: Optional Features - Bulk Operations (OF-6)

- [ ] T105 [OF-6] Implement `complete_all_tasks()` in service
- [ ] T106 [OF-6] Implement `delete_completed_tasks()` returning count deleted
- [ ] T107 [OF-6] Implement `delete_all_tasks()` with safety check
- [ ] T108 [OF-6] Add `handle_complete_all()` with double confirmation
- [ ] T109 [OF-6] Add `handle_delete_completed()` with confirmation
- [ ] T110 [OF-6] Add menu options "13. Complete All" and "14. Delete Completed"
- [ ] T111 [OF-6] Show affected count: "✓ X tasks completed/deleted"
- [ ] T112 [OF-6] Write tests for bulk operations

## Phase 15: Optional Features - Notes (OF-7)

- [ ] T113 [OF-7] Add `TaskNote` dataclass to `models.py` (text, created_at)
- [ ] T114 [OF-7] Update `Task` model with `notes: list[TaskNote]` field
- [ ] T115 [OF-7] Implement `add_note(task_id, note_text)` in service
- [ ] T116 [OF-7] Implement `get_task_notes(task_id)` returning note list
- [ ] T117 [OF-7] Add `display_task_notes(task)` in UI showing formatted notes
- [ ] T118 [OF-7] Add 📝 indicator in task list when notes exist
- [ ] T119 [OF-7] Add `handle_add_note()` with task ID and note prompts
- [ ] T120 [OF-7] Add menu option "15. Add Note to Task"
- [ ] T121 [OF-7] Update detailed view to show notes with timestamps
- [ ] T122 [OF-7] Write tests for notes functionality

## Phase 16: Optional Features - Subtasks (OF-8)

- [ ] T123 [OF-8] Add `Subtask` dataclass to `models.py` (id, title, status)
- [ ] T124 [OF-8] Update `Task` model with `subtasks: list[Subtask]` field
- [ ] T125 [OF-8] Implement `add_subtask(parent_id, subtask_title)` in service
- [ ] T126 [OF-8] Implement `complete_subtask(task_id, subtask_id)` with parent auto-complete
- [ ] T127 [OF-8] Implement `get_subtask_progress(task_id)` returning (complete, total)
- [ ] T128 [OF-8] Update `display_tasks()` to show indented subtask tree structure
- [ ] T129 [OF-8] Add progress indicator: "Progress: 2/5 complete"
- [ ] T130 [OF-8] Add `handle_add_subtask()` handler
- [ ] T131 [OF-8] Add menu option "16. Add Subtask"
- [ ] T132 [OF-8] Write tests for subtask functionality and parent auto-complete

## Phase 17: Optional Features - Themes (OF-9)

- [ ] T133 [OF-9] Add `ColorTheme` enum to `models.py` (DEFAULT, DARK, LIGHT, COLORFUL)
- [ ] T134 [OF-9] Create `THEMES` dictionary mapping theme names to color configs
- [ ] T135 [OF-9] Add global `current_theme` variable in storage/service
- [ ] T136 [OF-9] Implement `set_theme(theme_name)` in service
- [ ] T137 [OF-9] Implement `get_current_theme()` returning active theme config
- [ ] T138 [OF-9] Refactor all UI color usage to use theme config
- [ ] T139 [OF-9] Add `display_theme_menu()` showing available themes
- [ ] T140 [OF-9] Add `handle_change_theme()` handler
- [ ] T141 [OF-9] Add menu option "17. Change Theme"
- [ ] T142 [OF-9] Update header to show current theme name
- [ ] T143 [OF-9] Write tests for theme switching

## Phase 18: Optional Features - Export/Import (OF-10)

- [ ] T144 [OF-10] Import `json` and `pathlib.Path` in service layer
- [ ] T145 [OF-10] Implement `export_tasks(filename)` serializing tasks to JSON
- [ ] T146 [OF-10] Implement `import_tasks(filename)` with:
  - File existence check
  - JSON parsing with error handling
  - ID conflict resolution (renumber imports)
  - Return count of imported tasks
- [ ] T147 [OF-10] Add `prompt_filename(default)` in UI with validation
- [ ] T148 [OF-10] Add `handle_export_tasks()` with success message
- [ ] T149 [OF-10] Add `handle_import_tasks()` with error handling
- [ ] T150 [OF-10] Add menu options "18. Export Tasks" and "19. Import Tasks"
- [ ] T151 [OF-10] Write tests for export/import with sample JSON files

## Phase 19: Integration Testing for Optional Features

- [ ] T152 Write integration test for priority sorting and filtering
- [ ] T153 Write integration test for due date warnings and sorting
- [ ] T154 Write integration test for category filtering workflow
- [ ] T155 Write integration test for search with highlighting
- [ ] T156 Write integration test for statistics calculations
- [ ] T157 Write integration test for bulk operations
- [ ] T158 Write integration test for notes workflow
- [ ] T159 Write integration test for subtasks with auto-complete
- [ ] T160 Write integration test for theme switching
- [ ] T161 Write integration test for export and import round-trip

## Phase 20: Final Polish for Enhanced Features

- [ ] T162 Update README.md with optional features documentation
- [ ] T163 Create enhanced demo session showing all features
- [ ] T164 Add keyboard shortcuts documentation (if implemented)
- [ ] T165 Add troubleshooting section for common issues
- [ ] T166 Create visual examples of each theme
- [ ] T167 Add sample export JSON file to repository
- [ ] T168 Manual testing of all optional features
- [ ] T169 Performance testing with large task lists (100+ tasks)
- [ ] T170 Final code review ensuring all Task-IDs present

## Dependencies Between Tasks

```
T001-T005 (Setup)
    ↓
T006-T010 (Models & Storage) [Can run in parallel]
    ↓
T011-T017 (Service Layer) [Sequential, builds on storage]
    ↓
T018-T029 (UI Layer) [Can build in parallel after service exists]
    ↓
T030-T038 (Main Loop) [Requires both Service & UI]
    ↓
T039-T049 (Testing) [Can write alongside implementation]
    ↓
T050-T057 (Polish & Docs) [Final phase]
```

## Acceptance Criteria Per Task

### T020 - display_tasks() Acceptance
- Displays "MY TODO LIST" header in yellow
- Shows === border in cyan
- Each task formatted as: [ID] icon Title
- Complete tasks show green ✓
- Incomplete tasks show white ○
- Description shows or "No description"
- Bottom shows "Total: X tasks" in cyan
- Empty state shows "No tasks yet! Add your first task."

### T022 - show_menu() Acceptance
- Displays "What would you like to do?" in yellow
- Lists 6 numbered options:
  1. Add Task
  2. View Tasks
  3. Update Task
  4. Complete Task
  5. Delete Task
  6. Exit
- Shows prompt: "Enter your choice (1-6): "

### T032 - handle_add_task() Acceptance
- Prompts for title
- Validates title (1-200 chars, not empty)
- Shows red error and re-prompts on invalid
- Prompts for description with "(Enter to skip)"
- Calls service.add_task()
- Shows green success: "✓ Task added successfully!"
- Pauses briefly before returning to menu

### T034 - handle_complete_task() Acceptance
- Prompts: "Enter task ID: "
- Validates numeric input, re-prompts on invalid
- Calls service.complete_task(id)
- Catches TaskNotFound, shows red error
- Shows green success: "✓ Task marked as complete!"
- Returns to menu with updated icon

## Notes

- All tasks must include Task-ID comments in code
- All public functions must have type hints
- All validation errors must be user-friendly
- All success operations must show confirmation
- Screen must clear between all operations
- Colors must work cross-platform (via colorama)
