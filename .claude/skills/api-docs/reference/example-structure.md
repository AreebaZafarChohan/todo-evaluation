# API Docs Module Structure Reference

```
src/
  docs/
    openapi.yaml           # Main OpenAPI specification
    components.yaml        # Reusable components
    paths/
      users.yaml           # User endpoints
      posts.yaml           # Post endpoints
      auth.yaml            # Auth endpoints
  config/
    swagger.ts             # Swagger UI setup
    openapi.ts             # Spec generation
  routes/
    user.routes.ts         # With inline JSDoc annotations
```

## Auto-Generation Workflow

```
Code Changes
    ↓
JSDoc Comments in Routes
    ↓
swagger-jsdoc parsing
    ↓
openapi.json spec
    ↓
Swagger UI / Redoc
```

## Endpoints Documentation Pattern

```
/paths/
  /users.yaml          # GET, POST /users
  /users/{id}.yaml     # GET, PUT, DELETE /users/{id}
  /auth.yaml           # POST /auth/login, /auth/register
```

## Tools Stack

- **swagger-jsdoc**: Parse JSDoc → OpenAPI spec
- **swagger-ui**: Interactive API docs UI
- **@apidevtools/swagger-parser**: Spec validation
- **openapi-format**: Merge and format multi-file specs
```

## Versioning Strategy

```
/api-docs/v1.0/  → Current stable
/api-docs/v1.1/  → Next version (in development)
/api-docs/latest → Redirects to v1.1
```
