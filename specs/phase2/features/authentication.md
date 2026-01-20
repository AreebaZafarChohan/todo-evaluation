# Feature: User Authentication
 
## User Stories
- As a user, I can register a new account with email and password.
- As a user, I can log in with my credentials and receive a JWT token.
- As a user, I can access protected resources using my JWT token.
- As a user, I can log out (invalidate my session/token).
 
## Acceptance Criteria
 
### User Registration
- Requires a unique email and a strong password.
- Stores hashed passwords, not plain text.
- Returns a success message upon registration.
 
### User Login
- Accepts email and password.
- Returns an access token (JWT) upon successful authentication.
- Returns an error for invalid credentials.
 
### Protected Endpoints
- Requires a valid JWT in the Authorization header (Bearer token).
- Returns 401 Unauthorized for missing or invalid tokens.
 
### Logout
- Invalidates the current user's session/token on the server (if applicable) or instructs the client to discard it.