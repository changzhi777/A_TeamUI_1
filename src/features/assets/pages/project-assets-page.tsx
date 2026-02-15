/**
 * project-assets-page
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

/**
 * Project Assets Page
 * 项目资产页面
 */

import { useState } from 'react'
import React from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AssetFilters } from '../components/asset-filters'
import { AssetGrid } from '../components/asset-grid'
import { AssetList } from '../components/asset-list'
import { useAssetStore, useProjectAssets, useAssetStats } from '@/stores/asset-store'
import { Loader2, Upload, Search, Grid3x3, List, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

export function ProjectAssetsPage() {
  const navigate = useNavigate()
  const params = useParams({ strict: false })
  // 获取项目ID
  const projectId = window.location.pathname.split('/').at(-2) || ''
  const { filters, viewMode, setViewMode, setFilters, resetFilters } = useAssetStore()
  const [searchInput, setSearchInput] = useState(filters.search)

  // 构建查询参数
  const queryParams = {
    search: filters.search || undefined,
    type: filters.type as any,
    source: filters.source as any,
    tags: filters.tags.length > 0 ? filters.tags : undefined,
  }

  // 获取项目资产列表
  const { data: assetsData, isLoading, error } = useProjectAssets(projectId, queryParams)

  // 获取项目统计信息
  const { data: statsData } = useAssetStats(projectId)

  // 处理返回
  const handleBack = () => {
    navigate({ to: `/projects/${projectId}` })
  }

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
    // TODO: 打开上传对话框
    toast.info('上传功能即将推出')
  }

  // 切换视图模式
  const toggleViewMode = () => {
    setViewMode(viewMode === 'grid' ? 'list' : 'grid')
  }

  // 重置筛选
  const handleResetFilters = () => {
    setSearchInput('')
    resetFilters()
  }

  const assets = assetsData || []

  return (
    <div className="flex flex-col h-full">
      {/* 页面头部 */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="flex h-16 items-center px-6 gap-4">
          {/* 返回按钮 */}
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">项目资产</h1>
            {statsData && (
              <span className="text-sm text-muted-foreground">
                共 {statsData.total} 个资产
              </span>
            )}
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* 视图切换 */}
            <Button
              variant="outline"
              size="icon"
              onClick={toggleViewMode}
              title={viewMode === 'grid' ? '切换到列表视图' : '切换到网格视图'}
            >
              {viewMode === 'grid' ? (
                <List className="h-4 w-4" />
              ) : (
                <Grid3x3 className="h-4 w-4" />
              )}
            </Button>

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

      {/* 内容区域 */}
      <div className="flex-1 overflow-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <p className="text-muted-foreground">加载资产失败</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              重试
            </Button>
          </div>
        ) : assets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="text-6xl">📁</div>
            <div className="text-center">
              <h3 className="text-lg font-semibold">暂无项目资产</h3>
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
            {viewMode === 'grid' ? <AssetGrid assets={assets} /> : <AssetList assets={assets} />}
          </>
        )}
      </div>
    </div>
  )
}
