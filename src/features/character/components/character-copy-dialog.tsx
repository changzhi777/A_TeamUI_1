/**
 * character-copy-dialog
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

/**
 * Character Copy Dialog Component
 * 角色复制对话框组件 - 支持项目角色与全局角色之间的复制转换
 */

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import {
  Copy,
  ArrowRight,
  Globe,
  FolderOpen,
  AlertTriangle,
  Loader2,
} from 'lucide-react'
import type { Character } from '@/lib/types/character'
import { useCharacterStore } from '@/stores/character-store'
import { useAuthStore } from '@/stores/auth-store'
import { syncCharacterToAssetAsync } from '@/lib/services/character-asset-sync'
import { toast } from 'sonner'

interface CharacterCopyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  character: Character
  onSuccess?: (newCharacterId: string) => void
}

type CopyTarget = 'global' | 'project'

export function CharacterCopyDialog({
  open,
  onOpenChange,
  character,
  onSuccess,
}: CharacterCopyDialogProps) {
  const [target, setTarget] = useState<CopyTarget>(
    character.projectId ? 'global' : 'project'
  )
  const [copying, setCopying] = useState(false)

  const { createCharacter, updateCharacter, getCharactersByProject } = useCharacterStore()
  const { user } = useAuthStore()

  // 检查权限：只有管理员可以执行复制转换
  const isAdmin = user?.role === 'admin'
  const isProjectCharacter = !!character.projectId
  const isGlobalCharacter = !character.projectId

  // 确定可用的复制目标
  const availableTargets: CopyTarget[] = []
  if (isProjectCharacter) {
    availableTargets.push('global') // 项目角色可以复制为全局角色
  }
  if (isGlobalCharacter) {
    availableTargets.push('project') // 全局角色可以复制为项目角色
  }

  const handleCopy = async () => {
    if (!isAdmin) {
      toast.error('您没有权限执行此操作')
      return
    }

    setCopying(true)

    try {
      // 创建新角色
      const newId = createCharacter({
        name: character.name,
        description: character.description,
        personality: character.personality,
        attributes: character.attributes,
        tags: character.tags,
        basePrompt: character.basePrompt,
        projectId: target === 'project' ? character.projectId : undefined,
      })

      // 复制视角图片
      const newCharacter = useCharacterStore.getState().getCharacterById(newId)
      if (newCharacter) {
        // 更新复制的内容
        updateCharacter(newId, {
          views: { ...character.views },
          costumes: character.costumes.map((c) => ({ ...c })),
          voice: character.voice ? { ...character.voice } : undefined,
        })

        // 同步到资产库
        const updatedCharacter = useCharacterStore.getState().getCharacterById(newId)
        if (updatedCharacter) {
          await syncCharacterToAssetAsync(updatedCharacter)
        }
      }

      toast.success(
        target === 'global'
          ? '角色已复制为全局角色'
          : '角色已复制到项目'
      )

      onSuccess?.(newId)
      onOpenChange(false)
    } catch (error) {
      toast.error('复制失败：' + (error instanceof Error ? error.message : '未知错误'))
    } finally {
      setCopying(false)
    }
  }

  if (!isAdmin) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>复制角色</DialogTitle>
          </DialogHeader>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              您没有权限执行角色复制转换操作。此功能仅限管理员使用。
            </AlertDescription>
          </Alert>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="h-5 w-5" />
            复制角色
          </DialogTitle>
          <DialogDescription>
            复制角色 "{character.name}" 到新的范围，复制后将生成新的角色编号。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 当前角色信息 */}
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <Badge variant={isProjectCharacter ? 'default' : 'secondary'}>
              {isProjectCharacter ? (
                <>
                  <FolderOpen className="h-3 w-3 mr-1" />
                  项目角色
                </>
              ) : (
                <>
                  <Globe className="h-3 w-3 mr-1" />
                  全局角色
                </>
              )}
            </Badge>
            <span className="font-mono text-xs text-muted-foreground">
              {character.code}
            </span>
          </div>

          {/* 选择复制目标 */}
          <div className="space-y-3">
            <Label>复制目标</Label>
            <RadioGroup
              value={target}
              onValueChange={(v) => setTarget(v as CopyTarget)}
              className="space-y-2"
            >
              {availableTargets.includes('global') && (
                <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="global" id="target-global" />
                  <Label htmlFor="target-global" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      <span>复制为全局角色</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      角色将可以被所有项目使用
                    </p>
                  </Label>
                </div>
              )}
              {availableTargets.includes('project') && (
                <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="project" id="target-project" />
                  <Label htmlFor="target-project" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <FolderOpen className="h-4 w-4" />
                      <span>复制到项目</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      角色将仅在当前项目中可用
                    </p>
                  </Label>
                </div>
              )}
            </RadioGroup>
          </div>

          {/* 提示信息 */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <strong>注意：</strong>复制后的角色将与原角色独立，修改其中一个不会影响另一个。
              复制后的角色将自动同步到资产库。
            </AlertDescription>
          </Alert>

          {/* 复制预览 */}
          <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
            <Badge variant="outline" className="font-mono">
              {character.code}
            </Badge>
            <ArrowRight className="h-4 w-4" />
            <Badge variant="secondary" className="font-mono">
              {target === 'global' ? 'GLOBAL-CHAR-???' : 'PROJ-???-CHAR-???'}
            </Badge>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleCopy} disabled={copying}>
            {copying ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                复制中...
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                确认复制
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
