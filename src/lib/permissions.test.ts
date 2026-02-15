/**
 * 权限管理模块测试
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import { describe, it, expect } from 'vitest'
import {
  modulePermissions,
  sidebarPermissionMap,
  hasMenuPermission,
  roleDisplayNames,
  getRoleDisplayName,
  getAllRoles,
  canAssignRole,
} from './permissions'
import type { UserRole } from '@/stores/auth-store'

describe('permissions.ts', () => {
  describe('modulePermissions', () => {
    it('应该包含所有模块的权限定义', () => {
      expect(modulePermissions).toHaveProperty('project')
      expect(modulePermissions).toHaveProperty('script')
      expect(modulePermissions).toHaveProperty('storyboard')
      expect(modulePermissions).toHaveProperty('asset')
      expect(modulePermissions).toHaveProperty('character')
    })

    it('每个模块应该包含所有操作类型', () => {
      const actionTypes = ['read', 'write', 'delete', 'manage']
      Object.values(modulePermissions).forEach((module) => {
        actionTypes.forEach((action) => {
          expect(module).toHaveProperty(action)
        })
      })
    })
  })

  describe('sidebarPermissionMap', () => {
    it('应该包含主要菜单项的权限配置', () => {
      expect(sidebarPermissionMap).toHaveProperty('项目列表')
      expect(sidebarPermissionMap).toHaveProperty('团队成员')
      expect(sidebarPermissionMap).toHaveProperty('分镜头创作')
      expect(sidebarPermissionMap).toHaveProperty('资产库')
    })
  })

  describe('hasMenuPermission', () => {
    it('未登录用户应该没有权限', () => {
      expect(hasMenuPermission(undefined, [], '项目列表')).toBe(false)
    })

    it('超级管理员应该有所有菜单权限', () => {
      expect(hasMenuPermission('super_admin', [], '团队成员')).toBe(true)
      expect(hasMenuPermission('super_admin', [], '分镜头创作')).toBe(true)
    })

    it('普通成员不应该有团队成员管理权限', () => {
      expect(hasMenuPermission('member', [], '团队成员')).toBe(false)
    })

    it('未配置权限的菜单应该对所有角色可见', () => {
      // 测试一个未在 sidebarPermissionMap 中定义的菜单
      expect(hasMenuPermission('member', [], '未知菜单')).toBe(true)
    })
  })

  describe('roleDisplayNames', () => {
    it('应该包含所有角色的显示名称', () => {
      const roles: UserRole[] = ['super_admin', 'admin', 'director', 'screenwriter', 'editor', 'member']
      roles.forEach((role) => {
        expect(roleDisplayNames).toHaveProperty(role)
      })
    })
  })

  describe('getRoleDisplayName', () => {
    it('应该返回正确的角色显示名称', () => {
      expect(getRoleDisplayName('super_admin')).toBe('超级管理员')
      expect(getRoleDisplayName('admin')).toBe('管理员')
      expect(getRoleDisplayName('director')).toBe('导演')
      expect(getRoleDisplayName('screenwriter')).toBe('编剧')
      expect(getRoleDisplayName('editor')).toBe('剪辑师')
      expect(getRoleDisplayName('member')).toBe('普通成员')
    })
  })

  describe('getAllRoles', () => {
    it('应该返回所有角色的列表', () => {
      const roles = getAllRoles()
      expect(roles.length).toBe(6)
      expect(roles[0]).toHaveProperty('value')
      expect(roles[0]).toHaveProperty('label')
    })
  })

  describe('canAssignRole', () => {
    it('超级管理员可以分配任何角色', () => {
      expect(canAssignRole('super_admin', 'admin')).toBe(true)
      expect(canAssignRole('super_admin', 'member')).toBe(true)
    })

    it('管理员不能分配超级管理员角色', () => {
      expect(canAssignRole('admin', 'super_admin')).toBe(false)
    })

    it('管理员不能分配管理员角色', () => {
      expect(canAssignRole('admin', 'admin')).toBe(false)
    })

    it('管理员可以分配其他角色', () => {
      expect(canAssignRole('admin', 'director')).toBe(true)
      expect(canAssignRole('admin', 'screenwriter')).toBe(true)
      expect(canAssignRole('admin', 'editor')).toBe(true)
      expect(canAssignRole('admin', 'member')).toBe(true)
    })

    it('普通成员不能分配任何角色', () => {
      expect(canAssignRole('member', 'admin')).toBe(false)
      expect(canAssignRole('member', 'member')).toBe(false)
    })
  })
})
