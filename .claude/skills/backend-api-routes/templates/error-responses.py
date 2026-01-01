# Template: Standard Error Responses
# Usage: Use these error response formats across your API

from fastapi import HTTPException, status
from pydantic import BaseModel
from typing import Dict, Any, Optional
from datetime import datetime
import uuid

class ErrorDetail(BaseModel):
    code: str
    message: str
    details: Optional[Dict[str, Any]] = None
    request_id: str
    timestamp: str
    path: Optional[str] = None

class ErrorResponse(BaseModel):
    error: ErrorDetail

# Helper function to create standardized errors
def create_error_response(
    code: str,
    message: str,
    details: Optional[Dict[str, Any]] = None,
    path: Optional[str] = None
) -> ErrorDetail:
    return ErrorDetail(
        code=code,
        message=message,
        details=details,
        request_id=f"req_{uuid.uuid4().hex[:12]}",
        timestamp=datetime.utcnow().isoformat() + "Z",
        path=path
    )

# 400 Bad Request
def bad_request_error(message: str, details: Optional[Dict] = None):
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=create_error_response(
            code="BAD_REQUEST",
            message=message,
            details=details
        ).dict()
    )

# Example usage:
# bad_request_error("Invalid input", {"field": "email"})

# 401 Unauthorized
def unauthorized_error(message: str = "Authentication required"):
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=create_error_response(
            code="UNAUTHORIZED",
            message=message
        ).dict(),
        headers={"WWW-Authenticate": "Bearer"}
    )

# 403 Forbidden
def forbidden_error(message: str = "Insufficient permissions"):
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail=create_error_response(
            code="FORBIDDEN",
            message=message
        ).dict()
    )

# 404 Not Found
def not_found_error(resource: str, resource_id: str):
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=create_error_response(
            code="RESOURCE_NOT_FOUND",
            message=f"{resource.capitalize()} with id {resource_id} not found",
            details={"resource": resource, "id": resource_id}
        ).dict()
    )

# Example usage:
# not_found_error("user", "123")

# 409 Conflict
def conflict_error(message: str, details: Optional[Dict] = None):
    raise HTTPException(
        status_code=status.HTTP_409_CONFLICT,
        detail=create_error_response(
            code="CONFLICT",
            message=message,
            details=details
        ).dict()
    )

# Example usage:
# conflict_error("User with this email already exists", {"email": "user@example.com"})

# 422 Unprocessable Entity (Validation Error)
def validation_error(field_errors: Dict[str, list]):
    raise HTTPException(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        detail=create_error_response(
            code="VALIDATION_ERROR",
            message="Request validation failed",
            details={"fields": field_errors}
        ).dict()
    )

# Example usage:
# validation_error({
#     "email": ["Invalid email format"],
#     "age": ["Must be at least 18"]
# })

# 429 Too Many Requests
def rate_limit_error(retry_after: int = 60):
    raise HTTPException(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        detail=create_error_response(
            code="RATE_LIMIT_EXCEEDED",
            message="Too many requests. Please try again later.",
            details={"retry_after_seconds": retry_after}
        ).dict(),
        headers={"Retry-After": str(retry_after)}
    )

# 500 Internal Server Error
def internal_server_error(message: str = "An unexpected error occurred"):
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=create_error_response(
            code="INTERNAL_SERVER_ERROR",
            message=message
        ).dict()
    )

# 503 Service Unavailable
def service_unavailable_error(message: str = "Service temporarily unavailable"):
    raise HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail=create_error_response(
            code="SERVICE_UNAVAILABLE",
            message=message
        ).dict(),
        headers={"Retry-After": "60"}
    )

# Custom business logic error
def business_logic_error(code: str, message: str, details: Optional[Dict] = None):
    raise HTTPException(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        detail=create_error_response(
            code=code,
            message=message,
            details=details
        ).dict()
    )

# Example usage:
# business_logic_error(
#     "INSUFFICIENT_BALANCE",
#     "Cannot complete transaction",
#     {"balance": 100, "required": 150}
# )
