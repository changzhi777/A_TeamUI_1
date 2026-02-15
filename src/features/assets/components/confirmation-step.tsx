/**
 * confirmation-step
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

/**
 * Confirmation Step Component
 * 确认上传步骤
 */

import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  FileIcon,
  ImageIcon,
  VideoIcon,
  MusicIcon,
  FileTextIcon,
  Upload,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatAssetFileSize, type AssetType } from '@/lib/types/assets'
import type { SelectedFile } from './file-selection-step'
import type { FileMetadata } from './metadata-step'

interface FileUploadStatus {
  fileId: string
  status: 'pending' | 'uploading' | 'success' | 'error'
  progress: number
  error?: string
}

interface ConfirmationStepProps {
  files: SelectedFile[]
  metadataMap: Map<string, FileMetadata>
  uploadStatuses: Map<string, FileUploadStatus>
  isUploading: boolean
  onStartUpload: () => void
  className?: string
}

// 获取文件图标
function getFileIcon(type: AssetType | 'unknown') {
  switch (type) {
    case 'image':
      return ImageIcon
    case 'video':
      return VideoIcon
    case 'audio':
      return MusicIcon
    case 'script':
      return FileIcon
    case 'aiGenerated':
      return FileTextIcon
    default:
      return FileIcon
  }
}

// 获取类型标签颜色
function getTypeBadgeVariant(type: AssetType): 'default' | 'secondary' | 'outline' | 'destructive' {
  switch (type) {
    case 'image':
      return 'default'
    case 'video':
      return 'secondary'
    case 'audio':
      return 'outline'
    case 'script':
      return 'secondary'
    case 'aiGenerated':
      return 'default'
    default:
      return 'outline'
  }
}

// 类型名称映射
const TYPE_NAMES: Record<AssetType | 'unknown', string> = {
  image: '图片',
  video: '视频',
  audio: '音频',
  script: '剧本',
  aiGenerated: 'AI生成',
  unknown: '未知',
}

export function ConfirmationStep({
  files,
  metadataMap,
  uploadStatuses,
  isUploading,
  onStartUpload,
  className,
}: ConfirmationStepProps) {
  const validFiles = files.filter((f) => f.isValid)

  // 计算总体进度
  const totalProgress = React.useMemo(() => {
    if (validFiles.length === 0) return 0
    const statuses = validFiles.map((f) => uploadStatuses.get(f.id))
    const totalProgressValue = statuses.reduce((sum, status) => sum + (status?.progress || 0), 0)
    return Math.round(totalProgressValue / validFiles.length)
  }, [validFiles, uploadStatuses])

  // 统计上传状态
  const uploadStats = React.useMemo(() => {
    const stats = { pending: 0, uploading: 0, success: 0, error: 0 }
    validFiles.forEach((f) => {
      const status = uploadStatuses.get(f.id)
      if (status) {
        stats[status.status]++
      } else {
        stats.pending++
      }
    })
    return stats
  }, [validFiles, uploadStatuses])

  // 是否全部完成
  const allCompleted = uploadStats.success === validFiles.length && validFiles.length > 0

  // 是否有错误
  const hasErrors = uploadStats.error > 0

  return (
    <div className={cn('space-y-4', className)}>
      {/* 总体进度 */}
      {isUploading && (
        <div className="space-y-2 p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">
              {allCompleted
                ? '上传完成'
                : `正在上传 ${uploadStats.uploading}/${validFiles.length}`}
            </span>
            <span className="text-muted-foreground">{totalProgress}%</span>
          </div>
          <Progress value={totalProgress} className="h-2" />
          <div className="flex gap-4 text-xs text-muted-foreground">
            {uploadStats.success > 0 && (
              <span className="text-green-600">✓ 成功 {uploadStats.success}</span>
            )}
            {uploadStats.error > 0 && (
              <span className="text-destructive">✗ 失败 {uploadStats.error}</span>
            )}
            {uploadStats.pending > 0 && <span>等待 {uploadStats.pending}</span>}
          </div>
        </div>
      )}

      {/* 文件列表 */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium">待上传文件 ({validFiles.length})</h4>
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {validFiles.map((file) => {
            const metadata = metadataMap.get(file.id)
            const status = uploadStatuses.get(file.id)
            const Icon = getFileIcon(file.type)

            return (
              <div
                key={file.id}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-lg border transition-colors',
                  status?.status === 'success'
                    ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900'
                    : status?.status === 'error'
                      ? 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900'
                      : status?.status === 'uploading'
                        ? 'bg-primary/5 border-primary/30'
                        : 'bg-muted/30 border-transparent'
                )}
              >
                {/* 状态图标 */}
                <div className="shrink-0 pt-0.5">
                  {status?.status === 'success' ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : status?.status === 'error' ? (
                    <XCircle className="h-5 w-5 text-destructive" />
                  ) : status?.status === 'uploading' ? (
                    <Loader2 className="h-5 w-5 text-primary animate-spin" />
                  ) : (
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>

                {/* 文件信息 */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium truncate max-w-[200px]" title={file.file.name}>
                      {metadata?.name || file.file.name}
                    </span>
                    <Badge variant={getTypeBadgeVariant(metadata?.type || 'image')} className="text-xs">
                      {TYPE_NAMES[metadata?.type || 'image']}
                    </Badge>
                  </div>

                  <div className="text-xs text-muted-foreground space-x-2">
                    <span>{formatAssetFileSize(file.file.size)}</span>
                    <span>•</span>
                    <span>{file.file.name}</span>
                  </div>

                  {/* 标签 */}
                  {metadata?.tags && metadata.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {metadata.tags.slice(0, 5).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs px-1.5 py-0">
                          {tag}
                        </Badge>
                      ))}
                      {metadata.tags.length > 5 && (
                        <Badge variant="outline" className="text-xs px-1.5 py-0">
                          +{metadata.tags.length - 5}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* 进度条 */}
                  {status?.status === 'uploading' && (
                    <Progress value={status.progress} className="h-1.5 mt-2" />
                  )}

                  {/* 错误信息 */}
                  {status?.status === 'error' && status.error && (
                    <p className="text-xs text-destructive mt-1">{status.error}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 上传按钮 */}
      {!isUploading && !allCompleted && (
        <Button onClick={onStartUpload} className="w-full" size="lg">
          <Upload className="mr-2 h-4 w-4" />
          开始上传 {validFiles.length} 个文件
        </Button>
      )}

      {/* 完成提示 */}
      {allCompleted && (
        <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
          <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-2" />
          <p className="font-medium text-green-700 dark:text-green-400">
            全部上传完成！
          </p>
          <p className="text-sm text-green-600 dark:text-green-500 mt-1">
            成功上传 {uploadStats.success} 个文件
          </p>
        </div>
      )}

      {/* 错误提示 */}
      {hasErrors && !isUploading && !allCompleted && (
        <div className="text-center p-4 bg-destructive/5 rounded-lg">
          <XCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
          <p className="font-medium text-destructive">部分文件上传失败</p>
          <p className="text-sm text-muted-foreground mt-1">
            {uploadStats.error} 个文件失败，{uploadStats.success} 个成功
          </p>
        </div>
      )}
    </div>
  )
}
