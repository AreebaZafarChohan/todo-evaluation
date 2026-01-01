# Backend-Config Module Structure Reference

```
src/
  config/
    index.ts                    # Config loader entry point
    defaults.ts                 # Default configuration values
    schema.ts                   # Environment validation schema
    environments/
      development.yaml          # Development settings
      staging.yaml              # Staging settings
      production.yaml           # Production settings
    secrets/
      .gitkeep                  # Placeholder (secrets not committed)
```

## Configuration File Structure

### `config/development.yaml`

```yaml
app:
  name: todo-app
  version: 1.0.0
  environment: development
  port: 3000
  logLevel: debug

services:
  api:
    baseUrl: http://localhost:3000
    timeout: 30000
    retryAttempts: 3

  database:
    host: localhost
    port: 5432
    name: todos_dev
    pool:
      min: 2
      max: 10

  redis:
    host: localhost
    port: 6379
    keyPrefix: todos:dev:

features:
  dark_mode: true
  new_dashboard: false
  debug_tools: true

limits:
  max_todos_per_user: 1000
  api_rate_limit: 100
```

### `config/production.yaml`

```yaml
app:
  name: todo-app
  version: 1.0.0
  environment: production
  port: 8080
  logLevel: warn

services:
  api:
    baseUrl: https://api.example.com
    timeout: 30000
    retryAttempts: 3

  database:
    host: db.example.com
    port: 5432
    name: todos_prod
    pool:
      min: 5
      max: 20

  redis:
    host: redis.example.com
    port: 6379
    keyPrefix: todos:prod:

features:
  dark_mode: true
  new_dashboard: false
  debug_tools: false

limits:
  max_todos_per_user: 10000
  api_rate_limit: 1000
```

## Usage Examples

### Loading Configuration

```typescript
// Load default (development) config
const config = new ConfigLoader().load();

// Load specific environment
const config = new ConfigLoader().load('production');

// Get single value
const port = config.get('app.port');
```

### Environment Validation

```typescript
// Validate environment variables
import { env } from './schema';

if (env.NODE_ENV === 'production') {
  console.log('Running in production mode');
}

// Type-safe access
const dbHost: string = env.DATABASE_HOST;
const dbPort: number = env.DATABASE_PORT;
```

### Hot Reload Configuration

```typescript
// Watch for config changes
const config = new ConfigLoader();
config.load();

if (process.env.NODE_ENV === 'development') {
  // Watch for file changes in development
  fs.watch('./config', { recursive: true }, () => {
    config.reload();
    console.log('Configuration reloaded');
  });
}
```

## Configuration Categories

| Category | Variables | Source | Sensitive |
|----------|-----------|--------|-----------|
| App | APP_ENV, APP_PORT, LOG_LEVEL | System | No |
| Database | DATABASE_URL, DB_* | Secrets | Yes |
| JWT | JWT_SECRET, JWT_* | Secrets | Yes |
| Redis | REDIS_URL, REDIS_* | Secrets | Yes |
| API Keys | API_KEY, *_API_KEY | Secrets | Yes |
| Features | FEATURE_* | Config | No |

## Best Practices

1. **12-Factor Compliance**: All config in environment
2. **Secrets Management**: Never commit secrets
3. **Validation**: Validate at startup
4. **Defaults**: Provide sensible defaults
5. **Documentation**: Document all config options
6. **Hot Reload**: Support config changes in dev
