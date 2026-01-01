// Security headers middleware
import { Request, Response, NextFunction } from 'express';

// Security headers configuration
export interface SecurityHeadersConfig {
  // X-Frame-Options
  frameguard?: {
    action?: 'DENY' | 'SAMEORIGIN';
  };
  // X-Content-Type-Options
  nosniff?: boolean;
  // X-XSS-Protection
  xssProtection?: boolean;
  // Strict-Transport-Security
  hsts?: {
    maxAge?: number;
    includeSubDomains?: boolean;
    preload?: boolean;
  };
  // Content-Security-Policy
  csp?: {
    directives?: Record<string, string[]>;
    reportOnly?: boolean;
  };
  // Referrer-Policy
  referrerPolicy?: {
    policy?: 'no-referrer' | 'same-origin' | 'strict-origin' | 'unsafe-url';
  };
  // Permissions-Policy
  permissionsPolicy?: {
    features?: Record<string, string[]>;
  };
}

const defaultConfig: SecurityHeadersConfig = {
  frameguard: { action: 'SAMEORIGIN' },
  nosniff: true,
  xssProtection: true,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  csp: {
    directives: {
      'default-src': ["'self'"],
      'script-src': ["'self'"],
      'style-src': ["'self'", "'unsafe-inline'"],
      'img-src': ["'self'", 'data:', 'https:'],
      'font-src': ["'self'"],
      'connect-src': ["'self'"],
    },
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  permissionsPolicy: {
    features: {
      geolocation: ["'none'"],
      microphone: ["'none'"],
      camera: ["'none'"],
    },
  },
};

export function securityHeadersMiddleware(config: SecurityHeadersConfig = {}) {
  const finalConfig = { ...defaultConfig, ...config };

  return (req: Request, res: Response, next: NextFunction): void => {
    // X-Frame-Options
    if (finalConfig.frameguard) {
      res.setHeader('X-Frame-Options', finalConfig.frameguard.action);
    }

    // X-Content-Type-Options
    if (finalConfig.nosniff) {
      res.setHeader('X-Content-Type-Options', 'nosniff');
    }

    // X-XSS-Protection
    if (finalConfig.xssProtection) {
      res.setHeader('X-XSS-Protection', '1; mode=block');
    }

    // Strict-Transport-Security
    if (finalConfig.hsts) {
      let header = `max-age=${finalConfig.hsts.maxAge}`;
      if (finalConfig.hsts.includeSubDomains) {
        header += '; includeSubDomains';
      }
      if (finalConfig.hsts.preload) {
        header += '; preload';
      }
      res.setHeader('Strict-Transport-Security', header);
    }

    // Content-Security-Policy
    if (finalConfig.csp) {
      const directives = Object.entries(finalConfig.csp.directials || {})
        .map(([key, values]) => `${key} ${values.join(' ')}`)
        .join('; ');
      const headerName = finalConfig.csp.reportOnly
        ? 'Content-Security-Policy-Report-Only'
        : 'Content-Security-Policy';
      res.setHeader(headerName, directives);
    }

    // Referrer-Policy
    if (finalConfig.referrerPolicy) {
      res.setHeader('Referrer-Policy', finalConfig.referrerPolicy.policy);
    }

    // Permissions-Policy
    if (finalConfig.permissionsPolicy) {
      const features = Object.entries(finalConfig.permissionsPolicy.features || {})
        .map(([key, values]) => `${key}=(${values.join(' ')})`)
        .join(', ');
      res.setHeader('Permissions-Policy', features);
    }

    // Remove fingerprinting headers
    res.removeHeader('X-Powered-By');

    next();
  };
}

// Helmet integration (recommended)
export { contentSecurityPolicy } from 'helmet';
