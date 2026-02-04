from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from uuid import uuid4
from datetime import datetime

from src.core.database import get_session
from src.core.security import hash_password, verify_password, create_access_token
from src.models.task import User
from src.schemas.auth import SignupRequest, LoginRequest, AuthResponse, UserResponse

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def signup(request: SignupRequest, session: Session = Depends(get_session)):
    """
    Register a new user.

    - **name**: User's display name
    - **email**: Valid email address
    - **password**: Password (min 6 chars)
    - **confirm_password**: Must match password
    """
    # Validate password match
    if request.password != request.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password and confirm_password do not match"
        )

    # Check if email already exists
    existing_user = session.exec(
        select(User).where(User.email == request.email)
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already exists"
        )

    # Create new user with a unique string ID
    user_id = str(uuid4())
    hashed_pw = hash_password(request.password)
    user = User(
        id=user_id,
        email=request.email,
        name=request.name,
        hashed_password=hashed_pw,
        created_at=datetime.now()
    )
    session.add(user)
    session.commit()
    session.refresh(user)

    # Generate JWT token
    access_token = create_access_token(user.id)

    return AuthResponse(
        user=UserResponse(id=user.id, name=user.name, email=user.email),
        access_token=access_token
    )


@router.post("/login", response_model=AuthResponse)
def login(request: LoginRequest, session: Session = Depends(get_session)):
    """
    Authenticate user and return JWT token.

    - **email**: User's email address
    - **password**: User's password
    """
    # Find user by email
    user = session.exec(
        select(User).where(User.email == request.email)
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    # Verify password
    if not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    # Generate JWT token
    access_token = create_access_token(user.id)

    return AuthResponse(
        user=UserResponse(id=user.id, name=user.name, email=user.email),
        access_token=access_token
    )
