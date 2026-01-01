import { Request, Response, NextFunction } from 'express';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

interface RateLimitConfig {
  windowMs: number;      // Time window in ms
  maxRequests: number;   // Max requests per window
  keyPrefix: string;     // Redis key prefix
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export function createRateLimiter(config: RateLimitConfig) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Determine client key (auth user ID or IP)
    const key = (req as any).user?.id
      ? `${config.keyPrefix}:user:${(req as any).user.id}`
      : `${config.keyPrefix}:ip:${req.ip}`;

    const now = Date.now();
    const windowStart = now - config.windowMs;

    // Use Redis sorted set for sliding window
    const pipeline = redis.pipeline();
    pipeline.zadd(key, now, `${now}:${Math.random()}`);
    pipeline.zremrangebyscore(key, 0, windowStart);
    pipeline.zcard(key);
    pipeline.expire(key, Math.ceil(config.windowMs / 1000));

    const results = await pipeline.exec();
    const requestCount = results?.[2]?.[1] as number || 0;

    // Set rate limit headers
    res.set({
      'X-RateLimit-Limit': String(config.maxRequests),
      'X-RateLimit-Remaining': String(Math.max(0, config.maxRequests - requestCount)),
      'X-RateLimit-Reset': String(Math.ceil((now + config.windowMs) / 1000)),
    });

    if (requestCount > config.maxRequests) {
      const retryAfter = Math.ceil(config.windowMs / 1000);
      res.set('Retry-After', String(retryAfter));
      res.status(429).json({
        error: {
          code: 'RATE_LIMITED',
          message: 'Too many requests. Please try again later.',
          details: {
            retryAfter,
            limit: config.maxRequests,
            window: `${config.windowMs / 1000}s`,
          },
        },
      });
      return;
    }

    next();
  };
}

// Pre-configured limiters
export const strictLimiter = createRateLimiter({
  windowMs: 60 * 1000,      // 1 minute
  maxRequests: 10,
  keyPrefix: 'ratelimit:strict',
});

export const standardLimiter = createRateLimiter({
  windowMs: 60 * 1000,      // 1 minute
  maxRequests: 100,
  keyPrefix: 'ratelimit:standard',
});

export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,
  keyPrefix: 'ratelimit:auth',
  skipSuccessfulRequests: true,
});
