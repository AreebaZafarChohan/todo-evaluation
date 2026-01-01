// Service Layer Pattern Implementation

// Base service interface
export interface IService<T, CreateDto, UpdateDto, QueryDto> {
  findById(id: string): Promise<T | null>;
  findAll(query?: QueryDto): Promise<T[]>;
  findPage(query: QueryDto & { page: number; limit: number }): Promise<{
    data: T[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }>;
  create(dto: CreateDto): Promise<T>;
  update(id: string, dto: UpdateDto): Promise<T>;
  delete(id: string): Promise<void>;
  count(query?: QueryDto): Promise<number>;
}

// Base service with common functionality
export abstract class BaseService<T, CreateDto, UpdateDto, QueryDto>
  implements IService<T, CreateDto, UpdateDto, QueryDto>
{
  protected abstract repository: {
    findById(id: string): Promise<T | null>;
    findAll(query?: QueryDto): Promise<T[]>;
    create(dto: CreateDto): Promise<T>;
    update(id: string, dto: UpdateDto): Promise<T>;
    delete(id: string): Promise<void>;
    count(query?: QueryDto): Promise<number>;
  };

  async findById(id: string): Promise<T | null> {
    return this.repository.findById(id);
  }

  async findAll(query?: QueryDto): Promise<T[]> {
    return this.repository.findAll(query);
  }

  async findPage(
    query: QueryDto & { page: number; limit: number }
  ): Promise<{
    data: T[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const [data, total] = await Promise.all([
      this.repository.findAll(query),
      this.repository.count(query),
    ]);

    const totalPages = Math.ceil(total / query.limit);

    return {
      data,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages,
      },
    };
  }

  async create(dto: CreateDto): Promise<T> {
    return this.repository.create(dto);
  }

  async update(id: string, dto: UpdateDto): Promise<T> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Entity with id ${id} not found`);
    }
    return this.repository.update(id, dto);
  }

  async delete(id: string): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Entity with id ${id} not found`);
    }
    await this.repository.delete(id);
  }

  async count(query?: QueryDto): Promise<number> {
    return this.repository.count(query);
  }
}

// Domain events for service actions
export interface ServiceEvent {
  action: 'created' | 'updated' | 'deleted';
  entity: string;
  entityId: string;
  userId?: string;
  timestamp: Date;
  data?: Record<string, unknown>;
}

// Error types
export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class AuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthorizationError';
  }
}
