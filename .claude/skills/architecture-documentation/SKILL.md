---
name: architecture-documentation
description: "Convert specifications into clear architectural designs. Define components, data flow, interfaces, and contracts. Produces speckit.plan compatible output with textual diagrams."
---

# Architecture Documentation Skill

## Purpose

Convert specifications into clear architectural designs. This skill bridges the gap between WHAT (specification) and HOW (implementation) by defining system structure, component responsibilities, data flows, and interfaces without prescribing code or business logic.

## Core Principles

### What Architecture Documentation Is

- **Structural description** of how components relate
- **Interface definitions** that enable independent implementation
- **Data flow descriptions** that show how information moves
- **Decision rationale** linked back to specifications
- **Technology-agnostic** patterns and patterns only

### What Architecture Documentation Is NOT

- Code or pseudocode
- Business logic implementation
- Framework or language selection
- Database schema designs (deferred to data modeling)
- Deployment configurations (deferred to infrastructure)

---

## Architecture Document Structure

### 1. Architecture Overview

**Purpose**: High-level view of the system structure.

**Template**:

```markdown
## Architecture Overview

### System Context

[1-2 paragraph description of what this system does]

### Architectural Style

[Style: layered | microservices | event-driven | modular-monolith | client-server]

### High-Level Components

| Component | Responsibility | Key Interface |
|-----------|---------------|---------------|
| [Name] | [What it does] | [Primary input/output] |
| [Name] | [What it does] | [Primary input/output] |

### External Dependencies

- [Dependency 1]: [Purpose]
- [Dependency 2]: [Purpose]
```

**Example**:

```markdown
## Architecture Overview

### System Context

The Todo Management System enables users to create, update, and track tasks across multiple projects with sharing capabilities. It provides both web and mobile interfaces with real-time synchronization.

### Architectural Style

Modular Monolith with clear domain boundaries. All functionality lives in a single deployable unit with well-defined module interfaces, enabling future microservice extraction if needed.

### High-Level Components

| Component | Responsibility | Key Interface |
|-----------|---------------|---------------|
| API Gateway | Request routing, auth | HTTP endpoints |
| Todo Module | Todo CRUD operations | TodoRepository |
| Project Module | Project management | ProjectRepository |
| User Module | User management | UserRepository |
| Sync Engine | Real-time sync | WebSocket / Push |

### External Dependencies

- PostgreSQL: Persistent storage
- Redis: Session cache, rate limiting
- SendGrid: Email notifications
```

### 2. Component Details

**Purpose**: Define each component's responsibilities, interfaces, and boundaries.

**Template**:

```markdown
### [Component Name]

**Responsibility**: [1 sentence on what this component OWNS]

**Does NOT Own**: [What this component delegates]
- [Item 1]
- [Item 2]

**Interfaces**

| Interface | Input | Output | Purpose |
|-----------|-------|--------|---------|
| [Name] | [Data] | [Data] | [Why exists] |

**Data Dependencies**
- [What data it reads]
- [What data it writes]

**Quality Attributes**
- [Relevant NFRs this component must satisfy]
```

**Example**:

```markdown
### Todo Module

**Responsibility**: Owns all todo-related business rules and data operations.

**Does NOT Own**:
- User authentication (User Module)
- Project creation rules (Project Module)
- Email delivery (Notification Service)

**Interfaces**

| Interface | Input | Output | Purpose |
|-----------|-------|--------|---------|
| CreateTodo | TodoCreateRequest | Todo | Creates new todo with validation |
| UpdateTodo | TodoUpdateRequest | Todo | Updates existing todo |
| ListTodos | ListFilter | TodoList | Returns filtered todo collection |
| DeleteTodo | TodoId | Confirmation | Removes todo permanently |

**Data Dependencies**
- Reads: User permissions, Project settings
- Writes: Todo entities, Audit logs

**Quality Attributes**
- Must handle 1000 todos per user
- List response < 200ms for 95th percentile
```

### 3. Data Flow

**Purpose**: Describe how data moves through the system for key operations.

**Template**:

```markdown
## Data Flow

### [Operation Name]

**Trigger**: [What initiates this flow]

**Flow Sequence**:

```
[Component A] → [Data Format] → [Component B]
    → [Data Format] → [Component C]
    → [Data Format] → [Component D]
