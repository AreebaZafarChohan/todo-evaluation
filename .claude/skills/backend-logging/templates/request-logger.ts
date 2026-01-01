import { Request, Response, NextFunction } from 'express';
import { logger, createRequestLogger } from './logger';

// Request logging middleware
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const requestId = req.headers['x-request-id'] || crypto.randomUUID();
  const startTime = Date.now();

  // Attach request logger to request
  const reqLogger = createRequestLogger(requestId, (req as any).user?.id);
  (req as any).logger = reqLogger;

  // Log request
  reqLogger.info('Incoming request', {
    method: req.method,
    path: req.path,
    query: req.query,
    userAgent: req.get('user-agent'),
    ip: req.ip,
  });

  // Log response on finish
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logLevel = res.statusCode >= 400 ? 'warn' : 'info';

    reqLogger[logLevel]('Request completed', {
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('content-length'),
    });
  });

  next();
}

// Logged operation helper
export async function loggedOperation<T>(
  logger: ReturnType<typeof createRequestLogger>,
  operation: string,
  fn: () => Promise<T>
): Promise<T> {
  logger.debug(`Starting operation: ${operation}`);
  const startTime = Date.now();

  try {
    const result = await fn();
    const duration = Date.now() - startTime;

    logger.info(`Operation completed: ${operation}`, {
      duration: `${duration}ms`,
    });

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;

    logger.error(`Operation failed: ${operation}`, {
      duration: `${duration}ms`,
      error: (error as Error).message,
      stack: (error as Error).stack,
    });

    throw error;
  }
}
