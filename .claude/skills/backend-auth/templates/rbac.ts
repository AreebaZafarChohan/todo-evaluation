import { AuthenticatedRequest } from './jwt-middleware';

export type Role = 'admin' | 'moderator' | 'user' | 'guest';

export interface Permission {
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete')[];
}

export const rolePermissions: Record<Role, Permission[]> = {
  admin: [
    { resource: '*', actions: ['create', 'read', 'update', 'delete'] },
  ],
  moderator: [
    { resource: 'posts', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'comments', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'users', actions: ['read'] },
  ],
  user: [
    { resource: 'posts', actions: ['create', 'read', 'update'] },
    { resource: 'comments', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'profile', actions: ['read', 'update'] },
  ],
  guest: [
    { resource: 'posts', actions: ['read'] },
  ],
};

export function hasPermission(
  req: AuthenticatedRequest,
  resource: string,
  action: 'create' | 'read' | 'update' | 'delete'
): boolean {
  const userRole = req.user?.role || 'guest';
  const permissions = rolePermissions[userRole];

  return permissions.some(perm => {
    const resourceMatch = perm.resource === '*' || perm.resource === resource;
    return resourceMatch && perm.actions.includes(action);
  });
}

export function requirePermission(resource: string, action: 'create' | 'read' | 'update' | 'delete') {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!hasPermission(req, resource, action)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }
    next();
  };
}
