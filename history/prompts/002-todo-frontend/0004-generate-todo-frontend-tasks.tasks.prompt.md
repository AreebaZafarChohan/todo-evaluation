---
id: 0004
title: Generate Todo Frontend Tasks
stage: tasks
date: 2026-01-20
surface: agent
model: gemini-1.5-flash-latest
feature: 002-todo-frontend
branch: 002-todo-frontend
user: areeba_zafar
command: /sp.tasks
labels: ["tasks", "frontend", "todo-app", "phase2"]
links:
  spec: specs/phase2/002-todo-frontend/spec.md
  plan: specs/002-todo-frontend/plan.md
  tasks: specs/002-todo-frontend/tasks.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/002-todo-frontend/tasks.md
tests:
---

## Prompt

/sp.tasks You are Spec-Kit Plus generating Claude Code–executable frontend tasks from an approved frontend plan.

Rules:
- Each task must produce working frontend code
- Tasks must be small and focused
- Authentication tasks must come first
- No backend or database changes
- Must follow Next.js App Router conventions

Tasks must cover:
1. Next.js App Router project bootstrap
2. Tailwind CSS setup
3. Better Auth configuration
4. Signup page implementation
5. Signin page implementation
6. Auth-protected layout
7. API client with JWT support
8. Task list page
9. Create task form
10. Update task UI
11. Delete task action
12. Toggle completion action
13. Loading and error handling
14. Basic UI polish

Output:
- Numbered list of frontend tasks
- Each task executable by Claude Code
- Tasks aligned with Phase II frontend requirements


## Response snapshot

Successfully generated an actionable, dependency-ordered tasks.md file for the "Frontend for Todo Full-Stack Web Application (Phase II)" feature. The tasks are organized by user story, including setup, foundational, authentication, and todo management phases, with clear file paths, independent test criteria, parallel execution opportunities, and a suggested MVP scope.

## Outcome

- ✅ Impact: Detailed task breakdown generated, providing clear steps for implementation.
- 🧪 Tests: N/A
- 📁 Files: Created tasks.md.
- 🔁 Next prompts: /sp.implement or /sp.analyze
- 🧠 Reflection: Successfully generated tasks from design artifacts, adhering to strict formatting and dependency rules.

## Evaluation notes (flywheel)

- Failure modes observed: N/A
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A
