// Example: Todo Service with business logic

import { BaseService, NotFoundError } from './base-service';

// DTOs
export interface CreateTodoDto {
  title: string;
  description?: string;
  projectId: string;
  dueDate?: Date;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  tags?: string[];
}

export interface UpdateTodoDto {
  title?: string;
  description?: string;
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  dueDate?: Date | null;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  tags?: string[];
}

export interface TodoQueryDto {
  status?: string;
  projectId?: string;
  assigneeId?: string;
  search?: string;
  tags?: string[];
}

// Domain entity
export interface Todo {
  id: string;
  title: string;
  description: string | null;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  projectId: string;
  assigneeId: string | null;
  dueDate: Date | null;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Repository interface
export interface TodoRepository {
  findById(id: string): Promise<Todo | null>;
  findAll(query?: TodoQueryDto): Promise<Todo[]>;
  create(dto: CreateTodoDto): Promise<Todo>;
  update(id: string, dto: UpdateDto): Promise<Todo>;
  delete(id: string): Promise<void>;
  count(query?: TodoQueryDto): Promise<number>;
}

// Service implementation
export class TodoService extends BaseService<Todo, CreateTodoDto, UpdateTodoDto, TodoQueryDto> {
  constructor(private todoRepository: TodoRepository) {
    super();
  }

  protected repository = this.todoRepository;

  async create(dto: CreateTodoDto): Promise<Todo> {
    // Business logic: Validate project exists
    const project = await this.getProject(dto.projectId);
    if (!project) {
      throw new NotFoundError('Project not found');
    }

    // Business logic: Enforce max todos per user
    const userTodoCount = await this.todoRepository.count({
      assigneeId: project.ownerId,
    });
    if (userTodoCount >= 1000) {
      throw new ValidationError('Maximum todo limit reached');
    }

    // Business logic: Auto-assign to creator
    const todo = await this.todoRepository.create({
      ...dto,
      status: 'PENDING',
      assigneeId: project.ownerId,
    });

    return todo;
  }

  async update(id: string, dto: UpdateTodoDto): Promise<Todo> {
    // Business logic: Cannot complete without title
    if (dto.status === 'COMPLETED') {
      const existing = await this.todoRepository.findById(id);
      if (!existing?.title.trim()) {
        throw new ValidationError('Cannot complete todo without title');
      }
    }

    return super.update(id, dto);
  }

  async findByProject(projectId: string): Promise<Todo[]> {
    return this.todoRepository.findAll({ projectId });
  }

  async findOverdue(): Promise<Todo[]> {
    const todos = await this.todoRepository.findAll();
    return todos.filter(
      todo => todo.dueDate && new Date(todo.dueDate) < new Date() && todo.status !== 'COMPLETED'
    );
  }

  private async getProject(projectId: string) {
    // Implementation would fetch from project repository
    return { id: projectId, ownerId: 'user-1' };
  }
}

// Usage in controller
export function createTodoController(todoService: TodoService) {
  return {
    async getTodo(req, res) {
      const todo = await todoService.findById(req.params.id);
      if (!todo) {
        res.status(404).json({ error: 'Todo not found' });
        return;
      }
      res.json({ data: todo });
    },

    async createTodo(req, res) {
      try {
        const todo = await todoService.create(req.body);
        res.status(201).json({ data: todo });
      } catch (error) {
        if (error instanceof ValidationError) {
          res.status(400).json({ error: error.message });
        }
        throw error;
      }
    },
  };
}
