/**
 * 团队成员权限管理组件
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import { useState } from 'react'
import { useRoleCheck } from '@/hooks/use-role-check'
import { canAssignRole, getAllRoles, getRoleDisplayName } from '@/lib/permissions'
import type { UserRole } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { useI18n } from '@/i18n'

interface TeamMember {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  joinedAt: string
}

interface TeamPermissionManagerProps {
  member: TeamMember | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onRoleChange: (memberId: string, newRole: UserRole) => Promise<void>
}

/**
 * 团队成员权限管理对话框
 */
export function TeamPermissionManager({
  member,
  open,
  onOpenChange,
  onRoleChange,
}: TeamPermissionManagerProps) {
  const { t } = useI18n()
  const { toast } = useToast()
  const { role: currentUserRole, canAssignRole: canAssign } = useRoleCheck()
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [isChanging, setIsChanging] = useState(false)

  // 重置状态
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSelectedRole(null)
    }
    onOpenChange(newOpen)
  }

  // 检查是否可以更改角色
  const canChangeRole = (targetRole: UserRole): boolean => {
    if (!currentUserRole || !member) return false
    return canAssignRole(currentUserRole, targetRole)
  }

  // 获取可分配的角色列表
  const availableRoles = getAllRoles().filter((r) => canChangeRole(r.value))

  // 处理角色变更
  const handleRoleChange = async () => {
    if (!member || !selectedRole) return

    if (!canChangeRole(selectedRole)) {
      toast({
        title: '权限不足',
        description: '您没有权限分配此角色',
        variant: 'destructive',
      })
      return
    }

    setIsChanging(true)
    try {
      await onRoleChange(member.id, selectedRole)
      toast({
        title: '角色已更新',
        description: `${member.name} 的角色已更改为 ${getRoleDisplayName(selectedRole)}`,
      })
      handleOpenChange(false)
    } catch (error) {
      toast({
        title: '更新失败',
        description: '无法更新成员角色，请稍后重试',
        variant: 'destructive',
      })
    } finally {
      setIsChanging(false)
    }
  }

  if (!member) return null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>更改成员角色</DialogTitle>
          <DialogDescription>
            为 {member.name} 分配新的角色。角色决定了成员在项目中的权限。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 当前角色 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">当前角色</label>
            <div className="text-sm text-muted-foreground">
              {getRoleDisplayName(member.role)}
            </div>
          </div>

          {/* 选择新角色 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">选择新角色</label>
            <Select
              value={selectedRole || undefined}
              onValueChange={(value) => setSelectedRole(value as UserRole)}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择角色" />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {availableRoles.length === 0 && (
              <p className="text-sm text-muted-foreground">
                您没有权限更改此成员的角色
              </p>
            )}
          </div>

          {/* 权限说明 */}
          <div className="rounded-lg bg-muted p-3 text-sm">
            <p className="font-medium">权限说明</p>
            <ul className="mt-2 space-y-1 text-muted-foreground">
              <li>• 超级管理员：完整的系统管理权限</li>
              <li>• 管理员：可管理项目和团队成员</li>
              <li>• 导演：可编辑分镜头和剧本</li>
              <li>• 编剧：可编辑剧本</li>
              <li>• 剪辑师：可编辑分镜头</li>
              <li>• 普通成员：只读权限</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            取消
          </Button>
          <Button
            onClick={handleRoleChange}
            disabled={!selectedRole || selectedRole === member.role || isChanging}
          >
            {isChanging ? '更新中...' : '确认更改'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/**
 * 角色徽章组件
 */
export function RoleBadge({ role }: { role: UserRole }) {
  const displayName = getRoleDisplayName(role)

  const getBadgeStyle = (r: UserRole): string => {
    switch (r) {
      case 'super_admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      case 'admin':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
      case 'director':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'screenwriter':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'editor':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      case 'member':
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getBadgeStyle(role)}`}
    >
      {displayName}
    </span>
  )
}

export default TeamPermissionManager
