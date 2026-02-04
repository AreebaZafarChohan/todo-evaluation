from pydantic import BaseModel, EmailStr, field_validator


class SignupRequest(BaseModel):
    """Request schema for user signup."""
    email: EmailStr
    name: str
    password: str
    confirm_password: str

    @field_validator('name')
    @classmethod
    def name_must_be_valid(cls, v: str) -> str:
        if len(v) < 1:
            raise ValueError('Name must be at least 1 character')
        if len(v) > 100:
            raise ValueError('Name must be at most 100 characters')
        return v

    @field_validator('password')
    @classmethod
    def password_must_be_strong(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters')
        return v


class LoginRequest(BaseModel):
    """Request schema for user login. Accepts email."""
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """Response schema for user data (without password)."""
    id: str  # Changed from UUID to string to match our User model
    name: str
    email: str

    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    """Response schema for authentication (signup/login)."""
    user: UserResponse
    access_token: str
    token_type: str = "bearer"
