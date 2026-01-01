# Rate Limiting Module Structure Reference

```
src/
  rate-limit/
    middleware/
      rate-limiter.ts     # Express middleware
      token-bucket.ts     # Token bucket algorithm
    strategies/
      sliding-window.ts   # Sliding window counter
      fixed-window.ts     # Fixed window counter
      leaky-bucket.ts     # Leaky bucket algorithm
```

## Limiting Strategies

| Strategy | Pros | Cons |
|----------|------|------|
| Fixed Window | Simple, memory efficient | Burst at window boundary |
| Sliding Window | Smooth limits | More complex |
| Token Bucket | Allows bursts | Requires sync |
| Leaky Bucket | Smooth output | Strict rate only |

## Usage

```typescript
// Apply to routes
app.use('/api/', standardLimiter);
app.post('/auth/login', authLimiter);

// Custom limiter
const uploadLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 50,
  keyPrefix: 'ratelimit:upload',
});
```
