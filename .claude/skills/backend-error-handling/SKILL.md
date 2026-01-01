# backend-error-handling

## Description
Comprehensive guide for implementing standardized error handling in backend APIs including exception hierarchies, error response formats, logging, and recovery strategies.

## Purpose
This skill provides best practices for creating robust, user-friendly error handling in backend applications. It covers error taxonomy, exception hierarchies, structured logging, and recovery patterns to ensure consistent and maintainable error management.

## Core Principles

1. **Consistency**: Use uniform error response format across all endpoints
2. **Security**: Never expose internal details or stack traces to clients
3. **Actionability**: Provide clear, actionable error messages
4. **Observability**: Log all errors with structured context for debugging
5. **Resilience**: Implement retry logic and circuit breakers for transient failures

## When to Use

- Standardizing error responses across API
- Implementing custom exception classes
- Setting up global exception handlers
- Adding structured error logging
- Implementing retry logic for external services
- Creating user-friendly validation error messages
- Building error monitoring and alerting

## Error Taxonomy

### HTTP Status Code Categories

| Category | Codes | Meaning | Who's Fault |
|----------|-------|---------|-------------|
| **2xx Success** | 200, 201, 204 | Request succeeded | N/A |
| **4xx Client Error** | 400, 401, 403, 404, 422, 429 | Client made an error | Client |
| **5xx Server Error** | 500, 502, 503, 504 | Server made an error | Server |

### Detailed Status Codes

| Code | Name | When to Use | Should Retry? |
|------|------|-------------|---------------|
| 400 | Bad Request | Malformed request, invalid syntax | No |
| 401 | Unauthorized | Missing or invalid authentication | No |
| 403 | Forbidden | Authenticated but not authorized | No |
| 404 | Not Found | Resource doesn't exist | No |
| 409 | Conflict | Resource already exists, state conflict | Maybe |
| 422 | Unprocessable Entity | Validation failed, business logic error | No |
| 429 | Too Many Requests | Rate limit exceeded | Yes (after delay) |
| 500 | Internal Server Error | Unexpected server error | Maybe |
| 502 | Bad Gateway | Upstream service error | Yes |
| 503 | Service Unavailable | Server overloaded or in maintenance | Yes |
| 504 | Gateway Timeout | Upstream service timeout | Yes |

## Standard Error Response Format

### Basic Error Response
```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "User with id 123 not found",
    "details": {
      "resource_type": "User",
      "resource_id": "123"
    },
    "request_id": "req-abc123xyz",
    "timestamp": "2024-01-15T10:30:00Z",
    "path": "/api/v1/users/123"
  }
}
```