```

**Detailed Steps**:

1. [Component] receives [input]
2. [Component] [processes/validates/transforms]
3. [Component] produces [output]
4. [Component] [handles/responds]

**Error Handling**:

- [Condition]: [Fallback behavior]
- [Condition]: [Fallback behavior]

**Completion Criteria**:

- [What must be true when done]
```

**Example**:

```markdown
## Data Flow

### Create Todo Flow

**Trigger**: User submits todo creation form

**Flow Sequence**:

```
Web Client → API Gateway → Todo Module → Database
    → API Gateway → Web Client (response)
    → Sync Engine → WebSocket → Mobile Client
```

**Detailed Steps**:

1. **Web Client** sends POST /api/todos with TodoCreateRequest
2. **API Gateway** validates JWT token, adds user context
3. **Todo Module** validates:
   - User has project access
   - Todo title is present
   - Due date is valid if provided
4. **Todo Module** creates Todo entity with generated ID
5. **Database** persists Todo entity
6. **Todo Module** returns Todo response
7. **API Gateway** sends response to client
8. **Sync Engine** broadcasts create event via WebSocket
9. **Mobile Client** receives event and syncs

**Error Handling**:

- Invalid project: Return 404, "Project not found"
- No permissions: Return 403, "Access denied"
- Validation failure: Return 400 with field errors
- Database error: Return 500, log for investigation

**Completion Criteria**:
- Todo entity exists in database
- Create event broadcast to all connected clients
- Client receives success response with new Todo
```

### 4. Interface Contracts

**Purpose**: Define what each interface accepts and returns without prescribing HOW.

**Template**:

```markdown
## Interface Contracts

### [Interface Name]: [Purpose]

**Input Contract**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| [name] | [type] | [Y/N] | [rule] |

**Output Contract**

| Field | Type | Description |
|-------|------|-------------|
| [name] | [type] | [meaning] |

**Error Conditions**

| Condition | Response | Meaning |
|-----------|----------|---------|
| [scenario] | [status] | [message] |

**Idempotency**: [YES/NO - can calling twice cause side effects?]

**Timeout**: [Recommended timeout for client]

**Related Requirements**:
- [FR-XXX] - traced requirement
- [FR-XXX] - traced requirement
```

**Example**:

```markdown
## Interface Contracts

### CreateTodo: Creates a new todo item

**Input Contract**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| title | string(1-200) | Y | Non-empty, trimmed |
| description | string(0-2000) | N | Optional, max 2000 chars |
| projectId | UUID | Y | Valid project UUID |
| dueDate | ISO8601 | N | Future date only |
| priority | enum | N | LOW, MEDIUM, HIGH (default: MEDIUM) |
| tags | array[string] | N | Max 10 tags, each max 50 chars |

**Output Contract**

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique identifier for created todo |
| title | string | Title as saved |
| description | string | Description as saved |
| projectId | UUID | Associated project |
| status | enum | PENDING, IN_PROGRESS, COMPLETED |
| priority | enum | As provided or default |
| tags | array[string] | As provided |
| createdAt | ISO8601 | Creation timestamp |
| createdBy | UUID | User who created |

**Error Conditions**

| Condition | Response | Meaning |
|-----------|----------|---------|
| projectId not found | 404 | Invalid project reference |
| No project access | 403 | User lacks permissions |
| title empty | 400 | Validation error, details in body |
| Due date in past | 400 | Validation error |

**Idempotency**: NO - calling twice creates two todos

**Timeout**: 5000ms recommended

**Related Requirements**:
- FR-001: Users MUST be able to create todos
- FR-002: Todos MUST have titles
- FR-003: Todos MUST belong to a project
- NFR-001: Create response within 2 seconds
```

### 5. Technology Patterns

**Purpose**: Define technology-agnostic patterns that implementations should follow.

**Template**:

```markdown
## Technology Patterns

### [Pattern Name]

**When to Use**: [Condition]

**Pattern Description**: [What it does]

**Structure**:

```
[Component A] ←→ [Pattern] ←→ [Component B]
```

**Rules**:
- [Rule 1]
- [Rule 2]

**Example Application**: [How it applies to this system]
```

