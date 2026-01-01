# backend-api-routes

## Description
Comprehensive guide for designing and implementing RESTful API routes including routing patterns, HTTP methods, status codes, versioning, and resource naming conventions.

## Purpose
This skill provides best practices and patterns for designing clean, maintainable, and scalable API routes. It covers RESTful principles, resource naming, versioning strategies, and common patterns used in production APIs.

## Core Principles

1. **RESTful Design**: Follow REST architectural constraints for predictable APIs
2. **Consistency**: Maintain uniform patterns across all endpoints
3. **Discoverability**: Use HATEOAS principles for API navigation
4. **Versioning**: Plan for API evolution from the start
5. **Security**: Implement authentication and authorization at route level

## When to Use

- Designing new API endpoints
- Refactoring existing routes for consistency
- Implementing versioning strategy
- Creating resource hierarchies
- Standardizing error responses
- Adding pagination, filtering, and sorting

## RESTful Design Patterns

### HTTP Methods

| Method | Usage | Idempotent | Safe |
|--------|-------|------------|------|
| GET | Retrieve resource(s) | Yes | Yes |
| POST | Create new resource | No | No |
| PUT | Replace entire resource | Yes | No |
| PATCH | Partial update | No | No |
| DELETE | Delete resource | Yes | No |
| HEAD | Get headers only | Yes | Yes |
| OPTIONS | Get allowed methods | Yes | Yes |

### Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET/PUT/PATCH |
| 201 | Created | Successful POST (return Location header) |
| 204 | No Content | Successful DELETE or PUT with no response body |
| 400 | Bad Request | Validation error, malformed request |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Authenticated but insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 405 | Method Not Allowed | Wrong HTTP method used |
| 409 | Conflict | Resource conflict (duplicate, version mismatch) |
| 422 | Unprocessable Entity | Validation passed but business logic failed |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Unexpected server error |
| 503 | Service Unavailable | Temporary unavailability |

### Resource Naming Conventions

**Rules:**
- ✅ Use **nouns**, not verbs: `/users` not `/getUsers`
- ✅ Use **plural** names: `/users` not `/user`
- ✅ Use **hyphens** for multi-word: `/user-profiles` not `/userProfiles`
- ✅ Use **lowercase**: `/api/v1/users` not `/API/V1/Users`
- ✅ Nest resources logically: `/users/{id}/posts`
- ✅ Keep URLs short and intuitive
- ❌ Avoid deep nesting (max 2-3 levels)

### Standard URL Structure

```
GET    /api/v1/resources              # List all (with pagination)
GET    /api/v1/resources/{id}         # Get one by ID
POST   /api/v1/resources              # Create new
PUT    /api/v1/resources/{id}         # Replace entire resource
PATCH  /api/v1/resources/{id}         # Partial update
DELETE /api/v1/resources/{id}         # Delete

# Nested resources
GET    /api/v1/users/{id}/posts       # Get user's posts
POST   /api/v1/users/{id}/posts       # Create post for user
GET    /api/v1/users/{id}/posts/{postId}  # Get specific post

# Actions (when REST doesn't fit)
POST   /api/v1/users/{id}/activate    # Action: activate user
POST   /api/v1/orders/{id}/cancel     # Action: cancel order
```

## Versioning Strategy

### URL Versioning (Recommended)
```
/api/v1/users
/api/v2/users
```

**Pros:**
- Clear and explicit
- Easy to test and debug
- Simple routing

### Header Versioning (Alternative)
```
Accept: application/vnd.myapi.v1+json
Accept: application/vnd.myapi.v2+json
```

**Pros:**
- Clean URLs
- Better for media type negotiation

### Breaking Changes Rules
- ❌ Never remove fields from responses
- ❌ Never change field types (string → number)
- ❌ Never change semantic meaning
- ✅ Add new optional fields
- ✅ Add new endpoints
- ✅ Deprecate old endpoints with warnings

### Deprecation Strategy
```json
{
  "deprecated": true,
  "deprecation_date": "2024-06-01",
  "sunset_date": "2024-12-01",
  "migration_guide": "https://api.example.com/docs/migrations/v1-to-v2",
  "data": {...}
}
```

## Query Parameters

### Filtering
```
GET /api/v1/users?status=active
GET /api/v1/users?role=admin&department=engineering
GET /api/v1/users?created_after=2024-01-01
GET /api/v1/posts?author_id=123&published=true
```

### Sorting
```
GET /api/v1/users?sort=name           # Ascending
GET /api/v1/users?sort=-created_at    # Descending (- prefix)
GET /api/v1/users?sort=name,-created_at  # Multiple fields
```

### Pagination (Offset-based)
```
GET /api/v1/users?page=1&page_size=20
```

