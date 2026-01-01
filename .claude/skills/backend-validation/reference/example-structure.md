# Validation Module Structure Reference

```
src/
  validation/
    schemas/           # Zod schemas
      user.schema.ts
      post.schema.ts
      common.schema.ts
    validators/        # Express-validator chains
      user.validator.ts
      post.validator.ts
    sanitizers/        # Input sanitization
      sanitizer.ts
    middleware/
      validation.middleware.ts
```

## Usage with Express

```typescript
// routes/user.ts
import { validateRequest, createUserValidators } from '../validation';

router.post(
  '/users',
  validateRequest(createUserValidators),
  createUserHandler
);
```

## Usage with Zod

```typescript
// controllers/user.ts
import { createUserSchema, validate, type CreateUserInput } from '../validation';

const result = validate(createUserSchema, req.body);

if (!result.success) {
  return res.status(400).json({ errors: result.errors.format() });
}

const userData: CreateUserInput = result.data;
```

## Validation Chain

```
Client Request
    ↓
Middleware Layer (auth, rate limit)
    ↓
Input Validation (express-validator)
    ↓
Schema Validation (Zod)
    ↓
Business Rule Validation
    ↓
Controller Handler
```
