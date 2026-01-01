# Middleware Module Structure Reference

```
src/
  middleware/
    cors.ts              # CORS handling
    compression.ts       # Response compression
    security-headers.ts  # Security headers
    rate-limit.ts        # Rate limiting
    logging.ts           # Request logging
    auth.ts              # Authentication
    validation.ts        # Input validation
    tracing.ts           # Request tracing
```

## Middleware Execution Order

```
1. Request incoming
2. tracing (add request-id)
3. security-headers
4. compression
5. cors
6. rate-limit
7. body-parser / json
8. logging
9. auth (JWT verification)
10. validation
11. Route handler
12. error-handler
13. Response
```

## Custom Middleware Pattern

```typescript
// Factory function for configurable middleware
export function createCustomMiddleware(option: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Access req, res, next
    req.headers['x-custom'] = option;

    // Can call next() or send response directly
    next();
  };
}
```
