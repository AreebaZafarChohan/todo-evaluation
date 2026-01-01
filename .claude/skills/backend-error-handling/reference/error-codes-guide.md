# Error Codes Reference Guide

## Standard HTTP Error Codes

### 4xx Client Errors

| Code | Name | When to Use | Retry? | Example |
|------|------|-------------|--------|---------|
| 400 | Bad Request | Malformed request syntax | No | Invalid JSON in request body |
| 401 | Unauthorized | Missing/invalid authentication | No | JWT token expired or missing |
| 403 | Forbidden | Valid auth but insufficient permissions | No | User trying to delete another user's post |
| 404 | Not Found | Resource doesn't exist | No | GET /users/999999 |
| 405 | Method Not Allowed | Wrong HTTP method | No | POST /users/123 (should be PATCH) |
| 409 | Conflict | Resource conflict or duplicate | Maybe | Email already exists |
| 422 | Unprocessable Entity | Validation or business logic failed | No | Password too weak |
| 429 | Too Many Requests | Rate limit exceeded | Yes | More than 100 requests/hour |

### 5xx Server Errors

| Code | Name | When to Use | Retry? | Example |
|------|------|-------------|--------|---------|
| 500 | Internal Server Error | Unexpected error | Maybe | Unhandled exception |
| 502 | Bad Gateway | Upstream service error | Yes | Payment gateway down |
| 503 | Service Unavailable | Server overloaded | Yes | Database connection pool exhausted |
| 504 | Gateway Timeout | Upstream timeout | Yes | External API took >30s |

---

## Application-Specific Error Codes

### Authentication & Authorization

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_CREDENTIALS` | 401 | Username/password incorrect |
| `TOKEN_EXPIRED` | 401 | JWT token has expired |
| `TOKEN_INVALID` | 401 | JWT token is malformed or tampered |
| `REFRESH_TOKEN_EXPIRED` | 401 | Refresh token has expired |
| `EMAIL_NOT_VERIFIED` | 403 | Email verification required |
| `ACCOUNT_SUSPENDED` | 403 | Account has been suspended |
| `INSUFFICIENT_PERMISSIONS` | 403 | User lacks required permission |

### Validation Errors

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 422 | Generic validation failure |
| `MISSING_REQUIRED_FIELD` | 422 | Required field not provided |
| `INVALID_EMAIL_FORMAT` | 422 | Email address format invalid |
| `PASSWORD_TOO_WEAK` | 422 | Password doesn't meet requirements |
| `INVALID_DATE_FORMAT` | 422 | Date format incorrect |
| `VALUE_OUT_OF_RANGE` | 422 | Numeric value outside valid range |

### Resource Errors

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `RESOURCE_NOT_FOUND` | 404 | Requested resource doesn't exist |
| `RESOURCE_ALREADY_EXISTS` | 409 | Duplicate resource (email, username) |
| `RESOURCE_LOCKED` | 423 | Resource is locked by another process |
| `RESOURCE_DELETED` | 410 | Resource was permanently deleted |

### Business Logic Errors

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INSUFFICIENT_BALANCE` | 422 | Not enough funds for transaction |
| `INVALID_STATE_TRANSITION` | 422 | Can't move from current state to requested state |
| `QUOTA_EXCEEDED` | 422 | User has exceeded their quota |
| `ORDER_ALREADY_PROCESSED` | 409 | Order can't be modified (already shipped) |
| `PRODUCT_OUT_OF_STOCK` | 422 | Product unavailable |
| `MINIMUM_AGE_REQUIRED` | 422 | User doesn't meet age requirement |

### Rate Limiting

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests in time window |
| `DAILY_LIMIT_REACHED` | 429 | Daily API call limit reached |
| `CONCURRENT_LIMIT_REACHED` | 429 | Too many concurrent requests |

### External Service Errors

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `PAYMENT_GATEWAY_ERROR` | 502 | Payment processor unavailable |
| `EMAIL_SERVICE_ERROR` | 502 | Email service unavailable |
| `EXTERNAL_API_TIMEOUT` | 504 | Third-party API timed out |
| `UPSTREAM_SERVICE_ERROR` | 502 | Generic upstream service error |

