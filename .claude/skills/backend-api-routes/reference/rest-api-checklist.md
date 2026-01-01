# REST API Design Checklist

## URL Design

### Naming Conventions
- [ ] Use nouns for resources, not verbs
- [ ] Use plural resource names (`/users` not `/user`)
- [ ] Use lowercase letters
- [ ] Use hyphens for multi-word resources (`/user-profiles`)
- [ ] Keep URLs short and intuitive
- [ ] Avoid deep nesting (max 2-3 levels)

### Examples
```
✅ GET /api/v1/users
✅ POST /api/v1/users
✅ GET /api/v1/users/{id}/posts

❌ GET /api/v1/getUsers
❌ POST /api/v1/user/create
❌ GET /api/v1/users/{id}/posts/{postId}/comments/{commentId}/likes
```

---

## HTTP Methods

- [ ] Use GET for retrieving resources
- [ ] Use POST for creating new resources
- [ ] Use PUT for replacing entire resources
- [ ] Use PATCH for partial updates
- [ ] Use DELETE for removing resources
- [ ] Ensure idempotency for GET, PUT, DELETE
- [ ] POST is not idempotent (handle duplicates)

### Method Matrix
| Operation | HTTP Method | URL | Success Code |
|-----------|-------------|-----|--------------|
| List all | GET | `/users` | 200 |
| Get one | GET | `/users/{id}` | 200 |
| Create | POST | `/users` | 201 |
| Replace | PUT | `/users/{id}` | 200 |
| Update | PATCH | `/users/{id}` | 200 |
| Delete | DELETE | `/users/{id}` | 204 |

---

## Status Codes

### Success Codes
- [ ] 200 OK - Successful GET, PUT, PATCH
- [ ] 201 Created - Successful POST (include Location header)
- [ ] 204 No Content - Successful DELETE

### Client Error Codes
- [ ] 400 Bad Request - Malformed request
- [ ] 401 Unauthorized - Missing/invalid auth
- [ ] 403 Forbidden - Insufficient permissions
- [ ] 404 Not Found - Resource doesn't exist
- [ ] 405 Method Not Allowed - Wrong HTTP method
- [ ] 409 Conflict - Resource conflict (duplicate, etc.)
- [ ] 422 Unprocessable Entity - Validation failed
- [ ] 429 Too Many Requests - Rate limit exceeded

### Server Error Codes
- [ ] 500 Internal Server Error - Unexpected error
- [ ] 503 Service Unavailable - Temporary downtime

---

## Request/Response Format

### Request Body
- [ ] Use JSON for request/response bodies
- [ ] Validate all input data
- [ ] Use consistent field naming (snake_case or camelCase)
- [ ] Include Content-Type header: `application/json`

### Response Body
- [ ] Return consistent JSON structure
- [ ] Include metadata (timestamps, IDs)
- [ ] Wrap data in "data" field for consistency
- [ ] Include links (HATEOAS) when appropriate

### Example Response
```json
{
  "data": {
    "id": "123",
    "name": "John Doe",
    "email": "john@example.com",
    "created_at": "2024-01-15T10:00:00Z"
  },
  "links": {
    "self": "/api/v1/users/123",
    "posts": "/api/v1/users/123/posts"
  }
}
```

---

## Pagination

- [ ] Implement pagination for list endpoints
- [ ] Use consistent pagination parameters
- [ ] Include pagination metadata in response
- [ ] Provide navigation links (first, prev, next, last)
- [ ] Set reasonable default page size (e.g., 20)
- [ ] Set maximum page size (e.g., 100)

### Offset-based Pagination
```
GET /api/v1/users?page=1&page_size=20
```

### Cursor-based Pagination
```
GET /api/v1/users?cursor=abc123&limit=20
```

---

## Filtering & Sorting

### Filtering
- [ ] Support filtering via query parameters
- [ ] Use intuitive filter names
- [ ] Support multiple filters
- [ ] Document all available filters

```
GET /api/v1/users?status=active&role=admin
```

### Sorting
- [ ] Support sorting via query parameter
- [ ] Use `-` prefix for descending order
- [ ] Support multi-field sorting

```
GET /api/v1/users?sort=name,-created_at
```

### Field Selection
- [ ] Allow clients to specify fields to return
- [ ] Reduce payload size for better performance

```
GET /api/v1/users?fields=id,name,email
```

