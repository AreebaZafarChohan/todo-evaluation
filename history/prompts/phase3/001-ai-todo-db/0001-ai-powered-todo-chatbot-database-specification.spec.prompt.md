---
id: 0001
title: AI-Powered Todo Chatbot Database Specification
stage: spec
date: 2026-01-29
surface: agent
model: gemini-1.5-pro
feature: 001-ai-todo-db
branch: 001-ai-todo-db
user: User
command: /sp.specify "You are Spec-Kit Plus acting as a senior database architect. Create a database specification for Phase III: AI-Powered Todo Chatbot. Scope: - DATABASE ONLY - Phase III ONLY - Neon Serverless PostgreSQL - SQLModel ORM (Python) - Stateless backend architecture - Used by FastAPI + MCP + AI Agent - Authentication via Better Auth (user_id is trusted after JWT verification) Goals: - Persist chatbot conversations - Persist messages for stateless chat - Support AI-driven task management - Support reminders and notifications - Support streaming AI responses (final output persistence) Database Requirements: ### Core Tables 1. tasks - id (integer, primary key) - user_id (string, indexed) - title (string, required) - description (text, optional) - completed (boolean, default false) - priority (string, optional: low | medium | high) - due_date (timestamp, optional) - created_at (timestamp) - updated_at (timestamp) 2. conversations - id (integer, primary key) - user_id (string, indexed) - created_at (timestamp) - updated_at (timestamp) 3. messages - id (integer, primary key) - conversation_id (integer, foreign key) - user_id (string, indexed) - role (string: user | assistant | system | tool) - content (text) - created_at (timestamp) 4. reminders - id (integer, primary key) - task_id (integer, foreign key) - user_id (string, indexed) - next_trigger_at (timestamp) - repeat_interval_minutes (integer) - active (boolean) ### Relationships - One user → many tasks - One user → many conversations - One conversation → many messages - One task → zero or more reminders ### Indexing Requirements - tasks.user_id - tasks.completed - tasks.due_date - conversations.user_id - messages.conversation_id - reminders.next_trigger_at ### Data Integrity Rules - Tasks must always belong to a user - Conversations are isolated per user - Messages cannot exist without conversation - Reminders must reference a valid task ### AI & Streaming Considerations - Streaming tokens are NOT stored individually - Only final assistant message is persisted - Tool calls may be stored as structured metadata (optional JSON field) ### Out of Scope - Database migrations tooling - Seeding scripts - Analytics tables - Frontend concerns Constraints: - Do NOT write SQL or ORM code - Do NOT include backend logic - Focus on structure, relations, and constraints only Output Format: - Clear table definitions - Field descriptions - Relationships - Indexing strategy - Ready for Phase III planning"
labels: ["database", "specification", "chatbot", "ai", "todo"]
links:
  spec: specs/001-ai-todo-db/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/001-ai-todo-db/spec.md
  - specs/001-ai-todo-db/checklists/requirements.md
tests:
  - N/A
---

## Prompt

You are Spec-Kit Plus acting as a senior database architect. Create a database specification for Phase III: AI-Powered Todo Chatbot. Scope: - DATABASE ONLY - Phase III ONLY - Neon Serverless PostgreSQL - SQLModel ORM (Python) - Stateless backend architecture - Used by FastAPI + MCP + AI Agent - Authentication via Better Auth (user_id is trusted after JWT verification) Goals: - Persist chatbot conversations - Persist messages for stateless chat - Support AI-driven task management - Support reminders and notifications - Support streaming AI responses (final output persistence) Database Requirements: ### Core Tables 1. tasks - id (integer, primary key) - user_id (string, indexed) - title (string, required) - description (text, optional) - completed (boolean, default false) - priority (string, optional: low | medium | high) - due_date (timestamp, optional) - created_at (timestamp) - updated_at (timestamp) 2. conversations - id (integer, primary key) - user_id (string, indexed) - created_at (timestamp) - updated_at (timestamp) 3. messages - id (integer, primary key) - conversation_id (integer, foreign key) - user_id (string, indexed) - role (string: user | assistant | system | tool) - content (text) - created_at (timestamp) 4. reminders - id (integer, primary key) - task_id (integer, foreign key) - user_id (string, indexed) - next_trigger_at (timestamp) - repeat_interval_minutes (integer) - active (boolean) ### Relationships - One user → many tasks - One user → many conversations - One conversation → many messages - One task → zero or more reminders ### Indexing Requirements - tasks.user_id - tasks.completed - tasks.due_date - conversations.user_id - messages.conversation_id - reminders.next_trigger_at ### Data Integrity Rules - Tasks must always belong to a user - Conversations are isolated per user - Messages cannot exist without conversation - Reminders must reference a valid task ### AI & Streaming Considerations - Streaming tokens are NOT stored individually - Only final assistant message is persisted - Tool calls may be stored as structured metadata (optional JSON field) ### Out of Scope - Database migrations tooling - Seeding scripts - Analytics tables - Frontend concerns Constraints: - Do NOT write SQL or ORM code - Do NOT include backend logic - Focus on structure, relations, and constraints only Output Format: - Clear table definitions - Field descriptions - Relationships - Indexing strategy - Ready for Phase III planning

## Response snapshot

Created a feature specification document for the AI-Powered Todo Chatbot Database, including user scenarios, functional requirements, key entities, and measurable success criteria. The specification was validated against a quality checklist and is ready for planning.

## Outcome

- ✅ Impact: The specification for the AI-Powered Todo Chatbot Database was successfully created and validated according to the provided requirements.
- 🧪 Tests: N/A
- 📁 Files: Created `specs/001-ai-todo-db/spec.md` and `specs/001-ai-todo-db/checklists/requirements.md`.
- 🔁 Next prompts: The specification is ready for the next phase, likely `/sp.plan`.
- 🧠 Reflection: The `create-phr.sh` script did not automatically fill in the placeholders, requiring manual intervention.

## Evaluation notes (flywheel)

- Failure modes observed: The `create-phr.sh` script failed to correctly fill placeholders in the PHR template when executed directly.
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Investigate and fix the `create-phr.sh` script to ensure it correctly populates all placeholders automatically.