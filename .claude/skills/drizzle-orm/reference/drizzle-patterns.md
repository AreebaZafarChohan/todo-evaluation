# Drizzle ORM Reference

## Schema Definition Pattern

```typescript
// schema.ts
import { pgTable, serial, text, timestamp, integer, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

## Query Patterns

```typescript
// Select all users
const users = await db.select().from(users);

// Select with filters
const activeUsers = await db.select().from(users).where(eq(users.active, true));

// Insert
await db.insert(users).values({ email: 'test@example.com', name: 'Test' });

// Update
await db.update(users).set({ name: 'Updated' }).where(eq(users.id, 1));

// Delete
await db.delete(users).where(eq(users.id, 1));
```

## Relations

```typescript
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}));
```

## Migrations

```
drizzle-kit generate
drizzle-kit push    # For development
drizzle-kit migrate # For production
```

## Best Practices

- Use explicit schema definitions
- Define relationships using relations()
- Use parameterized queries for safety
- Use transactions for complex operations
- Index frequently queried columns
