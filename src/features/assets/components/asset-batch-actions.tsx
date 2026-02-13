/**
 * Asset Batch Actions
 * 资产批量操作工具栏
 */

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Trash2, Move, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAssetStore, useAssetMutations } from '@/stores/asset-store'
import { useProjectStore } from '@/stores/project-store'

interface AssetBatchActionsProps {
  className?: string
}

export function AssetBatchActions({ className }: AssetBatchActionsProps) {
  const { selectedAssets, clearSelection } = useAssetStore()
  const { batchDeleteAssets, batchMoveToProject } = useAssetMutations()
  const { projects } = useProjectStore()

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showMoveDialog, setShowMoveDialog] = useState(false)
  const [targetProjectId, setTargetProjectId] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)

  // 计算选中数量
  const selectedCount = selectedAssets.size

  // 没有选中资产时不显示
  if (selectedCount === 0) {
    return null
  }

  const handleBatchDelete = async () => {
    const assetIds = Array.from(selectedAssets)
    if (assetIds.length === 0) return

    setIsProcessing(true)
    try {
      const result = await batchDeleteAssets(assetIds)
      if (result.success > 0) {
        toast.success(`已删除 ${result.success} 个资产`)
        clearSelection()
      } else {
        const errorMsgs = result.errors.map(e => e.error).join(', ')
        toast.error(`删除失败：${errorMsgs}`)
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '批量删除失败')
    } finally {
      setIsProcessing(false)
      setShowDeleteDialog(false)
    }
  }

  const handleBatchMove = async () => {
    const assetIds = Array.from(selectedAssets)
    if (assetIds.length === 0) return

    if (!targetProjectId) {
      toast.error('请选择目标项目')
      return
    }

    setIsProcessing(true)
    try {
      const result = await batchMoveToProject({
        ids: assetIds,
        projectId: targetProjectId === 'global' ? '' : targetProjectId,
      })
      if (result.success > 0) {
        toast.success(`已移动 ${result.success} 个资产`)
        clearSelection()
      } else {
        const errorMsgs = result.errors.map(e => e.error).join(', ')
        toast.error(`移动失败：${errorMsgs}`)
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '批量移动失败')
    } finally {
      setIsProcessing(false)
      setShowMoveDialog(false)
    }
  }

  return (
    <>
      {/* 工具栏 */}
      <div
        className={`flex items-center gap-2 p-2 bg-muted rounded-lg ${className}`}
      >
        <span className="text-sm text-muted-foreground">
          已选择 {selectedCount} 个资产
        </span>
        <div className="flex-1" />
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowMoveDialog(true)}
        >
          <Move className="h-4 w-4 mr-1" />
          移动
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setShowDeleteDialog(true)}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          删除
        </Button>
        <Button variant="ghost" size="sm" onClick={clearSelection}>
          取消选择
        </Button>
      </div>

      {/* 删除确认对话框 */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认批量删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除选中的 {selectedCount} 个资产吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBatchDelete}
              disabled={isProcessing}
              className="bg-destructive text-destructive-foreground"
            >
              {isProcessing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 移动对话框 */}
      <Dialog open={showMoveDialog} onOpenChange={setShowMoveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>移动资产</DialogTitle>
            <DialogDescription>
              选择目标位置，将 {selectedCount} 个资产移动到该位置。
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Select value={targetProjectId} onValueChange={setTargetProjectId}>
              <SelectTrigger>
                <SelectValue placeholder="选择目标位置" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="global">全局资产库</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowMoveDialog(false)}
              disabled={isProcessing}
            >
              取消
            </Button>
            <Button onClick={handleBatchMove} disabled={isProcessing}>
              {isProcessing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              移动
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
