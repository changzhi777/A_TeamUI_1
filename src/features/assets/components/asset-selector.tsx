/**
 * asset-selector
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

/**
 * Asset Selector Component
 * 资产选择器组件 - 用于在其他功能中选择资产
 */

import { useState } from 'react'
import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { AssetFilters } from './asset-filters'
import { useGlobalAssets } from '@/stores/asset-store'
import { Search, Loader2 } from 'lucide-react'
import type { Asset, AssetType } from '@/lib/types/assets'
import { getAssetTypeName, formatAssetFileSize } from '@/lib/types/assets'

interface AssetSelectorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (assets: Asset[]) => void
  multiple?: boolean
  allowedTypes?: AssetType[]
  title?: string
}

export function AssetSelector({
  open,
  onOpenChange,
  onSelect,
  multiple = false,
  allowedTypes,
  title = '选择资产',
}: AssetSelectorProps) {
  const [search, setSearch] = useState('')
  const [selectedType, setSelectedType] = useState<string | undefined>()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // 构建查询参数
  const queryParams = {
    search: search || undefined,
    type: selectedType as any,
    ...(allowedTypes && !selectedType ? { type: allowedTypes[0] } : {}),
  }

  // 获取资产列表
  const { data: assetsData, isLoading } = useGlobalAssets(queryParams)
  const assets = assetsData?.filter((asset) => {
    if (allowedTypes && !allowedTypes.includes(asset.type)) {
      return false
    }
    return true
  }) || []

  // 处理选择切换
  const handleToggleSelect = (asset: Asset) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(asset.id)) {
        newSet.delete(asset.id)
      } else if (multiple) {
        newSet.add(asset.id)
      } else {
        // 单选模式，清空其他选择
        newSet.clear()
        newSet.add(asset.id)
      }
      return newSet
    })
  }

  // 处理确认选择
  const handleConfirm = () => {
    const selectedAssets = assets.filter((asset) => selectedIds.has(asset.id))
    onSelect(selectedAssets)
    setSelectedIds(new Set())
    setSearch('')
    onOpenChange(false)
  }

  // 处理取消
  const handleCancel = () => {
    setSelectedIds(new Set())
    setSearch('')
    onOpenChange(false)
  }

  // 获取选中的资产
  const selectedAssets = assets.filter((asset) => selectedIds.has(asset.id))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {/* 搜索栏 */}
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索资产名称或描述..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <AssetFilters />
          </div>

          {/* 资产网格 */}
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : assets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <p className="text-muted-foreground">
                {search || selectedType ? '没有找到匹配的资产' : '暂无可用资产'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {assets.map((asset) => (
                <AssetSelectorItem
                  key={asset.id}
                  asset={asset}
                  selected={selectedIds.has(asset.id)}
                  onSelect={() => handleToggleSelect(asset)}
                  multiple={multiple}
                />
              ))}
            </div>
          )}
        </div>

        {/* 底部信息栏 */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {selectedAssets.length > 0
              ? `已选择 ${selectedAssets.length} 个资产`
              : '请选择资产'}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              取消
            </Button>
            <Button onClick={handleConfirm} disabled={selectedAssets.length === 0}>
              确认选择
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface AssetSelectorItemProps {
  asset: Asset
  selected: boolean
  onSelect: () => void
  multiple: boolean
}

function AssetSelectorItem({ asset, selected, onSelect, multiple }: AssetSelectorItemProps) {
  return (
    <div
      className={`
        relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all
        ${selected ? 'border-primary' : 'border-transparent hover:border-muted-foreground'}
      `}
      onClick={onSelect}
    >
      {/* 选中状态 */}
      <div className="absolute top-2 left-2 z-10">
        <Checkbox checked={selected} />
      </div>

      {/* 缩略图 */}
      <div className="aspect-square bg-muted relative">
        {asset.thumbnailUrl || asset.type === 'image' ? (
          <img
            src={asset.thumbnailUrl || asset.url}
            alt={asset.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-4xl">
            {asset.type === 'audio' && '🎵'}
            {asset.type === 'video' && '🎬'}
            {asset.type === 'script' && '📄'}
            {asset.type === 'aiGenerated' && '✨'}
          </div>
        )}

        {/* AI 生成标识 */}
        {asset.aiGenerated && (
          <div className="absolute bottom-2 left-2 bg-purple-500/90 text-white text-xs px-2 py-0.5 rounded-full">
            AI 生成
          </div>
        )}
      </div>

      {/* 信息 */}
      <div className="p-2 bg-background">
        <p className="text-sm font-medium truncate" title={asset.name}>
          {asset.name}
        </p>
        <p className="text-xs text-muted-foreground">
          {getAssetTypeName(asset.type)} • {formatAssetFileSize(asset.fileSize)}
        </p>
      </div>
    </div>
  )
}
