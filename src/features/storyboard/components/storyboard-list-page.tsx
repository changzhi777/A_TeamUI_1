/**
 * storyboard-list-page
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import { useState, useMemo, useEffect } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb'
import { Link } from '@tanstack/react-router'
import { useStoryboardStore, type StoryboardShot } from '@/stores/storyboard-store'
import { useProjectStore } from '@/stores/project-store'
import { useCustomFieldStore, formatFieldValue } from '@/stores/custom-field-store'
import { ShotListTable } from './shot-list-table'
import { ShotFormDialog } from './shot-form-dialog'
import { TemplateExportDialog } from './template-export-dialog'
import { TemplateImportDialog } from './template-import-dialog'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { toast } from 'sonner'
import { Download, FileUp, Upload, MoreVertical, RefreshCw, Trash2, FileJson, FileSpreadsheet } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { seedAllStoryboardData, clearStoryboardSeedData } from '@/lib/seed-storyboard-data'
import { getTestShotData, generateTestCSVFile, generateTestJSONFile, generateTestFilename } from '@/lib/test-data-files'

export function StoryboardListPage() {
  const allShots = useStoryboardStore((state) => state.shots)
  const deleteShot = useStoryboardStore((state) => state.deleteShot)
  const deleteShots = useStoryboardStore((state) => state.deleteShots)
  const deselectAllShots = useStoryboardStore((state) => state.deselectAllShots)
  const selectedShotIds = useStoryboardStore((state) => state.selectedShotIds)
  const allProjects = useProjectStore((state) => state.projects)
  const selectedProjectIdFromStore = useProjectStore((state) => state.selectedProjectId)

  const [selectedProjectId, setSelectedProjectId] = useState<string | 'all'>(() => {
    return selectedProjectIdFromStore || 'all'
  })
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [singleDeleteId, setSingleDeleteId] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingShot, setEditingShot] = useState<StoryboardShot | null>(null)
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [regenerateConfirmOpen, setRegenerateConfirmOpen] = useState(false)
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false)

  // 同步selectedProjectIdFromStore到selectedProjectId
  useEffect(() => {
    if (selectedProjectIdFromStore && selectedProjectId !== selectedProjectIdFromStore) {
      setSelectedProjectId(selectedProjectIdFromStore)
    }
  }, [selectedProjectIdFromStore, selectedProjectId])

  // 按项目筛选分镜头
  const filteredShots = useMemo(() => {
    if (selectedProjectId === 'all') {
      return allShots
    }
    return allShots.filter((s) => s.projectId === selectedProjectId)
  }, [allShots, selectedProjectId])

  const handleBatchDelete = () => {
    if (selectedShotIds.length > 0) {
      deleteShots(selectedShotIds)
      setDeleteConfirmOpen(false)
      deselectAllShots()
      toast.success(`已删除 ${selectedShotIds.length} 个镜头`)
    }
  }

  const handleEdit = (shot: StoryboardShot) => {
    setEditingShot(shot)
    setIsFormOpen(true)
  }

  const handleDelete = (shotId: string) => {
    setSingleDeleteId(shotId)
  }

  const handleSingleDeleteConfirm = () => {
    if (singleDeleteId) {
      deleteShot(singleDeleteId)
      setSingleDeleteId(null)
      toast.success('镜头删除成功')
    }
  }

  // Get custom fields for the current project scope
  const { getMergedFields } = useCustomFieldStore()
  const customFields = selectedProjectId === 'all' ? [] : getMergedFields(selectedProjectId)

  // 导出为 CSV
  const handleExportCSV = () => {
    // CSV 表头 - 包含固定字段和自定义字段
    const baseHeaders = ['镜头编号', '季数', '集数', '场次', '景别', '运镜方式', '时长', '画面描述', '对白/旁白', '音效说明', '项目']
    const customHeaders = customFields.map((f) => f.name)
    const headers = [...baseHeaders, ...customHeaders]

    // 转换函数
    const getShotSizeLabel = (size: string) => {
      const labels: Record<string, string> = {
        extremeLong: '远景',
        long: '全景',
        medium: '中景',
        closeUp: '近景',
        extremeCloseUp: '特写',
      }
      return labels[size] || size
    }

    const getCameraMovementLabel = (movement: string) => {
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

    const formatDuration = (seconds: number) => {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const getProjectName = (projectId: string) => {
      const project = allProjects.find((p) => p.id === projectId)
      return project?.name || '未知项目'
    }

    const escapeCSV = (value: string) => {
      if (!value) return ''
      return `"${value.replace(/"/g, '""')}"`
    }

    // 转换数据
    const rows = filteredShots.map((shot) => {
      const baseValues = [
        shot.shotNumber,
        shot.seasonNumber ?? '',
        shot.episodeNumber ?? '',
        shot.sceneNumber,
        getShotSizeLabel(shot.shotSize),
        getCameraMovementLabel(shot.cameraMovement),
        formatDuration(shot.duration),
        escapeCSV(shot.description),
        escapeCSV(shot.dialogue || ''),
        escapeCSV(shot.sound || ''),
        escapeCSV(getProjectName(shot.projectId)),
      ]

      // Add custom field values
      const customValues = customFields.map((field) => {
        const value = shot.customFields?.[field.id] ?? null
        const formattedValue = formatFieldValue(value, field)
        return escapeCSV(formattedValue)
      })

      return [...baseValues, ...customValues]
    })

    // 组合 CSV
    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n')

    // 添加 BOM 以支持 Excel 正确显示中文
    const BOM = '\uFEFF'
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })

    // 下载
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `分镜头清单_${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast.success('导出成功')
  }

  // 重新生成模拟数据
  const handleRegenerateSeedData = () => {
    setRegenerateConfirmOpen(true)
  }

  const confirmRegenerate = () => {
    const count = seedAllStoryboardData(true)
    toast.success(`已重新生成 ${count} 个分镜头数据`)
    setRegenerateConfirmOpen(false)
  }

  // 清除模拟数据
  const handleClearSeedData = () => {
    setClearConfirmOpen(true)
  }

  const confirmClear = () => {
    clearStoryboardSeedData()
    toast.success('已清除所有模拟分镜头数据')
    setClearConfirmOpen(false)
  }

  // 下载测试数据
  const handleDownloadTestDataCSV = () => {
    const testData = getTestShotData()
    const filename = generateTestFilename('csv')
    generateTestCSVFile(testData, filename)
    toast.success('已下载 CSV 测试数据文件，可用于测试导入功能')
  }

  const handleDownloadTestDataJSON = () => {
    const testData = getTestShotData()
    const filename = generateTestFilename('json')
    generateTestJSONFile(testData, filename)
    toast.success('已下载 JSON 测试数据文件，可用于测试导入功能')
  }

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
              <BreadcrumbPage>分镜头清单</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">分镜头清单</h1>
              <p className="text-muted-foreground">查看和管理所有分镜头</p>
            </div>
            <div className="flex items-center gap-2">
              {filteredShots.length > 0 && (
                <Button
                  variant="default"
                  onClick={handleExportCSV}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  快速导出
                </Button>
              )}
              <Button
                variant="default"
                onClick={() => setImportDialogOpen(true)}
              >
                <Upload className="mr-2 h-4 w-4" />
                导入向导
              </Button>
              <Button
                variant="default"
                onClick={() => setExportDialogOpen(true)}
              >
                <FileUp className="mr-2 h-4 w-4" />
                导出向导
              </Button>
              {/* 数据管理下拉菜单 */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleDownloadTestDataCSV}>
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    下载 CSV 测试数据
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDownloadTestDataJSON}>
                    <FileJson className="h-4 w-4 mr-2" />
                    下载 JSON 测试数据
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleRegenerateSeedData}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    重新生成数据
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleClearSeedData} className="text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    清除模拟数据
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* 项目筛选器 */}
          {allProjects.length > 0 && (
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">项目筛选:</label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors"
              >
                <option value="all">全部项目</option>
                {allProjects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* 数据表格 */}
        {filteredShots.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <svg
                  className="h-8 w-8 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">暂无分镜头</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {selectedProjectId === 'all'
                  ? '还没有任何分镜头，先去创建一些吧'
                  : '该项目还没有分镜头'}
              </p>
              <Button asChild>
                <Link to="/projects">前往项目列表</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <ShotListTable
            shots={filteredShots}
            projects={allProjects}
            onBatchDelete={() => setDeleteConfirmOpen(true)}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}

        <ConfirmDialog
          open={deleteConfirmOpen}
          onOpenChange={setDeleteConfirmOpen}
          title="删除选中的镜头"
          desc={`确定要删除选中的 ${selectedShotIds.length} 个镜头吗？此操作不可撤销。`}
          handleConfirm={handleBatchDelete}
        />

        <ConfirmDialog
          open={singleDeleteId !== null}
          onOpenChange={() => setSingleDeleteId(null)}
          title="删除镜头"
          desc="确定要删除此镜头吗？此操作不可撤销。"
          handleConfirm={handleSingleDeleteConfirm}
        />

        <ConfirmDialog
          open={regenerateConfirmOpen}
          onOpenChange={setRegenerateConfirmOpen}
          title="重新生成数据"
          desc="此操作将清除所有现有的模拟分镜头数据，并为演示项目重新生成。用户手动创建的分镜头将保留。是否继续？"
          handleConfirm={confirmRegenerate}
        />

        <ConfirmDialog
          open={clearConfirmOpen}
          onOpenChange={setClearConfirmOpen}
          title="清除模拟数据"
          desc="此操作将清除所有模拟生成的分镜头数据，但不会影响用户手动创建的分镜头。是否继续？"
          handleConfirm={confirmClear}
        />

        <ShotFormDialog
          open={isFormOpen}
          onOpenChange={(open) => {
            setIsFormOpen(open)
            if (!open) setEditingShot(null)
          }}
          projectId={editingShot?.projectId || selectedProjectId === 'all' ? '' : selectedProjectId}
          shot={editingShot}
        />

        <TemplateImportDialog
          open={importDialogOpen}
          onOpenChange={setImportDialogOpen}
          projectId={selectedProjectId === 'all' ? (allProjects.length > 0 ? allProjects[0].id : '') : selectedProjectId}
        />
        <TemplateExportDialog
          open={exportDialogOpen}
          onOpenChange={setExportDialogOpen}
          shots={filteredShots}
          projectName={selectedProjectId === 'all' ? undefined : allProjects.find(p => p.id === selectedProjectId)?.name}
        />
      </Main>
    </>
  )
}