---

## Versioning

- [ ] Include version in URL path (`/api/v1/`)
- [ ] Plan versioning strategy from day one
- [ ] Never remove fields in same version
- [ ] Never change field types in same version
- [ ] Provide migration guide for version changes
- [ ] Deprecate old versions with advance notice

### Deprecation Headers
```
Deprecation: true
Sunset: Sat, 01 Dec 2024 00:00:00 GMT
Link: <https://api.example.com/docs/migrations>; rel="deprecation"
```

---

## Error Handling

- [ ] Use consistent error response format
- [ ] Include error code for programmatic handling
- [ ] Provide human-readable error message
- [ ] Include request_id for debugging
- [ ] Add timestamp to errors
- [ ] Include field-level errors for validation

### Standard Error Format
```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "User with id 123 not found",
    "details": {"resource": "user", "id": "123"},
    "request_id": "req_abc123",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

---

## Security

### Authentication
- [ ] Implement authentication on non-public endpoints
- [ ] Use standard auth mechanisms (JWT, OAuth2)
- [ ] Include auth token in Authorization header
- [ ] Return 401 for missing/invalid auth
- [ ] Use HTTPS only in production

### Authorization
- [ ] Implement resource-level authorization
- [ ] Check permissions before operations
- [ ] Return 403 for insufficient permissions
- [ ] Don't leak existence of resources (404 vs 403)

### Input Validation
- [ ] Validate all user input
- [ ] Sanitize input to prevent injection
- [ ] Use schema validation (Pydantic, Zod)
- [ ] Return 400/422 for invalid input

### Rate Limiting
- [ ] Implement rate limiting per user/IP
- [ ] Return 429 when limit exceeded
- [ ] Include Retry-After header
- [ ] Document rate limits

---

## Performance

### Caching
- [ ] Set appropriate Cache-Control headers
- [ ] Use ETags for conditional requests
- [ ] Support If-None-Match header
- [ ] Return 304 Not Modified when appropriate

### Compression
- [ ] Enable gzip compression
- [ ] Support Accept-Encoding header
- [ ] Compress responses > 1KB

### Database Optimization
- [ ] Use indexes for frequently queried fields
- [ ] Avoid N+1 queries
- [ ] Use pagination to limit results
- [ ] Implement query result caching

---

## Documentation

### OpenAPI/Swagger
- [ ] Generate OpenAPI spec from code
- [ ] Include request/response examples
- [ ] Document all query parameters
- [ ] Document all error responses
- [ ] Keep documentation up-to-date

### API Documentation Should Include
- [ ] Authentication requirements
- [ ] Rate limits
- [ ] Pagination details
- [ ] Filtering/sorting options
- [ ] Example requests/responses
- [ ] Error codes and meanings
- [ ] Versioning policy
- [ ] Deprecation notices

---

## Testing

### Automated Tests
- [ ] Test all endpoints
- [ ] Test authentication/authorization
- [ ] Test input validation
- [ ] Test error handling
- [ ] Test pagination edge cases
- [ ] Test rate limiting

### Manual Testing
- [ ] Test with Postman/Insomnia
- [ ] Test error scenarios
- [ ] Test with invalid tokens
- [ ] Test with missing fields
- [ ] Test concurrent requests

---

## Monitoring & Logging

### Logging
- [ ] Log all API requests
- [ ] Include request_id in logs
- [ ] Log errors with stack traces
- [ ] Don't log sensitive data (passwords, tokens)

### Monitoring
- [ ] Monitor response times
- [ ] Track error rates
- [ ] Monitor rate limit usage
- [ ] Set up alerting for anomalies

### Metrics to Track
- [ ] Request count per endpoint
- [ ] Response time percentiles (p50, p95, p99)
- [ ] Error rate per endpoint
- [ ] Rate limit hits
- [ ] Active users

---

## Pre-Launch Checklist

### Before Going to Production
- [ ] All endpoints documented
- [ ] Authentication implemented
- [ ] Rate limiting configured
- [ ] HTTPS enforced
- [ ] CORS configured correctly
- [ ] Error handling complete
- [ ] Logging/monitoring set up
- [ ] Load testing completed
- [ ] Security audit done
- [ ] Backup strategy in place

### Post-Launch Monitoring
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Review logs for issues
- [ ] Track API usage patterns
- [ ] Gather user feedback
