/**
 * asset-preview-dialog
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

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
  Shirt,
  Volume2,
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
      case 'character':
        return <User className="h-5 w-5" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  // 获取角色缩略图
  const getCharacterThumbnail = () => {
    if (asset.characterData) {
      return asset.characterData.views.front?.url ||
        asset.characterData.views.threeQuarter?.url ||
        asset.characterData.views.side?.url ||
        asset.characterData.views.back?.url
    }
    return null
  }

  // 渲染角色预览内容
  const renderCharacterPreview = () => {
    if (!asset.characterData) return null
    const data = asset.characterData

    return (
      <div className="space-y-6">
        {/* 角色编号 */}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono">
            {data.code}
          </Badge>
        </div>

        {/* 角色属性 */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(data.attributes).map(([key, value]) => (
            value && (
              <div key={key} className="p-2 bg-muted rounded text-sm">
                <span className="text-muted-foreground">{key}：</span>
                <span>{value}</span>
              </div>
            )
          ))}
        </div>

        {/* 个性描述 */}
        {data.personality && (
          <div className="space-y-1">
            <h4 className="text-sm font-medium">个性描述</h4>
            <p className="text-sm text-muted-foreground">{data.personality}</p>
          </div>
        )}

        {/* 视角图片 */}
        {Object.values(data.views).some(Boolean) && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              多视角图片
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {data.views.front && (
                <div className="aspect-square rounded overflow-hidden bg-muted">
                  <img src={data.views.front.url} alt="正面" className="w-full h-full object-cover" />
                </div>
              )}
              {data.views.threeQuarter && (
                <div className="aspect-square rounded overflow-hidden bg-muted">
                  <img src={data.views.threeQuarter.url} alt="3/4视角" className="w-full h-full object-cover" />
                </div>
              )}
              {data.views.side && (
                <div className="aspect-square rounded overflow-hidden bg-muted">
                  <img src={data.views.side.url} alt="侧面" className="w-full h-full object-cover" />
                </div>
              )}
              {data.views.back && (
                <div className="aspect-square rounded overflow-hidden bg-muted">
                  <img src={data.views.back.url} alt="背面" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* 服装变体 */}
        {data.costumes.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Shirt className="h-4 w-4" />
              服装变体 ({data.costumes.length})
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {data.costumes.map((costume) => (
                <div key={costume.id} className="aspect-square rounded overflow-hidden bg-muted relative group">
                  <img src={costume.imageUrl} alt={costume.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-xs font-medium">{costume.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 语音 */}
        {data.voice && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              角色语音
            </h4>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{data.voice.style}</Badge>
              {data.voice.sampleUrl && (
                <audio controls className="h-8 flex-1">
                  <source src={data.voice.sampleUrl} type="audio/wav" />
                </audio>
              )}
            </div>
          </div>
        )}

        {/* 基础提示词 */}
        {data.basePrompt && (
          <div className="space-y-1">
            <h4 className="text-sm font-medium">生成提示词</h4>
            <p className="text-xs text-muted-foreground p-2 bg-muted rounded">{data.basePrompt}</p>
          </div>
        )}
      </div>
    )
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
            ) : asset.type === 'character' ? (
              <div className="p-4">
                {getCharacterThumbnail() ? (
                  <img
                    src={getCharacterThumbnail()!}
                    alt={asset.name}
                    className="w-full max-h-64 object-contain mx-auto rounded"
                  />
                ) : (
                  <div className="aspect-video flex items-center justify-center">
                    <User className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-video flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <FileText className="h-16 w-16 mx-auto mb-2" />
                  <p>该文件类型暂不支持预览</p>
                </div>
              </div>
            )}
          </div>

          {/* 角色详细信息 */}
          {asset.type === 'character' && asset.characterData && renderCharacterPreview()}

          {/* 非角色类型的元数据 */}
          {asset.type !== 'character' && (
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
          )}

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
