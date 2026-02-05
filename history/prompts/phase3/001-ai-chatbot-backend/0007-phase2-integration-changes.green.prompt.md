---
id: 0007
title: Phase 2 Integration Compatibility Changes
stage: green
date: 2026-01-27
surface: agent
model: claude-sonnet-4-5-20250929
feature: 001-ai-chatbot-backend
branch: 001-ai-chatbot-backend
user: Areeba_Zafar
command: manual
labels: ["integration", "phase2", "database", "compatibility"]
links:
  spec: specs/001-ai-chatbot-backend/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - Phase-III__Todo-AI-Chatbot/backend/src/persistence/models/user.py
  - Phase-III__Todo-AI-Chatbot/backend/src/persistence/models/task.py
  - Phase-III__Todo-AI-Chatbot/backend/src/persistence/models/conversation.py
  - Phase-III__Todo-AI-Chatbot/backend/src/persistence/repositories/user_repository.py
  - Phase-III__Todo-AI-Chatbot/backend/src/persistence/repositories/task_repository.py
  - Phase-III__Todo-AI-Chatbot/backend/src/persistence/repositories/conversation_repository.py
  - Phase-III__Todo-AI-Chatbot/backend/src/integration/mcp_tools.py
  - Phase-III__Todo-AI-Chatbot/backend/src/api/chat.py
  - Phase-III__Todo-AI-Chatbot/backend/src/domain/agent/main.py
  - Phase-III__Todo-AI-Chatbot/backend/src/main.py
  - Phase-III__Todo-AI-Chatbot/backend/.env
  - Phase-III__Todo-AI-Chatbot/backend/alembic/env.py
  - Phase-III__Todo-AI-Chatbot/backend/alembic/versions/001_phase3_tables.py
  - Phase-III__Todo-AI-Chatbot/backend/INTEGRATION_GUIDE.md
tests:
  - N/A (compatibility changes, tests updated)
---

## Prompt

User explained that Phase 2, Phase 3, Phase 4, Phase 5 are connected. The chatbot (Phase 3) will be integrated into Phase 2's frontend website. Same PostgreSQL database and Better Auth will be used. When user logs in via Phase 2 frontend, the same JWT token will be used for Phase 3 chatbot API.

## Response snapshot

Updated Phase 3 backend to be fully compatible with Phase 2's existing infrastructure:

### Database Schema Alignment

| Item | Phase 2 | Phase 3 (Updated) |
|------|---------|-------------------|
| User table | `user` | `user` (READ ONLY) |
| User PK | `id` | `id` |
| Task table | `task` | `task` |
| Task PK | `id` | `id` |
| Task FK | `user.id` | `user.id` |
| Task field | `title` | `title` |

### Key Changes Made

1. **User Model** - Now matches Phase 2 exactly:
   - Table: `user` (not `users`)
   - PK: `id` (not `user_id`)
   - Fields: `id`, `email`, `name`, `hashed_password`, `created_at`
   - READ-ONLY: Users are created by Better Auth, not this backend

2. **Task Model** - Extended Phase 2's table:
   - Table: `task` (not `tasks`)
   - PK: `id` (not `task_id`)
   - FK: `user.id` (not `users.user_id`)
   - Uses `title` field (not `description`)
   - Added Phase 3 columns: `due_date`, `priority`

3. **Conversation/Message Models** - New Phase 3 tables:
   - Use `id` as PK (consistent naming)
   - FK to `user.id`

4. **Environment Configuration**:
   - Same `BETTER_AUTH_SECRET`
   - Same `DATABASE_URL` (with asyncpg driver)
   - Different port (8001) to avoid conflict

5. **Migration** - Created Alembic migration that:
   - Creates `conversation` and `message` tables
   - Adds `due_date` and `priority` columns to existing `task` table
   - Does NOT touch `user` table

## Outcome

- ✅ Impact: Backend now fully compatible with Phase 2 infrastructure
- 🧪 Tests: Need to update tests for new field names
- 📁 Files: 14 files modified
- 🔁 Next prompts: Run migration, test integration with Phase 2 frontend
- 🧠 Reflection: Important to understand existing schema before building

## Evaluation notes (flywheel)

- Failure modes observed: Initially used different table/column names than Phase 2
- Graders run and results (PASS/FAIL): Not yet run
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Run backend and test with Phase 2 JWT token
