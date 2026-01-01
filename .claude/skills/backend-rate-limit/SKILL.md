# backend-rate-limit

## Description
Rate limiting and throttling patterns to protect APIs from abuse and ensure fair resource usage.

## Core Principles
1. **Tiered Limits**: Different limits for different endpoints.
2. **User Identification**: Use API keys, IPs, or auth tokens.
3. **Graceful Degradation**: Return 429 with retry-after header.
4. **Distributed Ready**: Use Redis for multi-instance deployment.
