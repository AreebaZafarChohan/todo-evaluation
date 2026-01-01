import * as dotenv from 'dotenv';
import { cleanEnv, str, num, bool, host, port } from 'envalid';

// Load .env file
dotenv.config();

export const env = cleanEnv(process.env, {
  // App Configuration
  NODE_ENV: str({
    choices: ['development', 'staging', 'production', 'test'],
    default: 'development',
  }),
  APP_PORT: port({ default: 3000 }),
  APP_LOG_LEVEL: str({
    choices: ['debug', 'info', 'warn', 'error'],
    default: 'info',
  }),

  // Database Configuration
  DATABASE_HOST: host({ default: 'localhost' }),
  DATABASE_PORT: port({ default: 5432 }),
  DATABASE_NAME: str({ default: 'app_dev' }),
  DATABASE_USER: str(),
  DATABASE_PASSWORD: str(),
  DATABASE_POOL_MIN: num({ default: 2 }),
  DATABASE_POOL_MAX: num({ default: 10 }),

  // Redis Configuration
  REDIS_HOST: host({ default: 'localhost' }),
  REDIS_PORT: port({ default: 6379 }),
  REDIS_PASSWORD: str({ default: '' }),

  // JWT Configuration
  JWT_SECRET: str(),
  JWT_EXPIRES_IN: str({ default: '7d' }),
  JWT_REFRESH_SECRET: str(),
  JWT_REFRESH_EXPIRES_IN: str({ default: '30d' }),

  // OAuth Configuration
  GOOGLE_CLIENT_ID: str({ default: '' }),
  GOOGLE_CLIENT_SECRET: str({ default: '' }),

  // External Services
  API_BASE_URL: str({ default: 'http://localhost:3000' }),
  EXTERNAL_API_KEY: str({ default: '' }),

  // Feature Flags
  FEATURE_DARK_MODE: bool({ default: true }),
  FEATURE_NEW_DASHBOARD: bool({ default: false }),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: num({ default: 60000 }),
  RATE_LIMIT_MAX_REQUESTS: num({ default: 100 }),

  // Security
  BCRYPT_ROUNDS: num({ default: 12 }),
  SESSION_SECRET: str(),
});

// Environment type for type safety
export type Environment = typeof env;

// Helper functions
export function isDevelopment(): boolean {
  return env.NODE_ENV === 'development';
}

export function isProduction(): boolean {
  return env.NODE_ENV === 'production';
}

export function isTest(): boolean {
  return env.NODE_ENV === 'test';
}

export function getDatabaseUrl(): string {
  return `postgresql://${env.DATABASE_USER}:${env.DATABASE_PASSWORD}@${env.DATABASE_HOST}:${env.DATABASE_PORT}/${env.DATABASE_NAME}`;
}

export function getRedisUrl(): string {
  const password = env.REDIS_PASSWORD ? `:${env.REDIS_PASSWORD}@` : '';
  return `redis://${password}${env.REDIS_HOST}:${env.REDIS_PORT}`;
}
