# Feature Specification: Backend JWT and Task Management

**Feature Branch**: `001-backend-jwt-tasks`  
**Created**: 2026-01-18  
**Status**: Draft  
**Input**: User description: "You are Spec-Kit Plus acting as a senior backend architect. Create a complete backend specification for Phase II: Todo Full-Stack Web Application. Scope: - Backend ONLY - No frontend implementation - Database behavior allowed, but no infra provisioning - Phase II only Technology Constraints: - FastAPI (Python, async) - SQLModel ORM - Neon Serverless PostgreSQL - Authentication via Better Auth (JWT-based) - Stateless REST API Authentication Requirements: - Better Auth runs on frontend and issues JWT tokens - Backend must: - Verify JWT token on every request - Use shared secret via environment variable: BETTER_AUTH_SECRET - Extract authenticated user_id from JWT - Enforce strict user-level data isolation - Requests without valid JWT → 401 Unauthorized - user_id in URL must match authenticated user_id API Requirements: Implement REST endpoints: - GET /api/{user_id}/tasks - POST /api/{user_id}/tasks - GET /api/{user_id}/tasks/{id} - PUT /api/{user_id}/tasks/{id} - DELETE /api/{user_id}/tasks/{id} - PATCH /api/{user_id}/tasks/{id}/complete Behavior Rules: - All tasks belong to exactly one user - Users can only access their own tasks - Backend must NEVER trust user_id from request without JWT validation - Proper HTTP status codes (200, 201, 400, 401, 403, 404) Non-Functional Requirements: - OpenAPI documentation enabled - Testable architecture - Clear separation of concerns - Environment-based configuration - Ready for future Dapr / Kafka integration Out of Scope: - Frontend - Kafka / Dapr - AI features - Deployment scripts Output Required: - Backend responsibilities - Auth flow (Better Auth + JWT) - API behavior and security rules - Success criteria for Phase II backend i have also empty git branch 001-backend-jwt-tasks you can use it"

## User Scenarios & Testing *(mandatory)*

### User Story 0 - User Registration and Authentication (Priority: P0)

As a user, I want to register an account and login so that I can securely access my tasks.

**Why this priority**: Without user registration and login, users cannot authenticate and use the application. This is the foundation for all other features.

**Independent Test**: A new user can register with username, email, password and confirm password. A registered user can login with username/email and password.

**Acceptance Scenarios**:

1. **Given** a new user, **When** they make a `POST` request to `/api/auth/signup` with valid username, email, password, and confirm_password, **Then** a new user account is created and a `201 Created` status is returned with user data and JWT token.
2. **Given** a new user, **When** they make a `POST` request to `/api/auth/signup` with mismatched password and confirm_password, **Then** the API returns a `400 Bad Request` status with error details.
3. **Given** a new user, **When** they make a `POST` request to `/api/auth/signup` with an email that already exists, **Then** the API returns a `409 Conflict` status.
4. **Given** a registered user, **When** they make a `POST` request to `/api/auth/login` with valid username and password, **Then** a `200 OK` status is returned with user data and JWT token.
5. **Given** a registered user, **When** they make a `POST` request to `/api/auth/login` with valid email and password, **Then** a `200 OK` status is returned with user data and JWT token.
6. **Given** a user, **When** they make a `POST` request to `/api/auth/login` with invalid credentials, **Then** the API returns a `401 Unauthorized` status.

### User Story 1 - Secure Task Management (Priority: P1)

As a user, I want to manage my tasks through a secure API, ensuring that only I can access and modify my own tasks.

**Why this priority**: This is the core functionality of the application. Without secure task management, the application is not usable.

**Independent Test**: A user can create, read, update, and delete their own tasks. Attempts to access another user's tasks are blocked.

**Acceptance Scenarios**:

1. **Given** a valid user with a JWT, **When** they make a `POST` request to `/api/{user_id}/tasks` with valid task data, **Then** a new task is created for that user and a `201 Created` status is returned.
2. **Given** a valid user with a JWT, **When** they make a `GET` request to `/api/{user_id}/tasks`, **Then** a list of their tasks is returned with a `200 OK` status.
3. **Given** a valid user with a JWT and an existing task, **When** they make a `PUT` request to `/api/{user_id}/tasks/{id}` with valid update data, **Then** the task is updated and a `200 OK` status is returned.
4. **Given** a valid user with a JWT and an existing task, **When** they make a `DELETE` request to `/api/{user_id}/tasks/{id}`, **Then** the task is deleted and a `200 OK` status is returned.
5. **Given** a user with a valid JWT, **When** they attempt to access tasks for a different `user_id`, **Then** the API returns a `403 Forbidden` status.
6. **Given** a user without a valid JWT, **When** they attempt to access any task endpoint, **Then** the API returns a `401 Unauthorized` status.