Response:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total_items": 100,
    "total_pages": 5
  },
  "links": {
    "first": "/api/v1/users?page=1&page_size=20",
    "prev": null,
    "self": "/api/v1/users?page=1&page_size=20",
    "next": "/api/v1/users?page=2&page_size=20",
    "last": "/api/v1/users?page=5&page_size=20"
  }
}
```

### Pagination (Cursor-based)
Better for large datasets and real-time data:

```
GET /api/v1/users?cursor=abc123&limit=20
```

Response:
```json
{
  "data": [...],
  "pagination": {
    "next_cursor": "xyz789",
    "has_more": true,
    "limit": 20
  }
}
```

### Field Selection (Sparse Fieldsets)
```
GET /api/v1/users?fields=id,name,email
GET /api/v1/users/{id}?fields=name,email,profile.avatar
```

### Search
```
GET /api/v1/users?q=john
GET /api/v1/products?search=laptop&category=electronics
```

## HATEOAS Implementation

### Response with Links
```json
{
  "data": {
    "id": "123",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "links": {
    "self": "/api/v1/users/123",
    "posts": "/api/v1/users/123/posts",
    "update": "/api/v1/users/123",
    "delete": "/api/v1/users/123",
    "avatar": "/api/v1/users/123/avatar"
  }
}
```

### Collection with Links
```json
{
  "data": [...],
  "links": {
    "self": "/api/v1/users?page=2",
    "first": "/api/v1/users?page=1",
    "prev": "/api/v1/users?page=1",
    "next": "/api/v1/users?page=3",
    "last": "/api/v1/users?page=10"
  }
}
```

## Error Response Standard

### Standard Error Format
```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "User with id 123 not found",
    "details": {
      "resource": "user",
      "id": "123"
    },
    "request_id": "req_abc123xyz",
    "timestamp": "2024-01-15T10:30:00Z",
    "path": "/api/v1/users/123"
  }
}
```

### Validation Errors
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": {
      "fields": {
        "email": ["Invalid email format"],
        "age": ["Must be at least 18"]
      }
    },
    "request_id": "req_abc123xyz",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

## Best Practices

### 1. Consistency
- Same URL structure across similar resources
- Same response format for all operations
- Same error format across all endpoints
- Consistent date/time format (ISO 8601)

### 2. Documentation
```python
# OpenAPI/Swagger annotations
@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(user_id: str):
    """
    Get user by ID

    - **user_id**: UUID of the user
    Returns user object with profile information
    """
    pass
```

### 3. Security
- ✅ Authentication on all non-public endpoints
- ✅ Authorization checks per resource
- ✅ Input validation on all inputs
- ✅ Rate limiting
- ✅ CORS configuration
- ✅ HTTPS only in production

### 4. Performance
- ✅ Implement caching headers (ETag, Cache-Control)
- ✅ Use compression (gzip)
- ✅ Paginate large collections
- ✅ Support field selection to reduce payload
- ✅ Database query optimization

### 5. Idempotency
For non-idempotent operations (POST), use idempotency keys:

```
POST /api/v1/orders
Idempotency-Key: unique-key-123

# Same request with same key returns cached result
```

## Anti-Patterns to Avoid

1. ❌ **Verbs in URLs**: `/getUsers`, `/createUser`
   - ✅ Use: `GET /users`, `POST /users`

2. ❌ **Mixing conventions**: `/api/users`, `/api/getUserById`
   - ✅ Use: Consistent REST patterns

3. ❌ **Exposing internal IDs**: `/users/internal_db_id_12345`
   - ✅ Use: UUIDs or opaque identifiers

4. ❌ **Deep nesting**: `/users/123/posts/456/comments/789/likes`
   - ✅ Use: `/comments/789/likes`

5. ❌ **Over-fetching**: Returning all fields always
   - ✅ Support field selection

6. ❌ **Ignoring HTTP methods**: Using POST for everything
   - ✅ Use appropriate HTTP verbs

7. ❌ **Custom status codes**: 299 for "almost success"
   - ✅ Use standard HTTP codes

## Implementation Examples

### FastAPI Example
```python
from fastapi import APIRouter, HTTPException, status

router = APIRouter(prefix="/api/v1/users", tags=["users"])

@router.get("", response_model=List[UserResponse])
async def list_users(
    page: int = 1,
    page_size: int = 20,
    status: Optional[str] = None,
    sort: str = "-created_at"
):
    """List users with pagination and filtering"""
    pass

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: str):
    """Get user by ID"""
    user = await db.get_user(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "USER_NOT_FOUND", "message": f"User {user_id} not found"}
        )
    return user

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_user(user: UserCreate):
    """Create new user"""
    return await db.create_user(user)

@router.patch("/{user_id}")
async def update_user(user_id: str, updates: UserUpdate):
    """Partially update user"""
    return await db.update_user(user_id, updates)

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: str):
    """Delete user"""
    await db.delete_user(user_id)
```

## Quality Checklist

- [ ] URL follows REST naming conventions (nouns, plural, lowercase)
- [ ] Correct HTTP methods used (GET, POST, PUT, PATCH, DELETE)
- [ ] Appropriate status codes returned (200, 201, 204, 400, 404, etc.)
- [ ] Consistent error format across all endpoints
- [ ] Proper versioning strategy in place (/api/v1/)
- [ ] Pagination implemented for list endpoints
- [ ] Filtering and sorting supported where appropriate
- [ ] Field selection (sparse fieldsets) available
- [ ] HATEOAS links included in responses
- [ ] OpenAPI/Swagger documentation complete
- [ ] Authentication/authorization implemented
- [ ] Input validation on all endpoints
- [ ] Rate limiting configured
- [ ] Caching headers set appropriately
- [ ] CORS configured correctly
- [ ] Request/response examples in docs

## Related Skills
- backend-database
- backend-jwt-auth
- backend-error-handling
- backend-query-params
- backend-service-layer

## Tools & Libraries
- FastAPI / Express / Django REST Framework
- OpenAPI/Swagger for documentation
- Pydantic for validation (Python)
- Zod for validation (TypeScript)

## References
- [REST API Design Best Practices](https://restfulapi.net/)
- [HTTP Status Codes](https://httpstatuses.com/)
- [OpenAPI Specification](https://swagger.io/specification/)
- [API Design Patterns](https://www.apiguide.dev/)
