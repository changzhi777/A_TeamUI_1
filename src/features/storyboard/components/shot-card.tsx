import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { useStoryboardStore } from '@/stores/storyboard-store'
import { MoreVertical, Clock } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'

interface ShotCardProps {
  shot: any
  onEdit: (shot: any) => void
  getShotSizeLabel: (size: string) => string
  getCameraMovementLabel: (movement: string) => string
  compact?: boolean
}

export function ShotCard({
  shot,
  onEdit,
  getShotSizeLabel,
  getCameraMovementLabel,
  compact = false,
}: ShotCardProps) {
  const toggleShotSelection = useStoryboardStore((state) => state.toggleShotSelection)
  const selectedShotIds = useStoryboardStore((state) => state.selectedShotIds)
  const isSelected = selectedShotIds.includes(shot.id)

  const handleDelete = () => {
    if (confirm('确定要删除此镜头吗？')) {
      const deleteShot = useStoryboardStore.getState().deleteShot
      deleteShot(shot.id)
      toast.success('镜头已删除')
    }
  }

  const handleDuplicate = () => {
    const duplicateShots = useStoryboardStore.getState().duplicateShots
    duplicateShots([shot.id])
    toast.success('镜头已复制')
  }

  if (compact) {
    return (
      <Card
        className={`hover:shadow-md transition-all cursor-pointer ${
          isSelected ? 'ring-2 ring-primary' : ''
        }`}
        onClick={() => toggleShotSelection(shot.id)}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => toggleShotSelection(shot.id)}
                onClick={(e) => e.stopPropagation()}
              />
              <Badge variant="outline">#{shot.shotNumber}</Badge>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>操作</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onEdit(shot)}>编辑</DropdownMenuItem>
                <DropdownMenuItem onClick={handleDuplicate}>复制</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
                  删除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          {/* 配图预览 */}
          {shot.image ? (
            <div className="aspect-video bg-muted rounded mb-2 overflow-hidden">
              <img
                src={shot.image}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="aspect-video bg-muted rounded mb-2 flex items-center justify-center">
              <span className="text-xs text-muted-foreground">暂无配图</span>
            </div>
          )}

          <div className="space-y-1 text-xs">
            <p className="font-medium line-clamp-2">{shot.description || '暂无描述'}</p>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3 w-3" />
              {shot.duration}s
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className={`hover:shadow-md transition-all ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => toggleShotSelection(shot.id)}
            />
            <div>
              <CardTitle className="text-base">
                镜头 #{shot.shotNumber} - {shot.sceneNumber || '未设置场次'}
              </CardTitle>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>操作</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onEdit(shot)}>编辑</DropdownMenuItem>
              <DropdownMenuItem onClick={handleDuplicate}>复制</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
                删除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 配图 */}
          {shot.image ? (
            <div className="aspect-video bg-muted rounded overflow-hidden">
              <img
                src={shot.image}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="aspect-video bg-muted rounded flex items-center justify-center">
              <span className="text-sm text-muted-foreground">暂无配图</span>
            </div>
          )}

          {/* 信息 */}
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">画面描述</label>
              <p className="text-sm">{shot.description || '暂无描述'}</p>
            </div>

            {shot.dialogue && (
              <div>
                <label className="text-xs text-muted-foreground">对白/旁白</label>
                <p className="text-sm italic">&ldquo;{shot.dialogue}&rdquo;</p>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{getShotSizeLabel(shot.shotSize)}</Badge>
              <Badge variant="secondary">{getCameraMovementLabel(shot.cameraMovement)}</Badge>
              <Badge variant="outline">{shot.duration}s</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