## Clarifications

### Session 2026-01-18
- Q: How should the API respond when a user submits a task with missing or invalid data? → A: Reject the request with a `400 Bad Request` status and a JSON body describing the validation errors.
- Q: What is the intended difference in behavior between `PUT` and `PATCH` for task updates? → A: `PUT` should fully replace the task resource with the provided data. `PATCH` should apply a partial update to specific fields (e.g., marking as complete).
- Q: What should happen when a task is deleted? → A: It should be a hard delete (permanently removed from the database).
- Q: How should the `id` for a new task be generated? → A: UUID (Universally Unique Identifier) to ensure uniqueness and compatibility with distributed systems.
- Q: Should there be support for pagination or sorting for `GET /api/{user_id}/tasks`? → A: Yes, with default pagination (20 items per page, page 1 by default) and sorting by creation date (descending by default). Parameters `page`, `page_size`, `sort_by`, `sort_order` should be supported.

## Requirements *(mandatory)*

### Functional Requirements

#### Authentication Requirements (FR-AUTH)

- **FR-AUTH-001**: The system MUST expose a `POST /api/auth/signup` endpoint for user registration.
- **FR-AUTH-002**: The signup endpoint MUST accept `username`, `email`, `password`, and `confirm_password` fields.
- **FR-AUTH-003**: The system MUST validate that `password` and `confirm_password` match.
- **FR-AUTH-004**: The system MUST hash passwords using bcrypt before storing.
- **FR-AUTH-005**: The system MUST return `409 Conflict` if email or username already exists.
- **FR-AUTH-006**: The system MUST expose a `POST /api/auth/login` endpoint for user authentication.
- **FR-AUTH-007**: The login endpoint MUST accept either `username` or `email` along with `password`.
- **FR-AUTH-008**: The system MUST return a JWT token upon successful signup or login.
- **FR-AUTH-009**: The JWT token MUST contain the user's `id` in the `sub` claim.
- **FR-AUTH-010**: The system MUST return `401 Unauthorized` for invalid login credentials.

#### Task Management Requirements (FR-TASK)

- **FR-001**: The system MUST expose REST endpoints for CRUD operations on tasks.
- **FR-002**: The system MUST verify a JWT on every request to a protected endpoint.
- **FR-003**: The system MUST extract a `user_id` from the JWT payload.
- **FR-004**: The system MUST enforce user-level data isolation, ensuring users can only access their own tasks.
- **FR-005**: The system MUST return a `401 Unauthorized` error for requests with missing or invalid JWTs.
- **FR-006**: The system MUST return a `403 Forbidden` error when a user tries to access another user's data.
- **FR-007**: The system MUST use a shared secret from the `BETTER_AUTH_SECRET` environment variable to validate JWT signatures.
- **FR-008**: The system MUST provide OpenAPI documentation for all endpoints.
- **FR-009**: The system MUST validate incoming task data (e.g., title, description) and return a `400 Bad Request` with validation error details if the data is invalid.
- **FR-010**: The system MUST allow full replacement of a task resource via `PUT /api/{user_id}/tasks/{id}`.
- **FR-011**: The system MUST allow partial updates to specific task fields (e.g., marking as complete) via `PATCH /api/{user_id}/tasks/{id}/complete`.
- **FR-012**: The system MUST permanently remove a task from the database when a `DELETE /api/{user_id}/tasks/{id}` request is successfully processed.
- **FR-013**: The system MUST support pagination for `GET /api/{user_id}/tasks` with default page size of 20 and default page 1, configurable via `page` and `page_size` query parameters.
- **FR-014**: The system MUST support sorting for `GET /api/{user_id}/tasks` by creation date in descending order by default, configurable via `sort_by` and `sort_order` query parameters.

### Key Entities

- **User**: Represents a user of the application. Has a unique `id` (UUID), `username`, `email`, and `hashed_password`.
- **Task**: Represents a single to-do item. It belongs to exactly one user. A task has an `id` (UUID), `title`, `description`, and `completed` status.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of unauthorized or cross-user requests are rejected with the correct HTTP status code (401/403).
- **SC-002**: All API endpoints have corresponding automated tests that cover both success and failure scenarios.
- **SC-003**: The backend API is fully documented and accessible via an OpenAPI (Swagger) UI.
- **SC-004**: The API can handle 100 concurrent requests with a median response time of less than 200ms.
