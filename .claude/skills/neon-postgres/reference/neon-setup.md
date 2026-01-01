# Neon PostgreSQL Reference

## Connection Pattern

```typescript
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

// Usage
const users = await sql('SELECT * FROM users LIMIT 10');
```

## Environment Setup

```
DATABASE_URL=postgresql://user:password@ep-xyz.region.neon.tech/NeonDB?sslmode=require
```

## Connection Pooling

```typescript
import { Pool } from '@neondatabase/serverless';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
await pool.query('SELECT 1');
```

## Branch Management

```
Main Branch: ep-xyz (production)
Dev Branch: ep-xyz-dev (development)
Feature Branch: ep-xyz-feature-xyz (ephemeral)
```

## Best Practices

- Use connection pooling for serverless functions
- Set appropriate connection timeout
- Use environment variables for credentials
- Enable SSL for production connections
- Use branch isolation for development

## Scaling

| Plan | Max Connections | Compute |
|------|-----------------|---------|
| Free | 100 | 0.25 vCPU |
| Pro | 500 | 0.5 vCPU |
| Team | 1000 | 1 vCPU |
