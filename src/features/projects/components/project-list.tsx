import { useState, useMemo, useEffect, useRef } from 'react'
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
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
} from '@/components/ui/collapsible'
import { useI18n } from '@/i18n'
import { useProjectStore } from '@/stores/project-store'
import { useAuthStore } from '@/stores/auth-store'
import { useStoryboardStore } from '@/stores/storyboard-store'
import { Plus, MoreVertical, Users, Film, Clock, Star, Pin, CheckCircle, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Link } from '@tanstack/react-router'
import { ProjectFormDialog } from './project-form-dialog'
import { ProjectSearchBar } from './project-search-bar'
import { ProjectSortSelect, type SortType } from './project-sort-select'
import { ProjectViewToggle, type ViewMode } from './project-view-toggle'
import { seedDiverseProjects, clearAllProjects, getProjectTypeSummary } from '@/lib/seed-data-clean'
import { seedAllStoryboardData } from '@/lib/seed-storyboard-data'
import { formatDateTime } from '@/lib/utils'

function getStatusBadgeColor(status: string) {
  switch (status) {
    case 'planning':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800'
    case 'filming':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-200 dark:border-blue-800'
    case 'postProduction':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 border-purple-200 dark:border-purple-800'
    case 'completed':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200 dark:border-green-800'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 border-gray-200 dark:border-gray-800'
  }
}

function getStatusLabel(status: string, t: any) {
  const statusKey = status as keyof typeof t.project.status
  return t.project.status[statusKey] || status
}

