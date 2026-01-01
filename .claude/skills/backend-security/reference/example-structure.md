# Backend Security Module Structure Reference

```
src/
  infrastructure/
    security/
      headers/
        security-headers.ts    # Security header middleware
        cors.ts                # CORS configuration
      validation/
        sanitization.ts        # Input sanitization
        validation.ts          # Express-validator rules
      encryption/
        encrypt.ts             # Encryption utilities
      rate-limiting/
        rate-limiter.ts        # Rate limiting
```

## Security Headers

| Header | Purpose | Recommended Value |
|--------|---------|-------------------|
| X-Frame-Options | Clickjacking protection | SAMEORIGIN |
| X-Content-Type-Options | MIME sniffing | nosniff |
| X-XSS-Protection | XSS filter | 1; mode=block |
| Strict-Transport-Security | HTTPS enforcement | max-age=31536000 |
| Content-Security-Policy | XSS and injection prevention | Policy defined per app |
| Referrer-Policy | Referrer information control | strict-origin |

## Input Sanitization

```typescript
// Sanitize user input
function sanitizeUserInput(input: string): string {
  return input
    .trim()
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '');
}
```

## Common Security Checks

1. **SQL Injection**: Use parameterized queries
2. **XSS**: Sanitize and escape output
3. **CSRF**: Use anti-CSRF tokens
4. **Rate Limiting**: Prevent brute force
5. **Authentication**: Strong password policies
6. **Authorization**: Role-based access control

## Security Checklist

- [ ] All endpoints require authentication
- [ ] Sensitive data is encrypted
- [ ] Input is validated and sanitized
- [ ] Security headers are set
- [ ] Rate limiting is enabled
- [ ] Logging captures security events
- [ ] Dependencies are audited