### Server Errors

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INTERNAL_ERROR` | 500 | Unexpected server error |
| `DATABASE_ERROR` | 500 | Database operation failed |
| `SERVICE_UNAVAILABLE` | 503 | Server in maintenance mode |
| `CONFIGURATION_ERROR` | 500 | Server misconfiguration |

---

## Error Code Naming Conventions

### Best Practices

✅ **Use UPPER_SNAKE_CASE**
```
EMAIL_ALREADY_EXISTS
INSUFFICIENT_BALANCE
```

✅ **Be specific and descriptive**
```
❌ Bad: ERROR, FAILED, INVALID
✅ Good: EMAIL_FORMAT_INVALID, PASSWORD_TOO_SHORT
```

✅ **Use noun + verb/adjective pattern**
```
RESOURCE_NOT_FOUND
TOKEN_EXPIRED
PAYMENT_FAILED
```

✅ **Group related codes with prefixes**
```
AUTH_TOKEN_EXPIRED
AUTH_TOKEN_INVALID
AUTH_CREDENTIALS_INVALID

PAYMENT_DECLINED
PAYMENT_TIMEOUT
PAYMENT_GATEWAY_ERROR
```

### Anti-Patterns

❌ **Don't use HTTP status codes as error codes**
```
Bad: "code": "404"
Good: "code": "USER_NOT_FOUND"
```

❌ **Don't use generic codes**
```
Bad: "code": "ERROR"
Good: "code": "EMAIL_ALREADY_EXISTS"
```

❌ **Don't include sensitive info in codes**
```
Bad: "code": "INVALID_PASSWORD_FOR_USER_123"
Good: "code": "INVALID_CREDENTIALS"
```

---

## Error Response Examples

### Validation Error
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": {
      "fields": {
        "email": ["Invalid email format"],
        "password": ["Must be at least 8 characters"]
      }
    },
    "request_id": "req_abc123",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### Resource Not Found
```json
{
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User with id 123 not found",
    "details": {
      "resource_type": "User",
      "resource_id": "123"
    },
    "request_id": "req_xyz789",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### Business Logic Error
```json
{
  "error": {
    "code": "INSUFFICIENT_BALANCE",
    "message": "Insufficient balance for this transaction",
    "details": {
      "balance": 50.00,
      "required": 100.00,
      "currency": "USD"
    },
    "request_id": "req_def456",
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
      "limit": 100,
      "window": "1 hour",
      "retry_after": 3600
    },
    "request_id": "req_ghi789",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

---

## Error Code Documentation Template

For each error code, document:

```markdown
### ERROR_CODE_NAME

**HTTP Status:** 422
**Description:** Short description of when this error occurs
**Retry:** No / Yes (with conditions)

**Causes:**
- User action that caused the error
- System condition that triggers it

**Resolution:**
- What the client should do to fix it
- Any user actions required

**Example Response:**
```json
{
  "error": {
    "code": "ERROR_CODE_NAME",
    "message": "Human-readable message",
    "details": {...}
  }
}
```

**Related Codes:**
- OTHER_RELATED_CODE
```

---

## Quick Reference: When to Use Which Code

| Scenario | Error Code | HTTP Status |
|----------|------------|-------------|
| User not logged in | `UNAUTHORIZED` | 401 |
| Invalid email/password | `INVALID_CREDENTIALS` | 401 |
| JWT expired | `TOKEN_EXPIRED` | 401 |
| User can't access resource | `FORBIDDEN` | 403 |
| Resource doesn't exist | `RESOURCE_NOT_FOUND` | 404 |
| Email already taken | `EMAIL_ALREADY_EXISTS` | 409 |
| Invalid input | `VALIDATION_ERROR` | 422 |
| Business rule violated | Custom code | 422 |
| Too many requests | `RATE_LIMIT_EXCEEDED` | 429 |
| Server crashed | `INTERNAL_ERROR` | 500 |
| External API down | `UPSTREAM_SERVICE_ERROR` | 502 |
| Database down | `SERVICE_UNAVAILABLE` | 503 |

---

## Maintaining Error Code Registry

Create a central registry file (`errors/codes.py`):

```python
from enum import Enum

class ErrorCode(str, Enum):
    """Central registry of all application error codes."""

    # Auth errors (401, 403)
    UNAUTHORIZED = "UNAUTHORIZED"
    TOKEN_EXPIRED = "TOKEN_EXPIRED"
    FORBIDDEN = "FORBIDDEN"

    # Validation errors (422)
    VALIDATION_ERROR = "VALIDATION_ERROR"
    EMAIL_INVALID = "EMAIL_INVALID"

    # Resource errors (404, 409)
    RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND"
    EMAIL_ALREADY_EXISTS = "EMAIL_ALREADY_EXISTS"

    # Business logic (422)
    INSUFFICIENT_BALANCE = "INSUFFICIENT_BALANCE"

    # Rate limiting (429)
    RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED"

    # Server errors (5xx)
    INTERNAL_ERROR = "INTERNAL_ERROR"
    SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE"
```

**Benefits:**
- Single source of truth
- Type safety (IDE autocomplete)
- Easy to audit and document
- Prevents duplicate codes
