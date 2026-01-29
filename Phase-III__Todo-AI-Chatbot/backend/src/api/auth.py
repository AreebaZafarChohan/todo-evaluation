"""JWT verification and user extraction middleware for Better Auth integration."""
from dataclasses import dataclass
from typing import Annotated

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

from src.core.config import settings

# Security scheme for JWT bearer tokens
security = HTTPBearer(auto_error=False)


@dataclass
class AuthenticatedUser:
    """Represents an authenticated user extracted from JWT."""

    user_id: str
    email: str | None = None


class AuthError(HTTPException):
    """Authentication error with standardized response."""

    def __init__(self, detail: str = "Could not validate credentials"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"},
        )


def decode_jwt(token: str) -> dict:
    """Decode and validate JWT token.

    Args:
        token: JWT token string

    Returns:
        Decoded token payload

    Raises:
        AuthError: If token is invalid or expired
    """
    try:
        payload = jwt.decode(
            token,
            settings.better_auth_secret,
            algorithms=["HS256"],
            options={"verify_exp": True},
        )
        return payload
    except JWTError as e:
        raise AuthError(f"Invalid token: {e}")


async def get_current_user(
    request: Request,
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(security)],
) -> AuthenticatedUser:
    """Extract and validate user from JWT token.

    This dependency extracts the JWT from the Authorization header,
    validates it, and returns the authenticated user information.

    Args:
        request: FastAPI request object
        credentials: HTTP Bearer credentials

    Returns:
        AuthenticatedUser with validated user information

    Raises:
        AuthError: If authentication fails
    """
    if credentials is None:
        raise AuthError("Missing authentication token")

    payload = decode_jwt(credentials.credentials)

    user_id = payload.get("sub")
    if not user_id:
        raise AuthError("Token missing user identifier")

    return AuthenticatedUser(
        user_id=user_id,
        email=payload.get("email"),
    )


async def validate_user_access(
    path_user_id: str,
    current_user: Annotated[AuthenticatedUser, Depends(get_current_user)],
) -> AuthenticatedUser:
    """Validate that the authenticated user matches the path user_id.

    Args:
        path_user_id: User ID from the URL path
        current_user: Currently authenticated user

    Returns:
        AuthenticatedUser if validation passes

    Raises:
        HTTPException: If user IDs don't match (403 Forbidden)
    """
    if current_user.user_id != path_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: user ID mismatch",
        )
    return current_user


# Type alias for dependency injection
CurrentUser = Annotated[AuthenticatedUser, Depends(get_current_user)]
