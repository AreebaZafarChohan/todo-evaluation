# Template: Custom Exception Classes
# Usage: Copy and extend for your application errors

from enum import Enum
from typing import Any, Optional
from datetime import datetime

class ErrorCode(str, Enum):
    """Application error codes - customize for your domain."""
    # Generic errors
    VALIDATION_ERROR = "VALIDATION_ERROR"
    RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND"
    UNAUTHORIZED = "UNAUTHORIZED"
    FORBIDDEN = "FORBIDDEN"

    # Business logic errors (customize these)
    EMAIL_ALREADY_EXISTS = "EMAIL_ALREADY_EXISTS"
    INSUFFICIENT_BALANCE = "INSUFFICIENT_BALANCE"
    INVALID_STATE_TRANSITION = "INVALID_STATE_TRANSITION"

    # Server errors
    INTERNAL_ERROR = "INTERNAL_ERROR"
    SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE"

class AppError(Exception):
    """Base exception for all application errors."""

    def __init__(
        self,
        code: ErrorCode,
        message: str,
        details: Optional[dict[str, Any]] = None,
        status_code: int = 400,
        headers: Optional[dict[str, str]] = None
    ):
        self.code = code
        self.message = message
        self.details = details or {}
        self.status_code = status_code
        self.headers = headers or {}
        self.request_id = None
        self.timestamp = datetime.utcnow()
        super().__init__(self.message)

    def to_dict(self) -> dict:
        return {
            "error": {
                "code": self.code.value,
                "message": self.message,
                "details": self.details,
                "request_id": self.request_id,
                "timestamp": self.timestamp.isoformat() + "Z"
            }
        }

# 4xx Client Errors
class ValidationError(AppError):
    def __init__(self, message: str = "Validation failed", field_errors: dict = None):
        super().__init__(
            code=ErrorCode.VALIDATION_ERROR,
            message=message,
            details={"fields": field_errors or {}},
            status_code=422
        )

class NotFoundError(AppError):
    def __init__(self, resource_type: str, resource_id: str):
        super().__init__(
            code=ErrorCode.RESOURCE_NOT_FOUND,
            message=f"{resource_type} with id {resource_id} not found",
            details={"resource_type": resource_type, "resource_id": resource_id},
            status_code=404
        )

class UnauthorizedError(AppError):
    def __init__(self, message: str = "Authentication required"):
        super().__init__(
            code=ErrorCode.UNAUTHORIZED,
            message=message,
            status_code=401,
            headers={"WWW-Authenticate": "Bearer"}
        )

class ForbiddenError(AppError):
    def __init__(self, message: str = "Access denied"):
        super().__init__(
            code=ErrorCode.FORBIDDEN,
            message=message,
            status_code=403
        )

# Business Logic Errors (customize these)
class EmailAlreadyExistsError(AppError):
    def __init__(self, email: str):
        super().__init__(
            code=ErrorCode.EMAIL_ALREADY_EXISTS,
            message=f"User with email {email} already exists",
            details={"field": "email", "value": email},
            status_code=409
        )

class InsufficientBalanceError(AppError):
    def __init__(self, balance: float, required: float):
        super().__init__(
            code=ErrorCode.INSUFFICIENT_BALANCE,
            message="Insufficient balance for this operation",
            details={"balance": balance, "required": required},
            status_code=422
        )

# 5xx Server Errors
class InternalError(AppError):
    def __init__(self, message: str = "An unexpected error occurred"):
        super().__init__(
            code=ErrorCode.INTERNAL_ERROR,
            message=message,
            status_code=500
        )

class ServiceUnavailableError(AppError):
    def __init__(self, message: str = "Service temporarily unavailable"):
        super().__init__(
            code=ErrorCode.SERVICE_UNAVAILABLE,
            message=message,
            status_code=503,
            headers={"Retry-After": "60"}
        )
