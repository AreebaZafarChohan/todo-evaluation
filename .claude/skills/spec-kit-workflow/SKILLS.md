---
name: spec-kit-workflow
description: "Enforce strict Spec-Driven Development (SDD) using Spec-Kit. Gatekeeper for the mandatory lifecycle: Specification → Planning → Task Definition → Implementation. Blocks invalid state transitions and premature implementation."
---

# Spec-Kit Workflow Skill

## Purpose

Enforce strict Spec-Driven Development (SDD) using Spec-Kit. This skill is the gatekeeper that ensures all development work follows the mandatory lifecycle: Specification → Planning → Task Definition → Implementation.

## Responsibilities

1. **Lifecycle Enforcement**: Ensure work progresses through the exact four-phase lifecycle
2. **Gatekeeping**: Block invalid state transitions and premature implementation
3. **State Awareness**: Track current lifecycle position and prevent out-of-order work
4. **Escalation**: Route complex issues to the Spec Guardian Agent when rules are violated

## Lifecycle Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    SPEC-KIT LIFECYCLE                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────────┐ │
│   │  STEP 1 │ →  │  STEP 2 │ →  │  STEP 3 │ →  │   STEP 4    │ │
│   │specify  │    │  plan   │    │  tasks  │    │implementation│ │
│   └─────────┘    └─────────┘    └─────────┘    └─────────────┘ │
│        ↓              ↓              ↓              ↓           │
│   ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────────┐ │
│   │ spec.md │    │ plan.md │    │tasks.md │    │ source code │ │
│   └─────────┘    └─────────┘    └─────────┘    └─────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Rules (Non-Negotiable)

### Core Lifecycle Rules

| Rule | Description | Enforcement |
|------|-------------|-------------|
| **LIFECYCLE-1** | No code generation before `/sp.tasks` is approved | Block all code creation commands |
| **LIFECYCLE-2** | No tasks without an approved `/sp.plan` | Block `/sp.tasks` if plan.md missing |
| **LIFECYCLE-3** | No plan without an approved `/sp.specify` | Block `/sp.plan` if spec.md missing |
| **LIFECYCLE-4** | Exact order: specify → plan → tasks → implement | Block any command out of sequence |

### Input Validation Rules

| Rule | Description | Enforcement |
|------|-------------|-------------|
| **INPUT-1** | Agents must stop and ask for clarification if inputs are incomplete | Return clarification request |
| **INPUT-2** | All required predecessor artifacts must exist | Verify artifact presence |
| **INPUT-3** | Commands must receive required arguments | Error on missing arguments |

### Output Requirements Rules

| Rule | Description | Enforcement |
|------|-------------|-------------|
| **OUTPUT-1** | Each phase must produce all mandatory outputs | Fail if output missing |
| **OUTPUT-2** | Output must pass quality gates before proceeding | Validate against template |
| **OUTPUT-3** | Checklists must be completed before phase exit | Verify checklist completion |

## Step-by-Step Specification

### STEP 1: `/sp.specify` — Feature Specification

**Purpose**: Transform natural language requirements into a formal feature specification.

#### Entry Criteria

- User provides a feature description (natural language)
- No prior specification exists for this feature (or explicit override)

#### Allowed Inputs

- Feature description (required): What users need and WHY
- Business context and goals
- User roles and personas
- Existing system constraints (if provided)

#### Prohibited Inputs

- Technology choices (language, framework, database)
- Implementation details or code structure
- API designs or data models
- Any "HOW" that should be determined in planning

#### Mandatory Outputs

```
specs/[###-feature-name]/
├── spec.md                    # Feature specification (mandatory)
├── checklists/
│   └── requirements.md        # Quality checklist (mandatory)
└── (optional) acceptance-criteria.md
```

#### Exit Criteria

- [ ] `spec.md` exists and is valid
- [ ] All mandatory sections completed:
  - User Scenarios & Testing
  - Functional Requirements
  - Success Criteria
- [ ] Requirements Quality Checklist passed
- [ ] No unresolved `[NEEDS CLARIFICATION]` markers (or max 3 with documented decisions)
- [ ] Specification focused on WHAT and WHY, not HOW

#### Valid Next Commands

- `/sp.clarify` — Resolve remaining questions
- `/sp.plan` — Proceed to planning (ONLY if exit criteria met)

---

### STEP 2: `/sp.plan` — Implementation Planning

**Purpose**: Transform specification into actionable technical design.

#### Entry Criteria

- `spec.md` exists and passes quality checklist
- Specification has no unresolved critical clarifications
- User explicitly requests planning phase

#### Allowed Inputs

- Reference to `spec.md` (read automatically)
- Technical preferences and constraints (if any)
- Architecture requirements and non-functional goals

#### Prohibited Inputs

- Modification of feature scope (must return to `/sp.specify`)
- Changes to user stories or success criteria
- Premature task breakdown (defer to `/sp.tasks`)

#### Mandatory Outputs

```
specs/[###-feature-name]/
├── plan.md                    # Implementation plan (mandatory)
├── research.md                # Technology research (mandatory)
├── data-model.md              # Data model (mandatory)
├── quickstart.md              # Quick start guide (mandatory)
└── contracts/                 # API contracts (mandatory if APIs involved)
```

