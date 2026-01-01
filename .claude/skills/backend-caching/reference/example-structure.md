# Caching Module Structure Reference

```
src/
  cache/
    redis-cache.ts        # Redis cache service
    memory-cache.ts       # In-memory LRU cache
    cache-aside.ts        # Cache-aside pattern
    cache-manager.ts      # Multi-layer cache
```

## Cache Layers

```
Request
  ↓
L1: Memory Cache (fast, local)
  ↓
L2: Redis Cache (distributed)
  ↓
Database (source of truth)
```

## Cache-Aside Pattern

```typescript
async function getUser(id: number): Promise<User> {
  // 1. Check memory cache
  let user = memoryCache.get(`user:${id}`);
  if (user) return user;

  // 2. Check Redis
  user = await cache.get(`user:${id}`);
  if (user) {
    memoryCache.set(`user:${id}`, user);
    return user;
  }

  // 3. Fetch from database
  user = await db.users.findById(id);
  if (user) {
    await cache.set(`user:${id}`, user);
    memoryCache.set(`user:${id}`, user);
  }

  return user;
}
```

## TTL Guidelines

| Data Type | TTL | Invalidation |
|-----------|-----|--------------|
| User profile | 5 min | On update |
| Session | 24h | On logout |
| Static config | 1h | On deploy |
| List data | 1 min | Event-driven |
