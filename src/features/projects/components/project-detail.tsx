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
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { useI18n } from '@/i18n'
import { useProjectStore } from '@/stores/project-store'
import { ArrowLeft, Users, Film, FileText, Settings, Video, Star, Pin } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { ProjectFormDialog } from './project-form-dialog'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { User } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'

function getStatusBadgeColor(status: string) {
  switch (status) {
    case 'planning':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    case 'filming':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    case 'postProduction':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    case 'completed':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }
}

function QuickActionCard({
  title,
  description,
  icon: Icon,
  to,
  params,
  onClick,
}: {
  title: string
  description: string
  icon: any
  to?: string
  params?: any
  onClick?: () => void
}) {
  const content = (
    <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription className="text-sm">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
    </Card>
  )

  if (to) {
    if (params) {
      return <Link to={to} params={params}>{content}</Link>
    }
    return <Link to={to}>{content}</Link>
  }

  return (
    <div onClick={onClick} onKeyDown={(e) => e.key === 'Enter' && onClick?.()} role="button" tabIndex={0}>
      {content}
    </div>
  )
}

export function ProjectDetailPage() {
  const { t } = useI18n()
  const { id } = useParams({ strict: false })
  const navigate = useNavigate()
  const getProjectById = useProjectStore((state) => state.getProjectById)
  const toggleFavorite = useProjectStore((state) => state.toggleFavorite)
  const togglePin = useProjectStore((state) => state.togglePin)
  const setCurrentProjectId = useProjectStore((state) => state.setCurrentProjectId)

  const project = id ? getProjectById(id) : undefined
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  // 设置当前项目ID
  useEffect(() => {
    if (id) {
      setCurrentProjectId(id)
    }
  }, [id, setCurrentProjectId])

  if (!project) {
    return (
      <>
        <Header>
          <div className="ms-auto flex items-center space-x-4">
            <ThemeSwitch />
            <ProfileDropdown />
          </div>
        </Header>
        <Main>
          <div className="flex flex-col items-center justify-center py-12">
            <h2 className="text-2xl font-bold mb-4">项目不存在</h2>
            <p className="text-muted-foreground mb-6">未找到指定的项目</p>
            <Button onClick={() => navigate({ to: '/projects' })}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回项目列表
            </Button>
          </div>
        </Main>
      </>
    )
  }

  const statusKey = project.status as keyof typeof t.project.status
  const statusLabel = t.project.status[statusKey] || project.status

  const typeKey = project.type as keyof typeof t.project.type
  const typeLabel = t.project.type[typeKey] || project.type

  const progressPercentage = project.totalShots > 0
    ? Math.round((project.completedShots / project.totalShots) * 100)
    : 0

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
        {/* 面包屑导航 */}
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/projects">项目列表</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{project.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* 项目头部 */}
        <div className="mb-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
                <Badge className={getStatusBadgeColor(project.status)}>
                  {statusLabel}
                </Badge>
              </div>
              {/* 集数范围标签 */}
              {project.episodeRange && (
                <div>
                  <Badge variant="secondary" className="gap-1">
                    <Film className="h-3 w-3" />
                    {project.episodeRange}
                  </Badge>
                </div>
              )}
              <p className="text-muted-foreground">{project.description || '暂无描述'}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                <span>类型: {typeLabel}</span>
                <span>•</span>
                <span>创建于 {formatDateTime(project.createdAt)}</span>
              </div>
              {project.director && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>导演: {project.director}</span>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => toggleFavorite(project.id)}
                      className={project.isFavorite ? 'text-yellow-500 border-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-950/20' : ''}
                    >
                      <Star className={`h-4 w-4 ${project.isFavorite ? 'fill-current' : ''}`} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{project.isFavorite ? '取消收藏' : '收藏项目'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => togglePin(project.id)}
                      className={project.isPinned ? 'text-primary border-primary hover:bg-primary/10' : ''}
                    >
                      <Pin className={`h-4 w-4 ${project.isPinned ? 'fill-current' : ''}`} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{project.isPinned ? '取消置顶' : '置顶项目'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
                编辑项目
              </Button>
            </div>
          </div>
        </div>

        {/* 进度概览 */}
        <div className="grid gap-4 sm:grid-cols-3 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                分镜头进度
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-2xl font-bold">
                    {project.completedShots} / {project.totalShots}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {progressPercentage}% 完成
                  </p>
                </div>
                <div className="h-16 w-32">
                  {/* 简单的进度条可视化 */}
                  <div className="h-full bg-secondary rounded-lg overflow-hidden flex">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                团队成员
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div className="text-2xl font-bold">{project.members.length}</div>
                <div className="text-sm text-muted-foreground">
                  {project.members.filter((m) => m.role === 'admin').length} 管理员
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                最后更新
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatDateTime(project.updatedAt)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 快捷操作 */}
        <h2 className="text-xl font-semibold mb-4">快捷操作</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <QuickActionCard
            title="分镜头创作"
            description="创建和管理分镜头"
            icon={Video}
            to="/projects/$id/storyboard"
            params={{ id: project.id }}
          />
          <QuickActionCard
            title="剧本编辑"
            description="编辑项目剧本"
            icon={FileText}
            to="/projects/$id/script"
            params={{ id: project.id }}
          />
          <QuickActionCard
            title="团队成员"
            description="管理项目成员"
            icon={Users}
            to="/projects/$id/team"
            params={{ id: project.id }}
          />
          <QuickActionCard
            title="项目设置"
            description="配置项目选项"
            icon={Settings}
          />
        </div>

        {/* 项目统计图表占位 */}
        <h2 className="text-xl font-semibold mb-4">项目统计</h2>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">统计图表即将推出</p>
          </CardContent>
        </Card>
      </Main>

      {/* 编辑项目对话框 */}
      <ProjectFormDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        project={project}
      />
    </>
  )
}
