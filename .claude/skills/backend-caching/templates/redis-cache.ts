import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

interface CacheOptions {
  ttl?: number;           // Time to live in seconds
  namespace?: string;
  prefix?: string;
}

export class CacheService {
  private namespace: string;
  private defaultTtl: number;

  constructor(namespace: string = 'app', defaultTtl: number = 3600) {
    this.namespace = namespace;
    this.defaultTtl = defaultTtl;
  }

  private key(key: string): string {
    return `${this.namespace}:${key}`;
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await redis.get(this.key(key));
    if (!value) return null;

    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  }

  async set(key: string, value: unknown, options?: CacheOptions): Promise<void> {
    const ttl = options?.ttl || this.defaultTtl;
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);

    await redis.setex(this.key(key), ttl, serialized);
  }

  async delete(key: string): Promise<void> {
    await redis.del(this.key(key));
  }

  async deletePattern(pattern: string): Promise<void> {
    const keys = await redis.keys(this.key(pattern));
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }

  async exists(key: string): Promise<boolean> {
    return (await redis.exists(this.key(key))) === 1;
  }

  async increment(key: string, amount: number = 1): Promise<number> {
    return await redis.incrby(this.key(key), amount);
  }

  // Cache-aside pattern
  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    options?: CacheOptions
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await fetchFn();
    await this.set(key, value, options);
    return value;
  }

  // Distributed lock for cache stampede prevention
  async withLock<T>(
    lockKey: string,
    fn: () => Promise<T>,
    lockTtl: number = 10
  ): Promise<T> {
    const lock = await redis.set(
      `${this.namespace}:lock:${lockKey}`,
      '1',
      'EX',
      lockTtl,
      'NX'
    );

    if (lock === 'OK') {
      try {
        return await fn();
      } finally {
        await redis.del(`${this.namespace}:lock:${lockKey}`);
      }
    }

    // Wait and retry
    await new Promise(resolve => setTimeout(resolve, 100));
    return this.getOrSet(lockKey, fn);
  }
}

export const cache = new CacheService('{{projectName}}', 3600);
