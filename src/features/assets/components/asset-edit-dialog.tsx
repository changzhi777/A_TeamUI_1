/**
 * Asset Edit Dialog
 * 资产编辑对话框
 */

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
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
import { Badge } from '@/components/ui/badge'
import { X, Plus } from 'lucide-react'
import { toast } from 'sonner'
import type { Asset, AssetScope } from '@/lib/types/assets'
import { useAssetMutations } from '@/stores/asset-store'
import { searchAssetTags } from '@/lib/api/assets'

interface AssetEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  asset: Asset | null
  onSuccess?: () => void
}

export function AssetEditDialog({
  open,
  onOpenChange,
  asset,
  onSuccess,
}: AssetEditDialogProps) {
  const { updateAsset } = useAssetMutations()

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    scope: 'global' as AssetScope,
    tags: [] as string[],
  })

  const [newTag, setNewTag] = useState('')
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)

  // 初始化表单数据
  useEffect(() => {
    if (asset) {
      setFormData({
        name: asset.name,
        description: asset.description || '',
        scope: asset.scope,
        tags: [...asset.tags],
      })
    }
  }, [asset])

  // 搜索标签建议
  useEffect(() => {
    if (newTag.length > 0) {
      searchAssetTags(newTag).then(setTagSuggestions)
    } else {
      setTagSuggestions([])
    }
  }, [newTag])

  const handleAddTag = () => {
    const tag = newTag.trim()
    if (tag && !formData.tags.includes(tag)) {
      setFormData({ ...formData, tags: [...formData.tags, tag] })
      setNewTag('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!asset) return

    if (!formData.name.trim()) {
      toast.error('请输入资产名称')
      return
    }

    setIsSaving(true)
    try {
      await updateAsset({
        id: asset.id,
        data: {
          name: formData.name,
          description: formData.description,
          tags: formData.tags,
        },
      })
      toast.success('资产已更新')
      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '更新失败')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>编辑资产</DialogTitle>
            <DialogDescription>修改资产的名称、描述和标签</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* 名称 */}
            <div className="grid gap-2">
              <Label htmlFor="name">
                名称 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="输入资产名称"
              />
            </div>

            {/* 描述 */}
            <div className="grid gap-2">
              <Label htmlFor="description">描述</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="输入资产描述（可选）"
                rows={3}
              />
            </div>

            {/* 归属 */}
            <div className="grid gap-2">
              <Label htmlFor="scope">归属</Label>
              <Select
                value={formData.scope}
                onValueChange={(value) =>
                  setFormData({ ...formData, scope: value as AssetScope })
                }
              >
                <SelectTrigger id="scope">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="global">全局资产库</SelectItem>
                  <SelectItem value="project">项目资产</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 标签 */}
            <div className="grid gap-2">
              <Label>标签</Label>

              {/* 已有标签 */}
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="gap-1 pr-1"
                    >
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
              )}

              {/* 添加标签 */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="输入标签"
                    list="tag-suggestions"
                  />
                  {tagSuggestions.length > 0 && (
                    <datalist id="tag-suggestions">
                      {tagSuggestions.map((tag) => (
                        <option key={tag} value={tag} />
                      ))}
                    </datalist>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleAddTag}
                  disabled={!newTag.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              取消
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? '保存中...' : '保存'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
