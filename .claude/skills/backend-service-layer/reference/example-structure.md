# Backend Service Layer Module Structure Reference

```
src/
  domain/
    entities/
      todo.ts                  # Domain entity
      project.ts               # Domain entity

  application/
    services/
      todo.service.ts          # Todo business logic
      project.service.ts       # Project business logic
      interfaces/
        todo.repository.interface.ts  # Repository contract
        todo.service.interface.ts     # Service contract

  infrastructure/
    repository/
      todo.repository.ts       # Database implementation
    database/
      db.ts                    # Database connection

  interfaces/
    http/
      controllers/
        todo.controller.ts     # HTTP handling
      routes/
        todo.routes.ts         # Route definitions
```

## Service Layer Responsibilities

| Controller | Service | Repository |
|------------|---------|------------|
| Parse request | Business rules | Data access |
| Validate input | Transactions | CRUD operations |
| Handle response | Domain logic | Query execution |
| Error handling | Validation | Identity map |

## Code Example

```typescript
// Controller (thin - HTTP only)
const todoController = {
  async create(req, res) {
    const todo = await todoService.create(req.body);
    res.status(201).json(todo);
  },
};

// Service (fat - business logic)
class TodoService {
  async create(dto: CreateTodoDto): Promise<Todo> {
    // Business rules
    if (!dto.title.trim()) {
      throw new ValidationError('Title required');
    }
    // Data access through repository
    return this.repo.create(dto);
  }
}

// Repository (data access)
class TodoRepository {
  async create(dto: CreateTodoDto): Promise<Todo> {
    // Database operation
  }
}
```

## Best Practices

1. **Thin controllers**: Minimal HTTP handling
2. **Fat services**: Business logic lives here
3. **Dumb repositories**: Pure data access
4. **Dependency injection**: Inject repositories into services
5. **Domain events**: Emit events for state changes
6. **Error handling**: Domain errors in services
