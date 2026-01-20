# Implementation Plan: Backend JWT and Task Management

**Feature Branch**: `001-backend-jwt-tasks`  
**Created**: 2026-01-18  
**Status**: Draft  

## 1. Technical Context

This plan outlines the development of a secure backend for a to-do list application. The backend will be built with FastAPI and will use JWT for authentication, SQLModel for database interaction, and Neon Serverless PostgreSQL for data storage. The focus is on creating a stateless REST API with robust authentication and authorization mechanisms.

## 2. Constitution Check

The plan adheres to the project's constitution by emphasizing a clear separation of concerns, testable architecture, and environment-based configuration. The implementation will follow standard security best practices for JWT handling and database access.

## 3. Plan Phases

### Phase 1: Project Setup and Configuration

1.  **Initialize FastAPI Project**:
    *   Create a standard FastAPI project structure with `main.py`, a `routers` directory for API endpoints, a `models` directory for data models, and a `core` directory for configuration and dependencies.
2.  **Environment Configuration**:
    *   Set up a `.env` file to manage environment variables: `DATABASE_URL` for the Neon PostgreSQL connection and `BETTER_AUTH_SECRET` for JWT validation.
    *   Create a `config.py` in the `core` directory to load these variables.

### Phase 2: User Registration and Authentication

1.  **Update User Model**:
    *   Extend the `User` model to include `username`, `email`, and `hashed_password` fields.
    *   Add unique constraints on `username` and `email`.

2.  **Password Hashing Service**:
    *   Implement password hashing using `passlib` with bcrypt.
    *   Create utility functions for hashing and verifying passwords.

3.  **JWT Token Service**:
    *   Create a service to generate JWT tokens with user `id` in the `sub` claim.
    *   Use `BETTER_AUTH_SECRET` for signing tokens.
    *   Set token expiration (e.g., 7 days).

4.  **Auth Router - Signup Endpoint**:
    *   Create `POST /api/auth/signup` endpoint.
    *   Accept `username`, `email`, `password`, `confirm_password`.
    *   Validate password match.
    *   Check for existing username/email (return `409 Conflict`).
    *   Hash password and create user.
    *   Return user data and JWT token with `201 Created`.

5.  **Auth Router - Login Endpoint**:
    *   Create `POST /api/auth/login` endpoint.
    *   Accept `username_or_email` and `password`.
    *   Find user by username OR email.
    *   Verify password.
    *   Return user data and JWT token with `200 OK`.
    *   Return `401 Unauthorized` for invalid credentials.

### Phase 3: JWT Verification Middleware

1.  **JWT Verification Middleware**:
    *   Implement a middleware to intercept all incoming requests to `/api/` paths (except `/api/auth/*`).
    *   The middleware will extract the JWT from the `Authorization` header, decode it using the `BETTER_AUTH_SECRET`, and verify its signature and expiration.
    *   Invalid or missing tokens will result in a `401 Unauthorized` response.
2.  **Authentication Dependency**:
    *   Create a FastAPI dependency that can be injected into API routes.
    *   This dependency will extract the `user_id` from the validated JWT payload and make it available to the route.

### Phase 4: Database and Data Models

1.  **Database Connection**:
    *   Set up the database engine and session management for Neon PostgreSQL using SQLModel.
2.  **Task Model**:
    *   Define the `Task` model using SQLModel, including fields for `id` (UUID), `title`, `description`, `completed`, and a foreign key relationship to the user.

### Phase 5: Task API Implementation

1.  **Task Router**:
    *   Create a new router in the `routers` directory for task-related endpoints.
2.  **CRUD Endpoints**:
    *   Implement the following endpoints:
        *   `POST /api/{user_id}/tasks`: Create a new task.
        *   `GET /api/{user_id}/tasks`: Retrieve a user's tasks with pagination and sorting.
        *   `GET /api/{user_id}/tasks/{id}`: Retrieve a single task.
        *   `PUT /api/{user_id}/tasks/{id}`: Fully update a task.
        *   `DELETE /api/{user_id}/tasks/{id}`: Delete a task.
        *   `PATCH /api/{user_id}/tasks/{id}/complete`: Mark a task as complete.
3.  **Ownership Enforcement**:
    *   In all task-related queries, ensure that the `user_id` from the JWT matches the owner of the task.
    *   If a user attempts to access or modify a task they do not own, return a `403 Forbidden` error.
4.  **Error Handling**:
    *   Implement robust error handling for database errors, validation errors, and other potential issues.

### Phase 6: Testing

1.  **Authentication Tests**:
    *   Write unit tests for the JWT verification middleware and authentication dependency.
    *   Write integration tests for signup and login endpoints.
2.  **API Tests**:
    *   Write integration tests for each API endpoint, covering success cases, error cases (401, 403, 404), and validation failures (400).

## 4. Generated Artifacts

-   **Data Model**: `specs/backend-jwt-tasks/data-model.md`
-   **API Contracts**: `specs/backend-jwt-tasks/contracts/`
-   **Research**: `specs/backend-jwt-tasks/research.md`
-   **Quickstart**: `specs/backend-jwt-tasks/quickstart.md`