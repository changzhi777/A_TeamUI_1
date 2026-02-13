/**
 * Asset Card Component
 * 资产卡片组件
 */

import { useState } from 'react'
import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { Asset } from '@/lib/types/assets'
import {
  getAssetTypeName,
  getAssetSourceName,
  formatAssetFileSize,
} from '@/lib/types/assets'
import {
  MoreHorizontal,
  Image,
  Music,
  Video,
  FileText,
  Sparkles,
  ExternalLink,
  Trash2,
  Edit,
  Copy,
  Eye,
  Tag,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAssetMutations } from '@/stores/asset-store'
import { cn } from '@/lib/utils'
import { useAssetStore } from '@/stores/asset-store'
import { useAuthStore } from '@/stores/auth-store'
import { AssetEditDialog } from './asset-edit-dialog'

interface AssetCardProps {
  asset: Asset
  onSelect?: () => void
  onPreview?: () => void
  onUpdate?: () => void
}

export function AssetCard({ asset, onSelect, onPreview, onUpdate }: AssetCardProps) {
  const { isSelected, toggleSelectAsset } = useAssetStore()
  const { deleteAsset } = useAssetMutations()
  const { canManageAsset, canDeleteAsset } = useAuthStore()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)

  const isDefaultSelected = isSelected(asset.id)

  // 权限检查
  const canEdit = canManageAsset(asset.uploadedBy)
  const canDelete = canDeleteAsset(asset.uploadedBy)

  // 获取资产类型图标
  const getTypeIcon = () => {
    switch (asset.type) {
      case 'image':
        return <Image className="h-4 w-4" />
      case 'audio':
        return <Music className="h-4 w-4" />
      case 'video':
        return <Video className="h-4 w-4" />
      case 'script':
        return <FileText className="h-4 w-4" />
      case 'aiGenerated':
        return <Sparkles className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  // 处理选择
  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleSelectAsset(asset.id)
  }

  // 处理预览
  const handlePreview = (e: React.MouseEvent) => {
    e.stopPropagation()
    onPreview?.()
  }

  // 处理编辑
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowEditDialog(true)
  }

  // 处理添加标签（打开编辑对话框）
  const handleAddTag = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowEditDialog(true)
  }

  // 处理复制链接
  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(asset.url)
    toast.success('链接已复制到剪贴板')
  }

  // 处理删除
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!canDelete) {
      toast.error('您没有权限删除此资产')
      return
    }
    setShowDeleteDialog(true)
  }

  // 确认删除
  const confirmDelete = async () => {
    try {
      await deleteAsset(asset.id)
      toast.success('资产已删除')
      setShowDeleteDialog(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '删除失败')
    }
  }

  // 处理卡片点击
  const handleCardClick = () => {
    onSelect?.()
  }

  return (
    <>
      <Card
        className={cn(
          'group relative overflow-hidden transition-all hover:shadow-md cursor-pointer',
          isDefaultSelected && 'ring-2 ring-primary'
        )}
        onClick={handleCardClick}
      >
        {/* 选择复选框 */}
        <div className="absolute top-2 left-2 z-10">
          <Checkbox
            checked={isDefaultSelected}
            onCheckedChange={() => toggleSelectAsset(asset.id)}
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        {/* 更多操作菜单 */}
        <div className="absolute top-2 right-2 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handlePreview}>
                <Eye className="mr-2 h-4 w-4" />
                预览
              </DropdownMenuItem>
              {canEdit && (
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  编辑
                </DropdownMenuItem>
              )}
              {canEdit && (
                <DropdownMenuItem onClick={handleAddTag}>
                  <Tag className="mr-2 h-4 w-4" />
                  添加标签
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleCopyLink}>
                <Copy className="mr-2 h-4 w-4" />
                复制链接
              </DropdownMenuItem>
              {canDelete && <DropdownMenuSeparator />}
              {canDelete && (
                <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  删除
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* 缩略图区域 */}
        <div className="aspect-square bg-muted relative overflow-hidden">
          {asset.thumbnailUrl || asset.type === 'image' ? (
            <img
              src={asset.thumbnailUrl || asset.url}
              alt={asset.name}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              {getTypeIcon()}
            </div>
          )}

          {/* AI 生成标识 */}
          {asset.aiGenerated && (
            <div className="absolute bottom-2 left-2 bg-purple-500/90 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              AI 生成
            </div>
          )}

          {/* 来源标识 */}
          {asset.source === 'link' && (
            <div className="absolute top-2 left-10 bg-blue-500/90 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
              <ExternalLink className="h-3 w-3" />
              外部链接
            </div>
          )}
        </div>

        {/* 信息区域 */}
        <CardContent className="p-3">
          <div className="space-y-1">
            {/* 名称 */}
            <h3 className="font-medium text-sm truncate" title={asset.name}>
              {asset.name}
            </h3>

            {/* 元信息 */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{getAssetTypeName(asset.type)}</span>
              <span>•</span>
              <span>{formatAssetFileSize(asset.fileSize)}</span>
            </div>

            {/* 标签 */}
            {asset.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {asset.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-1.5 py-0.5 bg-secondary text-secondary-foreground rounded"
                  >
                    {tag}
                  </span>
                ))}
                {asset.tags.length > 3 && (
                  <span className="text-xs text-muted-foreground">
                    +{asset.tags.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 删除确认对话框 */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除资产"{asset.name}"吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 编辑对话框 */}
      <AssetEditDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        asset={asset}
        onSuccess={() => {
          onUpdate?.()
        }}
      />
    </>
  )
}
