---
id: "0001"
title: Backend JWT and Task Management Spec
stage: spec
date_iso: 2026-01-18
surface: "agent"
model: "unknown"
branch: "0001-backend-jwt-tasks"
feature: "backend-jwt-tasks"
label: "backend, jwt, spec"
---

# Prompt

You are Spec-Kit Plus acting as a senior backend architect. Create a complete backend specification for Phase II: Todo Full-Stack Web Application. Scope: - Backend ONLY - No frontend implementation - Database behavior allowed, but no infra provisioning - Phase II only Technology Constraints: - FastAPI (Python, async) - SQLModel ORM - Neon Serverless PostgreSQL - Authentication via Better Auth (JWT-based) - Stateless REST API Authentication Requirements: - Better Auth runs on frontend and issues JWT tokens - Backend must: - Verify JWT token on every request - Use shared secret via environment variable: BETTER_AUTH_SECRET - Extract authenticated user_id from JWT - Enforce strict user-level data isolation - Requests without valid JWT → 401 Unauthorized - user_id in URL must match authenticated user_id API Requirements: Implement REST endpoints: - GET /api/{user_id}/tasks - POST /api/{user_id}/tasks - GET /api/{user_id}/tasks/{id} - PUT /api/{user_id}/tasks/{id} - DELETE /api/{user_id}/tasks/{id} - PATCH /api/{user_id}/tasks/{id}/complete Behavior Rules: - All tasks belong to exactly one user - Users can only access their own tasks - Backend must NEVER trust user_id from request without JWT validation - Proper HTTP status codes (200, 201, 400, 401, 403, 404) Non-Functional Requirements: - OpenAPI documentation enabled - Testable architecture - Clear separation of concerns - Environment-based configuration - Ready for future Dapr / Kafka integration Out of Scope: - Frontend - Kafka / Dapr - AI features - Deployment scripts Output Required: - Backend responsibilities - Auth flow (Better Auth + JWT) - API behavior and security rules - Success criteria for Phase II backend i have also empty git branch 001-backend-jwt-tasks you can use it

# Response

I have created the backend specification for the Todo Full-Stack Web Application.

**Branch:** `001-backend-jwt-tasks`
**Specification:** `specs/backend-jwt-tasks/spec.md`
**Checklist:** `specs/backend-jwt-tasks/checklists/requirements.md`

The specification is ready for the next phase. You can now proceed with `/sp.plan` to create a technical plan or `/sp.clarify` if you have any questions.