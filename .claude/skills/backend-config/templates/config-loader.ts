// Configuration loader with environment support
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

export interface AppConfig {
  app: {
    name: string;
    version: string;
    environment: string;
    port: number;
    logLevel: string;
  };
  services: {
    api: {
      baseUrl: string;
      timeout: number;
      retryAttempts: number;
    };
    database: {
      host: string;
      port: number;
      name: string;
      pool: {
        min: number;
        max: number;
      };
    };
    redis: {
      host: string;
      port: number;
      keyPrefix: string;
    };
  };
  features: {
    [key: string]: boolean;
  };
  limits: {
    maxTodosPerUser: number;
    apiRateLimit: number;
  };
}

export type Config = DeepPartial<AppConfig>;

type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;

class ConfigLoader {
  private config: AppConfig | null = null;
  private configPath: string;

  constructor(configPath: string = './config') {
    this.configPath = configPath;
  }

  load(environment?: string): AppConfig {
    if (this.config) return this.config;

    const env = environment || process.env.APP_ENV || 'development';
    const configFile = path.join(this.configPath, `${env}.yaml`);

    if (!fs.existsSync(configFile)) {
      throw new Error(`Configuration file not found: ${configFile}`);
    }

    const fileContents = fs.readFileSync(configFile, 'utf8');
    const baseConfig = yaml.load(fileContents) as AppConfig;

    // Merge with defaults
    this.config = this.mergeConfig(baseConfig, this.getDefaults());
    this.validateConfig(this.config);

    return this.config;
  }

  private getDefaults(): Partial<AppConfig> {
    return {
      app: {
        name: 'app',
        version: '1.0.0',
        environment: 'development',
        port: 3000,
        logLevel: 'info',
      },
      services: {
        api: {
          baseUrl: 'http://localhost:3000',
          timeout: 30000,
          retryAttempts: 3,
        },
        database: {
          host: 'localhost',
          port: 5432,
          name: 'app_dev',
          pool: { min: 2, max: 10 },
        },
        redis: {
          host: 'localhost',
          port: 6379,
          keyPrefix: 'app:',
        },
      },
      features: {},
      limits: {
        maxTodosPerUser: 1000,
        apiRateLimit: 100,
      },
    };
  }

  private mergeConfig(user: Partial<AppConfig>, defaults: Partial<AppConfig>): AppConfig {
    const merged: any = { ...defaults };

    for (const key in user) {
      if (key in defaults && typeof defaults[key as keyof AppConfig] === 'object') {
        merged[key] = this.mergeConfig(
          user[key as keyof AppConfig] as any,
          defaults[key as keyof AppConfig] as any
        );
      } else {
        merged[key] = user[key as keyof AppConfig];
      }
    }

    return merged as AppConfig;
  }

  private validateConfig(config: AppConfig): void {
    const requiredKeys = ['app.port', 'services.database.host'];

    for (const key of requiredKeys) {
      const value = this.getNestedValue(config, key);
      if (value === undefined || value === null) {
        throw new Error(`Missing required configuration key: ${key}`);
      }
    }
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  get<K extends keyof AppConfig>(key: K): AppConfig[K] {
    if (!this.config) {
      this.load();
    }
    return this.config![key];
  }

  getAll(): AppConfig {
    if (!this.config) {
      this.load();
    }
    return this.config!;
  }
}

// Environment-specific configuration
export const configLoader = new ConfigLoader();

// Type-safe config access
export function getConfig(): AppConfig {
  return configLoader.getAll();
}

export function get<T>(key: string): T {
  const config = getConfig();
  const value = key.split('.').reduce((obj, k) => (obj as any)[k], config);
  return value as T;
}
