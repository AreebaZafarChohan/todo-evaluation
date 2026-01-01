// Simple in-memory cache with LRU eviction
export class MemoryCache<T> {
  private cache: Map<string, { value: T; expiresAt: number }>;
  private maxSize: number;
  private defaultTtl: number;

  constructor(maxSize: number = 1000, defaultTtlMs: number = 3600000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.defaultTtl = defaultTtlMs;
  }

  private prune(): void {
    const now = Date.now();
    // Remove expired entries
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt < now) {
        this.cache.delete(key);
      }
    }

    // If still over max size, evict LRU
    while (this.cache.size > this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    if (entry.expiresAt < Date.now()) {
      this.cache.delete(key);
      return undefined;
    }

    // Move to end (LRU)
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.value;
  }

  set(key: string, value: T, ttlMs?: number): void {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + (ttlMs || this.defaultTtl),
    });
    this.prune();
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  get size(): number {
    return this.cache.size;
  }
}

// Singleton instance
export const memoryCache = new MemoryCache(1000);
