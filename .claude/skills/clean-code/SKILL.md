---
name: clean-code
description: "Ensure readable, maintainable, and traceable code. Defines naming conventions, folder organization, mandatory Task-ID comments, and refactoring rules. Prohibits clever hacks and over-engineering."
---

# Clean Code Skill

## Purpose

Ensure all code is readable, maintainable, and traceable to approved tasks. This skill enforces clean code principles that enable team collaboration, code review, and long-term system health.

## Core Principles

### What Clean Code Means

- **Readable by humans** - Intent is obvious without comments
- **Maintainable** - Easy to modify without breaking things
- **Traceable** - Every change links to an approved task
- **Focused** - Each function does one thing well
- **Simple** - No unnecessary complexity

### What Clean Code Is NOT

- **Clever hacks** - Tricks that save bytes but obscure meaning
- **Over-engineering** - Abstractions for hypothetical future needs
- **Orphan logic** - Code without task linkage
- **Magic numbers** - Hard-coded values without explanation

---

## Naming Conventions

### File Naming

| File Type | Convention | Example |
|-----------|------------|---------|
| Modules | kebab-case | `user-auth.ts` |
| Components | PascalCase | `UserProfile.tsx` |
| Utilities | kebab-case | `date-helper.ts` |
| Config files | kebab-case | `eslint.config.js` |
| Test files | `*.test.ts` or `*.spec.ts` | `user.test.ts` |
| Type files | `*.types.ts` | `user.types.ts` |

### Folder Naming

| Folder Type | Convention | Example |
|-------------|------------|---------|
| Feature modules | kebab-case | `src/todo/` |
| Shared utilities | kebab-case | `src/utils/` |
| Components | kebab-case or PascalCase | `src/components/` or `src/components/Button/` |
| Pages/Routes | kebab-case | `src/pages/dashboard/` |
| Hooks | usePrefix | `useAuth.ts` |

### Function Naming

**Rule**: Verb + Noun that describes exactly what happens.

| Operation | Bad Name | Good Name |
|-----------|----------|-----------|
| Create user | `makeUser()` | `createUser()` |
| Get user | `find()` | `getUserById()` |
| Check permission | `check()` | `hasPermission()` |
| Toggle state | `flip()` | `toggleVisibility()` |
| Validate input | `validate()` | `isValidEmail()` |
| Transform data | `process()` | `formatDate()` |

**Guidelines**:

- Use active verbs: `delete`, `create`, `update`, `fetch`
- Be specific: `getUserById` not `getUser`
- Boolean functions start with `is`, `has`, `can`, `should`
- Functions that throw errors can use action verbs: `saveUser()` not `trySaveUser()`

### Variable Naming

| Type | Convention | Example |
|------|------------|---------|
| Local variables | camelCase | `userName`, `todoList` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_RETRY_COUNT` |
| Configuration | camelCase | `apiEndpoint` |
| DOM elements | Descriptive with prefix | `todoInput`, `submitButton` |
| Booleans | `is/has/can` prefix | `isComplete`, `hasError` |
| Arrays | Plural nouns | `users`, `todoItems` |
| Objects | Singular nouns | `user`, `todoItem` |

### Class/Type Naming

| Type | Convention | Example |
|------|------------|---------|
| Classes | PascalCase | `UserService`, `TodoController` |
| Interfaces | PascalCase with I prefix (optional) | `IUser` or `User` |
| Types | PascalCase | `TodoStatus`, `UserRole` |
| Enums | PascalCase | `PriorityLevel` |

---

## Code Organization

### Module Structure

```
src/
├── [feature-module]/           # Feature-based organization
│   ├── [feature].types.ts     # Type definitions
│   ├── [feature].service.ts   # Business logic
│   ├── [feature].repository.ts # Data access
│   ├── [feature].controller.ts # Request handling
│   └── index.ts               # Public exports
├── shared/
│   ├── utils/
│   ├── hooks/
│   └── constants/
└── config/
```

### File Content Order

**Order within a file**:

```typescript
// 1. Imports (external first, then internal)
// 2. Types/Interfaces
// 3. Constants
// 4. Utility functions (if small, related)
// 5. Main class/function
// 6. Helper functions (private)
```

**Example**:

```typescript
// 1. IMPORTS
import { createUser, getUserById } from './user.repository';
import { UserError } from '@/shared/errors';

