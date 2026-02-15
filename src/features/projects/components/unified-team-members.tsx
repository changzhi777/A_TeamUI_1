/**
 * 统一团队成员组件
 * 支持全局模式和项目模式，集成当前用户标识和层级权限控制
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import { useState, useMemo, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Link, useNavigate } from '@tanstack/react-router'
import { useI18n } from '@/i18n'
import { useProjectStore, type MemberRole, type GlobalMember, type ProjectMember } from '@/stores/project-store'
import { useAuthStore, type UserRole } from '@/stores/auth-store'
import { Plus, MoreVertical, UserPlus, Mail, Shield, Edit, UserCheck, Loader2, FolderPlus, Folder } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatDateTime, cn } from '@/lib/utils'
import { toast } from 'sonner'
import { usePermissionCheck } from '@/hooks/use-permission-check'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { MemberSearchBar } from './member-search-bar'
import { MemberSortSelect, type MemberSortType } from './member-sort-select'
import { MemberRoleFilter } from './member-role-filter'
import { EditMemberDialog } from './edit-member-dialog'
import { canManageRole, canEditMemberRole } from '@/lib/permissions'
import * as membersApi from '@/lib/api/members'

// 角色优先级（用于排序）
const memberRolePriority: Record<MemberRole, number> = {
  admin: 7,
  director: 6,
  screenwriter: 5,
  cinematographer: 4,
  editor: 3,
  actor: 2,
  member: 1,
}

// UserRole 到 MemberRole 的映射
const userRoleToMemberRole: Record<UserRole, MemberRole> = {
  super_admin: 'admin',
  admin: 'admin',
  director: 'director',
  screenwriter: 'screenwriter',
  editor: 'editor',
  member: 'member',
  auditor: 'member',
}

function getRoleBadgeColor(role: string) {
  switch (role) {
    case 'admin':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    case 'director':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    case 'screenwriter':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    case 'cinematographer':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    case 'editor':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
    case 'actor':
      return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }
}

// 邮箱格式验证
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// 将 UserRole 转换为用于权限比较的格式
function getUserRoleForComparison(userRole: UserRole): UserRole {
  return userRole
}

// 将 MemberRole 转换为 UserRole（用于权限比较）
function memberRoleToUserRole(memberRole: MemberRole): UserRole {
  // MemberRole 和 UserRole 有重叠，但不完全相同
  const mapping: Partial<Record<MemberRole, UserRole>> = {
    admin: 'admin',
    director: 'director',
    screenwriter: 'screenwriter',
    editor: 'editor',
    member: 'member',
    cinematographer: 'editor', // 映射到相近的权限
    actor: 'member',
  }
  return mapping[memberRole] || 'member'
}

function AddMemberDialog({
  open,
  onOpenChange,
  onAdd,
  projectName,
  currentUserRole,
  isLoading,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (data: { name: string; email: string; role: MemberRole; password: string }) => void
  projectName?: string
  currentUserRole: UserRole
  isLoading?: boolean
}) {
  const { t } = useI18n()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'member' as MemberRole,
    password: '',
  })
  const [errors, setErrors] = useState<{
    name?: string
    email?: string
    password?: string
  }>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: typeof errors = {}

    if (!formData.name.trim()) {
      newErrors.name = t.validation.nameRequired
    }

    if (!formData.email.trim()) {
      newErrors.email = t.validation.emailRequired
    } else if (!validateEmail(formData.email)) {
      newErrors.email = t.errors.invalidEmail
    }

    if (!formData.password.trim()) {
      newErrors.password = '密码不能为空'
    } else if (formData.password.length < 6) {
      newErrors.password = '密码长度至少6位'
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      return
    }

    onAdd(formData)
    setFormData({ name: '', email: '', role: 'member', password: '' })
    setErrors({})
    onOpenChange(false)
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setFormData({ name: '', email: '', role: 'member', password: '' })
      setErrors({})
    }
    onOpenChange(open)
  }

  // 根据当前用户角色确定可选择的角色列表
  const availableRoles: MemberRole[] = useMemo(() => {
    const allRoles: MemberRole[] = ['admin', 'director', 'screenwriter', 'cinematographer', 'editor', 'actor', 'member']

    return allRoles.filter(role => {
      const targetUserRole = memberRoleToUserRole(role)
      return canManageRole(currentUserRole, targetUserRole)
    })
  }, [currentUserRole])

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>添加团队成员</DialogTitle>
            <DialogDescription>
              {projectName ? `邀请新成员加入 ${projectName}` : '邀请新成员加入团队'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="member-name">姓名</Label>
              <Input
                id="member-name"
                placeholder="输入成员姓名"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={errors.name ? 'border-destructive' : ''}
                disabled={isLoading}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="member-email">邮箱</Label>
              <Input
                id="member-email"
                type="email"
                placeholder="成员邮箱地址"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={errors.email ? 'border-destructive' : ''}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="member-password">密码</Label>
              <Input
                id="member-password"
                type="password"
                placeholder="设置登录密码"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={errors.password ? 'border-destructive' : ''}
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="member-role">角色</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value as MemberRole })}
                disabled={isLoading}
              >
                <SelectTrigger id="member-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map(role => (
                    <SelectItem key={role} value={role}>
                      {t.project.role[role] || role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isLoading}>
              取消
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              添加
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export interface UnifiedTeamMembersProps {
  mode: 'global' | 'project'
  projectId?: string
}

export function UnifiedTeamMembers({ mode, projectId }: UnifiedTeamMembersProps) {
  const { t } = useI18n()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { canManageMembers } = usePermissionCheck()

  // 获取当前登录用户信息
  const currentUser = useAuthStore((state) => state.user)
  const currentUserRole = currentUser?.role || 'member'

  // Store 操作 (保留用于项目模式的后备)
  const getProjectById = useProjectStore((state) => state.getProjectById)

  const project = projectId ? getProjectById(projectId) : undefined

  // 状态管理
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<GlobalMember | null>(null)
  const [deletingMember, setDeletingMember] = useState<GlobalMember | null>(null)
  const [assigningMember, setAssigningMember] = useState<GlobalMember & { projectCount: number; projects?: membersApi.MemberProject[] } | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<MemberSortType>('joinedAt')
  const [selectedRole, setSelectedRole] = useState<MemberRole | 'all'>('all')

  // 分页状态
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  // 获取成员列表 - 使用真实 API
  const {
    data: membersData,
    isLoading: isLoadingMembers,
    error: membersError,
  } = useQuery({
    queryKey: ['members', { page, pageSize, search: searchTerm, role: selectedRole !== 'all' ? selectedRole : undefined }],
    queryFn: () => membersApi.getMembers({
      page,
      pageSize,
      search: searchTerm || undefined,
      role: selectedRole !== 'all' ? selectedRole : undefined,
    }),
    staleTime: 30 * 1000, // 30秒
  })

  // 添加成员 mutation
  const addMemberMutation = useMutation({
    mutationFn: (data: membersApi.AddMemberData) => membersApi.addMember(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] })
      toast.success('成员添加成功')
    },
    onError: (error: Error) => {
      toast.error(`添加失败: ${error.message}`)
    },
  })

  // 更新成员 mutation
  const updateMemberMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: membersApi.UpdateMemberData }) =>
      membersApi.updateMember(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] })
      toast.success('成员信息已更新')
    },
    onError: (error: Error) => {
      toast.error(`更新失败: ${error.message}`)
    },
  })

  // 删除成员 mutation
  const deleteMemberMutation = useMutation({
    mutationFn: (id: string) => membersApi.deleteMember(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] })
      toast.success('成员已删除')
    },
    onError: (error: Error) => {
      toast.error(`删除失败: ${error.message}`)
    },
  })

  // 添加成员到项目 mutation
  const addMemberToProjectMutation = useMutation({
    mutationFn: ({ memberId, projectId, role }: { memberId: string; projectId: string; role: string }) =>
      membersApi.addMemberToProject(memberId, projectId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] })
      toast.success('已将成员添加到项目')
    },
    onError: (error: Error) => {
      toast.error(`添加到项目失败: ${error.message}`)
    },
  })

  // 从项目移除成员 mutation
  const removeMemberFromProjectMutation = useMutation({
    mutationFn: ({ memberId, projectId }: { memberId: string; projectId: string }) =>
      membersApi.removeMemberFromProject(memberId, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] })
      toast.success('已将成员从项目中移除')
    },
    onError: (error: Error) => {
      toast.error(`移除失败: ${error.message}`)
    },
  })

  // 将 API 返回的成员转换为组件使用的格式
  const members = useMemo(() => {
    if (!membersData?.data) return []
    return membersData.data.map((m): GlobalMember & { projectCount: number; projects?: membersApi.MemberProject[] } => ({
      id: m.id,
      name: m.name,
      email: m.email,
      role: m.role as MemberRole,
      avatar: m.avatar,
      phone: m.phone,
      joinedAt: m.createdAt,
      projectId: m.projects?.[0]?.projectId,
      projectCount: m.projectCount,
      projects: m.projects,
    }))
  }, [membersData])

  // 检查是否是当前用户
  const isCurrentUser = (member: GlobalMember | ProjectMember): boolean => {
    return currentUser?.email === member.email
  }

  // 检查是否可以操作某个成员
  const canOperateOnMember = (member: GlobalMember | ProjectMember): boolean => {
    // 不能操作自己
    if (isCurrentUser(member)) return false

    // 检查层级权限
    const memberUserRole = memberRoleToUserRole(member.role as MemberRole)
    return canManageRole(currentUserRole, memberUserRole)
  }

  // 检查是否可以分配某个角色
  const canAssignMemberRole = (targetRole: MemberRole): boolean => {
    const targetUserRole = memberRoleToUserRole(targetRole)
    return canManageRole(currentUserRole, targetUserRole)
  }

  // 计算成员数量统计
  const memberCounts = useMemo(() => {
    const counts: Record<MemberRole | 'all', number> = {
      all: membersData?.meta?.total || members.length,
      admin: 0,
      member: 0,
      director: 0,
      screenwriter: 0,
      cinematographer: 0,
      editor: 0,
      actor: 0,
    }
    members.forEach((member) => {
      const role = member.role as MemberRole
      if (counts[role] !== undefined) {
        counts[role]++
      }
    })
    return counts
  }, [members, membersData])

  // 过滤和排序成员 (API 已处理搜索和筛选，这里只做排序)
  const filteredAndSortedMembers = useMemo(() => {
    let result = [...members]

    // 排序 - 当前用户始终排在最前面
    result.sort((a, b) => {
      // 当前用户排在最前面
      const aIsCurrentUser = isCurrentUser(a)
      const bIsCurrentUser = isCurrentUser(b)
      if (aIsCurrentUser) return -1
      if (bIsCurrentUser) return 1

      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name, 'zh-CN')
        case 'joinedAt':
          const aTime = a.joinedAt ? new Date(a.joinedAt).getTime() : 0
          const bTime = b.joinedAt ? new Date(b.joinedAt).getTime() : 0
          return bTime - aTime
        case 'role':
          return memberRolePriority[b.role as MemberRole] - memberRolePriority[a.role as MemberRole]
        default:
          return 0
      }
    })

    return result
  }, [members, sortBy, currentUser])

  // 检查是否有管理权限
  const hasManagePermission = useMemo(() => {
    if (mode === 'global') {
      return currentUserRole === 'super_admin' || currentUserRole === 'admin'
    }
    if (project) {
      return canManageMembers(project.createdBy) || currentUserRole === 'super_admin'
    }
    return false
  }, [mode, project, currentUserRole, canManageMembers])

  // 处理添加成员
  const handleAddMember = (data: { name: string; email: string; role: MemberRole; password: string }) => {
    if (!hasManagePermission) {
      toast.error('您没有添加成员的权限')
      return
    }

    addMemberMutation.mutate({
      name: data.name,
      email: data.email,
      role: data.role,
      password: data.password,
    })
  }

  // 处理删除成员
  const handleRemoveMember = () => {
    if (!deletingMember) {
      setDeletingMember(null)
      return
    }

    if (!canOperateOnMember(deletingMember)) {
      toast.error('您没有权限移除该成员')
      setDeletingMember(null)
      return
    }

    deleteMemberMutation.mutate(deletingMember.id, {
      onSuccess: () => {
        setDeletingMember(null)
      },
    })
  }

  // 处理编辑成员
  const handleEditMember = (id: string, data: { name: string; email: string; role: MemberRole }) => {
    const member = members.find(m => m.id === id)
    if (!member || !canOperateOnMember(member)) {
      toast.error('您没有权限编辑该成员')
      return
    }

    updateMemberMutation.mutate({
      id,
      data: {
        name: data.name,
        email: data.email,
        role: data.role,
      },
    })
  }

  // 处理更改角色
  const handleChangeRole = (memberId: string, newRole: MemberRole) => {
    const member = members.find(m => m.id === memberId)
    if (!member || !canOperateOnMember(member)) {
      toast.error('您没有权限更改该成员角色')
      return
    }

    if (!canAssignMemberRole(newRole)) {
      toast.error('您没有权限分配此角色')
      return
    }

    updateMemberMutation.mutate({
      id: memberId,
      data: { role: newRole },
    })
  }

  // 打开编辑对话框
  const openEditDialog = (member: GlobalMember) => {
    if (!canOperateOnMember(member)) {
      toast.error('您没有权限编辑该成员')
      return
    }
    setEditingMember(member)
    setIsEditDialogOpen(true)
  }

  const isEmpty = filteredAndSortedMembers.length === 0
  const showEmptyState = members.length === 0
  const showNoResults = !showEmptyState && isEmpty

  // 获取可分配的角色列表
  const assignableRoles = useMemo(() => {
    const allRoles: MemberRole[] = ['admin', 'director', 'screenwriter', 'cinematographer', 'editor', 'actor', 'member']
    return allRoles.filter(role => canAssignMemberRole(role))
  }, [currentUserRole])

  return (
    <>
      <Header>
        <TopNav links={[]} />
        <div className="ms-auto flex items-center space-x-4">
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/projects">项目列表</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {project && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/projects/$id" params={{ id: project.id }}>
                      {project.name}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            )}
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>团队成员</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">团队成员</h1>
            <p className="text-muted-foreground">
              {mode === 'global'
                ? '管理所有团队成员和权限'
                : project
                  ? `管理 ${project.name} 的团队成员和权限`
                  : '管理团队成员和权限'}
            </p>
          </div>
          {hasManagePermission && (
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              添加成员
            </Button>
          )}
        </div>

        {/* 控制栏 */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
            <MemberSearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="搜索成员姓名或邮箱..."
            />
            <div className="flex items-center gap-2">
              <MemberSortSelect value={sortBy} onChange={setSortBy} />
            </div>
          </div>

          <MemberRoleFilter
            value={selectedRole}
            onChange={setSelectedRole}
            memberCounts={memberCounts}
          />
        </div>

        {/* 成员列表 */}
        <Card>
          <CardContent className="p-0">
            {isLoadingMembers ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">加载中...</p>
              </div>
            ) : membersError ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Shield className="h-16 w-16 text-destructive mb-4" />
                <h3 className="text-lg font-medium mb-2">加载失败</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  请稍后重试
                </p>
              </div>
            ) : showEmptyState ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Shield className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">暂无团队成员</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  添加成员开始协作
                </p>
                {hasManagePermission && (
                  <Button onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    添加第一个成员
                  </Button>
                )}
              </div>
            ) : showNoResults ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Shield className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  {searchTerm ? '未找到匹配的成员' : '该角色下暂无成员'}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchTerm
                    ? t.project.tryDifferentSearchMember
                    : t.project.tryDifferentFilterMember}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>成员</TableHead>
                    <TableHead>邮箱</TableHead>
                    <TableHead>角色</TableHead>
                    <TableHead>参与项目</TableHead>
                    <TableHead>{t.project.joinedAt}</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedMembers.map((member) => {
                    const isMe = isCurrentUser(member)
                    const canOperate = canOperateOnMember(member)
                    const memberWithProjects = member as GlobalMember & { projectCount: number; projects?: membersApi.MemberProject[] }

                    return (
                      <TableRow
                        key={`${member.id}-${member.projectId || 'global'}`}
                        className={cn(
                          "group hover:bg-muted/50 transition-colors",
                          isMe && "bg-primary/5"
                        )}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {member.name}
                            {isMe && (
                              <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                                <UserCheck className="h-3 w-3 mr-1" />
                                我
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            {member.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getRoleBadgeColor(member.role)}>
                            {t.project.role[member.role as MemberRole] || member.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Folder className="h-4 w-4 text-muted-foreground" />
                            <span>{memberWithProjects.projectCount || 0} 个项目</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatDateTime(member.joinedAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          {hasManagePermission && canOperate ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>操作</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => openEditDialog(member)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  编辑成员
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  setAssigningMember(memberWithProjects)
                                  setIsProjectDialogOpen(true)
                                }}>
                                  <FolderPlus className="h-4 w-4 mr-2" />
                                  管理项目
                                </DropdownMenuItem>
                                {assignableRoles.length > 0 && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuLabel>更改角色</DropdownMenuLabel>
                                    {assignableRoles.map(role => (
                                      <DropdownMenuItem
                                        key={role}
                                        onClick={() => handleChangeRole(member.id, role)}
                                      >
                                        {t.project.role[role]}
                                      </DropdownMenuItem>
                                    ))}
                                  </>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => setDeletingMember(member)}
                                >
                                  移除成员
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              {isMe ? '当前用户' : '无权限'}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </Main>

      {/* 添加成员对话框 */}
      <AddMemberDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={handleAddMember}
        projectName={project?.name}
        currentUserRole={currentUserRole}
        isLoading={addMemberMutation.isPending}
      />

      {/* 编辑成员对话框 */}
      <EditMemberDialog
        key={editingMember?.id || 'edit-dialog'}
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open)
          if (!open) setEditingMember(null)
        }}
        member={editingMember}
        onSave={handleEditMember}
      />

      {/* 删除确认对话框 */}
      <ConfirmDialog
        open={!!deletingMember}
        onOpenChange={() => setDeletingMember(null)}
        title="确认移除成员"
        desc={
          <>
            确定要移除成员 <strong>{deletingMember?.name}</strong> 吗？
            <p className="text-sm text-destructive mt-2">
              ⚠️ 此操作将删除该用户账户，无法撤销。
            </p>
          </>
        }
        cancelBtnText="取消"
        confirmText="确认移除"
        destructive
        handleConfirm={handleRemoveMember}
      />

      {/* 项目分配对话框 */}
      <Dialog open={isProjectDialogOpen} onOpenChange={(open) => {
        setIsProjectDialogOpen(open)
        if (!open) setAssigningMember(null)
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>管理成员项目</DialogTitle>
            <DialogDescription>
              为 <strong>{assigningMember?.name}</strong> 分配或移除项目
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {assigningMember?.projects && assigningMember.projects.length > 0 ? (
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">当前参与的项目</Label>
                {assigningMember.projects.map((p) => (
                  <div
                    key={p.projectId}
                    className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                  >
                    <div>
                      <p className="font-medium">{p.projectName}</p>
                      <p className="text-sm text-muted-foreground">
                        角色: {t.project.role[p.role as MemberRole] || p.role}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => {
                        removeMemberFromProjectMutation.mutate({
                          memberId: assigningMember.id,
                          projectId: p.projectId,
                        })
                      }}
                      disabled={removeMemberFromProjectMutation.isPending}
                    >
                      移除
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Folder className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>该成员尚未参与任何项目</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsProjectDialogOpen(false)
              setAssigningMember(null)
            }}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
