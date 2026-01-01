# CRUD Module Structure Reference

```
src/
  domain/
    entities/
      user.ts
      product.ts
    repositories/
      user.repository.interface.ts
      product.repository.interface.ts

  application/
    services/
      user.service.ts
      product.service.ts
    dto/
      user.dto.ts
      product.dto.ts

  infrastructure/
    database/
      migrations/
      schema.ts
      index.ts
    repositories/
      user.repository.ts
      product.repository.ts

  interfaces/
    http/
      controllers/
        user.controller.ts
        product.controller.ts
      routes/
        users.routes.ts
        products.routes.ts
      middleware/
        validation.middleware.ts
```

## Usage Example

### 1. Define DTOs (dto.ts)
```typescript
import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  role: z.enum(['user', 'admin']),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
```

### 2. Create Controller (controller.ts)
```typescript
import { createCrudController } from './crud-controller';

const userController = createCrudController({
  name: 'User',
  createSchema: createUserSchema,
  updateSchema: updateUserSchema,
  service: userService,
});

export const userRoutes = Router()
  .get('/', userController.list)
  .get('/:id', userController.getById)
  .post('/', userController.create)
  .put('/:id', userController.update)
  .patch('/:id', userController.patch)
  .delete('/:id', userController.delete);
```

### 3. Service Layer (service.ts)
```typescript
class UserService {
  constructor(private repo: UserRepository) {}

  async findById(id: string) {
    return this.repo.findById(id);
  }

  async create(data: CreateUserInput) {
    const hashedPassword = await hash(data.password);
    return this.repo.create({ ...data, password: hashedPassword });
  }
}
```

## Best Practices

1. **Validation**: Always validate input with Zod schemas
2. **Error Handling**: Use consistent error responses
3. **Pagination**: Include meta with paginated results
4. **Soft Delete**: Consider using deleted_at column
5. **Auditing**: Track created_by, updated_by fields
6. **Versioning**: Use content-type versioning for APIs
