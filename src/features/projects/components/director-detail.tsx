import { useMemo } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Film, Users, Clock } from 'lucide-react'
import { useProjectStore } from '@/stores/project-store'
import { useI18n } from '@/i18n'
import { formatDateTime } from '@/lib/utils'

function getStatusLabel(status: string, t: any) {
  const statusKey = status as keyof typeof t.project.status
  return t.project.status[statusKey] || status
}

function getStatusBadgeColor(status: string) {
  switch (status) {
    case 'planning':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-200 dark:border-blue-800'
    case 'filming':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 border-orange-200 dark:border-orange-800'
    case 'postProduction':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 border-purple-200 dark:border-purple-800'
    case 'completed':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200 dark:border-green-800'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 border-gray-200 dark:border-gray-800'
  }
}

function DirectorProjectCard({ project }: { project: any }) {
  const { t } = useI18n()
  const statusLabel = getStatusLabel(project.status, t)
  const progressPercentage = project.totalShots > 0
    ? Math.round((project.completedShots / project.totalShots) * 100)
    : 0

  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-border/50 hover:border-primary/50">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <Link
              to="/projects/$id"
              params={{ id: project.id }}
              className="text-lg font-semibold mb-1 hover:text-primary transition-colors"
            >
              {project.name}
            </Link>
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
          <Badge
            variant="outline"
            className={getStatusBadgeColor(project.status)}
          >
            {statusLabel}
          </Badge>
        </div>

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

export function DirectorDetailPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { director } = Route.useParams()
  const projects = useProjectStore((state) => state.projects)

  const directorProjects = useMemo(() => {
    return projects.filter(p => p.director === director)
  }, [projects, director])

  const stats = useMemo(() => {
    const totalProjects = directorProjects.length
    const completedProjects = directorProjects.filter(p => p.status === 'completed').length
    const totalShots = directorProjects.reduce((sum, p) => sum + p.totalShots, 0)
    const completedShots = directorProjects.reduce((sum, p) => sum + p.completedShots, 0)
    const totalMembers = directorProjects.reduce((sum, p) => sum + p.members.length, 0)

    return {
      totalProjects,
      completedProjects,
      totalShots,
      completedShots,
      totalMembers,
      progressPercentage: totalShots > 0 ? Math.round((completedShots / totalShots) * 100) : 0,
    }
  }, [directorProjects])

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate({ to: '/projects' })}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回项目列表
        </Button>
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          {director}
        </h1>
        <p className="text-muted-foreground">
          查看该导演参与的所有项目
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              总项目数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
            <p className="text-xs text-muted-foreground mt-1">
              已完成 {stats.completedProjects} 个
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              分镜头总数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalShots}</div>
            <p className="text-xs text-muted-foreground mt-1">
              已完成 {stats.completedShots} 个
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              总体进度
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.progressPercentage}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              基于所有项目
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              团队成员
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMembers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              所有项目合计
            </p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">
          项目列表 ({directorProjects.length})
        </h2>
        {directorProjects.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Film className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                暂无项目
              </h3>
              <p className="text-sm text-muted-foreground text-center">
                该导演暂无参与的项目
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {directorProjects.map((project) => (
              <DirectorProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
