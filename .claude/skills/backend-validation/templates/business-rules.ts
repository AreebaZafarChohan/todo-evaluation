import { z } from 'zod';

// Custom validators with business logic
export const subscriptionSchema = z.object({
  plan: z.enum(['free', 'pro', 'enterprise']),
  maxProjects: z.number(),
  maxStorage: z.number(), // in GB
});

export const userWithSubscriptionSchema = z.object({
  email: z.string().email(),
  subscription: subscriptionSchema,
  currentProjects: z.number(),
  currentStorage: z.number(),
}).refine(data => {
  // Business rule: Cannot exceed plan limits
  return data.currentProjects <= data.subscription.maxProjects;
}, {
  message: 'Project limit exceeded for current plan',
  path: ['currentProjects'],
}).refine(data => {
  return data.currentStorage <= data.subscription.maxStorage;
}, {
  message: 'Storage limit exceeded for current plan',
  path: ['currentStorage'],
});

// Context-aware validation
export interface ValidationContext {
  userId?: number;
  isAdmin?: boolean;
  existingRecord?: Record<string, unknown>;
}

export function createPostValidationRules(context: ValidationContext) {
  return z.object({
    title: z.string().min(1).max(200),
    content: z.string().min(1),
    published: z.boolean().default(false),
  }).refine(data => {
    // Business rule: Only admins can publish directly
    if (data.published && !context.isAdmin) {
      return false;
    }
    return true;
  }, {
    message: 'Only admins can publish posts directly',
    path: ['published'],
  });
}

// Async validator for database checks
export async function validateUniqueEmail(email: string, excludeUserId?: number): Promise<boolean> {
  // This would typically check against a database
  // For now, returns mock result
  const existingEmails = ['taken@example.com'];
  if (existingEmails.includes(email)) {
    return false;
  }
  return true;
}

export const asyncEmailSchema = z.string().email().refine(
  async (email) => validateUniqueEmail(email),
  { message: 'Email is already in use' }
);

// Sanitization helpers
export function sanitizeHtml(input: string): string {
  // Remove potential XSS vectors
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '');
}

export function sanitizeInput<T extends Record<string, unknown>>(obj: T): T {
  const sanitized = { ...obj };
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      (sanitized as Record<string, unknown>)[key] = sanitizeHtml(sanitized[key] as string);
    }
  }
  return sanitized;
}
