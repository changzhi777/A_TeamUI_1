/**
 * Asset Preview Dialog Component
 * 资产预览对话框组件
 */

import { useState } from 'react'
import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type { Asset } from '@/lib/types/assets'
import {
  getAssetTypeName,
  getAssetSourceName,
  formatAssetFileSize,
  formatAssetDuration,
} from '@/lib/types/assets'
import {
  Image as ImageIcon,
  Music,
  Video,
  FileText,
  Sparkles,
  ExternalLink,
  Calendar,
  HardDrive,
  User,
  Tag as TagIcon,
  Link2,
} from 'lucide-react'
import { useAssetUsage } from '@/stores/asset-store'
import { AssetPreviewImage } from './preview/asset-preview-image'
import { AssetPreviewVideo } from './preview/asset-preview-video'
import { AssetPreviewAudio } from './preview/asset-preview-audio'

interface AssetPreviewDialogProps {
  asset: Asset
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AssetPreviewDialog({ asset, open, onOpenChange }: AssetPreviewDialogProps) {
  const [imageScale, setImageScale] = useState(100)

  // 获取资产使用情况
  const { data: usageData } = useAssetUsage(asset.id)
  const usageCount = usageData?.referenceCount || 0

  // 获取资产类型图标
  const getTypeIcon = () => {
    switch (asset.type) {
      case 'image':
        return <ImageIcon className="h-5 w-5" />
      case 'audio':
        return <Music className="h-5 w-5" />
      case 'video':
        return <Video className="h-5 w-5" />
      case 'script':
        return <FileText className="h-5 w-5" />
      case 'aiGenerated':
        return <Sparkles className="h-5 w-5" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getTypeIcon()}
            {asset.name}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {/* 预览区域 */}
          <div className="bg-black/5 rounded-lg overflow-hidden mb-4">
            {asset.type === 'image' ? (
              <AssetPreviewImage asset={asset} scale={imageScale} onScaleChange={setImageScale} />
            ) : asset.type === 'video' ? (
              <AssetPreviewVideo asset={asset} />
            ) : asset.type === 'audio' ? (
              <AssetPreviewAudio asset={asset} />
            ) : (
              <div className="aspect-video flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <FileText className="h-16 w-16 mx-auto mb-2" />
                  <p>该文件类型暂不支持预览</p>
                </div>
              </div>
            )}
          </div>

          {/* 元数据 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 基本信息 */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">基本信息</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <TagIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">类型：</span>
                  <Badge variant="secondary">{getAssetTypeName(asset.type)}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">大小：</span>
                  <span>{formatAssetFileSize(asset.fileSize)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">来源：</span>
                  <span>{getAssetSourceName(asset.source)}</span>
                </div>
                {asset.duration && (
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">时长：</span>
                    <span>{formatAssetDuration(asset.duration)}</span>
                  </div>
                )}
                {asset.width && asset.height && (
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">尺寸：</span>
                    <span>{asset.width} × {asset.height}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 上传信息 */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">上传信息</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">上传者：</span>
                  <span>{asset.uploadedByName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">创建时间：</span>
                  <span>{formatDate(asset.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">更新时间：</span>
                  <span>{formatDate(asset.updatedAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Link2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">引用次数：</span>
                  <Badge variant={usageCount > 0 ? 'default' : 'secondary'}>
                    {usageCount}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* 描述 */}
          {asset.description && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">描述</h3>
                <p className="text-sm text-muted-foreground">{asset.description}</p>
              </div>
            </>
          )}

          {/* 标签 */}
          {asset.tags.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">标签</h3>
                <div className="flex flex-wrap gap-2">
                  {asset.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* AI 生成信息 */}
          {asset.aiGenerated && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  AI 生成信息
                </h3>
                {asset.aiModel && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">模型：</span>
                    <Badge variant="secondary">{asset.aiModel}</Badge>
                  </div>
                )}
                {asset.aiPrompt && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">提示词：</span>
                    <p className="mt-1 p-2 bg-muted rounded text-xs">{asset.aiPrompt}</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* 外部链接 */}
          {asset.source === 'link' && asset.externalUrl && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">原始链接</h3>
                <a
                  href={asset.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  {asset.externalUrl}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </>
          )}
        </div>

        {/* 底部操作 */}
        <div className="flex gap-2 pt-4 border-t">
          <Button variant="outline" className="flex-1" asChild>
            <a href={asset.url} target="_blank" rel="noopener noreferrer">
              <Link2 className="mr-2 h-4 w-4" />
              打开原始链接
            </a>
          </Button>
          <Button variant="outline" className="flex-1" asChild>
            <a href={asset.url} download>
              下载
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