function ProjectCard({
  project,
  onEdit,
  onDelete,
  onToggleFavorite,
  onTogglePin,
  onToggleSelect,
  isSelected,
}: {
  project: any
  onEdit: (project: any) => void
  onDelete: (project: any) => void
  onToggleFavorite: (project: any) => void
  onTogglePin: (project: any) => void
  onToggleSelect: (project: any) => void
  isSelected: boolean
}) {
  const { t } = useI18n()
  const statusLabel = getStatusLabel(project.status, t)
  const setCurrentProjectId = useProjectStore((state) => state.setCurrentProjectId)

  const handleProjectClick = () => {
    setCurrentProjectId(project.id)
  }

  const progressPercentage = project.totalShots > 0
    ? Math.round((project.completedShots / project.totalShots) * 100)
    : 0

  return (
    <Card className={`group hover:shadow-lg transition-all duration-200 border-border/50 relative ${isSelected ? 'border-primary ring-2 ring-primary/20' : 'hover:border-primary/50'}`}>
      {/* 选定状态标识 */}
      {isSelected && (
        <div className="absolute top-3 right-3 z-20">
          <div className="flex items-center justify-center w-6 h-6 bg-primary rounded-full">
            <CheckCircle className="h-4 w-4 text-primary-foreground fill-primary-foreground" />
          </div>
        </div>
      )}

      {/* 置顶/收藏图标 */}
      <div className="absolute top-3 left-3 flex gap-1.5 z-10">
        {project.isPinned && (
          <div className="flex items-center justify-center w-6 h-6 bg-primary/10 rounded-full">
            <Pin className="h-3 w-3 text-primary fill-primary" />
          </div>
        )}
        {project.isFavorite && (
          <div className="flex items-center justify-center w-6 h-6 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
            <Star className="h-3 w-3 text-yellow-600 dark:text-yellow-400 fill-yellow-600 dark:fill-yellow-400" />
          </div>
        )}
      </div>

      <CardContent className="p-6">
        {/* 顶部：项目名称和状态 */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold mb-1 truncate flex items-center gap-2">
              {project.isPinned && <Pin className="h-4 w-4 text-primary" />}
              <Link
                to="/projects/$id"
                params={{ id: project.id }}
                className="hover:text-primary transition-colors"
                onClick={handleProjectClick}
              >
                {project.name}
              </Link>
            </h3>
            {/* 集数范围标签 */}
            {project.episodeRange && (
              <div className="mb-2">
                <Badge variant="secondary" className="gap-1">
                  <Film className="h-3 w-3" />
                  {project.episodeRange}
                </Badge>
              </div>
            )}
            <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
              {project.description || '暂无描述'}
            </p>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <Badge
              variant="outline"
              className={getStatusBadgeColor(project.status)}
            >
              {statusLabel}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>项目操作</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onToggleSelect(project)}>
                  <CheckCircle className={`h-4 w-4 mr-2 ${isSelected ? 'fill-current text-primary' : ''}`} />
                  {isSelected ? '取消选定' : '选定项目'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onToggleFavorite(project)}>
                  <Star className={`h-4 w-4 mr-2 ${project.isFavorite ? 'fill-current text-yellow-500' : ''}`} />
                  {project.isFavorite ? '取消收藏' : '收藏项目'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onTogglePin(project)}>
                  <Pin className={`h-4 w-4 mr-2 ${project.isPinned ? 'fill-current text-primary' : ''}`} />
                  {project.isPinned ? '取消置顶' : '置顶项目'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onEdit(project)}>
                  编辑项目
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/projects/$id/team" params={{ id: project.id }}>
                    管理成员
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/projects/$id/storyboard" params={{ id: project.id }}>
                    分镜头创作
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(project)}
                  className="text-destructive"
                >
                  删除项目
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* 中部：进度条 */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">分镜头进度</span>
            <span className="font-medium">{progressPercentage}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* 底部：统计信息 */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Film className="h-4 w-4" />
              <span>{project.completedShots}/{project.totalShots}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              <span>{project.members.length}</span>
            </div>
            {project.director && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium">导演:</span>
                <Link
                  to="/director/$director"
                  params={{ director: project.director }}
                  className="text-xs hover:text-primary transition-colors hover:underline"
                >
                  {project.director}
                </Link>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span className="text-xs">
              {formatDateTime(project.updatedAt)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function ProjectsPage() {
  const { t } = useI18n()
  const projects = useProjectStore((state) => state.projects)
  const deleteProject = useProjectStore((state) => state.deleteProject)
  const toggleFavorite = useProjectStore((state) => state.toggleFavorite)
  const togglePin = useProjectStore((state) => state.togglePin)
  const selectedProjectId = useProjectStore((state) => state.selectedProjectId)
  const selectProject = useProjectStore((state) => state.selectProject)
  const ensureSelectedProject = useProjectStore((state) => state.ensureSelectedProject)
  const canDeleteProject = useAuthStore((state) => state.canDeleteProject)
  const user = useAuthStore((state) => state.user)
  const getShotsByProject = useStoryboardStore((state) => state.getShotsByProject)
  const addShot = useStoryboardStore((state) => state.addShot)

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<any>(null)
  const [deletingProject, setDeletingProject] = useState<any>(null)
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<SortType>('createdAt')
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())
  const [hasInitialized, setHasInitialized] = useState(false)
  const isInitializingRef = useRef(false)

  useEffect(() => {
    if (user && !hasInitialized && !isInitializingRef.current) {
      isInitializingRef.current = true

      if (projects.length > 0) {
        const summary = getProjectTypeSummary()
        console.log('Current project type summary before cleanup:', summary)
        const clearedCount = clearAllProjects()
        console.log(`Cleared ${clearedCount} duplicate projects`)
        setTimeout(() => {
          seedDiverseProjects(true)
          // 初始化分镜头模拟数据
          setTimeout(() => {
            const storyboardCount = seedAllStoryboardData(false)
            console.log(`自动生成了 ${storyboardCount} 个分镜头数据`)
            setHasInitialized(true)
            isInitializingRef.current = false
          }, 200)
        }, 100)
      } else {
        seedDiverseProjects(true)
        // 初始化分镜头模拟数据
        setTimeout(() => {
          const storyboardCount = seedAllStoryboardData(false)
          console.log(`自动生成了 ${storyboardCount} 个分镜头数据`)
          setHasInitialized(true)
          isInitializingRef.current = false
        }, 200)
      }
    }
  }, [user])

  // 确保有选定的项目
  useEffect(() => {
    if (hasInitialized) {
      ensureSelectedProject()
    }
  }, [hasInitialized, projects, ensureSelectedProject])

  // 排序项目：收藏/置顶优先，然后按指定字段排序
  const sortedProjects = useMemo(() => {
    const result = [...projects]

    // 先按置顶、收藏排序
    result.sort((a, b) => {
      // 置顶优先
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      // 收藏次之
      if (a.isFavorite && !b.isFavorite) return -1
      if (!a.isFavorite && b.isFavorite) return 1

      // 然后按指定字段排序
      switch (sortBy) {
        case 'createdAt':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'updatedAt':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        case 'name':
          return a.name.localeCompare(b.name, 'zh-CN')
        default:
          return 0
      }
    })

    return result
  }, [projects, sortBy])

  // 筛选项目：状态筛选 + 搜索筛选
  const filteredProjects = useMemo(() => {
    let result = sortedProjects

    // 状态筛选
    if (selectedStatus) {
      result = result.filter(p => p.status === selectedStatus)
    }

    // 搜索筛选（不区分大小写）
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim()
      result = result.filter(p =>
        p.name.toLowerCase().includes(searchLower) ||
        (p.description && p.description.toLowerCase().includes(searchLower)) ||
        (p.director && p.director.toLowerCase().includes(searchLower))
      )
    }

    return result
  }, [sortedProjects, selectedStatus, searchTerm])

  // 按状态分组（用于分组视图）
  const groupedProjects = useMemo(() => {
    const groups: Record<string, typeof projects> = {
      planning: [],
      filming: [],
      postProduction: [],
      completed: [],
    }

    filteredProjects.forEach(project => {
      if (groups[project.status]) {
        groups[project.status].push(project)
      }
    })

    return groups
  }, [filteredProjects])

  // 分组顺序和标签
  const groupOrder = ['planning', 'filming', 'postProduction', 'completed'] as const

  const handleEditProject = (project: any) => {
    setEditingProject(project)
    setIsCreateDialogOpen(true)
  }

  const handleDeleteProject = (project: any) => {
    // 检查删除权限
    if (!canDeleteProject(project.createdBy)) {
      toast.error('您没有权限删除此项目，只有管理员可以删除项目')
      return
    }
    setDeletingProject(project)
  }

  const handleToggleFavorite = (project: any) => {
    toggleFavorite(project.id)
  }

  const handleTogglePin = (project: any) => {
    togglePin(project.id)
  }

  const handleToggleSelect = (project: any) => {
    if (selectedProjectId === project.id) {
      const firstProject = filteredProjects[0]
      if (firstProject && firstProject.id !== project.id) {
        selectProject(firstProject.id)
        toast.success(`已切换选定项目：${firstProject.name}`)
      } else {
        selectProject(null)
        toast.success('已取消选定项目')
      }
    } else {
      selectProject(project.id)
      toast.success(`已选定项目：${project.name}`)
    }
  }

  const handleGenerateShots = (project: any) => {
    const existingShots = getShotsByProject(project.id)
    if (existingShots.length > 0) {
      toast.error('该项目已有分镜头数据，请先清空或手动添加')
      return
    }

    const { generateMockShots } = require('@/lib/mock-shots')
    const mockShots = generateMockShots(project.id, project.type)

    mockShots.forEach((shot: any) => {
      addShot(shot)
    })

    toast.success(`已为项目"${project.name}"生成${mockShots.length}个分镜头`)
  }

  const handleToggleGroup = (status: string) => {
    setCollapsedGroups((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(status)) {
        newSet.delete(status)
      } else {
        newSet.add(status)
      }
      return newSet
    })
  }

  const confirmDelete = () => {
    if (deletingProject) {
      // 再次确认权限
      if (!canDeleteProject(deletingProject.createdBy)) {
        toast.error('您没有权限删除此项目')
        setDeletingProject(null)
        return
      }
      deleteProject(deletingProject.id)
      toast.success('项目已删除')
      setDeletingProject(null)
      // 删除后确保有选定的项目
      setTimeout(() => {
        ensureSelectedProject()
      }, 0)
    }
  }

  const handleCloseDialog = () => {
    setIsCreateDialogOpen(false)
    setEditingProject(null)
  }

  const topNav = [
    {
      title: '项目列表',
      href: '/projects',
      isActive: true,
      disabled: false,
    },
  ]

  return (
    <>
      <Header>
        <TopNav links={topNav} />
        <div className="ms-auto flex items-center space-x-4">
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t.project.projects}
            </h1>
            <p className="text-muted-foreground">
              管理您的短剧创作项目
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t.project.createProject}
          </Button>
        </div>

        {/* 控制栏：搜索、排序、视图切换、状态筛选 */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
            <ProjectSearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder={t.project.searchPlaceholder}
            />
            <div className="flex items-center gap-2">
              <ProjectSortSelect value={sortBy} onChange={setSortBy} />
              <ProjectViewToggle value={viewMode} onChange={setViewMode} />
            </div>
          </div>

          {/* 当前选定项目提示 */}
          {selectedProjectId && (
            <div className="flex items-center justify-between gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">当前选定项目：</span>
                <span className="text-sm">
                  {projects.find(p => p.id === selectedProjectId)?.name || '未知'}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const selectedProject = projects.find(p => p.id === selectedProjectId)
                  if (selectedProject) {
                    handleGenerateShots(selectedProject)
                  }
                }}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                生成分镜头
              </Button>
            </div>
          )}

          {/* 状态筛选 */}
          <div className="flex gap-2 flex-wrap">
          <Button
            variant={selectedStatus === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedStatus(null)}
          >
            全部
          </Button>
          <Button
            variant={selectedStatus === 'planning' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedStatus('planning')}
          >
            {t.project.status.planning}
          </Button>
          <Button
            variant={selectedStatus === 'filming' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedStatus('filming')}
          >
            {t.project.status.filming}
          </Button>
          <Button
            variant={selectedStatus === 'postProduction' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedStatus('postProduction')}
          >
            {t.project.status.postProduction}
          </Button>
          <Button
            variant={selectedStatus === 'completed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedStatus('completed')}
          >
            {t.project.status.completed}
          </Button>
          </div>


        </div>

        {/* 项目卡片/分组视图 */}
        {filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Card className="max-w-md w-full border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Plus className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  {searchTerm ? '未找到匹配的项目' : selectedStatus ? '该状态下暂无项目' : '暂无项目'}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 text-center">
                  {searchTerm
                    ? '尝试使用其他关键词搜索'
                    : selectedStatus
                      ? '尝试切换到其他状态筛选'
                      : '创建您的第一个短剧项目开始创作'
                  }
                </p>
                {!searchTerm && !selectedStatus && (
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    {t.project.createProject}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        ) : viewMode === 'list' ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={handleEditProject}
                onDelete={handleDeleteProject}
                onToggleFavorite={handleToggleFavorite}
                onTogglePin={handleTogglePin}
                onToggleSelect={handleToggleSelect}
                isSelected={selectedProjectId === project.id}
              />
            ))}
          </div>
        ) : (
          // 分组视图
          <div className="space-y-6">
            {groupOrder.map((status) => {
              const groupProjects = groupedProjects[status]
              if (groupProjects.length === 0) return null

              const isCollapsed = collapsedGroups.has(status)

              return (
                <Collapsible key={status} open={!isCollapsed} onOpenChange={(open) => !open && handleToggleGroup(status)}>
                  <Card>
                    <CardHeader
                      className="pb-4 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleToggleGroup(status)}
                    >
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          {getStatusLabel(status, t)} ({groupProjects.length})
                        </CardTitle>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <svg
                            className={`h-4 w-4 transition-transform ${isCollapsed ? '' : 'rotate-180'}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </Button>
                      </div>
                    </CardHeader>
                    <CollapsibleContent>
                      <CardContent>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {groupProjects.map((project) => (
                            <ProjectCard
                              key={project.id}
                              project={project}
                              onEdit={handleEditProject}
                              onDelete={handleDeleteProject}
                              onToggleFavorite={handleToggleFavorite}
                              onTogglePin={handleTogglePin}
                              onToggleSelect={handleToggleSelect}
                              isSelected={selectedProjectId === project.id}
                            />
                          ))}
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              )
            })}
          </div>
        )}
      </Main>

      {/* 创建/编辑项目对话框 */}
      <ProjectFormDialog
        open={isCreateDialogOpen}
        onOpenChange={handleCloseDialog}
        project={editingProject}
      />

      {/* 删除确认对话框 */}
      <Card className="hidden">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-2">确认删除</h3>
          <p className="text-muted-foreground mb-4">
            确定要删除项目"{deletingProject?.name}"吗？此操作将永久删除该项目及其所有关联数据（包括分镜头、剧本等），无法恢复。
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setDeletingProject(null)}>
              取消
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              确认删除
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 删除确认浮层 */}
      {deletingProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">确认删除</h3>
              <p className="text-muted-foreground mb-4">
                确定要删除项目"<strong>{deletingProject.name}</strong>"吗？
              </p>
              <p className="text-sm text-destructive mb-6">
                ⚠️ 此操作将永久删除该项目及其所有关联数据（包括分镜头、剧本、成员信息等），无法恢复。
              </p>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setDeletingProject(null)}>
                  取消
                </Button>
                <Button variant="destructive" onClick={confirmDelete}>
                  确认删除
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