**Example**:

```markdown
## Technology Patterns

### Repository Pattern

**When to Use**: All data access operations

**Pattern Description**: Abstracts data storage behind a consistent interface. Components depend on interfaces, not concrete implementations.

**Structure**:

```
Service → Repository Interface → [Concrete: SQL, NoSQL, Mock]
```

**Rules**:
- Services MUST depend on repository interfaces
- Repository implementations handle storage specifics
- Repositories MUST throw domain exceptions
- Query methods return domain entities or value objects

**Example Application**:
- TodoService depends on TodoRepository interface
- PostgreSQLTodoRepository implements TodoRepository
- Tests use InMemoryTodoRepository

---

### CQRS Pattern (Simplified)

**When to Use**: Operations with different read/write characteristics

**Pattern Description**: Separates read operations (queries) from write operations (commands).

**Structure**:

```
Commands → Command Handler → Write Database
Queries → Query Handler → Read Database (optional replica)
```

**Rules**:
- Commands change state, return nothing (or ID)
- Queries read state, return data
- Same data model for simple cases
- Separate read model for complex queries

**Example Application**:
- CreateTodoCommand, UpdateTodoCommand, DeleteTodoCommand
- ListTodosQuery, GetTodoQuery
- TodoCommandHandler processes commands
- TodoQueryHandler processes queries
```

---

## Textual Diagrams

### Component Diagram

```markdown
## Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Todo Management System                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   API Layer  │───→│ Todo Module  │───→│   Database   │  │
│  │  (Endpoints) │    │  (Services)  │    │   (Storage)  │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│         │                    │                    ▲         │
│         │                    ▼                    │         │
│         │           ┌──────────────┐              │         │
│         │           │ Sync Engine  │              │         │
│         │           │  (Real-time) │──────────────┘         │
│         │           └──────────────┘                        │
│         │                    │                              │
│         ▼                    ▼                              │
│  ┌──────────────┐    ┌──────────────┐                       │
│  │  Auth Module │    │ Notification │                       │
│  │  (JWT Auth)  │    │   Service    │                       │
│  └──────────────┘    └──────────────┘                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│                      External Systems                        │
├─────────────────────────────────────────────────────────────┤
│  ┌────────────┐    ┌────────────┐    ┌─────────────────┐   │
│  │  PostgreSQL│    │   Redis    │    │    SendGrid     │   │
│  │  (Primary) │    │   (Cache)  │    │   (Email)       │   │
│  └────────────┘    └────────────┘    └─────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Sequence Diagram

```markdown
## Sequence Diagram: Create Todo

```
User → Web Client: Enter todo details
Web Client → API Gateway: POST /todos (with JWT)
API Gateway → Auth Module: Validate JWT
Auth Module → API Gateway: User context
API Gateway → Todo Module: CreateTodo(user, request)

Todo Module → Project Module: Check project access
Project Module → Todo Module: Access confirmed

Todo Module → Todo Validator: Validate todo data
Todo Validator → Todo Module: Validation passed

Todo Module → Todo Factory: Create Todo entity
Todo Factory → Todo Module: Todo with ID

Todo Module → Todo Repository: Save Todo
Todo Repository → Database: INSERT todo
Database → Todo Repository: Todo saved
Todo Repository → Todo Module: Saved Todo

Todo Module → Sync Engine: Broadcast create event
Sync Engine → Web Client (Socket): CREATE event
Sync Engine → Mobile Client (Push): CREATE event

Todo Module → API Gateway: Created Todo
API Gateway → Web Client: 201 Created (Todo JSON)

Web Client → User: Display created todo
```

### Data Flow Diagram

```markdown
## Data Flow: Todo Data Movement

```
┌─────────────┐
│   User A    │
│  (Web)      │
└──────┬──────┘
       │ HTTP Request
       ▼
┌─────────────┐
│ API Gateway │
└──────┬──────┘
       │
       ▼
┌─────────────┐     ┌─────────────┐
│ Todo Module │────▶│   Redis     │
│ (Validate)  │     │ (Rate Limit)│
└──────┬──────┘     └─────────────┘
       │
       ▼