// 2. TYPES
interface UserCreateDto {
  name: string;
  email: string;
}

// 3. CONSTANTS
const MAX_NAME_LENGTH = 100;

// 4. UTILITIES (if small and related)
function validateEmail(email: string): boolean {
  return email.includes('@');
}

// 5. MAIN FUNCTION
export function createUser(dto: UserCreateDto): User {
  if (!validateEmail(dto.email)) {
    throw new UserError('Invalid email');
  }
  return createUser(dto);
}

// 6. HELPERS (private)
function sanitizeName(name: string): string {
  return name.trim().slice(0, MAX_NAME_LENGTH);
}
```

### Function Organization

**Single Responsibility**: Each function does ONE thing.

**Bad**:

```typescript
function processUser(user: User) {
  validateUser(user);     // Thing 1
  saveUser(user);         // Thing 2
  sendWelcomeEmail(user); // Thing 3
  logActivity(user);      // Thing 4
}
```

**Good**:

```typescript
function createUser(dto: UserCreateDto): User {
  const user = validateAndSanitize(dto);
  return saveUser(user);
}

// Each function does ONE thing:
function validateAndSanitize(dto: UserCreateDto): User { /* ... */ }
function saveUser(user: User): User { /* ... */ }
```

---

## Task-ID References (Mandatory)

### Task ID Format

All code changes MUST reference a task ID from `tasks.md`.

**Format**: `// TNNN` or `/* TNNN */` at the file or function level.

### Where to Add Task IDs

**1. At file level** (top comment):

```typescript
// T001: Create todo model and repository
export class Todo { }
```

**2. At function level** (above function):

```typescript
// T005: Implement todo creation
export function createTodo(dto: CreateTodoDto): Todo {
  // ...
}
```

**3. At significant code blocks** (for complex logic):

```typescript
// T010: Calculate todo priority based on due date
const priority = todo.dueDate
  ? calculatePriority(todo.dueDate)
  : Priority.LOW;
```

### Task ID Table (Keep at file bottom)

```typescript
// Task References:
// T001 - Create todo model (spec: User Stories)
// T005 - Implement todo creation (spec: User Story 1)
// T010 - Priority calculation logic (spec: FR-003)
```

### Task ID Validation

| Requirement | Enforcement |
|-------------|-------------|
| Every file has task ID | Error if missing |
| Every function has task ID | Error if missing |
| Task ID exists in tasks.md | Warn if not found |
| Multiple changes to same file | Use same or new task ID |

---

## Comment Rules

### When to Comment

**Good reasons to comment**:

- **WHY** something is done (not obvious from code)
- **Complex algorithm** explained briefly
- **Workaround** with reference to bug/task
- **TODO** items with task IDs
- **Task ID** linkage

**Bad reasons to comment**:

- Explaining **WHAT** the code does (code should be self-explanatory)
- **Deprecated** code (remove it)
- **Obvious** things (i.e., `i++ // increment i`)

### Comment Templates

**File Header**:

```typescript
// TXXX: [Brief description of what this file contains]
// Description: [2-3 lines on purpose]
// Related: [spec reference or task ID]
```

**Function Documentation**:

```typescript
// TXXX: [What this function does]
// Args: [parameter descriptions]
// Returns: [what it returns]
// Throws: [errors it may throw]
```

**Complex Logic**:

```typescript
// TXXX: [Why this logic exists]
// The algorithm handles edge case X by doing Y
// Alternative approaches considered: [if relevant]
```

### Comment Style

