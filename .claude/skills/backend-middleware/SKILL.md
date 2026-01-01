# backend-middleware

## Description
Express/Fastify middleware patterns for cross-cutting concerns like auth, logging, compression, and CORS.

## Core Principles
1. **Single Responsibility**: Each middleware does one thing.
2. **Order Matters**: Auth before logging, logging before business logic.
3. **Async Support**: Handle promises correctly.
4. **Reusability**: Design for multiple route contexts.
