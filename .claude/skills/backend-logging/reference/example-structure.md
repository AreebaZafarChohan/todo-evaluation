# Logging Module Structure Reference

```
src/
  logging/
    logger.ts           # Winston configuration
    formatters.ts       # Custom log formatters
    request-logger.ts   # Request context logger
```

## Log Levels

| Level | When to Use |
|-------|-------------|
| `error` | App failures, exceptions |
| `warn` | Recoverable issues, deprecated usage |
| `info` | Key business events, API calls |
| `debug` | Detailed troubleshooting |
| `trace` | Fine-grained flow details |

## Log Format

```json
{
  "level": "info",
  "message": "User logged in",
  "timestamp": "2024-01-15T10:30:00Z",
  "service": "auth-api",
  "requestId": "req-abc123",
  "userId": 456,
  "meta": {
    "method": "POST",
    "path": "/auth/login"
  }
}
```

## Sensitive Data Masking

```typescript
const sensitiveFields = ['password', 'token', 'secret', 'apiKey'];

function maskSensitiveData(obj: Record<string, unknown>) {
  const masked = { ...obj };
  for (const field of sensitiveFields) {
    if (masked[field]) {
      masked[field] = '***REDACTED***';
    }
  }
  return masked;
}
```
