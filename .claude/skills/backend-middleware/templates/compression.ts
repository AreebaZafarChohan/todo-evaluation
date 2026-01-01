import { Request, Response, NextFunction } from 'express';
import compression from 'compression';

export const compressionMiddleware = compression({
  // Filter to only compress responses above certain size
  filter: (req, res) => {
    return compression.filter(req, res);
  },
  // Compression level (1-9)
  level: 6,
  // Threshold in bytes (default 1kb)
  threshold: 1024,
  // MIME types to compress
  mimeTypes: [
    'text/html',
    'text/css',
    'text/plain',
    'text/xml',
    'text/csv',
    'application/json',
    'application/javascript',
    'application/xml',
    'application/rss+xml',
    'image/svg+xml',
  ],
  // Brotli options (if available)
  brotli: {
    params: {
      [Symbol.for('brotli_compression_level')]: 6,
      [Symbol.for('brotli_window_size')]: 22,
      [Symbol.for('brotli_mode')]: 0,
    },
  },
});

// Custom compression middleware with caching
export function compressedCacheMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Skip compression for already cached responses
  if (res.get('X-Cache')) {
    next();
    return;
  }

  compressionMiddleware(req, res, next);
}
