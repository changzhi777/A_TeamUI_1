import { useState } from 'react'
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
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useI18n } from '@/i18n'
import type { GlobalMember, MemberRole } from '@/stores/project-store'

interface EditMemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  member: GlobalMember | null
  onSave: (id: string, data: { name: string; email: string; role: MemberRole }) => void
}

export function EditMemberDialog({
  open,
  onOpenChange,
  member,
  onSave,
}: EditMemberDialogProps) {
  const { t } = useI18n()

  // 使用 key prop 来重置表单，避免在 effect 中调用 setState
  const [formData, setFormData] = useState(() => ({
    name: member?.name || '',
    email: member?.email || '',
    role: (member?.role || 'member') as MemberRole,
  }))
  const [errors, setErrors] = useState<{
    name?: string
    email?: string
  }>({})

  // 邮箱格式验证
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // 验证
    const newErrors: typeof errors = {}

    if (!formData.name.trim()) {
      newErrors.name = t.validation.nameRequired
    }

    if (!formData.email.trim()) {
      newErrors.email = t.validation.emailRequired
    } else if (!validateEmail(formData.email)) {
      newErrors.email = t.errors.invalidEmail
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      return
    }

    if (member) {
      onSave(member.id, formData)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>编辑成员</DialogTitle>
            <DialogDescription>
              修改成员信息和角色权限
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">姓名</Label>
              <Input
                id="edit-name"
                placeholder="输入成员姓名"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-email">邮箱</Label>
              <Input
                id="edit-email"
                type="email"
                placeholder="成员邮箱地址"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-role">角色</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value as MemberRole })}
              >
                <SelectTrigger id="edit-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">{t.project.role.admin}</SelectItem>
                  <SelectItem value="member">{t.project.role.member}</SelectItem>
                  <SelectItem value="director">{t.project.role.director}</SelectItem>
                  <SelectItem value="screenwriter">{t.project.role.screenwriter}</SelectItem>
                  <SelectItem value="cinematographer">{t.project.role.cinematographer}</SelectItem>
                  <SelectItem value="editor">{t.project.role.editor}</SelectItem>
                  <SelectItem value="actor">{t.project.role.actor}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit">保存</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
