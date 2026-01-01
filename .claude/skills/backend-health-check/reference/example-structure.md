# Backend Health Check Module Structure Reference

```
src/
  infrastructure/
    health/
      health-checks.ts         # Health check registry and utilities
      middleware.ts            # Express middleware
      checks/
        database.check.ts      # Database health check
        redis.check.ts         # Redis health check
        disk.check.ts          # Disk space check
```

## Health Check Endpoints

| Endpoint | Type | Purpose |
|----------|------|---------|
| `/health/live` | Liveness | Is the process running? |
| `/health/ready` | Readiness | Is the service ready to accept traffic? |
| `/health` | Full | Detailed health status |

## Kubernetes Probes Configuration

```yaml
# deployment.yaml
livenessProbe:
  httpGet:
    path: /health/live
    port: 8080
  initialDelaySeconds: 10
  periodSeconds: 30
  timeoutSeconds: 5
  failureThreshold: 3

readinessProbe:
  httpGet:
    path: /health/ready
    port: 8080
  initialDelaySeconds: 5
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 3

startupProbe:
  httpGet:
    path: /health
    port: 8080
  initialDelaySeconds: 0
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 30  # 5 minutes max startup
```

## Health Check Registration

```typescript
// Register health checks
healthRegistry.register('database', databaseHealthCheck);
healthRegistry.register('redis', redisHealthCheck);
healthRegistry.register('memory', memoryHealthCheck);
```

## Response Format

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0",
  "uptime": 3600,
  "checks": [
    {
      "name": "database",
      "status": "healthy",
      "latencyMs": 25,
      "details": { "connections": 10 }
    }
  ]
}
```

## Best Practices

1. **Caching**: Cache results to avoid load spikes
2. **Deep Checks**: Check actual connectivity, not just process
3. **Timeouts**: Set reasonable timeouts for each check
4. **Logging**: Log health check failures
5. **Aggregation**: Combine checks into overall status
