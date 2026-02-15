/**
 * shot-form-dialog
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import { useState, useEffect, useMemo } from 'react'
import React from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { Separator } from '@/components/ui/separator'
import { useStoryboardStore, type ShotSize, type CameraMovement, type CustomFieldValue } from '@/stores/storyboard-store'
import { useCustomFieldStore } from '@/stores/custom-field-store'
import { toast } from 'sonner'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { AssetSelector } from '@/features/assets/components/asset-selector'
import { CustomFieldsForm, mergeCustomFieldValues } from './custom-field-renderer'
import type { Asset } from '@/lib/types/assets'

interface ShotFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  shot?: any
}

export function ShotFormDialog({ open, onOpenChange, projectId, shot }: ShotFormDialogProps) {
  const addShot = useStoryboardStore((state) => state.addShot)
  const updateShot = useStoryboardStore((state) => state.updateShot)
  const { getMergedFields } = useCustomFieldStore()

  // Get merged custom fields for the current project
  const customFields = useMemo(() => {
    return projectId ? getMergedFields(projectId) : []
  }, [projectId, getMergedFields])

  const [formData, setFormData] = useState({
    seasonNumber: '' as string | number,
    episodeNumber: '' as string | number,
    sceneNumber: '',
    shotSize: 'medium' as ShotSize,
    cameraMovement: 'static' as CameraMovement,
    duration: 5,
    description: '',
    dialogue: '',
    sound: '',
    image: '',
  })

  // Custom field values state
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, CustomFieldValue>>({})

  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [showAssetSelector, setShowAssetSelector] = useState(false)

  useEffect(() => {
    if (shot) {
      setFormData({
        seasonNumber: shot.seasonNumber ?? '',
        episodeNumber: shot.episodeNumber ?? '',
        sceneNumber: shot.sceneNumber || '',
        shotSize: shot.shotSize,
        cameraMovement: shot.cameraMovement,
        duration: shot.duration,
        description: shot.description || '',
        dialogue: shot.dialogue || '',
        sound: shot.sound || '',
        image: shot.image || '',
      })
      setImagePreview(shot.image || null)
      // Set custom field values from shot
      setCustomFieldValues(mergeCustomFieldValues(shot.customFields, customFields))
    } else {
      setFormData({
        seasonNumber: '',
        episodeNumber: '',
        sceneNumber: '',
        shotSize: 'medium',
        cameraMovement: 'static',
        duration: 5,
        description: '',
        dialogue: '',
        sound: '',
        image: '',
      })
      setImagePreview(null)
      // Reset custom field values to defaults
      setCustomFieldValues(mergeCustomFieldValues(undefined, customFields))
    }
  }, [shot, open, customFields])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 检查文件大小 (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('图片大小不能超过 2MB')
      return
    }

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      toast.error('请上传图片文件')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setFormData({ ...formData, image: result })
      setImagePreview(result)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setFormData({ ...formData, image: '' })
    setImagePreview(null)
  }

  // 处理从资产选择器选择图片
  const handleSelectFromAssets = (assets: Asset[]) => {
    if (assets.length > 0) {
      const selectedAsset = assets[0]
      setFormData({ ...formData, image: selectedAsset.url })
      setImagePreview(selectedAsset.thumbnailUrl || selectedAsset.url)
    }
    setShowAssetSelector(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.description.trim()) {
      toast.error('请输入画面描述')
      return
    }

    const shotData = {
      projectId,
      shotNumber: shot?.shotNumber || 0, // Will be assigned by store
      seasonNumber: formData.seasonNumber ? Number(formData.seasonNumber) : undefined,
      episodeNumber: formData.episodeNumber ? Number(formData.episodeNumber) : undefined,
      sceneNumber: formData.sceneNumber,
      shotSize: formData.shotSize,
      cameraMovement: formData.cameraMovement,
      duration: formData.duration,
      description: formData.description,
      dialogue: formData.dialogue,
      sound: formData.sound,
      image: formData.image,
      // Include custom fields if there are any
      ...(customFields.length > 0 && { customFields: customFieldValues }),
      createdBy: 'current-user',
    }

    if (shot) {
      updateShot(shot.id, shotData)
      toast.success('镜头已更新')
    } else {
      addShot(shotData)
      toast.success('镜头已添加')
    }

    onOpenChange(false)
  }

  // Handle custom field value changes
  const handleCustomFieldChange = (fieldId: string, value: CustomFieldValue) => {
    setCustomFieldValues((prev) => ({
      ...prev,
      [fieldId]: value,
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{shot ? '编辑镜头' : '添加镜头'}</DialogTitle>
            <DialogDescription>
              {shot ? '修改镜头信息' : '创建一个新的分镜头'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* 季数和集数 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="seasonNumber">季数</Label>
                <Input
                  id="seasonNumber"
                  type="number"
                  min="1"
                  placeholder="如: 1"
                  value={formData.seasonNumber}
                  onChange={(e) => setFormData({ ...formData, seasonNumber: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="episodeNumber">集数</Label>
                <Input
                  id="episodeNumber"
                  type="number"
                  min="1"
                  placeholder="如: 1"
                  value={formData.episodeNumber}
                  onChange={(e) => setFormData({ ...formData, episodeNumber: e.target.value })}
                />
              </div>
            </div>

            {/* 场次 */}
            <div className="grid gap-2">
              <Label htmlFor="sceneNumber">场次</Label>
              <Input
                id="sceneNumber"
                placeholder="如: 1, 2A, 3"
                value={formData.sceneNumber}
                onChange={(e) => setFormData({ ...formData, sceneNumber: e.target.value })}
              />
            </div>

            {/* 景别 */}
            <div className="grid gap-2">
              <Label htmlFor="shotSize">景别</Label>
              <Select
                value={formData.shotSize}
                onValueChange={(value) => setFormData({ ...formData, shotSize: value as ShotSize })}
              >
                <SelectTrigger id="shotSize">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="extremeLong">远景</SelectItem>
                  <SelectItem value="long">全景</SelectItem>
                  <SelectItem value="medium">中景</SelectItem>
                  <SelectItem value="closeUp">近景</SelectItem>
                  <SelectItem value="extremeCloseUp">特写</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 运镜方式 */}
            <div className="grid gap-2">
              <Label htmlFor="cameraMovement">运镜方式</Label>
              <Select
                value={formData.cameraMovement}
                onValueChange={(value) => setFormData({ ...formData, cameraMovement: value as CameraMovement })}
              >
                <SelectTrigger id="cameraMovement">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="static">固定</SelectItem>
                  <SelectItem value="pan">摇</SelectItem>
                  <SelectItem value="tilt">俯仰</SelectItem>
                  <SelectItem value="dolly">推拉</SelectItem>
                  <SelectItem value="truck">平移</SelectItem>
                  <SelectItem value="pedestral">升降</SelectItem>
                  <SelectItem value="crane">吊臂</SelectItem>
                  <SelectItem value="handheld">手持</SelectItem>
                  <SelectItem value="steadicam">斯坦尼康</SelectItem>
                  <SelectItem value="tracking">跟拍</SelectItem>
                  <SelectItem value="arc">弧形</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 时长 */}
            <div className="grid gap-2">
              <Label htmlFor="duration">时长 (秒)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                max="3600"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 1 })}
              />
            </div>

            {/* 画面描述 */}
            <div className="grid gap-2">
              <Label htmlFor="description">
                画面描述 <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="描述镜头的画面内容、构图、动作等"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                required
              />
            </div>

            {/* 对白/旁白 */}
            <div className="grid gap-2">
              <Label htmlFor="dialogue">对白/旁白</Label>
              <Textarea
                id="dialogue"
                placeholder="镜头中的对白或旁白内容"
                value={formData.dialogue}
                onChange={(e) => setFormData({ ...formData, dialogue: e.target.value })}
                rows={2}
              />
            </div>

            {/* 音效/配乐 */}
            <div className="grid gap-2">
              <Label htmlFor="sound">音效/配乐</Label>
              <Input
                id="sound"
                placeholder="如: 背景音乐、环境音效等"
                value={formData.sound}
                onChange={(e) => setFormData({ ...formData, sound: e.target.value })}
              />
            </div>

            {/* 自定义字段 */}
            {customFields.length > 0 && (
              <>
                <Separator className="my-4" />
                <div className="space-y-1">
                  <h4 className="text-sm font-medium">自定义字段</h4>
                  <p className="text-xs text-muted-foreground">
                    项目特定的扩展信息
                  </p>
                </div>
                <CustomFieldsForm
                  fields={customFields}
                  values={customFieldValues}
                  onChange={handleCustomFieldChange}
                />
              </>
            )}

            {/* 配图 */}
            <div className="grid gap-2">
              <Label>配图</Label>
              {imagePreview ? (
                <div className="relative">
                  <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                    <img
                      src={imagePreview}
                      alt="预览"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={handleRemoveImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed rounded-lg p-6 text-center space-y-4">
                  <div className="flex flex-col gap-3">
                    {/* 本地上传 */}
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="flex flex-col items-center cursor-pointer py-4"
                      >
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                        <span className="text-sm text-muted-foreground">
                          点击上传图片
                        </span>
                        <span className="text-xs text-muted-foreground mt-1">
                          支持 JPG、PNG，最大 2MB
                        </span>
                      </label>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                          或者
                        </span>
                      </div>
                    </div>

                    {/* 从资产库选择 */}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAssetSelector(true)}
                      className="w-full"
                    >
                      <ImageIcon className="mr-2 h-4 w-4" />
                      从资产库选择
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit">
              {shot ? '保存' : '添加'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      {/* 资产选择器 */}
      <AssetSelector
        open={showAssetSelector}
        onOpenChange={setShowAssetSelector}
        onSelect={handleSelectFromAssets}
        multiple={false}
        allowedTypes={['image']}
        title="选择配图"
      />
    </Dialog>
  )
}
