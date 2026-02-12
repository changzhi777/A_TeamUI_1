import { useState, useEffect } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Link, useNavigate } from '@tanstack/react-router'
import { useI18n } from '@/i18n'
import { useProjectStore } from '@/stores/project-store'
import { useStoryboardStore } from '@/stores/storyboard-store'
import { ArrowLeft, Plus, FolderOpen } from 'lucide-react'
import { ShotCard } from './shot-card'
import { ShotFormDialog } from './shot-form-dialog'
import { useSelectedProjectAPI } from '@/lib/selected-project-api'

function getShotSizeLabel(size: string) {
  const labels: Record<string, string> = {
    extremeLong: '远景',
    long: '全景',
    medium: '中景',
    closeUp: '近景',
    extremeCloseUp: '特写',
  }
  return labels[size] || size
}

function getCameraMovementLabel(movement: string) {
  const labels: Record<string, string> = {
    static: '固定',
    pan: '摇',
    tilt: '俯仰',
    dolly: '推拉',
    truck: '平移',
    pedestral: '升降',
    crane: '吊臂',
    handheld: '手持',
    steadicam: '斯坦尼康',
    tracking: '跟拍',
    arc: '弧形',
  }
  return labels[movement] || movement
}

export function GlobalStoryboardPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const getAllProjects = useProjectStore((state) => state.getAllProjects)
  const getProjectById = useProjectStore((state) => state.getProjectById)
  const updateShotProgress = useProjectStore((state) => state.updateShotProgress)

  const allShots = useStoryboardStore((state) => state.shots)
  const setCurrentProject = useStoryboardStore((state) => state.setCurrentProject)

  const { getSelectedProjectId, getSelectedProject } = useSelectedProjectAPI()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingShot, setEditingShot] = useState<any>(null)

  const projects = getAllProjects()
  const selectedProjectId = getSelectedProjectId()
  const selectedProject = selectedProjectId ? getProjectById(selectedProjectId) : null

  const shots = allShots
    .filter((s) => s.projectId === selectedProjectId)
    .sort((a, b) => a.shotNumber - b.shotNumber)

  useEffect(() => {
    if (selectedProjectId) {
      setCurrentProject(selectedProjectId)
    }
    return () => setCurrentProject(null)
  }, [selectedProjectId])

  useEffect(() => {
    if (selectedProject) {
      const total = shots.length
      const completed = shots.filter((s) => s.image).length
      if (total !== selectedProject.totalShots || completed !== selectedProject.completedShots) {
        updateShotProgress(selectedProjectId, total, completed)
      }
    }
  }, [shots.length, selectedProject?.totalShots, selectedProject?.completedShots, selectedProjectId])

  const handleCreateShot = () => {
    if (!selectedProjectId) return
    setEditingShot(null)
    setIsFormOpen(true)
  }

  const handleEditShot = (shot: any) => {
    setEditingShot(shot)
    setIsFormOpen(true)
  }

  const totalDuration = shots.reduce((sum, shot) => sum + shot.duration, 0)

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
              <BreadcrumbPage>分镜头创作</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">分镜头创作</h1>
              <p className="text-muted-foreground">创建和管理项目的分镜头脚本</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => navigate({ to: '/projects' })}
              >
                <FolderOpen className="mr-2 h-4 w-4" />
                管理项目
              </Button>
              <Button
                onClick={handleCreateShot}
                disabled={!selectedProjectId}
              >
                <Plus className="mr-2 h-4 w-4" />
                添加镜头
              </Button>
            </div>
          </div>

          <div className="mb-4">
            <label className="text-sm font-medium mb-2 block">当前选定项目</label>
            {selectedProject ? (
              <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
                <div className="flex-1">
                  <div className="font-medium">{selectedProject.name}</div>
                  <div className="text-sm text-muted-foreground">{selectedProject.description || '暂无描述'}</div>
                </div>
                <Badge variant="outline">
                  {selectedProject.type === 'shortDrama' && '动漫短剧'}
                  {selectedProject.type === 'realLifeDrama' && '真人短剧'}
                  {selectedProject.type === 'aiPodcast' && 'AI播客'}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate({ to: '/projects' })}
                >
                  切换项目
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 border rounded-lg border-dashed">
                <FolderOpen className="h-8 w-8 text-muted-foreground" />
                <div className="flex-1">
                  <div className="font-medium">未选择项目</div>
                  <div className="text-sm text-muted-foreground">请先在项目列表中选定一个项目</div>
                </div>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => navigate({ to: '/projects' })}
                >
                  前往选择
                </Button>
              </div>
            )}
          </div>

          {selectedProject && (
            <div className="flex gap-4 text-sm mb-4">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">镜头数:</span>
                <Badge variant="secondary">{shots.length}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">总时长:</span>
                <Badge variant="secondary">
                  {Math.floor(totalDuration / 60)}:{(totalDuration % 60).toString().padStart(2, '0')}
                </Badge>
              </div>
            </div>
          )}
        </div>

        {!selectedProjectId ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FolderOpen className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">请选择一个项目</h3>
              <p className="text-sm text-muted-foreground mb-4">
                选择一个项目后即可开始创建分镜头
              </p>
              {projects.length === 0 && (
                <Button onClick={() => navigate({ to: '/projects' })}>
                  <Plus className="mr-2 h-4 w-4" />
                  创建项目
                </Button>
              )}
            </CardContent>
          </Card>
        ) : shots.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Plus className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">暂无分镜头</h3>
              <p className="text-sm text-muted-foreground mb-4">
                创建第一个镜头开始设计您的分镜头脚本
              </p>
              <Button onClick={handleCreateShot}>
                <Plus className="mr-2 h-4 w-4" />
                添加镜头
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {shots.map((shot) => (
              <ShotCard
                key={shot.id}
                shot={shot}
                onEdit={handleEditShot}
                getShotSizeLabel={getShotSizeLabel}
                getCameraMovementLabel={getCameraMovementLabel}
              />
            ))}
          </div>
        )}
      </Main>

      <ShotFormDialog
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open)
          if (!open) setEditingShot(null)
        }}
        projectId={selectedProjectId}
        shot={editingShot}
      />
    </>
  )
}
