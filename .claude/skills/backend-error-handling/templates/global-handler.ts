import { Request, Response, NextFunction } from 'express';
import { AppError } from './custom-error';
import { logger } from '../logging/logger';

export class ErrorHandler {
  static handle(
    err: Error,
    req: Request,
    res: Response,
    _next: NextFunction
  ): void {
    const requestId = req.headers['x-request-id'] || crypto.randomUUID();

    if (err instanceof AppError) {
      logger.warn('App error', {
        code: err.code,
        statusCode: err.statusCode,
        path: req.path,
        method: req.method,
        requestId,
      });

      res.set(err.headers || {});
      res.status(err.statusCode).json({
        error: {
          code: err.code,
          message: err.message,
          details: err.details,
          requestId,
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    // Handle unexpected errors
    logger.error('Unexpected error', {
      error: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
      requestId,
    });

    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
        requestId,
        timestamp: new Date().toISOString(),
      },
    });
  }

  static notFound(req: Request, res: Response): void {
    res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: `Route ${req.method} ${req.path} not found`,
        requestId: req.headers['x-request-id'],
        timestamp: new Date().toISOString(),
      },
    });
  }
}

// Express error handler middleware
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => ErrorHandler.handle(err, req, res, next);

// 404 handler
export const notFoundHandler = (req: Request, res: Response) => {
  ErrorHandler.notFound(req, res);
};
