# API: JWT Authentication Endpoints
 
## Endpoints
 
### POST /api/auth/register
Register a new user.
 
Request Body:
- email: string (required, unique)
- password: string (required, min 8 characters, includes uppercase, lowercase, number, special char)
 
Response:
- status: "success"
- message: "User registered successfully"
 
### POST /api/auth/token
Authenticate user and issue JWT token.
 
Request Body:
- email: string (required)
- password: string (required)
 
Response (200 OK):
- access_token: string (JWT token)
- token_type: "bearer"
 
Response (401 Unauthorized):
- detail: "Invalid credentials"
 
### GET /api/users/me (Example protected endpoint)
Retrieve current authenticated user's information.
 
Headers:
- Authorization: Bearer <access_token>
 
Response (200 OK):
- id: string
- email: string
- name: string (if available)
 
Response (401 Unauthorized):
- detail: "Not authenticated"