/**
 * File Selection Step Component
 * 文件选择步骤
 */

import React, { useState, useCallback } from 'react'
import { Upload, X, FileIcon, ImageIcon, VideoIcon, MusicIcon, FileTextIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ASSET_SIZE_LIMITS, formatAssetFileSize, type AssetType } from '@/lib/types/assets'

export interface SelectedFile {
  id: string
  file: File
  type: AssetType | 'unknown'
  isValid: boolean
  errorMessage?: string
}

interface FileSelectionStepProps {
  files: SelectedFile[]
  onFilesChange: (files: SelectedFile[]) => void
  className?: string
}

// 从文件扩展名获取资产类型
function getAssetTypeFromFile(file: File): AssetType | 'unknown' {
  const ext = '.' + file.name.split('.').pop()?.toLowerCase()

  const typeMap: Record<string, AssetType> = {
    '.jpg': 'image',
    '.jpeg': 'image',
    '.png': 'image',
    '.webp': 'image',
    '.gif': 'image',
    '.svg': 'image',
    '.mp3': 'audio',
    '.wav': 'audio',
    '.aac': 'audio',
    '.ogg': 'audio',
    '.mp4': 'video',
    '.webm': 'video',
    '.mov': 'video',
    '.txt': 'script',
    '.md': 'script',
    '.pdf': 'script',
  }

  return typeMap[ext] || 'unknown'
}

// 验证文件
function validateFile(file: File): { isValid: boolean; errorMessage?: string } {
  const type = getAssetTypeFromFile(file)

  if (type === 'unknown') {
    return { isValid: false, errorMessage: '不支持的文件格式' }
  }

  const sizeLimit = ASSET_SIZE_LIMITS[type]
  if (file.size > sizeLimit) {
    return {
      isValid: false,
      errorMessage: `文件大小超出限制 (最大 ${formatAssetFileSize(sizeLimit)})`,
    }
  }

  return { isValid: true }
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
      return FileTextIcon
    default:
      return FileIcon
  }
}

export function FileSelectionStep({
  files,
  onFilesChange,
  className,
}: FileSelectionStepProps) {
  const [isDragging, setIsDragging] = useState(false)

  // 处理文件添加
  const handleFilesAdded = useCallback(
    (newFiles: FileList | File[]) => {
      const fileArray = Array.from(newFiles)
      const selectedFiles: SelectedFile[] = fileArray.map((file) => {
        const validation = validateFile(file)
        return {
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          file,
          type: getAssetTypeFromFile(file),
          ...validation,
        }
      })

      onFilesChange([...files, ...selectedFiles])
    },
    [files, onFilesChange]
  )

  // 处理拖拽
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      handleFilesAdded(e.dataTransfer.files)
    },
    [handleFilesAdded]
  )

  // 移除文件
  const handleRemoveFile = useCallback(
    (id: string) => {
      onFilesChange(files.filter((f) => f.id !== id))
    },
    [files, onFilesChange]
  )

  // 清空所有文件
  const handleClearAll = useCallback(() => {
    onFilesChange([])
  }, [onFilesChange])

  const validFiles = files.filter((f) => f.isValid)
  const invalidFiles = files.filter((f) => !f.isValid)

  return (
    <div className={cn('space-y-4', className)}>
      {/* 拖拽上传区域 */}
      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg p-8 transition-all duration-200 cursor-pointer',
          isDragging
            ? 'border-primary bg-primary/5 scale-[1.02]'
            : 'border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/50'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => {
          const input = document.createElement('input')
          input.type = 'file'
          input.multiple = true
          input.accept = 'image/*,video/*,audio/*,.pdf,.txt,.md'
          input.onchange = (e) => {
            const target = e.target as HTMLInputElement
            if (target.files) {
              handleFilesAdded(target.files)
            }
          }
          input.click()
        }}
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <div
            className={cn(
              'p-4 rounded-full transition-colors',
              isDragging ? 'bg-primary/10' : 'bg-muted'
            )}
          >
            <Upload
              className={cn(
                'h-8 w-8 transition-colors',
                isDragging ? 'text-primary' : 'text-muted-foreground'
              )}
            />
          </div>
          <div>
            <p className="text-sm font-medium">
              {isDragging ? '松开鼠标添加文件' : '拖拽文件到此处，或点击选择'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              支持图片、视频、音频、剧本文件
            </p>
          </div>
        </div>
      </div>

      {/* 文件列表 */}
      {files.length > 0 && (
        <div className="space-y-3">
          {/* 头部 */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              已选择 {files.length} 个文件
              {invalidFiles.length > 0 && (
                <span className="text-destructive ml-2">
                  ({invalidFiles.length} 个无效)
                </span>
              )}
            </span>
            <Button variant="ghost" size="sm" onClick={handleClearAll}>
              清空全部
            </Button>
          </div>

          {/* 有效文件列表 */}
          {validFiles.length > 0 && (
            <div className="space-y-2">
              {validFiles.map((file) => {
                const Icon = getFileIcon(file.type)
                return (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-transparent hover:border-primary/30 transition-colors"
                  >
                    <div className="p-2 bg-background rounded">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" title={file.file.name}>
                        {file.file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatAssetFileSize(file.file.size)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveFile(file.id)
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )
              })}
            </div>
          )}

          {/* 无效文件列表 */}
          {invalidFiles.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-destructive font-medium">以下文件无法上传：</p>
              {invalidFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-3 p-3 bg-destructive/5 rounded-lg border border-destructive/30"
                >
                  <div className="p-2 bg-background rounded">
                    <FileIcon className="h-5 w-5 text-destructive" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-destructive" title={file.file.name}>
                      {file.file.name}
                    </p>
                    <p className="text-xs text-destructive/80">{file.errorMessage}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemoveFile(file.id)
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 提示信息 */}
      <div className="text-xs text-muted-foreground space-y-1 p-3 bg-muted/30 rounded-lg">
        <p className="font-medium">支持的格式：</p>
        <div className="grid grid-cols-2 gap-2 mt-1">
          <span>• 图片：JPG, PNG, WebP, GIF, SVG（最大 50MB）</span>
          <span>• 视频：MP4, WebM, MOV（最大 2GB）</span>
          <span>• 音频：MP3, WAV, AAC, OGG（最大 200MB）</span>
          <span>• 剧本：TXT, MD, PDF（最大 10MB）</span>
        </div>
      </div>
    </div>
  )
}
