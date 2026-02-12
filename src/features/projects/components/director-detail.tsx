import { useMemo } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useParams } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { useProjectStore } from '@/stores/project-store'
import { ArrowLeft, Users, Film, FileText, Settings, Video, Star, Pin } from 'lucide-react'

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

interface QuickActionCardProps {
  title: string
  description: string
  icon: any
  to?: string
  params?: any
  onClick?: () => void
}

function QuickActionCard({
  title,
  description,
  icon,
  to,
  params,
  onClick,
}: QuickActionCardProps) {
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

  return content
}

export function DirectorDetailPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const params = useParams({ strict: false })
  const { id } = params
  const projects = useProjectStore((state) => state.projects)

  const directorProjects = useMemo(() => {
    return projects.filter((p): p && 'director' in p && p.director === id)
  }, [projects, director] as any)

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
    }
  })

  return (
    <div>
      <Header />
      <Main className="flex flex-col items-center justify-start">
        <TopNav links={topNav} />
        <ProfileDropdown />
        <ThemeSwitch />
      </Main>

      <div className="max-w-2xl">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink to="/projects">项目</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink to={`/directors/${id}`}>{t.director.name}</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-start justify-between mb-4">
          <h2 className="text-xl font-semibold mb-4">
            项目列表 ({directorProjects.length})
          </h2>
        </div>

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
