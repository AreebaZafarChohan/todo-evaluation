from fastapi import Depends, HTTPException, Request
from jose import jwt, JWTError
from sqlmodel import Session, select
from src.core.database import get_session
from src.models.task import User
from src.core.config import settings
from src.core.security import ALGORITHM


def get_current_user_id(request: Request, session: Session = Depends(get_session)) -> str:
    """Extract and validate JWT token, ensuring user exists in database."""
    auth_header = request.headers.get("Authorization")

    if not auth_header:
        raise HTTPException(status_code=401, detail="Authorization header missing")

    # Extract bearer token
    scheme, _, token = auth_header.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise HTTPException(status_code=401, detail="Invalid authorization scheme")

    try:
        # Decode JWT token
        payload = jwt.decode(token, settings.BETTER_AUTH_SECRET, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")

        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token: no user_id")

        # Verify user exists in database
        user = session.get(User, user_id)
        if not user:
            raise HTTPException(
                status_code=401,
                detail="User not found. Please sign up again."
            )

        return user_id

    except JWTError as e:
        raise HTTPException(status_code=401, detail=f"Could not validate credentials: {str(e)}") from e
