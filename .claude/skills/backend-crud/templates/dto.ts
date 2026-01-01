import { z } from 'zod';

// Base schema with common fields
export const baseSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Pagination params
export const paginationParamsSchema = z.object({
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// Generic filter params
export const filterParamsSchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  createdAfter: z.coerce.date().optional(),
  createdBefore: z.coerce.date().optional(),
});

// Example User DTOs
export const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  role: z.enum(['user', 'admin', 'moderator']).default('user'),
  metadata: z.record(z.unknown()).optional(),
});

export const updateUserSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().min(1).max(100).optional(),
  role: z.enum(['user', 'admin', 'moderator']).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const userResponseSchema = baseSchema.extend({
  email: z.string().email(),
  name: z.string(),
  role: z.enum(['user', 'admin', 'moderator']),
  metadata: z.record(z.unknown()).optional(),
});

// Example Product DTOs
export const createProductSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  price: z.number().positive(),
  sku: z.string().min(1).max(50),
  category: z.string(),
  inventory: z.number().int().nonnegative().default(0),
  tags: z.array(z.string()).optional(),
});

export const updateProductSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
  price: z.number().positive().optional(),
  category: z.string().optional(),
  inventory: z.number().int().nonnegative().optional(),
  tags: z.array(z.string()).optional(),
});

export const productResponseSchema = baseSchema.extend({
  name: z.string(),
  description: z.string().optional(),
  price: z.number(),
  sku: z.string(),
  category: z.string(),
  inventory: z.number(),
  tags: z.array(z.string()).optional(),
});

// Type exports
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductResponse = z.infer<typeof productResponseSchema>;
export type PaginationParams = z.infer<typeof paginationParamsSchema>;
export type FilterParams = z.infer<typeof filterParamsSchema>;