#### Exit Criteria

- [ ] `plan.md` exists and is valid
- [ ] Technology stack selected and justified
- [ ] Project structure defined
- [ ] All `[NEEDS CLARIFICATION]` resolved or documented
- [ ] Constitution check passed (or violations documented)
- [ ] Plan references spec.md and aligns with all requirements

#### Valid Next Commands

- `/sp.tasks` — Generate task list (ONLY if exit criteria met)
- `/sp.specify` — Return to specification (if scope changes needed)

---

### STEP 3: `/sp.tasks` — Task Definition

**Purpose**: Break implementation plan into testable, independent tasks.

#### Entry Criteria

- `plan.md` exists with complete design documents
- `spec.md` exists with approved user stories
- All design artifacts are finalized

#### Allowed Inputs

- Reference to `plan.md`, `spec.md`, and design documents (read automatically)
- Task ordering preferences
- Parallelization suggestions

#### Prohibited Inputs

- Changing plan or specification
- Writing actual code or tests
- Modifying user stories or acceptance criteria

#### Mandatory Outputs

```
specs/[###-feature-name]/
└── tasks.md                   # Task list (mandatory)
```

#### Exit Criteria

- [ ] `tasks.md` exists and is valid
- [ ] All tasks traceable to user stories
- [ ] Tasks organized by phase (Setup → Foundational → User Stories → Polish)
- [ ] Each task is:
  - Independent (where possible)
  - Testable (clear completion criteria)
  - Sized appropriately (can be completed in reasonable time)
- [ ] Parallel tasks marked with `[P]`
- [ ] Dependencies documented
- [ ] Tasks approved by user

#### Valid Next Commands

- `/sp.implement` — Begin implementation (ONLY if tasks approved)
- `/sp.plan` — Return to planning (if design gaps found)
- `/sp.specify` — Return to specification (if scope changes)

---

### STEP 4: `/sp.implement` — Implementation

**Purpose**: Execute approved tasks and generate working code.

#### Entry Criteria

- `tasks.md` exists with approved tasks
- User explicitly authorizes implementation
- All prerequisite phases complete

#### Allowed Inputs

- Reference to `tasks.md` (read automatically)
- Task selection (all or subset for incremental delivery)
- Implementation preferences within task scope

#### Prohibited Inputs

- Implementation before task approval
- Creating tasks during implementation
- Modifying specification or plan without going back
- Code that doesn't trace to an approved task

#### Mandatory Outputs

```
<repository-root>/
├── src/                       # Implementation files
├── tests/                     # Test files
└── (any project-specific structure per plan.md)
```

#### Exit Criteria

- [ ] Implementation matches approved tasks
- [ ] All tests pass
- [ ] Code passes linting/formatting
- [ ] Documentation updated (quickstart, README, etc.)
- [ ] Changes committed (per constitution)

#### Valid Next Commands

- `/sp.tasks` — Add new tasks as discovered
- `/sp.specify` — New feature specification

---

## Failure Handling

### Rule Violation Responses

| Violation Type | Response | Escalation |
|----------------|----------|------------|
| Attempt implement before tasks | **BLOCK** with error: "Implementation blocked: `/sp.tasks` must be approved first" | None |
| Attempt tasks before plan | **BLOCK** with error: "Tasks blocked: `/sp.plan` must be completed first" | None |
| Attempt plan before specification | **BLOCK** with error: "Planning blocked: `/sp.specify` must be completed first" | None |
| Missing required artifact | **BLOCK** with error: "Missing required artifact: [path]" | None |
| Incomplete inputs | **STOP AND ASK**: "Input incomplete: [specific missing items]" | None |
| Invalid state transition | **BLOCK** with error: "Invalid state transition from [current] to [requested]" | None |

### Escalation to Spec Guardian Agent

Escalate to the Spec Guardian Agent when:

1. **Disputed Clarifications**: User and agent cannot agree on clarification interpretation
2. **Scope Creep**: Request to add features during implementation without proper lifecycle restart
3. **Repeated Violations**: User attempts to bypass lifecycle multiple times
4. **Architecture Conflicts**: Technical decisions conflict with constitution principles
5. **Ambiguous Requirements**: Specification is fundamentally unclear despite best efforts

#### Escalation Format

```markdown
## Spec Guardian Escalation

**Escalation Type**: [rule-violation | scope-change | architecture-conflict | ambiguous-requirements]

**Current State**:
- Phase: [specify|plan|tasks|implement]
- Branch: [branch-name]
- Existing Artifacts: [list]

**Issue**:
[Clear description of the problem]

**User Action**:
[What the user attempted that triggered escalation]

**Recommended Resolution**:
[Suggested path forward]

**User Consent Required**: Yes/No
```

### Recovery Procedures

| Scenario | Recovery Action |
|----------|-----------------|
| User wants to change scope during implementation | Return to `/sp.specify` with new branch |
| Planning reveals specification gaps | Return to `/sp.specify` for clarification |
| Task breakdown reveals design gaps | Return to `/sp.plan` for resolution |
| Implementation discovers technical blocker | Return to `/sp.plan` for architecture review |

