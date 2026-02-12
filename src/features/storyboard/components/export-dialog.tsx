import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { FileText, FileJson, Download } from 'lucide-react'
import { exportToPDF } from '@/lib/export'
import { exportToWord } from '@/lib/export'
import { exportProjectToJSON } from '@/lib/export'
import { useProjectStore } from '@/stores/project-store'
import { useStoryboardStore } from '@/stores/storyboard-store'
import { toast } from 'sonner'
import { useParams } from '@tanstack/react-router'

interface ExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ExportDialog({ open, onOpenChange }: ExportDialogProps) {
  const { id } = useParams({ strict: false })
  const getProjectById = useProjectStore((state) => state.getProjectById)
  const getShotsByProject = useStoryboardStore((state) => state.getShotsByProject)

  const [isExporting, setIsExporting] = useState(false)

  const project = getProjectById(id)
  const shots = getShotsByProject(id)

  if (!project) return null

  const handleExportPDF = async () => {
    if (shots.length === 0) {
      toast.error('暂无分镜头可导出')
      return
    }

    setIsExporting(true)
    try {
      await exportToPDF(project, shots)
      toast.success('PDF 导出成功')
      onOpenChange(false)
    } catch (error) {
      console.error('PDF export error:', error)
      toast.error('PDF 导出失败，请重试')
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportWord = async () => {
    if (shots.length === 0) {
      toast.error('暂无分镜头可导出')
      return
    }

    setIsExporting(true)
    try {
      await exportToWord(project, shots)
      toast.success('Word 导出成功')
      onOpenChange(false)
    } catch (error) {
      console.error('Word export error:', error)
      toast.error('Word 导出失败，请重试')
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportJSON = () => {
    setIsExporting(true)
    try {
      exportProjectToJSON(project, shots)
      toast.success('JSON 导出成功')
      onOpenChange(false)
    } catch (error) {
      console.error('JSON export error:', error)
      toast.error('JSON 导出失败，请重试')
    } finally {
      setIsExporting(false)
    }
  }

  const exportOptions = [
    {
      id: 'pdf',
      title: '导出为 PDF',
      description: '生成适合打印和分享的 PDF 文档',
      icon: FileText,
      color: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-950',
      onClick: handleExportPDF,
    },
    {
      id: 'word',
      title: '导出为 Word',
      description: '生成可编辑的 Word 文档',
      icon: FileText,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
      onClick: handleExportWord,
    },
    {
      id: 'json',
      title: '导出为 JSON',
      description: '导出项目数据用于备份或迁移',
      icon: FileJson,
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-950',
      onClick: handleExportJSON,
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>导出分镜头</DialogTitle>
          <DialogDescription>
            选择导出格式，当前项目包含 {shots.length} 个分镜头
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-4">
          {exportOptions.map((option) => {
            const Icon = option.icon
            return (
              <button
                key={option.id}
                onClick={option.onClick}
                disabled={isExporting}
                className={`flex items-start gap-4 p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-accent transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed ${option.bgColor}`}
              >
                <div className={`p-2 rounded-md ${option.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{option.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {option.description}
                  </p>
                </div>
                {isExporting && (
                  <Download className="h-5 w-5 animate-pulse text-muted-foreground" />
                )}
              </button>
            )
          })}
        </div>

        <div className="text-xs text-muted-foreground text-center">
          导出的文件将自动下载到您的下载文件夹
        </div>
      </DialogContent>
    </Dialog>
  )
}
