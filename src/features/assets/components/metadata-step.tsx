/**
 * metadata-step
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

/**
 * Metadata Step Component
 * 元数据填写步骤
 */

import React, { useState, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { X, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AssetType, AssetSource, AssetScope } from '@/lib/types/assets'
import type { SelectedFile } from './file-selection-step'

export interface FileMetadata {
  name: string
  type: AssetType
  source: AssetSource
  scope: AssetScope
  tags: string[]
  description: string
}

interface MetadataStepProps {
  files: SelectedFile[]
  scope: AssetScope
  projectId?: string
  metadataMap: Map<string, FileMetadata>
  onMetadataChange: (fileId: string, metadata: FileMetadata) => void
  onCommonMetadataChange: (metadata: FileMetadata) => void
  className?: string
}

// 资产类型选项
const ASSET_TYPE_OPTIONS: { value: AssetType; label: string }[] = [
  { value: 'image', label: '图片' },
  { value: 'video', label: '视频' },
  { value: 'audio', label: '音频' },
  { value: 'script', label: '剧本' },
  { value: 'aiGenerated', label: 'AI 生成' },
]

// 资产来源选项
const ASSET_SOURCE_OPTIONS: { value: AssetSource; label: string }[] = [
  { value: 'upload', label: '本地上传' },
  { value: 'external', label: '外部链接' },
  { value: 'ai', label: 'AI 生成' },
  { value: 'storage', label: '云存储' },
  { value: 'link', label: '网络链接' },
]

// 常用标签
const COMMON_TAGS = [
  '场景背景',
  '角色设计',
  '道具',
  '背景音乐',
  '环境音效',
  '配音',
  '片头',
  '片尾',
  '转场',
  '特效',
  '主视觉',
  '特写',
  '室内',
  '室外',
  '日景',
  '夜景',
  '现代',
  '古装',
  '科幻',
]

// 默认元数据
function getDefaultMetadata(file: SelectedFile, scope: AssetScope): FileMetadata {
  // 从文件名提取名称（去除扩展名）
  const nameFromFile = file.file.name.replace(/\.[^/.]+$/, '')

  return {
    name: nameFromFile,
    type: file.type === 'unknown' ? 'image' : file.type,
    source: 'upload',
    scope,
    tags: [],
    description: '',
  }
}

export function MetadataStep({
  files,
  scope,
  projectId,
  metadataMap,
  onMetadataChange,
  onCommonMetadataChange,
  className,
}: MetadataStepProps) {
  const validFiles = files.filter((f) => f.isValid)
  const [useCommonSettings, setUseCommonSettings] = useState(true)
  const [currentFileIndex, setCurrentFileIndex] = useState(0)
  const [newTag, setNewTag] = useState('')

  // 获取当前文件的元数据
  const currentFile = validFiles[currentFileIndex] || validFiles[0]
  const currentMetadata = currentFile
    ? metadataMap.get(currentFile.id) || getDefaultMetadata(currentFile, scope)
    : null

  // 通用设置
  const commonMetadata: FileMetadata = {
    name: '',
    type: 'image',
    source: 'upload',
    scope,
    tags: [],
    description: '',
  }

  // 获取要显示的元数据
  const displayMetadata = useCommonSettings ? commonMetadata : currentMetadata

  // 更新元数据
  const handleMetadataUpdate = useCallback(
    (field: keyof FileMetadata, value: string | string[]) => {
      if (!currentFile) return

      const updatedMetadata = {
        ...(metadataMap.get(currentFile.id) || getDefaultMetadata(currentFile, scope)),
        [field]: value,
      }

      if (useCommonSettings) {
        // 更新所有文件的元数据
        validFiles.forEach((file) => {
          const existing = metadataMap.get(file.id) || getDefaultMetadata(file, scope)
          onMetadataChange(file.id, {
            ...existing,
            [field]: value,
          })
        })
        onCommonMetadataChange({
          ...commonMetadata,
          [field]: value,
        })
      } else {
        onMetadataChange(currentFile.id, updatedMetadata)
      }
    },
    [currentFile, metadataMap, scope, useCommonSettings, validFiles, onMetadataChange, onCommonMetadataChange, commonMetadata]
  )

  // 添加标签
  const handleAddTag = useCallback(
    (tag: string) => {
      if (!tag.trim()) return
      const currentTags = displayMetadata?.tags || []
      if (currentTags.includes(tag.trim())) return

      handleMetadataUpdate('tags', [...currentTags, tag.trim()])
      setNewTag('')
    },
    [displayMetadata, handleMetadataUpdate]
  )

  // 移除标签
  const handleRemoveTag = useCallback(
    (tag: string) => {
      const currentTags = displayMetadata?.tags || []
      handleMetadataUpdate(
        'tags',
        currentTags.filter((t) => t !== tag)
      )
    },
    [displayMetadata, handleMetadataUpdate]
  )

  if (validFiles.length === 0) {
    return (
      <div className={cn('text-center py-8 text-muted-foreground', className)}>
        没有有效的文件
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* 批量设置开关 */}
      {validFiles.length > 1 && (
        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
          <div className="space-y-0.5">
            <Label className="text-sm font-medium">统一设置所有文件</Label>
            <p className="text-xs text-muted-foreground">
              关闭后可为每个文件单独设置元数据
            </p>
          </div>
          <Switch
            checked={useCommonSettings}
            onCheckedChange={setUseCommonSettings}
          />
        </div>
      )}

      {/* 单文件选择器 */}
      {!useCommonSettings && validFiles.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {validFiles.map((file, index) => (
            <Button
              key={file.id}
              variant={currentFileIndex === index ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentFileIndex(index)}
              className="shrink-0"
            >
              {file.file.name.length > 15
                ? file.file.name.slice(0, 15) + '...'
                : file.file.name}
            </Button>
          ))}
        </div>
      )}

      {/* 元数据表单 */}
      <div className="space-y-4">
        {/* 资产名称 */}
        <div className="space-y-2">
          <Label htmlFor="asset-name">
            资产名称 <span className="text-destructive">*</span>
          </Label>
          <Input
            id="asset-name"
            value={displayMetadata?.name || ''}
            onChange={(e) => handleMetadataUpdate('name', e.target.value)}
            placeholder="输入资产名称"
          />
        </div>

        {/* 资产类型和来源 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="asset-type">
              资产类型 <span className="text-destructive">*</span>
            </Label>
            <Select
              value={displayMetadata?.type || 'image'}
              onValueChange={(value) => handleMetadataUpdate('type', value as AssetType)}
            >
              <SelectTrigger id="asset-type">
                <SelectValue placeholder="选择类型" />
              </SelectTrigger>
              <SelectContent>
                {ASSET_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="asset-source">
              资产来源 <span className="text-destructive">*</span>
            </Label>
            <Select
              value={displayMetadata?.source || 'upload'}
              onValueChange={(value) => handleMetadataUpdate('source', value as AssetSource)}
            >
              <SelectTrigger id="asset-source">
                <SelectValue placeholder="选择来源" />
              </SelectTrigger>
              <SelectContent>
                {ASSET_SOURCE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 资产范围提示 */}
        <div className="p-3 bg-muted/30 rounded-lg text-sm">
          <span className="text-muted-foreground">资产范围：</span>
          <span className="font-medium">
            {scope === 'global' ? '全局资产库' : `项目资产 (${projectId || '当前项目'})`}
          </span>
        </div>

        {/* 标签 */}
        <div className="space-y-2">
          <Label>标签</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {(displayMetadata?.tags || []).map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1">
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>

          {/* 添加标签输入 */}
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="输入标签"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddTag(newTag)
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => handleAddTag(newTag)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* 常用标签 */}
          <div className="flex flex-wrap gap-1 mt-2">
            <span className="text-xs text-muted-foreground mr-2">常用：</span>
            {COMMON_TAGS.filter((tag) => !(displayMetadata?.tags || []).includes(tag))
              .slice(0, 8)
              .map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => handleAddTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
          </div>
        </div>

        {/* 描述 */}
        <div className="space-y-2">
          <Label htmlFor="asset-description">描述</Label>
          <Textarea
            id="asset-description"
            value={displayMetadata?.description || ''}
            onChange={(e) => handleMetadataUpdate('description', e.target.value)}
            placeholder="输入资产描述（可选）"
            rows={3}
          />
        </div>
      </div>
    </div>
  )
}
