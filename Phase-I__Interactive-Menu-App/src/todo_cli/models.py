"""Task data models - Task-ID: T006, T007, T058-T143"""

from dataclasses import dataclass, field
from datetime import date, datetime
from enum import Enum
from colorama import Fore, Back, Style


class TaskStatus(Enum):
    """Task completion status - Task-ID: T006"""
    INCOMPLETE = "incomplete"
    COMPLETE = "complete"


class TaskPriority(Enum):
    """Task priority levels - Task-ID: T058"""
    HIGH = ("high", "🔴")
    MEDIUM = ("medium", "🟡")
    LOW = ("low", "🟢")

    def __init__(self, value: str, icon: str):
        self._value_ = value
        self.icon = icon


class TaskCategory(Enum):
    """Task categories for organization - Task-ID: T079"""
    WORK = ("Work", Fore.BLUE)
    PERSONAL = ("Personal", Fore.MAGENTA)
    SHOPPING = ("Shopping", Fore.CYAN)
    HEALTH = ("Health", Fore.GREEN)
    OTHER = ("Other", Fore.WHITE)

    def __init__(self, label: str, color: str):
        self._value_ = label
        self.label = label
        self.color = color


class ColorTheme(Enum):
    """Available color themes - Task-ID: T133"""
    DEFAULT = "default"
    DARK = "dark"
    LIGHT = "light"
    COLORFUL = "colorful"


