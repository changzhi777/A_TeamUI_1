/**
 * 数据导入对话框
 * 用于将导出的 JSON 数据导入到后端系统
 */

'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { projectsApi, storyboardApi } from '@/lib/api'
import { useProjectStore } from '@/stores/project-store'
import { useStoryboardStore } from '@/stores/storyboard-store'

interface ImportData {
  version: string
  exportedAt: string
  projects: any[]
  shots: any[]
}

export function DataImportDialog() {
  const [open, setOpen] = useState<boolean>(false)
  const [jsonText, setJsonText] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [importStats, setImportStats] = useState<{
    totalProjects: number
    importedProjects: number
    totalShots: number
    importedShots: number
  } | null>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      setJsonText(text)
    }
    reader.readAsText(file)
  }

  const validateImportData = (data: any): { valid: boolean; errors: string[] } => {
    const errors: string[] = []

    // 验证版本
    if (!data.version) {
      errors.push('缺少版本信息')
    }

    // 验证项目数据
    if (!Array.isArray(data.projects)) {
      errors.push('项目数据格式错误')
    } else {
      data.projects.forEach((project: any, index: number) => {
        if (!project.name) {
          errors.push(`项目 ${index + 1} 缺少名称`)
        }
        if (!project.type) {
          errors.push(`项目 ${index + 1} 缺少类型`)
        }
      })
    }

    // 验证分镜头数据
    if (!Array.isArray(data.shots)) {
      errors.push('分镜头数据格式错误')
    } else {
      data.shots.forEach((shot: any, index: number) => {
        if (!shot.projectId) {
          errors.push(`分镜头 ${index + 1} 缺少项目ID`)
        }
        if (!shot.shotNumber && shot.shotNumber !== 0) {
          errors.push(`分镜头 ${index + 1} 缺少镜头编号`)
        }
      })
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  const handleImport = async () => {
    const validation = validateImportData(JSON.parse(jsonText))
    if (!validation.valid) {
      toast.error('数据验证失败：\n' + validation.errors.join('\n'))
      return
    }

    setIsProcessing(true)
    setImportStats(null)

    try {
      const data: ImportData = JSON.parse(jsonText)

      // 导入项目
      let importedProjects = 0
      for (const project of data.projects) {
        try {
          await projectsApi.createProject({
            name: project.name,
            description: project.description || '',
            type: project.type || 'other',
            status: project.status || 'planning',
            episodeRange: project.episodeRange || '',
            director: project.director || '',
          })
          importedProjects++
        } catch (error) {
          console.error('Import project error:', error)
        }
      }

      // 导入分镜头
      let importedShots = 0
      for (const shot of data.shots) {
        try {
          await storyboardApi.createShot(shot.projectId, {
            sceneNumber: shot.sceneNumber || '',
            shotSize: shot.shotSize || 'medium',
            cameraMovement: shot.cameraMovement || 'static',
            duration: shot.duration || 0,
            description: shot.description || '',
            dialogue: shot.dialogue || '',
            sound: shot.sound || '',
          })
          importedShots++
        } catch (error) {
          console.error('Import shot error:', error)
        }
      }

      // 更新统计
      setImportStats({
        totalProjects: data.projects.length,
        importedProjects,
        totalShots: data.shots.length,
        importedShots,
      })

      // 刷新项目列表
      await useProjectStore.getState().loadProjects(true)
      await useStoryboardStore.getState().loadShots(data.projects[0]?.id || '', true)

      toast.success(`成功导入 ${importedProjects} 个项目和 ${importedShots} 个分镜头`)
      setJsonText('')
      setOpen(false)
    } catch (error) {
      console.error('Import error:', error)
      toast.error('导入失败：' + (error instanceof Error ? error.message : '未知错误'))
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
      >
        导入数据
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>导入数据</DialogTitle>
            <DialogDescription>
              将之前导出的 JSON 数据粘贴到下方，或选择文件上传。系统将自动创建项目和分镜头。
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* 文件上传 */}
            <div>
              <Label htmlFor="file">选择 JSON 文件</Label>
              <input
                id="file"
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="flex h-10 w-full rounded-md border border-input"
              />
            </div>

            {/* 或手动输入 */}
            <div>
              <Label htmlFor="json">粘贴 JSON 数据</Label>
              <Textarea
                id="json"
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                placeholder='{"version":"1.0.0","projects":[...],"shots":[...]}'
                rows={10}
                className="font-mono text-sm"
              />
            </div>

            {/* 导入统计 */}
            {importStats && (
              <div className="bg-muted p-4 rounded-md text-sm">
                <p className="font-medium">导入统计：</p>
                <ul className="space-y-1">
                  <li>总项目数: {importStats.totalProjects}</li>
                  <li>成功导入: {importStats.importedProjects}</li>
                  <li>总分镜头数: {importStats.totalShots}</li>
                  <li>成功导入: {importStats.importedShots}</li>
                </ul>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                取消
              </Button>
              <Button
                onClick={handleImport}
                disabled={!jsonText || isProcessing}
              >
                {isProcessing ? '导入中...' : '开始导入'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
