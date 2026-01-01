# Auth Module Structure Reference

```
src/
  auth/
    middleware/
      jwt.ts           # JWT verification middleware
      rbac.ts          # Role-based access control
      oauth.ts         # OAuth flow handlers
    services/
      auth.service.ts  # Core authentication logic
      token.service.ts # Token generation/refresh
    strategies/
      jwt.strategy.ts
      local.strategy.ts
      oauth.strategy.ts
    guards/
      jwt-auth.guard.ts
      roles.guard.ts
    types/
      auth.types.ts    # TypeScript interfaces
```

## Usage Examples

### Basic JWT Auth
```typescript
// router.ts
router.post('/protected', authMiddleware, protectedHandler);

// protectedHandler.ts
const userId = req.user?.userId;
```

### RBAC Protected Route
```typescript
router.delete(
  '/posts/:id',
  authMiddleware,
  requirePermission('posts', 'delete'),
  deletePostHandler
);
```

### OAuth Login
```typescript
// Start OAuth flow
router.get('/auth/google', (req, res) => {
  const state = generateState();
  const url = getOAuthUrl('google', state);
  res.redirect(url);
});

// Callback handler
router.get('/auth/google/callback', async (req, res) => {
  const tokens = await exchangeCodeForTokens('google', req.query.code);
  const userInfo = await getUserInfo('google', tokens.accessToken);
  // Create session and redirect
});
```