class ThemeManager:
    """Manages color themes for the application - Task-ID: T133"""

    THEMES = {
        "default": {
            "header_border": Fore.CYAN,
            "header_text": Fore.YELLOW + Style.BRIGHT,
            "menu_option": Fore.YELLOW,
            "menu_highlight": Fore.YELLOW + Style.BRIGHT,
            "success": Fore.GREEN + Style.BRIGHT,
            "error": Fore.RED + Style.BRIGHT,
            "warning": Fore.YELLOW,
            "info": Fore.CYAN,
            "task_title": Style.BRIGHT,
            "task_status_complete": Fore.GREEN,
            "task_status_incomplete": Fore.WHITE,
            "task_priority_high": Fore.RED,
            "task_priority_medium": Fore.YELLOW,
            "task_priority_low": Fore.GREEN,
            "task_category_work": Fore.BLUE,
            "task_category_personal": Fore.MAGENTA,
            "task_category_shopping": Fore.CYAN,
            "task_category_health": Fore.GREEN,
            "task_category_other": Fore.WHITE,
            "stats_header": Fore.CYAN,
            "stats_label": Fore.YELLOW,
            "stats_value": Fore.WHITE,
            "border": Fore.CYAN,
        },
        "dark": {
            "header_border": Fore.WHITE,
            "header_text": Fore.LIGHTYELLOW_EX + Style.BRIGHT,
            "menu_option": Fore.LIGHTWHITE_EX,
            "menu_highlight": Fore.LIGHTYELLOW_EX + Style.BRIGHT,
            "success": Fore.LIGHTGREEN_EX + Style.BRIGHT,
            "error": Fore.LIGHTRED_EX + Style.BRIGHT,
            "warning": Fore.LIGHTYELLOW_EX,
            "info": Fore.LIGHTCYAN_EX,
            "task_title": Style.BRIGHT,
            "task_status_complete": Fore.LIGHTGREEN_EX,
            "task_status_incomplete": Fore.LIGHTWHITE_EX,
            "task_priority_high": Fore.LIGHTRED_EX,
            "task_priority_medium": Fore.LIGHTYELLOW_EX,
            "task_priority_low": Fore.LIGHTGREEN_EX,
            "task_category_work": Fore.LIGHTBLUE_EX,
            "task_category_personal": Fore.LIGHTMAGENTA_EX,
            "task_category_shopping": Fore.LIGHTCYAN_EX,
            "task_category_health": Fore.LIGHTGREEN_EX,
            "task_category_other": Fore.LIGHTWHITE_EX,
            "stats_header": Fore.LIGHTCYAN_EX,
            "stats_label": Fore.LIGHTYELLOW_EX,
            "stats_value": Fore.LIGHTWHITE_EX,
            "border": Fore.WHITE,
        },
        "light": {
            "header_border": Fore.BLACK,
            "header_text": Fore.BLACK + Style.BRIGHT,
            "menu_option": Fore.BLACK,
            "menu_highlight": Fore.BLACK + Style.BRIGHT,
            "success": Fore.GREEN + Style.BRIGHT,
            "error": Fore.RED + Style.BRIGHT,
            "warning": Fore.YELLOW,
            "info": Fore.BLUE,
            "task_title": Style.BRIGHT,
            "task_status_complete": Fore.GREEN,
            "task_status_incomplete": Fore.BLACK,
            "task_priority_high": Fore.RED,
            "task_priority_medium": Fore.YELLOW,
            "task_priority_low": Fore.GREEN,
            "task_category_work": Fore.BLUE,
            "task_category_personal": Fore.MAGENTA,
            "task_category_shopping": Fore.CYAN,
            "task_category_health": Fore.GREEN,
            "task_category_other": Fore.BLACK,
            "stats_header": Fore.BLUE,
            "stats_label": Fore.BLACK,
            "stats_value": Fore.BLACK,
            "border": Fore.BLACK,
        },
        "colorful": {
            "header_border": Fore.MAGENTA,
            "header_text": Fore.LIGHTMAGENTA_EX + Style.BRIGHT,
            "menu_option": Fore.LIGHTYELLOW_EX,
            "menu_highlight": Fore.LIGHTCYAN_EX + Style.BRIGHT,
            "success": Fore.LIGHTGREEN_EX + Style.BRIGHT,
            "error": Fore.LIGHTRED_EX + Style.BRIGHT,
            "warning": Fore.LIGHTYELLOW_EX,
            "info": Fore.LIGHTCYAN_EX,
            "task_title": Style.BRIGHT,
            "task_status_complete": Fore.LIGHTGREEN_EX,
            "task_status_incomplete": Fore.LIGHTWHITE_EX,
            "task_priority_high": Fore.LIGHTRED_EX,
            "task_priority_medium": Fore.LIGHTYELLOW_EX,
            "task_priority_low": Fore.LIGHTGREEN_EX,
            "task_category_work": Fore.LIGHTBLUE_EX,
            "task_category_personal": Fore.LIGHTMAGENTA_EX,
            "task_category_shopping": Fore.LIGHTCYAN_EX,
            "task_category_health": Fore.LIGHTGREEN_EX,
            "task_category_other": Fore.LIGHTWHITE_EX,
            "stats_header": Fore.LIGHTMAGENTA_EX,
            "stats_label": Fore.LIGHTYELLOW_EX,
            "stats_value": Fore.LIGHTWHITE_EX,
            "border": Fore.MAGENTA,
        }
    }

    def __init__(self, theme_name: str = "default"):
        self.set_theme(theme_name)

    def set_theme(self, theme_name: str):
        """Set the current theme"""
        if theme_name in self.THEMES:
            self.current_theme = theme_name
            self.colors = self.THEMES[theme_name]
        else:
            # Default to default theme if invalid theme name
            self.current_theme = "default"
            self.colors = self.THEMES["default"]

    def get_color(self, element: str) -> str:
        """Get the color for a specific UI element"""
        return self.colors.get(element, "")

    def get_current_theme_name(self) -> str:
        """Get the name of the current theme"""
        return self.current_theme


@dataclass
class TaskNote:
    """Note/comment attached to a task - Task-ID: T113"""
    text: str
    created_at: datetime = field(default_factory=datetime.now)


@dataclass
class Subtask:
    """Subtask belonging to a parent task - Task-ID: T123"""
    id: int
    title: str
    status: TaskStatus = TaskStatus.INCOMPLETE


@dataclass
class Task:
    """
    Task entity representing a todo item.
    Task-ID: T007, T059, T069, T080, T114, T124

    Attributes:
        id: Unique identifier (auto-generated)
        title: Task title (1-200 characters, required)
        description: Optional task description
        status: Completion status (defaults to INCOMPLETE)
        priority: Priority level (defaults to MEDIUM) - OF-1
        due_date: Optional deadline date - OF-2
        category: Task category (defaults to OTHER) - OF-3
        notes: List of notes/comments - OF-7
        subtasks: List of subtasks - OF-8
    """
    id: int
    title: str
    description: str
    status: TaskStatus
    priority: TaskPriority = TaskPriority.MEDIUM
    due_date: date | None = None
    category: TaskCategory = TaskCategory.OTHER
    notes: list[TaskNote] = field(default_factory=list)
    subtasks: list[Subtask] = field(default_factory=list)
