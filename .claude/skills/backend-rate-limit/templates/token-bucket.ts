import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export class TokenBucket {
  private readonly key: string;
  private readonly capacity: number;
  private readonly refillRate: number; // tokens per second
  private readonly ttl: number;

  constructor(
    identifier: string,
    capacity: number = 100,
    refillRate: number = 10
  ) {
    this.key = `token_bucket:${identifier}`;
    this.capacity = capacity;
    this.refillRate = refillRate;
    this.ttl = Math.ceil(capacity / refillRate) * 2;
  }

  async consume(tokens: number = 1): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const now = Date.now();
    const script = `
      local key = KEYS[1]
      local capacity = tonumber(ARGV[1])
      local refillRate = tonumber(ARGV[2])
      local now = tonumber(ARGV[3])
      local tokens = tonumber(ARGV[4])
      local ttl = tonumber(ARGV[5])

      -- Get current state
      local data = redis.call('HMGET', key, 'tokens', 'lastRefill')
      local currentTokens = tonumber(data[1]) or capacity
      local lastRefill = tonumber(data[2]) or now

      -- Calculate tokens to add
      local elapsed = (now - lastRefill) / 1000
      local newTokens = elapsed * refillRate
      currentTokens = math.min(capacity, currentTokens + newTokens)

      -- Try to consume
      local allowed = false
      if currentTokens >= tokens then
        currentTokens = currentTokens - tokens
        allowed = true
      end

      -- Update state
      redis.call('HMSET', key, 'tokens', currentTokens, 'lastRefill', now)
      redis.call('EXPIRE', key, ttl)

      return {allowed, math.floor(currentTokens), now + ((capacity - currentTokens) / refillRate * 1000)}
    `;

    const result = await redis.eval(
      script,
      1,
      this.key,
      this.capacity,
      this.refillRate,
      now,
      tokens,
      this.ttl
    ) as [boolean, number, number];

    return {
      allowed: result[0],
      remaining: result[1],
      resetTime: result[2],
    };
  }
}
