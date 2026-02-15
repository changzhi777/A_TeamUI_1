/**
 * asset-library-page
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

/**
 * Asset Library Page
 * 全局资产库页面
 */

import React, { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AssetFilters } from '../components/asset-filters'
import { AssetGrid } from '../components/asset-grid'
import { AssetList } from '../components/asset-list'
import { AssetDataTable } from '../components/asset-data-table'
import { AssetBatchActions } from '../components/asset-batch-actions'
import { AssetImportExport } from '../components/asset-import-export'
import { AssetUploader } from '../components/asset-uploader'
import { useAssetStore, useGlobalAssets, useAssetStats } from '@/stores/asset-store'
import type { AssetViewMode } from '@/stores/asset-store'
import { Loader2, Plus, Search, SlidersHorizontal, Grid3x3, LayoutGrid, Table, Upload } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export function AssetLibraryPage() {
  const navigate = useNavigate()
  const { filters, viewMode, setViewMode, setFilters, resetFilters, selectedAssets } = useAssetStore()
  const [searchInput, setSearchInput] = useState(filters.search)
  const [showUploader, setShowUploader] = useState(false)

  // 计算选中数量
  const selectedCount = selectedAssets.size

  // 构建查询参数
  const queryParams = {
    search: filters.search || undefined,
    type: filters.type as any,
    source: filters.source as any,
    tags: filters.tags.length > 0 ? filters.tags : undefined,
    scope: 'global' as const,
  }

  // 获取资产列表
  const { data: assetsData, isLoading, error, refetch } = useGlobalAssets(queryParams)

  // 获取统计信息
  const { data: statsData } = useAssetStats(undefined)

  // 处理搜索
  const handleSearch = () => {
    setFilters({ search: searchInput })
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  // 处理上传
  const handleUpload = () => {
    setShowUploader(true)
  }

  // 切换视图模式
  const cycleViewMode = () => {
    // 循环切换: grid -> card -> table -> grid
    const modes: AssetViewMode[] = ['grid', 'card', 'table']
    const currentIndex = modes.indexOf(viewMode as AssetViewMode)
    const nextIndex = (currentIndex + 1) % modes.length
    setViewMode(modes[nextIndex])
  }

  // 设置特定视图模式
  const handleSetViewMode = (mode: AssetViewMode) => {
    setViewMode(mode)
  }

  // 获取视图模式标签
  const getViewModeLabel = () => {
    switch (viewMode) {
      case 'grid':
        return '网格视图'
      case 'card':
        return '卡片视图'
      case 'table':
        return '表格视图'
      default:
        return '网格视图'
    }
  }

  // 重置筛选
  const handleResetFilters = () => {
    setSearchInput('')
    resetFilters()
  }

  // 刷新资产列表
  const handleRefresh = () => {
    refetch()
  }

  const assets = assetsData || []

  return (
    <div className="flex flex-col h-full">
      {/* 页面头部 */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="flex h-16 items-center px-6 gap-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">资产管理</h1>
            {statsData && (
              <span className="text-sm text-muted-foreground">
                共 {statsData.total} 个资产
              </span>
            )}
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* 导入导出 */}
            <AssetImportExport />

            {/* 视图切换 - 三个按钮 */}
            <div className="flex items-center border rounded-md">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleSetViewMode('grid')}
                className={cn(
                  'rounded-none border-r h-9 w-9',
                  viewMode === 'grid' && 'bg-accent'
                )}
                title="网格视图"
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleSetViewMode('card')}
                className={cn(
                  'rounded-none border-r h-9 w-9',
                  viewMode === 'card' && 'bg-accent'
                )}
                title="卡片视图"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleSetViewMode('table')}
                className={cn(
                  'rounded-none h-9 w-9',
                  viewMode === 'table' && 'bg-accent'
                )}
                title="表格视图"
              >
                <Table className="h-4 w-4" />
              </Button>
            </div>

            {/* 上传按钮 */}
            <Button onClick={handleUpload}>
              <Upload className="mr-2 h-4 w-4" />
              上传资产
            </Button>
          </div>
        </div>

        {/* 搜索和筛选栏 */}
        <div className="flex items-center px-6 pb-4 gap-3">
          {/* 搜索框 */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索资产名称或描述..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="pl-9"
            />
          </div>

          {/* 筛选按钮 */}
          <AssetFilters />

          {/* 清除筛选 */}
          {(filters.search || filters.type || filters.source || filters.tags.length > 0) && (
            <Button variant="ghost" size="sm" onClick={handleResetFilters}>
              清除筛选
            </Button>
          )}
        </div>
      </div>

      {/* 批量操作工具栏 */}
      {selectedCount > 0 && (
        <div className="px-6 py-2 border-b bg-muted/50">
          <AssetBatchActions />
        </div>
      )}

      {/* 内容区域 */}
      <div className="flex-1 overflow-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <p className="text-muted-foreground">加载资产失败</p>
            <Button variant="outline" onClick={() => refetch()}>
              重试
            </Button>
          </div>
        ) : assets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="text-6xl">📁</div>
            <div className="text-center">
              <h3 className="text-lg font-semibold">暂无资产</h3>
              <p className="text-muted-foreground">
                {filters.search || filters.type || filters.source || filters.tags.length > 0
                  ? '没有找到匹配的资产，请尝试其他筛选条件'
                  : '开始上传您的第一个资产吧'}
              </p>
            </div>
            <Button onClick={handleUpload}>
              <Upload className="mr-2 h-4 w-4" />
              上传资产
            </Button>
          </div>
        ) : (
          <>
            {viewMode === 'grid' && (
              <AssetGrid assets={assets} onUpdate={handleRefresh} />
            )}
            {viewMode === 'card' && (
              <AssetList assets={assets} onUpdate={handleRefresh} />
            )}
            {viewMode === 'table' && (
              <AssetDataTable assets={assets} onUpdate={handleRefresh} />
            )}
          </>
        )}
      </div>

      {/* 上传对话框 */}
      <Dialog open={showUploader} onOpenChange={setShowUploader}>
        <DialogContent className="max-w-3xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>上传资产</DialogTitle>
          </DialogHeader>
          <div className="min-h-[400px]">
            <AssetUploader
              scope="global"
              onComplete={() => {
                handleRefresh()
              }}
              onClose={() => {
                setShowUploader(false)
                handleRefresh()
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