| Type | Style | Example |
|------|-------|---------|
| File header | Block comment | `/* T001: ... */` |
| Function | Line comment | `// T001: ...` |
| Inline | Line comment | `// Calculate latency` |
| TODO | With task ID | `// TXXX: TODO: refactor` |

---

## Refactoring Rules

### When to Refactor

**DO refactor when**:

- [ ] Code is duplicated in 3+ places
- [ ] Function is too long (>50 lines)
- [ ] Module has too many responsibilities (>7 functions)
- [ ] Naming is unclear despite best efforts
- [ ] Tests are hard to write (indicates poor design)
- [ ] Task explicitly requires refactoring

**DO NOT refactor when**:

- [ ] Code works and is infrequently changed
- [ ] Refactoring would change behavior
- [ ] No task covers this refactoring
- [ ] Time is better spent on new features
- [ ] Risk of introducing bugs is high

### Refactoring Limits

| Refactoring Type | Max Complexity | Requires Task |
|------------------|----------------|---------------|
| Rename variable/function | Low | TXXX |
| Extract function | Medium | TXXX |
| Move function to module | Medium | TXXX |
| Split large module | High | New task required |
| Change architecture | Highest | New task required |

### Refactoring Safety Rules

1. **Always have a task** - No unapproved refactoring
2. **One refactoring per task** - Keep changes focused
3. **Test coverage required** - Refactor only with tests
4. **Small steps** - Large refactors split across tasks
5. **No behavior change** - Refactor should not change output

### Refactoring Workflow

```markdown
1. Identify refactoring need
2. Create or find task for refactoring
3. Ensure test coverage exists
4. Make small, verifiable changes
5. Run tests after each change
6. Commit with task ID
```

---

## Forbidden Patterns

### Clever Hacks

**Forbidden**:

```typescript
// BAD: Clever but unclear
const magic = (n) => !(~n + ~n + 1) << 2 >> n;

// BAD: One-liner at expense of clarity
const format = (d) => d.split('/').reverse().join('-');

// BAD: Nested ternary
const status = age < 18 ? 'minor' : age < 65 ? 'adult' : 'senior';
```

**Acceptable**:

```typescript
// GOOD: Clear intent
function isEven(n: number): boolean {
  return n % 2 === 0;
}

// GOOD: Intentional optimization with comment
// Using bitwise for performance in hot path (T010)
const isEvenFast = (n: number) => (n & 1) === 0;
```

### Over-Engineering

**Forbidden**:

```typescript
// BAD: Abstract for "future" needs
interface ITodo<T extends Entity = Todo> extends IEntity, ITimestamped {}

// BAD: Factory for single use
class TodoFactoryFactory {
  static create(): TodoFactory<Todo> { return new TodoFactory(); }
}

// BAD: Interface for simple object
interface TodoConfig {
  color: string;
  theme: 'light' | 'dark';
}
const config: TodoConfig = { color: 'blue', theme: 'dark' };
```

**Acceptable**:

```typescript
// GOOD: Simple, direct
const config = { color: 'blue', theme: 'dark' as const };

// GOOD: Abstraction for actual variation
interface Repository<T> {
  findById(id: string): Promise<T>;
  save(entity: T): Promise<T>;
}
```

### Logic Without Task Linkage

**Forbidden**:

```typescript
// No task ID - where did this come from?
function calculateComplexMetric(input: Input): number {
  // ... 100 lines of complex logic
}
```

**Required**:

```typescript
// T015: Calculate user productivity score for dashboard
export function calculateProductivityScore(input: Input): number {
  // ... logic with T015 reference
}
```

---

## Code Quality Checklist

### Before Committing

- [ ] **Naming is descriptive** - Someone can understand from names alone
- [ ] **Functions are focused** - Each does ONE thing
- [ ] **Task IDs present** - Every file/function has TXXX reference
- [ ] **No clever hacks** - Code prioritizes clarity
- [ ] **No over-engineering** - Solutions match current needs
- [ ] **Comments explain WHY** - Not WHAT
- [ ] **Constants named well** - SCREAMING_SNAKE_CASE
- [ ] **Types are explicit** - No `any` without reason
- [ ] **Error handling exists** - Try/catch where needed
- [ ] **Tests pass** - All tests green

