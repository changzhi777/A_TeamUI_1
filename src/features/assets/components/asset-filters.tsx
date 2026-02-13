/**
 * Asset Filters Component
 * 资产筛选组件
 */

import { useState } from 'react'
import React from 'react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { SlidersHorizontal, X } from 'lucide-react'
import { useAssetStore } from '@/stores/asset-store'
import type { AssetType, AssetSource } from '@/lib/types/assets'
import { getAssetTypeName, getAssetSourceName } from '@/lib/types/assets'

const ASSET_TYPES: AssetType[] = ['image', 'audio', 'video', 'script', 'aiGenerated']
const ASSET_SOURCES: AssetSource[] = ['upload', 'external', 'ai', 'storage', 'link']

export function AssetFilters() {
  const { filters, setFilters } = useAssetStore()
  const [open, setOpen] = useState(false)

  // 处理类型筛选
  const handleTypeToggle = (type: AssetType) => {
    if (filters.type === type) {
      setFilters({ type: undefined })
    } else {
      setFilters({ type })
    }
  }

  // 处理来源筛选
  const handleSourceToggle = (source: AssetSource) => {
    if (filters.source === source) {
      setFilters({ source: undefined })
    } else {
      setFilters({ source })
    }
  }

  // 清除所有筛选
  const handleClearAll = () => {
    setFilters({ type: undefined, source: undefined, tags: [] })
  }

  // 是否有激活的筛选
  const hasActiveFilters = !!filters.type || !!filters.source || filters.tags.length > 0

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          筛选
          {hasActiveFilters && (
            <span className="ml-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
              {(!!filters.type ? 1 : 0) + (!!filters.source ? 1 : 0) + filters.tags.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-4">
          {/* 头部 */}
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">筛选条件</h3>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={handleClearAll}>
                <X className="mr-1 h-3 w-3" />
                清除全部
              </Button>
            )}
          </div>

          {/* 类型筛选 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">资产类型</Label>
            <div className="flex flex-wrap gap-2">
              {ASSET_TYPES.map((type) => (
                <Button
                  key={type}
                  variant={filters.type === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleTypeToggle(type)}
                  className="h-8"
                >
                  {getAssetTypeName(type)}
                </Button>
              ))}
            </div>
          </div>

          {/* 来源筛选 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">资产来源</Label>
            <div className="space-y-1">
              {ASSET_SOURCES.map((source) => (
                <div key={source} className="flex items-center space-x-2">
                  <Checkbox
                    id={`source-${source}`}
                    checked={filters.source === source}
                    onCheckedChange={() => handleSourceToggle(source)}
                  />
                  <Label
                    htmlFor={`source-${source}`}
                    className="text-sm cursor-pointer flex-1"
                  >
                    {getAssetSourceName(source)}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* 应用按钮 */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button className="flex-1" onClick={() => setOpen(false)}>
              应用
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