### Validation Error Response
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": {
      "fields": {
        "email": ["Must be a valid email address"],
        "password": [
          "Must be at least 8 characters",
          "Must contain at least one uppercase letter"
        ],
        "age": ["Must be at least 18"]
      }
    },
    "request_id": "req-xyz789",
    "timestamp": "2024-01-15T10:30:00Z",
    "path": "/api/v1/users"
  }
}
```

### Business Logic Error
```json
{
  "error": {
    "code": "EMAIL_ALREADY_EXISTS",
    "message": "A user with this email already exists",
    "details": {
      "field": "email",
      "value": "user@example.com"
    },
    "request_id": "req-abc123",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### Rate Limit Error
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "details": {
      "retry_after": 60,
      "limit": 100,
      "window": "1 hour"
    },
    "request_id": "req-def456",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

## Exception Hierarchy

### Base Exception Class

```python
from enum import Enum
from typing import Any, Optional
from datetime import datetime
import uuid

class ErrorCode(str, Enum):
    """Standard error codes for the application."""
    # Client errors (4xx)
    VALIDATION_ERROR = "VALIDATION_ERROR"
    RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND"
    UNAUTHORIZED = "UNAUTHORIZED"
    FORBIDDEN = "FORBIDDEN"
    CONFLICT = "CONFLICT"
    BAD_REQUEST = "BAD_REQUEST"
    RATE_LIMITED = "RATE_LIMITED"

    # Business logic errors
    EMAIL_ALREADY_EXISTS = "EMAIL_ALREADY_EXISTS"
    INSUFFICIENT_BALANCE = "INSUFFICIENT_BALANCE"
    INVALID_STATE_TRANSITION = "INVALID_STATE_TRANSITION"

    # Server errors (5xx)
    INTERNAL_ERROR = "INTERNAL_ERROR"
    SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE"
    UPSTREAM_ERROR = "UPSTREAM_ERROR"

class AppError(Exception):
    """Base application error with structured information."""

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
        self.request_id = None  # Set by middleware
        self.timestamp = datetime.utcnow()
        super().__init__(self.message)

    def to_dict(self) -> dict:
        """Convert error to dictionary for JSON response."""
        return {
            "error": {
                "code": self.code.value,
                "message": self.message,
                "details": self.details,
                "request_id": self.request_id,
                "timestamp": self.timestamp.isoformat() + "Z"
            }
        }
```

### Specific Exception Classes

```python
class ValidationError(AppError):
    """Validation error with field-level details."""

    def __init__(self, message: str = "Validation failed", field_errors: dict = None):
        super().__init__(
            code=ErrorCode.VALIDATION_ERROR,
            message=message,
            details={"fields": field_errors or {}},
            status_code=422
        )

class NotFoundError(AppError):
    """Resource not found error."""

    def __init__(self, resource_type: str, resource_id: str):
        super().__init__(
            code=ErrorCode.RESOURCE_NOT_FOUND,
            message=f"{resource_type} with id {resource_id} not found",
            details={
                "resource_type": resource_type,
                "resource_id": resource_id
            },
            status_code=404
        )

class UnauthorizedError(AppError):
    """Authentication required error."""

    def __init__(self, message: str = "Authentication required"):
        super().__init__(
            code=ErrorCode.UNAUTHORIZED,
            message=message,
            status_code=401,
            headers={"WWW-Authenticate": "Bearer"}
        )

class ForbiddenError(AppError):
    """Authorization denied error."""

    def __init__(self, message: str = "You don't have permission to access this resource"):
        super().__init__(
            code=ErrorCode.FORBIDDEN,
            message=message,
            status_code=403
        )

class ConflictError(AppError):
    """Resource conflict error."""

    def __init__(self, message: str, field: str = None, value: str = None):
        details = {}
        if field:
            details["field"] = field
        if value:
            details["value"] = value

        super().__init__(
            code=ErrorCode.CONFLICT,
            message=message,
            details=details,
            status_code=409
        )

class RateLimitError(AppError):
    """Rate limit exceeded error."""

    def __init__(self, retry_after: int = 60, limit: int = None, window: str = None):
        details = {"retry_after": retry_after}
        if limit:
            details["limit"] = limit
        if window:
            details["window"] = window

        super().__init__(
            code=ErrorCode.RATE_LIMITED,
            message="Too many requests. Please try again later.",
            details=details,
            status_code=429,
            headers={"Retry-After": str(retry_after)}
        )

class InternalError(AppError):
    """Internal server error."""

    def __init__(self, message: str = "An unexpected error occurred"):
        super().__init__(
            code=ErrorCode.INTERNAL_ERROR,
            message=message,
            status_code=500
        )

class ServiceUnavailableError(AppError):
    """Service temporarily unavailable."""

    def __init__(self, message: str = "Service temporarily unavailable", retry_after: int = 60):
        super().__init__(
            code=ErrorCode.SERVICE_UNAVAILABLE,
            message=message,
            status_code=503,
            headers={"Retry-After": str(retry_after)}
        )
```

## Global Exception Handlers

### FastAPI Exception Handlers

```python
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
import structlog
import uuid

app = FastAPI()
logger = structlog.get_logger()

@app.exception_handler(AppError)
async def app_error_handler(request: Request, exc: AppError):
    """Handle custom application errors."""
    # Add request_id if not set
    if not exc.request_id:
        exc.request_id = str(uuid.uuid4())[:12]

    # Log the error
    logger.warning(
        "Application error",
        code=exc.code.value,
        message=exc.message,
        status_code=exc.status_code,
        path=str(request.url.path),
        method=request.method,
        request_id=exc.request_id
    )

    return JSONResponse(
        status_code=exc.status_code,
        headers=exc.headers,
        content=exc.to_dict()
    )

@app.exception_handler(RequestValidationError)
async def validation_error_handler(request: Request, exc: RequestValidationError):
    """Handle Pydantic validation errors."""
    request_id = str(uuid.uuid4())[:12]

    # Format field errors
    field_errors = {}
    for error in exc.errors():
        loc = ".".join(str(l) for l in error["loc"])
        if loc not in field_errors:
            field_errors[loc] = []
        field_errors[loc].append(error["msg"])

    logger.warning(
        "Validation error",
        field_errors=field_errors,
        path=str(request.url.path),
        request_id=request_id
    )

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Request validation failed",
                "details": {"fields": field_errors},
                "request_id": request_id,
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "path": str(request.url.path)
            }
        }
    )

@app.exception_handler(Exception)
async def generic_error_handler(request: Request, exc: Exception):
    """Handle unexpected errors."""
    request_id = str(uuid.uuid4())[:12]

    # Log full error with stack trace
    logger.error(
        "Unexpected error",
        error=str(exc),
        error_type=type(exc).__name__,
        path=str(request.url.path),
        method=request.method,
        request_id=request_id,
        exc_info=True
    )

    # Return generic error to client (don't expose details)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": {
                "code": "INTERNAL_ERROR",
                "message": "An unexpected error occurred. Please try again later.",
                "details": {},
                "request_id": request_id,
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }
        }
    )
```

## Structured Error Logging

### Setup Structured Logging

```python
import structlog
import logging

# Configure structlog
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()
```

### Logging Errors with Context

```python
def log_error(
    error: Exception,
    request: Request,
    user_id: Optional[int] = None,
    extra: Optional[dict] = None
):
    """Log error with full context."""
    log_data = {
        "error_type": type(error).__name__,
        "error_message": str(error),
        "path": str(request.url.path),
        "method": request.method,
        "user_id": user_id,
    }

    if isinstance(error, AppError):
        log_data.update({
            "code": error.code.value,
            "status_code": error.status_code,
            "request_id": error.request_id,
        })

    if extra:
        log_data.update(extra)

    logger.error("Error occurred", **log_data)

# Usage in endpoint
@router.get("/users/{user_id}")
async def get_user(
    user_id: int,
    request: Request,
    current_user: User = Depends(get_current_user)
):
    try:
        user = await user_service.get_user(user_id)
        if not user:
            raise NotFoundError("User", str(user_id))
        return user
    except AppError:
        raise  # Let global handler catch it
    except Exception as e:
        log_error(e, request, current_user.id)
        raise InternalError()
```

## Retry Logic & Circuit Breakers

### Exponential Backoff Retry

```python
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type
)

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception_type((ConnectionError, TimeoutError))
)
async def call_external_service():
    """Call external service with automatic retry."""
    async with httpx.AsyncClient() as client:
        response = await client.get("https://api.example.com/data")
        response.raise_for_status()
        return response.json()
```

### Circuit Breaker Pattern

```python
import asyncio
from async_timeout import timeout

class CircuitBreaker:
    """Simple circuit breaker implementation."""

    def __init__(self, failure_threshold: int = 5, timeout_duration: int = 60):
        self.failure_threshold = failure_threshold
        self.timeout_duration = timeout_duration
        self.failure_count = 0
        self.last_failure_time = None
        self.state = "CLOSED"  # CLOSED, OPEN, HALF_OPEN

    async def call(self, func, *args, **kwargs):
        """Execute function with circuit breaker protection."""
        if self.state == "OPEN":
            if (datetime.utcnow() - self.last_failure_time).seconds > self.timeout_duration:
                self.state = "HALF_OPEN"
            else:
                raise ServiceUnavailableError("Circuit breaker is OPEN")

        try:
            result = await func(*args, **kwargs)
            if self.state == "HALF_OPEN":
                self.state = "CLOSED"
                self.failure_count = 0
            return result
        except Exception as e:
            self.failure_count += 1
            self.last_failure_time = datetime.utcnow()

            if self.failure_count >= self.failure_threshold:
                self.state = "OPEN"
                logger.error(
                    "Circuit breaker opened",
                    failure_count=self.failure_count,
                    threshold=self.failure_threshold
                )

            raise

# Usage
circuit_breaker = CircuitBreaker()

async def call_with_protection():
    return await circuit_breaker.call(call_external_service)
```

## Best Practices

1. **Use Specific Error Codes**: Don't just return "ERROR" - use descriptive codes like "EMAIL_ALREADY_EXISTS"
2. **Include Request ID**: Always include request_id for correlation between logs and user reports
3. **Don't Expose Stack Traces**: Never return stack traces or internal errors to clients
4. **Log All Errors**: Use structured logging with full context
5. **Provide Actionable Messages**: Tell users what went wrong and how to fix it
6. **Use Appropriate Status Codes**: Match HTTP status to error type
7. **Implement Global Handlers**: Catch all exceptions at app level
8. **Monitor Error Rates**: Set up alerts for error spikes
9. **Document Error Codes**: Maintain a list of all error codes and their meanings
10. **Test Error Scenarios**: Write tests for error cases, not just happy paths

## Anti-Patterns to Avoid

❌ **Returning 500 for all errors**
```python
# Bad
except Exception:
    return {"error": "Something went wrong"}, 500
```

❌ **Exposing internal details**
```python
# Bad
except DatabaseError as e:
    return {"error": str(e)}, 500  # Leaks database info
```

❌ **Inconsistent error formats**
```python
# Bad - different formats in different endpoints
return {"error": "Not found"}  # Endpoint 1
return {"message": "Not found"}  # Endpoint 2
```

❌ **Not logging errors**
```python
# Bad
try:
    await operation()
except:
    pass  # Silent failure
```

❌ **Generic error messages**
```python
# Bad
raise Exception("An error occurred")

# Good
raise ValidationError("Email address must be valid", {"email": ["Invalid format"]})
```

## Quality Checklist

- [ ] All endpoints return consistent error format
- [ ] HTTP status codes match error types
- [ ] No sensitive data in error responses
- [ ] No stack traces exposed to clients
- [ ] Structured logging with request_id
- [ ] Request ID included in all error responses
- [ ] Global exception handlers configured
- [ ] Validation errors include field-level details
- [ ] Retry logic for external services
- [ ] Circuit breaker for critical dependencies
- [ ] Error monitoring/alerting set up
- [ ] Error codes documented
- [ ] Error scenarios tested

## Related Skills
- backend-api-routes
- backend-database
- backend-service-layer
- backend-testing

## Tools & Libraries
- FastAPI exception handlers
- Pydantic validation
- structlog (structured logging)
- tenacity (retry logic)
- Sentry / DataDog (error monitoring)

## References
- [FastAPI Error Handling](https://fastapi.tiangolo.com/tutorial/handling-errors/)
- [HTTP Status Codes](https://httpstatuses.com/)
- [Structured Logging Best Practices](https://www.structlog.org/)
- [Circuit Breaker Pattern](https://martinfowler.com/bliki/CircuitBreaker.html)
