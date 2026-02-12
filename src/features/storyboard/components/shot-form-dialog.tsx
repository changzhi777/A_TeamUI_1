import { useState, useEffect } from 'react'
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
import { useStoryboardStore, type ShotSize, type CameraMovement } from '@/stores/storyboard-store'
import { toast } from 'sonner'
import { Upload, X } from 'lucide-react'

interface ShotFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  shot?: any
}

export function ShotFormDialog({ open, onOpenChange, projectId, shot }: ShotFormDialogProps) {
  const addShot = useStoryboardStore((state) => state.addShot)
  const updateShot = useStoryboardStore((state) => state.updateShot)

  const [formData, setFormData] = useState({
    sceneNumber: '',
    shotSize: 'medium' as ShotSize,
    cameraMovement: 'static' as CameraMovement,
    duration: 5,
    description: '',
    dialogue: '',
    sound: '',
    image: '',
  })

  const [imagePreview, setImagePreview] = useState<string | null>(null)

  useEffect(() => {
    if (shot) {
      setFormData({
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
    } else {
      setFormData({
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
    }
  }, [shot, open])

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.description.trim()) {
      toast.error('请输入画面描述')
      return
    }

    if (shot) {
      updateShot(shot.id, formData)
      toast.success('镜头已更新')
    } else {
      addShot({
        projectId,
        sceneNumber: formData.sceneNumber,
        shotSize: formData.shotSize,
        cameraMovement: formData.cameraMovement,
        duration: formData.duration,
        description: formData.description,
        dialogue: formData.dialogue,
        sound: formData.sound,
        image: formData.image,
        createdBy: 'current-user',
      })
      toast.success('镜头已添加')
    }

    onOpenChange(false)
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
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="flex flex-col items-center cursor-pointer"
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
    </Dialog>
  )
}
