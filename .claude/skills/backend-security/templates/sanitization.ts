import { body, param, query, validationResult } from 'express-validator';

// Input sanitization helpers
export function sanitizeString(value: string): string {
  return value
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .substring(0, 10000); // Limit length
}

export function sanitizeEmail(value: string): string {
  return value.trim().toLowerCase().substring(0, 254);
}

// Validation rules
export const validationRules = {
  // User validation
  createUser: [
    body('email')
      .isEmail()
      .withMessage('Invalid email format')
      .normalizeEmail()
      .customSanitizer(sanitizeEmail),
    body('name')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Name must be 1-100 characters')
      .customSanitizer(sanitizeString),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain uppercase, lowercase, and number'),
  ],

  // Todo validation
  createTodo: [
    body('title')
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('Title must be 1-200 characters')
      .customSanitizer(sanitizeString),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 5000 })
      .withMessage('Description must be under 5000 characters')
      .customSanitizer(sanitizeString),
    body('dueDate')
      .optional()
      .isISO8601()
      .withMessage('Invalid date format'),
  ],

  // UUID parameter validation
  uuidParam: [
    param('id')
      .isUUID()
      .withMessage('Invalid ID format'),
  ],

  // Pagination validation
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer')
      .toInt(),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
      .toInt(),
  ],
};

// Validation result handler
export function handleValidationErrors(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input',
        details: errors.array().map(err => ({
          field: 'path' in err ? err.path : err.type,
          message: err.msg,
        })),
      },
    });
    return;
  }

  next();
}

// SQL injection prevention helper
export function escapeLike(str: string): string {
  return str.replace(/[%_\\]/g, '\\$&');
}

// NoSQL injection prevention helper
export function sanitizeForMongo(value: unknown): unknown {
  if (typeof value === 'string') {
    return value.replace(/\$/g, '').replace(/\0/g, '');
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeForMongo);
  }
  if (typeof value === 'object' && value !== null) {
    const sanitized: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      sanitized[key.replace(/\$/g, '')] = sanitizeForMongo(val);
    }
    return sanitized;
  }
  return value;
}
