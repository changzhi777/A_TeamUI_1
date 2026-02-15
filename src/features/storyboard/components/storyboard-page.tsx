/**
 * storyboard-page
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import { useState, useEffect, useMemo } from 'react'
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { useI18n } from '@/i18n'
import { useProjectStore } from '@/stores/project-store'
import { useStoryboardStore, type ViewMode } from '@/stores/storyboard-store'
import {
  ArrowLeft,
  Plus,
  Grid3x3,
  List,
  Timer,
  Trash2,
  Copy,
  Download,
  Sparkles,
} from 'lucide-react'
import { ShotCard } from './shot-card'
import { ShotFormDialog } from './shot-form-dialog'
import { ExportDialog } from './export-dialog'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { toast } from 'sonner'

const viewModes = [
  { value: 'list' as ViewMode, label: '列表', icon: List },
  { value: 'grid' as ViewMode, label: '网格', icon: Grid3x3 },
  { value: 'timeline' as ViewMode, label: '时间轴', icon: Timer },
]

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

export function StoryboardPage() {
  const { t } = useI18n()
  const { id } = useParams({ strict: false })
  const navigate = useNavigate()
  const getProjectById = useProjectStore((state) => state.getProjectById)
  const updateShotProgress = useProjectStore((state) => state.updateShotProgress)

  // 获取所有 shots
  const allShots = useStoryboardStore((state) => state.shots)
  const viewMode = useStoryboardStore((state) => state.viewMode)
  const selectedShotIds = useStoryboardStore((state) => state.selectedShotIds)
  const setViewMode = useStoryboardStore((state) => state.setViewMode)
  const setCurrentProject = useStoryboardStore((state) => state.setCurrentProject)
  const deselectAllShots = useStoryboardStore((state) => state.deselectAllShots)
  const deleteSelectedShots = useStoryboardStore((state) => state.deleteSelectedShots)
  const duplicateShots = useStoryboardStore((state) => state.duplicateShots)

  // 使用 useMemo 来过滤和排序 shots
  const shots = useMemo(
    () => allShots.filter((s) => s.projectId === id).sort((a, b) => a.shotNumber - b.shotNumber),
    [allShots, id]
  )

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingShot, setEditingShot] = useState<any>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [isExportOpen, setIsExportOpen] = useState(false)

  const project = getProjectById(id)

  useEffect(() => {
    setCurrentProject(id)
    return () => setCurrentProject(null)
  }, [id])

  // 更新项目进度 - 只在 shots 数量变化时更新
  useEffect(() => {
    if (project) {
      const total = shots.length
      const completed = shots.filter((s) => s.image).length
      if (total !== project.totalShots || completed !== project.completedShots) {
        updateShotProgress(id, total, completed)
      }
    }
  }, [shots.length, project?.totalShots, project?.completedShots, id])

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
            <Button onClick={() => navigate({ to: '/projects' })}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回项目列表
            </Button>
          </div>
        </Main>
      </>
    )
  }

  const handleCreateShot = () => {
    setEditingShot(null)
    setIsFormOpen(true)
  }

  const handleEditShot = (shot: any) => {
    setEditingShot(shot)
    setIsFormOpen(true)
  }

  const handleDeleteSelected = () => {
    deleteSelectedShots()
    setDeleteConfirmOpen(false)
    deselectAllShots()
    toast.success(`已删除 ${selectedShotIds.length} 个镜头`)
  }

  const handleDuplicateSelected = () => {
    duplicateShots(selectedShotIds)
    deselectAllShots()
    toast.success(`已复制 ${selectedShotIds.length} 个镜头`)
  }

  const handleExport = () => {
    setIsExportOpen(true)
  }

  const handleAiGenerate = () => {
    toast.info('AI 生成分镜头功能即将推出', {
      description: '敬请期待',
      action: {
        label: '通知我',
        onClick: () => toast.success('已记录您的邮箱，功能上线时将通知您'),
      },
    })
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
              <BreadcrumbLink asChild>
                <Link to="/projects/$id" params={{ id: project.id }}>
                  {project.name}
                </Link>
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
              <p className="text-muted-foreground">{project.name}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleAiGenerate}>
                <Sparkles className="mr-2 h-4 w-4" />
                AI 生成
              </Button>
              <Button variant="outline" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                导出
              </Button>
              <Button onClick={handleCreateShot}>
                <Plus className="mr-2 h-4 w-4" />
                添加镜头
              </Button>
            </div>
          </div>

          {/* 统计信息 */}
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">镜头数:</span>
              <Badge variant="secondary">{shots.length}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">总时长:</span>
              <Badge variant="secondary">{Math.floor(totalDuration / 60)}:{(totalDuration % 60).toString().padStart(2, '0')}</Badge>
            </div>
            {selectedShotIds.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">已选择:</span>
                <Badge variant="default">{selectedShotIds.length}</Badge>
              </div>
            )}
          </div>
        </div>

        {/* 批量操作栏 */}
        {selectedShotIds.length > 0 && (
          <Card className="mb-4 border-primary">
            <CardContent className="py-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">
                  已选择 {selectedShotIds.length} 个镜头
                </span>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={handleDuplicateSelected}>
                    <Copy className="mr-2 h-4 w-4" />
                    复制
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteConfirmOpen(true)}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    删除
                  </Button>
                  <Button variant="ghost" size="sm" onClick={deselectAllShots}>
                    取消选择
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 视图切换 */}
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              {viewModes.map((mode) => {
                const Icon = mode.icon
                return (
                  <TabsTrigger key={mode.value} value={mode.value}>
                    <Icon className="mr-2 h-4 w-4" />
                    {mode.label}
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </div>

          <TabsContent value="list">
            {shots.length === 0 ? (
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
          </TabsContent>

          <TabsContent value="grid">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {shots.map((shot) => (
                <ShotCard
                  key={shot.id}
                  shot={shot}
                  onEdit={handleEditShot}
                  getShotSizeLabel={getShotSizeLabel}
                  getCameraMovementLabel={getCameraMovementLabel}
                  compact
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="timeline">
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  <Timer className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>时间轴视图即将推出</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </Main>

      <ShotFormDialog
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open)
          if (!open) setEditingShot(null)
        }}
        projectId={id}
        shot={editingShot}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="删除选中的镜头"
        description={`确定要删除选中的 ${selectedShotIds.length} 个镜头吗？此操作不可撤销。`}
        onConfirm={handleDeleteSelected}
      />

      <ExportDialog open={isExportOpen} onOpenChange={setIsExportOpen} />
    </>
  )
}
