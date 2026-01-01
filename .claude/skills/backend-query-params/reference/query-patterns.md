# Query Parameters Reference

## Common Query Patterns

```
GET /api/users?page=1&limit=20&sort=name&order=asc
GET /api/posts?status=published&author_id=123&from=2024-01-01
GET /api/search?q=keyword&filters=tag:javascript&fields=title,body
```

## Parameter Types

| Type | Example | Description |
|------|---------|-------------|
| Pagination | `page`, `limit` | Offset-based pagination |
| Sorting | `sort`, `order` | ASC/DESC sorting |
| Filtering | `status`, `type` | Exact match filters |
| Search | `q`, `search` | Full-text search |
| Range | `from`, `to` | Date/numeric ranges |
| Select | `fields`, `select` | Field selection |
| Expand | `expand`, `include` | Related resources |

## Validation

```typescript
// Query param validation
const userQuerySchema = {
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sort: z.enum(['name', 'created_at', 'updated_at']).default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
  status: z.enum(['active', 'inactive', 'pending']).optional(),
}
```

## Best Practices

- Always validate and sanitize query parameters
- Use type coercion for numeric/boolean values
- Provide sensible defaults
- Document all available query parameters
- Use ISO 8601 for date formats
- Consider rate limiting for expensive queries