### Code Review Points

| Check | Pass Criteria |
|-------|---------------|
| Naming | Can you guess what it does from the name? |
| Length | Functions under 50 lines? Files under 300 lines? |
| Task Linkage | Every change linked to TXXX? |
| Duplication | Logic repeated more than twice? |
| Simplicity | Could this be simpler? |

---

## Language-Specific Rules

### TypeScript

```typescript
// Use explicit types for function parameters
function createUser(name: string, email: string): User {
  return { name, email, createdAt: new Date() };
}

// Prefer interfaces for object shapes
interface CreateUserDto {
  name: string;
  email: string;
}

// Use type for unions/intersections
type UserStatus = 'active' | 'inactive' | 'pending';

// Avoid 'any' - use unknown if truly unknown
function handleError(error: unknown): void {
  if (error instanceof Error) {
    console.error(error.message);
  }
}
```

### Python

```python
# Use type hints
def create_user(name: str, email: str) -> User:
    return User(name=name, email=email)

# Constants at module level
MAX_NAME_LENGTH = 100

# Docstrings for public functions
def calculate_metrics(data: list) -> dict:
    """
    Calculate summary metrics for data.

    Args:
        data: List of numeric values

    Returns:
        Dict with mean, median, and std dev
    """
```

### General Rules

| Concept | Rule | Example |
|---------|------|---------|
| Magic numbers | Forbidden | Use `const DAYS_IN_WEEK = 7` |
| Deep nesting | Max 3 levels | Extract functions |
| Long lines | Max 100 chars | Wrap or extract |
| Console.log | Remove before commit | Use logger |
| Print debugging | Remove before commit | Use debugger |

---

## Examples

### Good Code Example

```typescript
// T001: User model and repository
// User entity definition with validation rules

interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

// T002: Email validation for user registration
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// T003: Create new user from DTO
export function createUser(dto: CreateUserDto): User {
  if (!isValidEmail(dto.email)) {
    throw new ValidationError('Invalid email format');
  }
  return {
    id: generateId(),
    email: dto.email.trim().toLowerCase(),
    name: dto.name.trim(),
    createdAt: new Date(),
  };
}

// Task References:
// T001 - Create user model (spec: FR-001)
// T002 - Email validation (spec: FR-002)
// T003 - User creation (spec: FR-003)
```

### Bad Code Example

```typescript
// Bad: No task ID, unclear naming, magic number
function doStuff(x: any) {
  const arr = [];
  for (let i = 0; i < x.length; i++) {
    if (x[i] > 10) {
      arr.push(x[i] * 2);
    }
  }
  return arr;
}

// Refactored to good:
const MULTIPLIER = 2;
const THRESHOLD = 10;

// T010: Filter and transform values above threshold
export function filterAndDouble(values: number[]): number[] {
  return values
    .filter(value => value > THRESHOLD)
    .map(value => value * MULTIPLIER);
}
```

---

## Enforcement

### Automated Checks

| Check | Tool | Config |
|-------|------|--------|
| Naming conventions | ESLint | custom rules |
| Task ID presence | Custom script | fail on missing |
| File length | ESLint | max 300 lines |
| Function length | ESLint | max 50 lines |
| No magic numbers | ESLint | no-constant-binary-expression |

### Manual Review

1. **Self-review** against checklist before commit
2. **Peer review** for all PRs
3. **Architecture review** for structural changes

---

## Summary

Clean code requires:

1. **Descriptive names** - What things are and do
2. **Focused functions** - One responsibility each
3. **Task linkage** - Every change traced to TXXX
4. **No clever hacks** - Clarity over cleverness
5. **No over-engineering** - Solve today's problem
6. **Good organization** - Logical file structure
7. **Thoughtful comments** - Why, not what