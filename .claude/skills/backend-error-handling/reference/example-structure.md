# Error Handling Module Structure Reference

```
src/
  errors/
    base.error.ts           # Base AppError class
    custom-errors.ts        # Specific error types
    error-codes.ts          # Error code constants
  middleware/
    error.middleware.ts     # Global error handler
  utils/
    retry.ts                # Retry utilities
    circuit-breaker.ts      # Circuit breaker
```

## Error Code Constants

```typescript
export const ERROR_CODES = {
  // Client errors (4xx)
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  BAD_REQUEST: 'BAD_REQUEST',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  RATE_LIMITED: 'RATE_LIMITED',
  UNPROCESSABLE_ENTITY: 'UNPROCESSABLE_ENTITY',

  // Server errors (5xx)
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  GATEWAY_TIMEOUT: 'GATEWAY_TIMEOUT',

  // Business logic errors
  EMAIL_EXISTS: 'EMAIL_EXISTS',
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  INVALID_OPERATION: 'INVALID_OPERATION',
} as const;
```

## Usage Pattern

```typescript
// Controller
try {
  const user = await userService.findById(id);
  if (!user) {
    throw new NotFoundError('User', id);
  }
  return user;
} catch (error) {
  if (error instanceof AppError) throw error;
  throw new InternalError('Failed to fetch user');
}

// Global handler catches and formats response
```