┌─────────────┐     ┌─────────────┐
│    User     │────▶│ Project     │
│  Context    │     │ Module      │
└──────┬──────┘     └─────────────┘
       │
       ▼
┌─────────────┐     ┌─────────────┐
│   Todo      │────▶│ PostgreSQL  │
│  Repository │     │ (Persist)   │
└──────┬──────┘     └─────────────┘
       │
       ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Sync      │────▶│  WebSocket  │────▶│ User B(Mob) │
│   Engine    │     │  (Push)     │     │  (Realtime) │
└─────────────┘     └─────────────┘     └─────────────┘
```

---

## Architecture Decisions

### Linking to Specifications

**Purpose**: Show how each architectural choice traces back to requirements.

**Template**:

```markdown
## Architecture Decisions

| Decision | Rationale | Traced From |
|----------|-----------|-------------|
| [Decision] | [Why this choice] | [FR-XXX / NFR-XXX] |
```

**Example**:

```markdown
## Architecture Decisions

| Decision | Rationale | Traced From |
|----------|-----------|-------------|
| Modular monolith | Simplicity, bounded contexts, extraction capability | SR-001: Clear module boundaries |
| JWT authentication | Stateless, scalable, industry standard | SR-005: Secure authentication |
| Event-driven sync | Real-time updates across devices | FR-010: Real-time sync |
| Repository pattern | Testability, abstraction | SR-003: Testable components |
```

---

## Quality Attributes Mapping

**Purpose**: Show how architecture satisfies non-functional requirements.

```markdown
## Quality Attributes

### Performance

| NFR | Architecture Response |
|-----|----------------------|
| 200ms response | API Gateway + caching layer |
| 1000 concurrent | Stateless design, horizontal scaling |

### Availability

| NFR | Architecture Response |
|-----|----------------------|
| 99.9% uptime | Stateless services, health checks |
| <5 min recovery | Container orchestration, self-healing |

### Security

| NFR | Architecture Response |
|-----|----------------------|
| Encrypted data | TLS 1.3, encryption at rest |
| Access control | JWT claims, module-level authorization |
```

---

## Rules and Constraints

### Always Do

- ✅ Link architecture decisions back to specifications
- ✅ Define interfaces before implementation details
- ✅ Use technology-agnostic patterns
- ✅ Document data flow for key operations
- ✅ Define error conditions for each interface
- ✅ Specify quality attributes at component level

### Never Do

- ❌ Specify programming language or framework
- ❌ Write code or pseudocode
- ❌ Define database schema
- ❌ Make assumptions not in specifications
- ❌ Include business logic implementation
- ❌ Define deployment infrastructure

### Boundary Checklist

| Category | Include | Exclude |
|----------|---------|---------|
| Components | Responsibilities, interfaces | Implementation details |
| Data Flow | Sequence, format, triggers | Processing logic |
| Interfaces | Input/output contracts | Method bodies |
| Patterns | Structure, rules | Concrete technology |
| Quality | Attribute requirements | Implementation tactics |

---

## Architecture Anti-Patterns

### Anti-Pattern 1: Golden Hammer

**Description**: Applying one architectural pattern to all problems.

**Bad**: "We'll use microservices because we always use microservices."

**Good**: "Based on the specification's independence requirements, a modular monolith enables team autonomy while keeping operational complexity manageable."

### Anti-Pattern 2: Architecture Astronaut

**Description**: Over-engineering for hypothetical future needs.

**Bad**: "We should design for 10 million users now because we might grow."

**Good**: "Design for current scale (10,000 users) with clear extension points for growth. Document scaling path."

### Anti-Pattern 3: Design by Recipe

**Description**: Copying patterns without understanding context.

**Bad**: "The spec uses a database, so we need a repository, factory, and mapper pattern."

**Good**: "The spec requires testability. Repository pattern provides the necessary abstraction."

### Anti-Pattern 4: Waterfall Architecture

**Description**: Designing everything upfront without iteration.

**Bad**: "Complete the full architecture document before any specification review."

**Good**: "Architecture evolves with specification. Review and refine as understanding deepens."

### Anti-Pattern 5: Bikeshedding

**Description**: Debating trivial decisions while ignoring critical ones.

**Bad**: "Should we use camelCase or snake_case?" while ignoring authentication strategy.

**Good**: "Authentication approach is critical. File naming convention can be decided by team standards."

### Anti-Pattern 6: Sunk Cost Architecture

**Description**: Continuing with bad decisions because of prior investment.

**Bad**: "We've always done it this way, so we'll continue."

**Good**: "Our current approach doesn't meet the specification's performance requirements. Propose alternative."

### Anti-Pattern 7: One-Size-Fits-All

**Description**: Applying same patterns regardless of context.

**Bad**: "Every component uses the same three-layer architecture."

**Good**: "Read-heavy components use cache-through pattern. Write-heavy components use queue-based processing."

---

## speckit.plan Compatibility

### Output Structure

When producing architecture documentation for speckit.plan:

```markdown
# Implementation Plan: [Feature Name]

