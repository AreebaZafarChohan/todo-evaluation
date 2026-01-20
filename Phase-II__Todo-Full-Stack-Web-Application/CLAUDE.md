# Todo App - Hackathon II
 
## Project Overview
This is a monorepo using GitHub Spec-Kit for spec-driven development.
 
## Spec-Kit Structure
Specifications are organized in /specs/phase2:
- /specs/phase2/overview.md - Project overview
- /specs/phase2/architecture.md - System architecture
- /specs/phase2/features/ - Feature specs (what to build)
- /specs/phase2/api/ - API endpoint and MCP tool specs
- /specs/phase2/database/ - Schema and model specs
- /specs/phase2/ui/ - Component and page specs
 
## How to Use Specs
1. Always read relevant spec before implementing
2. Reference specs with: @specs/phase2/features/task-crud.md
3. Update specs if requirements change
 
## Project Structure
- /frontend - Next.js 14 app
- /backend - Python FastAPI server
 
## Development Workflow
1. Read spec: @specs/phase2/features/[feature].md
2. Implement backend: @backend/CLAUDE.md
3. Implement frontend: @frontend/CLAUDE.md
4. Test and iterate
 
## Commands
- Frontend: cd frontend && npm run dev
- Backend: cd backend && uvicorn main:app --reload
- Both: docker-compose up