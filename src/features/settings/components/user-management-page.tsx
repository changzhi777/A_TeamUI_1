/**
 * 用户管理页面
 * 仅超级管理员可访问
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import { useState, useMemo } from 'react'
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
import { Link } from '@tanstack/react-router'
import { useI18n } from '@/i18n'
import { useAuthStore, type UserRole } from '@/stores/auth-store'
import { Plus, Mail, Shield, Edit, UserCheck, Loader2, Folder, MoreVertical, UserPlus } from 'lucide-react'
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
import { ConfirmDialog } from '@/components/confirm-dialog'
import * as membersApi from '@/lib/api/members'
import { canManageRole } from '@/lib/permissions'

// 角色优先级
const rolePriority: Record<UserRole, number> = {
  super_admin: 100,
  admin: 80,
  director: 60,
  screenwriter: 40,
  editor: 40,
  member: 20,
  auditor: 10,
}

function getRoleBadgeColor(role: string) {
  switch (role) {
    case 'super_admin':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    case 'admin':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
    case 'director':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    case 'screenwriter':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    case 'editor':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    case 'member':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }
}

export function UserManagementPage() {
  const { t } = useI18n()
  const queryClient = useQueryClient()

  // 获取当前登录用户信息
  const currentUser = useAuthStore((state) => state.user)
  const currentUserRole = currentUser?.role || 'member'

  // 状态管理
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'role'>('createdAt')
  const [selectedRole, setSelectedRole] = useState<UserRole | 'all'>('all')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [deletingMember, setDeletingMember] = useState<membersApi.Member | null>(null)

  // 获取用户列表
  const {
    data: membersData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['users', { page, pageSize, search: searchTerm, role: selectedRole !== 'all' ? selectedRole : undefined }],
    queryFn: () => membersApi.getMembers({
      page,
      pageSize,
      search: searchTerm || undefined,
      role: selectedRole !== 'all' ? selectedRole : undefined,
    }),
    staleTime: 30 * 1000,
  })

  // 删除成员 mutation
  const deleteMemberMutation = useMutation({
    mutationFn: (id: string) => membersApi.deleteMember(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('用户已删除')
    },
    onError: (error: Error) => {
      toast.error(`删除失败: ${error.message}`)
    },
  })

  // 检查是否是当前用户
  const isCurrentUser = (member: membersApi.Member): boolean => {
    return currentUser?.email === member.email
  }

  // 检查是否可以操作某个成员
  const canOperateOnMember = (member: membersApi.Member): boolean => {
    if (isCurrentUser(member)) return false
    return canManageRole(currentUserRole, member.role as UserRole)
  }

  // 过滤和排序
  const filteredMembers = useMemo(() => {
    if (!membersData?.data) return []

    let result = [...membersData.data]

    // 排序 - 当前用户排在最前面
    result.sort((a, b) => {
      const aIsCurrentUser = isCurrentUser(a)
      const bIsCurrentUser = isCurrentUser(b)
      if (aIsCurrentUser) return -1
      if (bIsCurrentUser) return 1

      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name, 'zh-CN')
        case 'createdAt':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'role':
          return (rolePriority[b.role as UserRole] || 0) - (rolePriority[a.role as UserRole] || 0)
        default:
          return 0
      }
    })

    return result
  }, [membersData, sortBy, currentUser])

  // 处理删除用户
  const handleRemoveMember = () => {
    if (!deletingMember) return

    if (!canOperateOnMember(deletingMember)) {
      toast.error('您没有权限删除该用户')
      setDeletingMember(null)
      return
    }

    deleteMemberMutation.mutate(deletingMember.id, {
      onSuccess: () => {
        setDeletingMember(null)
      },
    })
  }

  const isEmpty = filteredMembers.length === 0
  const showEmptyState = !membersData?.data?.length
  const showNoResults = !showEmptyState && isEmpty

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
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/settings">设置</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>用户管理</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">用户管理</h1>
            <p className="text-muted-foreground">
              管理系统中的所有用户和权限
            </p>
          </div>
        </div>

        {/* 控制栏 */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-sm">
              <input
                type="text"
                placeholder="搜索用户姓名或邮箱..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="createdAt">按创建时间</option>
                <option value="name">按姓名</option>
                <option value="role">按角色</option>
              </select>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserRole | 'all')}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="all">所有角色</option>
                <option value="super_admin">超级管理员</option>
                <option value="admin">管理员</option>
                <option value="director">导演</option>
                <option value="screenwriter">编剧</option>
                <option value="editor">剪辑师</option>
                <option value="member">成员</option>
              </select>
            </div>
          </div>
        </div>

        {/* 用户列表 */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">加载中...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Shield className="h-16 w-16 text-destructive mb-4" />
                <h3 className="text-lg font-medium mb-2">加载失败</h3>
                <p className="text-sm text-muted-foreground mb-4">请稍后重试</p>
              </div>
            ) : showEmptyState ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Shield className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">暂无用户</h3>
                <p className="text-sm text-muted-foreground">系统中还没有用户</p>
              </div>
            ) : showNoResults ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Shield className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  {searchTerm ? '未找到匹配的用户' : '该角色下暂无用户'}
                </h3>
                <p className="text-sm text-muted-foreground">尝试其他搜索条件</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>用户</TableHead>
                    <TableHead>邮箱</TableHead>
                    <TableHead>角色</TableHead>
                    <TableHead>参与项目</TableHead>
                    <TableHead>注册时间</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member) => {
                    const isMe = isCurrentUser(member)
                    const canOperate = canOperateOnMember(member)

                    return (
                      <TableRow
                        key={member.id}
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
                            {member.role === 'super_admin' ? '超级管理员' :
                             member.role === 'admin' ? '管理员' :
                             t.project.role[member.role as keyof typeof t.project.role] || member.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Folder className="h-4 w-4 text-muted-foreground" />
                            <span>{member.projectCount || 0} 个项目</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatDateTime(member.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          {canOperate ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>操作</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => setDeletingMember(member)}
                                >
                                  删除用户
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

        {/* 分页信息 */}
        {membersData?.meta && (
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>
              共 {membersData.meta.total} 个用户
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                上一页
              </Button>
              <span>第 {page} 页</span>
              <Button
                variant="outline"
                size="sm"
                disabled={!membersData.meta.hasMore}
                onClick={() => setPage(page + 1)}
              >
                下一页
              </Button>
            </div>
          </div>
        )}
      </Main>

      {/* 删除确认对话框 */}
      <ConfirmDialog
        open={!!deletingMember}
        onOpenChange={() => setDeletingMember(null)}
        title="确认删除用户"
        desc={
          <>
            确定要删除用户 <strong>{deletingMember?.name}</strong> 吗？
            <p className="text-sm text-destructive mt-2">
              ⚠️ 此操作将删除该用户账户及其所有项目关联，无法撤销。
            </p>
          </>
        }
        cancelBtnText="取消"
        confirmText="确认删除"
        destructive
        handleConfirm={handleRemoveMember}
      />
    </>
  )
}