**Branch**: [###-feature-name]
**Date**: [DATE]
**Specification**: [Link to spec.md]

## Summary

[Extracted from spec - core requirement]

## Architecture Overview

[Section from this skill]

## Component Details

[Section from this skill]

## Data Flow

[Section from this skill - key operations only]

## Interface Contracts

[Section from this skill - key interfaces only]

## Technology Patterns

[Section from this skill - patterns to follow]

## Architecture Decisions

[Section from this skill]

## Quality Attributes

[Section from this skill]

## Project Structure

[Derived from component breakdown]
```

### Required Sections for speckit.plan

1. Architecture Overview (required)
2. Component Details (required - at least one component)
3. Data Flow (required - key operation)
4. Interface Contracts (required - at least one interface)
5. Architecture Decisions (required - at least one)
6. Quality Attributes (optional - if specified)
7. Project Structure (derived, required)

---

## Example: Complete Architecture Document

```markdown
# Architecture Document: Todo Management System

## Architecture Overview

### System Context

Enables users to create, update, and track tasks across projects with real-time synchronization across devices.

### Architectural Style

Modular Monolith with domain-driven boundaries.

### High-Level Components

| Component | Responsibility | Key Interface |
|-----------|---------------|---------------|
| API Layer | Request handling | HTTP endpoints |
| Todo Module | Todo CRUD + rules | TodoRepository |
| Sync Engine | Real-time sync | WebSocket/Push |

### External Dependencies

- PostgreSQL: Persistent storage
- Redis: Cache, sessions
- SendGrid: Email notifications

---

## Component Details

### Todo Module

**Responsibility**: Owns todo business rules and data operations.

**Does NOT Own**:
- User authentication (Auth Module)
- Project rules (Project Module)
- Email delivery (Notification Service)

**Interfaces**:

| Interface | Input | Output |
|-----------|-------|--------|
| CreateTodo | TodoCreateRequest | Todo |
| UpdateTodo | TodoUpdateRequest | Todo |

---

## Data Flow

### Create Todo

```
User → Web → API → Todo → DB → Sync → Mobile
```

Steps:
1. User submits form
2. API validates auth
3. Todo Module validates
4. Database persists
5. Sync broadcasts event

---

## Interface Contracts

### CreateTodo

**Input**: title (string), projectId (UUID), dueDate (ISO8601, optional)

**Output**: Todo with id, createdAt, status

**Errors**: 400 (validation), 403 (access), 404 (project)

---

## Architecture Decisions

| Decision | Rationale | Traced From |
|----------|-----------|-------------|
| Modular monolith | Team autonomy, extraction path | SR-001 |
| JWT auth | Stateless, scalable | SR-005 |
```

---

## Summary Checklist

Before finalizing architecture documentation:

- [ ] Architecture overview provides clear system context
- [ ] Components have clear responsibilities and boundaries
- [ ] Interfaces define input/output contracts without implementation
- [ ] Data flows show key operations end-to-end
- [ ] All decisions link back to specifications
- [ ] No code, frameworks, or languages specified
- [ ] No business logic included
- [ ] No assumptions beyond specifications
- [ ] Textual diagrams are clear and accurate
- [ ] Technology patterns are technology-agnostic
- [ ] Document is ready for speckit.plan output