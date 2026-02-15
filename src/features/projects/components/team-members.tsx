/**
 * team-members
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import { useState, useMemo } from 'react'
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
import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { useI18n } from '@/i18n'
import { useProjectStore, type MemberRole, type GlobalMember } from '@/stores/project-store'
import { ArrowLeft, Plus, MoreVertical, UserPlus, Mail, Shield, Edit } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatDateTime } from '@/lib/utils'
import { toast } from 'sonner'
import { usePermissionCheck } from '@/hooks/use-permission-check'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { MemberSearchBar } from './member-search-bar'
import { MemberSortSelect, type MemberSortType } from './member-sort-select'
import { MemberRoleFilter } from './member-role-filter'
import { EditMemberDialog } from './edit-member-dialog'

// 角色优先级（用于排序）
const rolePriority: Record<MemberRole, number> = {
  admin: 7,
  director: 6,
  screenwriter: 5,
  cinematographer: 4,
  editor: 3,
  actor: 2,
  member: 1,
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

function AddMemberDialog({
  open,
  onOpenChange,
  onAdd,
  project,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (data: { name: string; email: string; role: MemberRole }) => void
  project?: { name: string }
}) {
  const { t } = useI18n()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'member' as MemberRole,
  })
  const [errors, setErrors] = useState<{
    name?: string
    email?: string
  }>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // 验证
    const newErrors: typeof errors = {}

    if (!formData.name.trim()) {
      newErrors.name = t.validation.nameRequired
    }

    if (!formData.email.trim()) {
      newErrors.email = t.validation.emailRequired
    } else if (!validateEmail(formData.email)) {
      newErrors.email = t.errors.invalidEmail
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      return
    }

    onAdd(formData)
    setFormData({ name: '', email: '', role: 'member' })
    setErrors({})
    onOpenChange(false)
  }

  // 当对话框关闭时重置表单
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setFormData({ name: '', email: '', role: 'member' })
      setErrors({})
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>添加团队成员</DialogTitle>
            <DialogDescription>
              {project ? `邀请新成员加入 ${project.name}` : '邀请新成员加入团队'}
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
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="member-role">角色</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value as MemberRole })}
              >
                <SelectTrigger id="member-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">{t.project.role.admin}</SelectItem>
                  <SelectItem value="member">{t.project.role.member}</SelectItem>
                  <SelectItem value="director">{t.project.role.director}</SelectItem>
                  <SelectItem value="screenwriter">{t.project.role.screenwriter}</SelectItem>
                  <SelectItem value="cinematographer">{t.project.role.cinematographer}</SelectItem>
                  <SelectItem value="editor">{t.project.role.editor}</SelectItem>
                  <SelectItem value="actor">{t.project.role.actor}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              取消
            </Button>
            <Button type="submit">添加</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function TeamMembersPage() {
  const { t } = useI18n()
  const { id } = useParams({ strict: false })
  const navigate = useNavigate()
  const { canManageMembers } = usePermissionCheck()
  const getProjectById = useProjectStore((state) => state.getProjectById)
  const addMember = useProjectStore((state) => state.addMember)
  const removeMember = useProjectStore((state) => state.removeMember)
  const updateMemberRole = useProjectStore((state) => state.updateMemberRole)
  const updateMember = useProjectStore((state) => state.updateMember)
  const addGlobalMember = useProjectStore((state) => state.addGlobalMember)
  const removeGlobalMember = useProjectStore((state) => state.removeGlobalMember)
  const updateGlobalMember = useProjectStore((state) => state.updateGlobalMember)

  const project = id ? getProjectById(id) : undefined

  // 状态管理
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<GlobalMember | null>(null)
  const [deletingMember, setDeletingMember] = useState<GlobalMember | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<MemberSortType>('joinedAt')
  const [selectedRole, setSelectedRole] = useState<MemberRole | 'all'>('all')

  // 获取所有成员（全局视图） - 修复：项目不存在时返回空数组
  const allMembers = useMemo(() => {
    if (!project) return []
    return project.members || []
  }, [project])

  // 计算成员数量统计
  const memberCounts = useMemo(() => {
    const members = project ? project.members : allMembers
    const counts: Record<MemberRole | 'all', number> = {
      all: members.length,
      admin: 0,
      member: 0,
      director: 0,
      screenwriter: 0,
      cinematographer: 0,
      editor: 0,
      actor: 0,
    }
    members.forEach((member) => {
      counts[member.role]++
    })
    return counts
  }, [project, allMembers])

  // 过滤和排序成员
  const filteredAndSortedMembers = useMemo(() => {
    const members = project ? project.members : allMembers
    let result = [...members]

    // 搜索过滤
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim()
      result = result.filter((member) =>
        member.name.toLowerCase().includes(searchLower) ||
        member.email.toLowerCase().includes(searchLower)
      )
    }

    // 角色筛选
    if (selectedRole !== 'all') {
      result = result.filter((member) => member.role === selectedRole)
    }

    // 排序
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name, 'zh-CN')
        case 'joinedAt':
          const aTime = a.joinedAt ? new Date(a.joinedAt).getTime() : 0
          const bTime = b.joinedAt ? new Date(b.joinedAt).getTime() : 0
          return bTime - aTime
        case 'role':
          return rolePriority[b.role] - rolePriority[a.role]
        default:
          return 0
      }
    })

    return result
  }, [project, allMembers, searchTerm, selectedRole, sortBy])

  // 处理添加成员
  const handleAddMember = (data: { name: string; email: string; role: MemberRole }) => {
    if (project && !canManageMembers(project.createdBy)) {
      return
    }

    // 检查邮箱是否已存在
    const members = project ? project.members : allMembers
    const emailExists = members.some((m) => m.email === data.email)
    if (emailExists) {
      toast.error('该邮箱已存在')
      return
    }

    if (project) {
      addMember(project.id, data)
    } else {
      addGlobalMember(data)
    }
    toast.success('成员添加成功')
  }

  // 处理删除成员
  const handleRemoveMember = () => {
    if (!deletingMember) {
      setDeletingMember(null)
      return
    }

    if (project && !canManageMembers(project.createdBy)) {
      setDeletingMember(null)
      return
    }

    if (project) {
      removeMember(project.id, deletingMember.id)
    } else {
      removeGlobalMember(deletingMember.id)
    }
    toast.success('成员已移除')
    setDeletingMember(null)
  }

  // 处理编辑成员
  const handleEditMember = (id: string, data: { name: string; email: string; role: MemberRole }) => {
    if (project && !canManageMembers(project.createdBy)) {
      return
    }

    // 检查邮箱是否与其他成员重复
    const members = project ? project.members : allMembers
    const emailExists = members.some(
      (m) => m.email === data.email && m.id !== id
    )
    if (emailExists) {
      toast.error('该邮箱已存在')
      return
    }

    if (project) {
      updateMember(project.id, id, data)
    } else {
      updateGlobalMember(id, data)
    }
    toast.success('成员信息已更新')
  }

  // 处理更改角色（快速操作）
  const handleChangeRole = (memberId: string, newRole: MemberRole) => {
    if (project && !canManageMembers(project.createdBy)) {
      return
    }

    if (project) {
      updateMemberRole(project.id, memberId, newRole)
    } else {
      updateGlobalMember(memberId, { role: newRole })
    }
    toast.success('角色已更新')
  }

  // 打开编辑对话框
  const openEditDialog = (member: GlobalMember) => {
    if (project && !canManageMembers(project.createdBy)) {
      return
    }
    setEditingMember(member)
    setIsEditDialogOpen(true)
  }

  const isEmpty = filteredAndSortedMembers.length === 0
  const showEmptyState = (project ? project.members.length : allMembers.length) === 0
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
              {project ? `管理 ${project.name} 的团队成员和权限` : '管理所有团队成员和权限'}
            </p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            添加成员
          </Button>
        </div>

        {/* 控制栏：搜索、排序、筛选 */}
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

          {/* 角色筛选 */}
          <MemberRoleFilter
            value={selectedRole}
            onChange={setSelectedRole}
            memberCounts={memberCounts}
          />
        </div>

        {/* 成员列表 */}
        <Card>
          <CardContent className="p-0">
            {showEmptyState ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Shield className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">暂无团队成员</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  添加成员开始协作
                </p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  添加第一个成员
                </Button>
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
                    : t.project.tryDifferentFilterMember
                  }
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>成员</TableHead>
                    <TableHead>邮箱</TableHead>
                    <TableHead>角色</TableHead>
                    <TableHead>{t.project.joinedAt}</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedMembers.map((member, index) => (
                    <TableRow key={`${member.id}-${member.projectId || 'global'}`} className="group hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium">{member.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          {member.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleBadgeColor(member.role)}>
                          {t.project.role[member.role] || member.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatDateTime(member.joinedAt)}
                      </TableCell>
                      <TableCell className="text-right">
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
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>更改角色</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleChangeRole(member.id, 'admin')}>
                              {t.project.role.admin}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleChangeRole(member.id, 'director')}>
                              {t.project.role.director}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleChangeRole(member.id, 'screenwriter')}>
                              {t.project.role.screenwriter}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleChangeRole(member.id, 'member')}>
                              {t.project.role.member}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setDeletingMember(member)}
                            >
                              移除成员
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
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
        project={project}
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
              ⚠️ 此操作将移除该成员对项目的所有访问权限，无法撤销。
            </p>
          </>
        }
        cancelBtnText="取消"
        confirmText="确认移除"
        destructive
        handleConfirm={handleRemoveMember}
      />
    </>
  )
}
