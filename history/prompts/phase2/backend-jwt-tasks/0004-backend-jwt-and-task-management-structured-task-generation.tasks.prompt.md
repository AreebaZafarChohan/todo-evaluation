---
id: "0004"
title: Backend JWT and Task Management Structured Task Generation
stage: tasks
date_iso: 2026-01-18
surface: "agent"
model: "unknown"
branch: "001-backend-jwt-tasks"
feature: "backend-jwt-tasks"
label: "backend, jwt, tasks"
---

# Prompt

/sp.tasks You are Spec-Kit Plus generating executable tasks from an approved Phase II backend plan.

Break the backend plan into atomic tasks suitable for Claude Code execution.

Rules:
- Each task must produce working, testable backend code
- Authentication tasks must come first
- Each task must reference backend artifacts
- JWT verification must be enforced everywhere
- Tasks must NOT include frontend work

Tasks must cover:
- FastAPI app bootstrap
- Config & environment loading
- JWT verification middleware/dependency
- Authenticated user extraction
- SQLModel + Neon DB connection
- Task model with user ownership
- CRUD endpoints for tasks
- Ownership & authorization checks
- Error handling
- Test creation and validation

Output:
- Numbered list of backend tasks
- Each task small, focused, and executable
- Suitable for direct use with Claude Code

# Response

The plan has been broken down into actionable, structured tasks.

*   **Tasks File Path**: `/mnt/d/Gemini_Cli/hackathon/hackathon_2/specs/backend-jwt-tasks/tasks.md`
*   **Total Task Count**: 19
*   **Task Count per User Story**:
    *   User Story 1: 12
*   **Parallel Opportunities**: 3 tasks are marked as parallelizable.
*   **Suggested MVP Scope**: User Story 1, which covers the core secure task management functionality.

The next step is to start implementing these tasks.