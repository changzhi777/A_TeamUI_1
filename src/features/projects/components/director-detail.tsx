/**
 * director-detail
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

/**
 * Director Detail Page
 * 导演详情页面
 */

import React, { useMemo } from 'react'
import { useParams, Link } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { useProjectStore } from '@/stores/project-store'
import { Film, Users, Clapperboard } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

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
  icon: LucideIcon
  to?: string
  onClick?: () => void
}

function QuickActionCard({
  title,
  description,
  icon: Icon,
  to,
  onClick,
}: QuickActionCardProps) {
  return (
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
}

export function DirectorDetailPage() {
  const params = useParams({ strict: false })
  const directorId = (params as any).director || ''
  const projects = useProjectStore((state) => state.projects)

  const directorProjects = useMemo(() => {
    return projects.filter((p) => p.director === directorId)
  }, [projects, directorId])

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
  }, [directorProjects])

  return (
    <div className="container mx-auto py-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/projects">项目</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{directorId}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{directorId}</h1>
            <p className="text-muted-foreground">导演详情</p>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.totalProjects}</div>
              <div className="text-sm text-muted-foreground">参与项目</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.completedProjects}</div>
              <div className="text-sm text-muted-foreground">已完成</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.totalShots}</div>
              <div className="text-sm text-muted-foreground">总分镜</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.totalMembers}</div>
              <div className="text-sm text-muted-foreground">团队成员</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-start justify-between">
          <h2 className="text-xl font-semibold">
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {directorProjects.map((project) => (
              <Link key={project.id} to="/projects/$id" params={{ id: project.id }}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <CardDescription>{project.description || '无描述'}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusBadgeColor(project.status)}>
                        {project.status === 'planning' ? '筹备中' :
                         project.status === 'filming' ? '拍摄中' :
                         project.status === 'postProduction' ? '后期制作' :
                         project.status === 'completed' ? '已完成' : project.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {project.completedShots}/{project.totalShots} 分镜
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