---

## Examples

### Correct Workflow

```
1. User: "I need a user authentication system"
2. Agent: Runs /sp.specify → creates spec.md
3. User: Reviews spec, approves
4. Agent: Runs /sp.plan → creates plan.md, research.md, data-model.md
5. User: Reviews plan, approves
6. Agent: Runs /sp.tasks → creates tasks.md
7. User: Reviews and approves tasks
8. Agent: Runs /sp.implement → creates source code
```

### Blocked Workflow (Attempted Shortcut)

```
1. User: "Just start coding the auth system"
2. Agent: BLOCK - "Planning blocked: /sp.specify must be completed first"
   → Must run /sp.specify before any implementation
```

### Blocked Workflow (Attempted Reordering)

```
1. User: Runs /sp.tasks without plan
2. Agent: BLOCK - "Tasks blocked: /sp.plan must be completed first"
   → Must complete /sp.plan before /sp.tasks
```

### Incomplete Input Handling

```
1. User: "/sp.specify"
2. Agent: STOP - "No feature description provided. Please describe what you need."
```

---

## Anti-Patterns

### Anti-Pattern 1: "Just Start Coding"
**Description**: User wants to skip specification and planning
**Violation**: LIFECYCLE-1, LIFECYCLE-3
**Response**: Block and explain: "Spec-Kit requires specification before implementation. Run `/sp.specify` with your feature description."

### Anti-Pattern 2: "We'll Figure It Out Later"
**Description**: Agent proceeds with unclear requirements
**Violation**: INPUT-1
**Response**: Stop and ask: "Requirements are incomplete. I need clarification on [specific items] before proceeding."

### Anti-Pattern 3: "Tasks Are Just Suggestions"
**Description**: Agent writes code not traced to tasks
**Violation**: OUTPUT-3
**Response**: Block implementation: "All code must trace to an approved task. Create a new task or select from existing."

### Anti-Pattern 4: "Quick Plan, Then Adjust"
**Description**: Agent rushes planning to reach implementation
**Violation**: OUTPUT-1
**Response**: Fail: "Plan incomplete. Missing required outputs: [list]. Complete planning before proceeding."

### Anti-Pattern 5: "We Can Fix It In Review"
**Description**: Agent produces low-quality artifacts expecting later fixes
**Violation**: OUTPUT-2
**Response**: Fail quality gate: "Output does not meet quality criteria: [list]. Fix before proceeding."

### Anti-Pattern 6: "I'll Just Add One Small Feature"
**Description**: User requests scope changes during implementation
**Violation**: LIFECYCLE-4
**Response**: Escalate: "Scope changes require returning to /sp.specify. Create new branch or modify current specification?"

---

## Integration Points

### Commands This Skill Works With

| Command | Interaction |
|---------|-------------|
| `/sp.specify` | Creates spec.md, checklist |
| `/sp.clarify` | Used when spec needs clarification |
| `/sp.plan` | Requires spec.md, creates design docs |
| `/sp.tasks` | Requires plan.md, creates tasks.md |
| `/sp.implement` | Requires approved tasks.md |
| `/sp.phr` | Records each phase transition |

### File Dependencies

```
specs/[###-feature-name]/
├── (prereq for plan) spec.md ← must exist
├── (prereq for tasks) plan.md ← must exist
├── (prereq for implement) tasks.md ← must exist
└── (optional) design docs: research.md, data-model.md, quickstart.md, contracts/
```

### Branch Naming Convention

- Format: `[###]-[feature-slug]` (e.g., `001-user-auth`, `002-payment-flow`)
- Created during `/sp.specify`
- Maintained through all subsequent phases

---

## Quality Gates

### Specification Gate (Step 1 → 2)

- [ ] No implementation details in spec
- [ ] Requirements are testable
- [ ] Success criteria are measurable
- [ ] User scenarios cover primary flows
- [ ] Quality checklist passed

### Planning Gate (Step 2 → 3)

- [ ] Technology stack selected
- [ ] Project structure defined
- [ ] Constitution check passed
- [ ] All design documents complete
- [ ] Plan aligns with spec

### Tasks Gate (Step 3 → 4)

- [ ] All tasks traceable to stories
- [ ] Tasks are independently testable
- [ ] Dependencies documented
- [ ] User approved tasks
- [ ] Parallelization maximized

### Implementation Gate (Step 4 complete)

- [ ] All tasks completed
- [ ] Tests pass
- [ ] Code quality met
- [ ] Documentation updated
- [ ] Changes committed

---

## Implementation Notes

This skill operates as a **state machine**. Each phase transition requires:

1. Verification of entry criteria
2. Validation of required inputs
3. Execution of phase logic
4. Verification of exit criteria
5. Creation of Prompt History Record (PHR)

The skill should never allow:
- Skipping phases
- Reversing phase order (except for intentional go-back)
- Proceeding with incomplete artifacts
- Bypassing quality gates

**Remember**: The purpose of this skill is to ensure quality through discipline. The lifecycle exists to prevent costly rework and ensure features meet user needs.
