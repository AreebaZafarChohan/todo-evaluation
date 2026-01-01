// Custom error class hierarchy
export class AppError extends Error {
  constructor(
    public readonly code: string,
    public readonly message: string,
    public readonly statusCode: number,
    public readonly details?: Record<string, unknown>,
    public readonly headers?: Record<string, string>
  ) {
    super(message);
    this.name = 'AppError';
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        details: this.details,
        timestamp: new Date().toISOString(),
      },
    };
  }
}

export class ValidationError extends AppError {
  constructor(message: string, fieldErrors: Record<string, string[]>) {
    super('VALIDATION_ERROR', message, 422, { fieldErrors });
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super('NOT_FOUND', `${resource} with id ${id} not found`, 404, { resource, id });
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Authentication required') {
    super('UNAUTHORIZED', message, 401, undefined, { 'WWW-Authenticate': 'Bearer' });
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Access denied') {
    super('FORBIDDEN', message, 403);
    this.name = 'ForbiddenError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string, field?: string, value?: string) {
    const details: Record<string, string> = {};
    if (field) details.field = field;
    if (value) details.value = value;
    super('CONFLICT', message, 409, Object.keys(details).length > 0 ? details : undefined);
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends AppError {
  constructor(retryAfter: number, limit?: number, window?: string) {
    super('RATE_LIMITED', 'Too many requests', 429, { retryAfter, limit, window }, { 'Retry-After': String(retryAfter) });
    this.name = 'RateLimitError';
  }
}

export class InternalError extends AppError {
  constructor(message: string = 'An unexpected error occurred') {
    super('INTERNAL_ERROR', message, 500);
    this.name = 'InternalError';
  }
}
