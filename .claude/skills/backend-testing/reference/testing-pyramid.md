# Testing Pyramid Reference

```
        /\
       /  \
      /    \     E2E Tests (10%)
     /██████\
    /        \
   /          \   Integration Tests (30%)
  /████████████\
 /              \
/████████████████\ Unit Tests (60%)
```

## Test Structure

```
tests/
  unit/
    user.service.spec.ts
    auth.helper.spec.ts
    utils.spec.ts
  integration/
    api.routes.spec.ts
    database.spec.ts
    auth.flow.spec.ts
  e2e/
    user.journey.spec.ts
    checkout.flow.spec.ts
  mocks/
    mock-db.ts
    mock-http.ts
    mock-auth.ts
  fixtures/
    test-data.ts
    test-users.ts
```

## Coverage Guidelines

| Test Type | Coverage Target | Execution Time |
|-----------|-----------------|----------------|
| Unit | >80% | <100ms each |
| Integration | >60% | <1s each |
| E2E | Core flows | <30s each |

## Testing Tools

- **Unit**: Jest, Vitest, Pytest
- **Integration**: Supertest, TestContainers
- **E2E**: Playwright, Cypress, Puppeteer
- **Mocking**: Mock Service Worker, Jest Mocks

## Best Practices

- Tests should be isolated and independent
- Use descriptive test names
- Follow Arrange-Act-Assert pattern
- Avoid testing implementation details
- Keep tests fast and reliable
- Use factories/fixtures for test data
