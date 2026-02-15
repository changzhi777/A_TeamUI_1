/**
 * permission
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import type { Context, Next } from 'hono'
import type { JWTPayloadContext } from './auth'
import { type UserRole, type Permission } from '../types'

// Role permissions mapping
const rolePermissions: Record<UserRole, Permission[]> = {
  super_admin: [
    'project:read',
    'project:write',
    'project:delete',
    'project:manage_members',
    'script:read',
    'script:write',
    'storyboard:read',
    'storyboard:write',
    'storyboard:delete',
  ],
  admin: [
    'project:read',
    'project:write',
    'project:delete',
    'project:manage_members',
    'script:read',
    'script:write',
    'storyboard:read',
    'storyboard:write',
    'storyboard:delete',
  ],
  director: [
    'project:read',
    'project:write',
    'script:read',
    'script:write',
    'storyboard:read',
    'storyboard:write',
    'storyboard:delete',
  ],
  screenwriter: ['project:read', 'script:read', 'script:write'],
  editor: [
    'project:read',
    'storyboard:read',
    'storyboard:write',
    'storyboard:delete',
  ],
  member: ['project:read', 'script:read', 'storyboard:read'],
}

/**
 * Check if user has required permission
 */
function hasPermission(userRole: UserRole, permission: Permission): boolean {
  const permissions = rolePermissions[userRole] || []
  return permissions.includes(permission)
}

/**
 * Require specific permission middleware
 */
export function requirePermission(permission: Permission) {
  return async (c: Context<JWTPayloadContext>, next: Next) => {
    const user = c.get('user')

    if (!user) {
      return c.json({ success: false, error: 'Authentication required' }, 401)
    }

    if (!hasPermission(user.role as UserRole, permission)) {
      return c.json(
        {
          success: false,
          error: `Permission '${permission}' required`,
        },
        403
      )
    }

    return next()
  }
}

/**
 * Require specific role(s) middleware
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return async (c: Context<JWTPayloadContext>, next: Next) => {
    const user = c.get('user')

    if (!user) {
      return c.json({ success: false, error: 'Authentication required' }, 401)
    }

    if (!allowedRoles.includes(user.role as UserRole)) {
      return c.json({ success: false, error: 'Insufficient role' }, 403)
    }

    return next()
  }
}

/**
 * Require admin or super_admin role
 */
export const requireAdmin = requireRole('admin', 'super_admin')

/**
 * Require any authenticated user
 */
export async function requireUser(c: Context<JWTPayloadContext>, next: Next) {
  const user = c.get('user')

  if (!user) {
    return c.json({ success: false, error: 'Authentication required' }, 401)
  }

  return next()
}
