import { Request, Response } from 'express';
import { z } from 'zod';

// Generic CRUD controller factory
export function createCrudController<T, CreateInput, UpdateInput>(
  options: {
    name: string;
    createSchema: z.ZodSchema<CreateInput>;
    updateSchema: z.ZodSchema<UpdateInput>;
    service: {
      findById: (id: string) => Promise<T | null>;
      findAll: (query: Record<string, unknown>) => Promise<T[]>;
      create: (data: CreateInput) => Promise<T>;
      update: (id: string, data: UpdateInput) => Promise<T>;
      delete: (id: string) => Promise<void>;
    };
  }
) {
  const { name, createSchema, updateSchema, service } = options;

  return {
    // GET /:id - Get single resource
    getById: async (req: Request, res: Response): Promise<void> => {
      const { id } = req.params;
      const resource = await service.findById(id);

      if (!resource) {
        res.status(404).json({
          error: { code: 'NOT_FOUND', message: `${name} not found` },
        });
        return;
      }

      res.json({ data: resource });
    },

    // GET - List resources
    list: async (req: Request, res: Response): Promise<void> => {
      const resources = await service.findAll(req.query);
      res.json({ data: resources });
    },

    // POST - Create resource
    create: async (req: Request, res: Response): Promise<void> => {
      const parseResult = createSchema.safeParse(req.body);

      if (!parseResult.success) {
        res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input',
            details: parseResult.error.flatten(),
          },
        });
        return;
      }

      const resource = await service.create(parseResult.data);
      res.status(201).json({ data: resource });
    },

    // PUT /:id - Full update
    update: async (req: Request, res: Response): Promise<void> => {
      const { id } = req.params;
      const parseResult = updateSchema.safeParse(req.body);

      if (!parseResult.success) {
        res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input',
            details: parseResult.error.flatten(),
          },
        });
        return;
      }

      const resource = await service.update(id, parseResult.data);
      res.json({ data: resource });
    },

    // PATCH /:id - Partial update
    patch: async (req: Request, res: Response): Promise<void> => {
      const { id } = req.params;

      // Merge existing with updates
      const existing = await service.findById(id);
      if (!existing) {
        res.status(404).json({
          error: { code: 'NOT_FOUND', message: `${name} not found` },
        });
        return;
      }

      const parseResult = updateSchema.partial().safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input',
            details: parseResult.error.flatten(),
          },
        });
        return;
      }

      const resource = await service.update(id, parseResult.data as UpdateInput);
      res.json({ data: resource });
    },

    // DELETE /:id - Delete resource
    delete: async (req: Request, res: Response): Promise<void> => {
      const { id } = req.params;
      await service.delete(id);
      res.status(204).send();
    },
  };
}

// Pagination helper
export function paginate<T>(
  items: T[],
  page: number,
  limit: number
): { data: T[]; meta: { page: number; limit: number; total: number; totalPages: number } } {
  const total = items.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const data = items.slice(start, start + limit);

  return {
    data,
    meta: { page, limit, total, totalPages },
  };
}
