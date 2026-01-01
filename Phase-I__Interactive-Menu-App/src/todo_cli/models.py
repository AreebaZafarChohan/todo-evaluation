"""Task data models - Task-ID: T006, T007, T058-T143"""

from dataclasses import dataclass, field
from datetime import date, datetime
from enum import Enum
from colorama import Fore


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
