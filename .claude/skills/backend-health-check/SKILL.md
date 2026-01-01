# backend-health-check

## Description
Health check and readiness probe patterns for container orchestration and load balancer integration.

## Core Principles
1. **Liveness**: Am I alive? (restart if unhealthy)
2. **Readiness**: Am I ready to serve traffic?
3. **Deep Checks**: Verify dependencies, not just process.
4. **Caching**: Cache health status to avoid load spikes.
