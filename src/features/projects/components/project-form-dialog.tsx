/**
 * project-form-dialog
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import React, { useState, useEffect } from 'react'
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
import { useI18n } from '@/i18n'
import { useProjectStore, type ProjectType, type ProjectStatus } from '@/stores/project-store'
import { useAuthStore } from '@/stores/auth-store'
import { usePermissionCheck } from '@/hooks/use-permission-check'

interface ProjectFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project?: any // 如果提供，则为编辑模式
}

export function ProjectFormDialog({ open, onOpenChange, project }: ProjectFormDialogProps) {
  const { t } = useI18n()
  const addProject = useProjectStore((state) => state.loadProject)
  const updateProject = useProjectStore((state) => state.updateProject)
  const user = useAuthStore((state) => state.user)
  const { canWriteProject } = usePermissionCheck()

  const [formData, setFormData] = useState({
    name: project?.name || '',
    description: project?.description || '',
    type: (project?.type as ProjectType) || 'shortDrama',
    status: (project?.status as ProjectStatus) || 'planning',
    episodeRange: project?.episodeRange || '',
    director: project?.director || '',
  })

  useEffect(() => {
    if (open && !project && user) {
      setFormData(prev => ({
        ...prev,
        director: user.name,
      }))
    } else if (open && project) {
      setFormData({
        name: project.name,
        description: project.description || '',
        type: project.type,
        status: project.status,
        episodeRange: project.episodeRange || '',
        director: project.director || '',
      })
    } else if (!open) {
      setFormData({
        name: '',
        description: '',
        type: 'shortDrama',
        status: 'planning',
        episodeRange: '',
        director: '',
      })
    }
  }, [open, project, user])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) return

    if (project) {
      // 编辑模式
      updateProject(project.id, {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        status: formData.status,
        episodeRange: formData.episodeRange,
        director: formData.director,
      })
    } else {
      // 创建模式
      addProject({
        name: formData.name,
        description: formData.description,
        type: formData.type,
        status: formData.status,
        episodeRange: formData.episodeRange,
        director: formData.director,
        createdBy: user?.id || 'unknown',
        members: [],
        totalShots: 0,
        completedShots: 0,
        isFavorite: false,
        isPinned: false,
      })
    }

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {project ? t.project.editProject : t.project.createProject}
            </DialogTitle>
            <DialogDescription>
              {project ? '修改项目信息' : '创建一个新的短剧创作项目'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* 项目名称 */}
            <div className="grid gap-2">
              <Label htmlFor="name">
                {t.project.projectName} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="输入项目名称"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            {/* 导演 */}
            <div className="grid gap-2">
              <Label htmlFor="director">{t.project.director}</Label>
              <Input
                id="director"
                placeholder="输入导演姓名"
                value={formData.director}
                onChange={(e) => setFormData({ ...formData, director: e.target.value })}
              />
            </div>

            {/* 项目类型 */}
            <div className="grid gap-2">
              <Label htmlFor="type">{t.project.projectType}</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as ProjectType })}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="shortDrama">{t.project.type.shortDrama}</SelectItem>
                  <SelectItem value="realLifeDrama">{t.project.type.realLifeDrama}</SelectItem>
                  <SelectItem value="aiPodcast">{t.project.type.aiPodcast}</SelectItem>
                  <SelectItem value="advertisement">{t.project.type.advertisement}</SelectItem>
                  <SelectItem value="mv">{t.project.type.mv}</SelectItem>
                  <SelectItem value="documentary">{t.project.type.documentary}</SelectItem>
                  <SelectItem value="other">{t.project.type.other}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 项目状态 */}
            {project && (
              <div className="grid gap-2">
                <Label htmlFor="status">{t.project.projectStatus}</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as ProjectStatus })}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">{t.project.status.planning}</SelectItem>
                    <SelectItem value="filming">{t.project.status.filming}</SelectItem>
                    <SelectItem value="postProduction">{t.project.status.postProduction}</SelectItem>
                    <SelectItem value="completed">{t.project.status.completed}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* 集数范围 */}
            <div className="grid gap-2">
              <Label htmlFor="episodeRange">{t.project.episodeRange}</Label>
              <Input
                id="episodeRange"
                placeholder={t.project.episodeRangePlaceholder}
                value={formData.episodeRange}
                onChange={(e) => setFormData({ ...formData, episodeRange: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                {t.project.episodeRangeDescription}
              </p>
            </div>

            {/* 项目描述 */}
            <div className="grid gap-2">
              <Label htmlFor="description">{t.project.projectDescription}</Label>
              <Textarea
                id="description"
                placeholder="简要描述项目内容、主题等"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t.common.cancel}
            </Button>
            <Button type="submit">
              {project ? t.common.save : t.common.create}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
