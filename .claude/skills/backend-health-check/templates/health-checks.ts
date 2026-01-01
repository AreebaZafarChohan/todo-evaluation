import { Request, Response, NextFunction } from 'express';

// Health check response types
export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: ISO8601Date;
  version: string;
  uptime: number;
  checks: HealthCheckResult[];
}

export interface HealthCheckResult {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  latencyMs: number;
  message?: string;
  details?: Record<string, unknown>;
}

// Health check registry
export class HealthCheckRegistry {
  private checks: Map<string, HealthCheckFn> = new Map();
  private lastResults: Map<string, HealthCheckResult> = new Map();
  private cacheTimeoutMs: number = 5000;
  private lastCacheUpdate: number = 0;

  constructor(options: { cacheTimeoutMs?: number } = {}) {
    this.cacheTimeoutMs = options.cacheTimeoutMs || 5000;
  }

  register(name: string, check: HealthCheckFn): void {
    this.checks.set(name, check);
  }

  async runAll(): Promise<HealthCheckResponse> {
    const results: HealthCheckResult[] = [];
    let hasUnhealthy = false;
    let hasDegraded = false;

    const promises = Array.from(this.checks.entries()).map(
      async ([name, check]) => {
        const start = Date.now();
        try {
          const result = await check();
          const latency = Date.now() - start;
          const healthResult: HealthCheckResult = {
            name,
            status: result.healthy ? 'healthy' : 'unhealthy',
            latencyMs: latency,
            message: result.message,
            details: result.details,
          };

          if (result.healthy === false) hasUnhealthy = true;
          if (result.healthy === 'degraded') hasDegraded = true;

          this.lastResults.set(name, healthResult);
          return healthResult;
        } catch (error) {
          const latency = Date.now() - start;
          const healthResult: HealthCheckResult = {
            name,
            status: 'unhealthy',
            latencyMs: latency,
            message: error instanceof Error ? error.message : 'Unknown error',
          };

          hasUnhealthy = true;
          this.lastResults.set(name, healthResult);
          return healthResult;
        }
      }
    );

    const checkedResults = await Promise.all(promises);

    return {
      status: hasUnhealthy ? 'unhealthy' : hasDegraded ? 'degraded' : 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.APP_VERSION || '1.0.0',
      uptime: process.uptime(),
      checks: checkedResults,
    };
  }

  async runWithCache(): Promise<HealthCheckResponse> {
    const now = Date.now();
    if (now - this.lastCacheUpdate < this.cacheTimeoutMs) {
      return {
        status: this.calculateOverallStatus(),
        timestamp: new Date().toISOString(),
        version: process.env.APP_VERSION || '1.0.0',
        uptime: process.uptime(),
        checks: Array.from(this.lastResults.values()),
      };
    }
    return this.runAll();
  }

  private calculateOverallStatus(): 'healthy' | 'degraded' | 'unhealthy' {
    const results = Array.from(this.lastResults.values());
    if (results.length === 0) return 'healthy';

    const hasUnhealthy = results.some(r => r.status === 'unhealthy');
    const hasDegraded = results.some(r => r.status === 'degraded');

    return hasUnhealthy ? 'unhealthy' : hasDegraded ? 'degraded' : 'healthy';
  }
}

// Health check function type
export type HealthCheckFn = () => Promise<{
  healthy: boolean | 'degraded';
  message?: string;
  details?: Record<string, unknown>;
}>;

// Common health check implementations
export async function databaseHealthCheck(
  query: () => Promise<unknown>
): Promise<{ healthy: boolean | 'degraded'; message?: string }> {
  try {
    const start = Date.now();
    await query();
    const latency = Date.now() - start;

    if (latency > 1000) {
      return { healthy: 'degraded', message: 'High latency' };
    }
    return { healthy: true };
  } catch (error) {
    return { healthy: false, message: 'Connection failed' };
  }
}

export async function memoryHealthCheck(): Promise<{
  healthy: boolean | 'degraded';
  details?: Record<string, unknown>;
}> {
  const used = process.memoryUsage();
  const maxHeap = 1024 * 1024 * 512; // 512MB limit
  const ratio = used.heapUsed / maxHeap;

  if (ratio > 0.9) {
    return { healthy: false, details: { used, maxHeap, ratio } };
  }
  if (ratio > 0.7) {
    return { healthy: 'degraded', details: { used, maxHeap, ratio } };
  }
  return { healthy: true, details: { used, maxHeap, ratio } };
}

export function diskSpaceHealthCheck(
  path: string,
  warnThreshold: number = 0.8
): HealthCheckFn {
  return async () => {
    const { available, total } = await getDiskSpace(path);
    const usedRatio = (total - available) / total;

    if (usedRatio > warnThreshold) {
      return { healthy: 'degraded', details: { available, total, usedRatio } };
    }
    return { healthy: true, details: { available, total, usedRatio } };
  };
}

async function getDiskSpace(path: string): Promise<{ available: number; total: number }> {
  const stat = await import('fs').then(fs => import('fs/promises').then(prom => ({
    available: (prom.statfs(await prom.realpath(path))).available,
    total: (prom.statfs(await prom.realpath(path))).blocks,
  })));
  return { available: stat.available, total: stat.total };
}

// Express middleware
export function createHealthCheckMiddleware(registry: HealthCheckRegistry) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const path = req.path;

    if (path === '/health' || path === '/health/live') {
      // Liveness probe - just check if process is running
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (path === '/health/ready' || path === '/health') {
      // Readiness probe - check all dependencies
      const health = await registry.runWithCache();
      const status = health.status === 'healthy' ? 200 :
                     health.status === 'degraded' ? 200 : 503;
      res.status(status).json(health);
      return;
    }

    next();
  };
}

// Singleton registry
export const healthRegistry = new HealthCheckRegistry();
