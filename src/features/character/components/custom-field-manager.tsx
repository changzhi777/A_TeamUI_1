/**
 * custom-field-manager
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

/**
 * Custom Field Manager Component
 * 自定义字段管理组件
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Plus,
  Trash2,
  Edit2,
  GripVertical,
} from 'lucide-react'
import { toast } from 'sonner'

/**
 * 自定义字段类型
 */
export type CustomFieldType = 'text' | 'number' | 'select' | 'textarea'

/**
 * 自定义字段定义
 */
export interface CustomFieldDefinition {
  /** 字段键名 */
  key: string
  /** 字段标签（显示名称） */
  label: string
  /** 字段类型 */
  type: CustomFieldType
  /** 选项（仅 type 为 select 时使用） */
  options?: string[]
  /** 占位符 */
  placeholder?: string
  /** 是否必填 */
  required?: boolean
}

interface CustomFieldManagerProps {
  /** 已定义的自定义字段 */
  fields: CustomFieldDefinition[]
  /** 字段变更回调 */
  onChange: (fields: CustomFieldDefinition[]) => void
  /** 是否禁用 */
  disabled?: boolean
}

/**
 * 自定义字段管理组件
 */
export function CustomFieldManager({
  fields,
  onChange,
  disabled = false,
}: CustomFieldManagerProps) {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingField, setEditingField] = useState<CustomFieldDefinition | null>(null)

  // 新字段表单状态
  const [newField, setNewField] = useState<CustomFieldDefinition>({
    key: '',
    label: '',
    type: 'text',
    placeholder: '',
    required: false,
  })
  const [optionsText, setOptionsText] = useState('')

  // 重置表单
  const resetForm = () => {
    setNewField({
      key: '',
      label: '',
      type: 'text',
      placeholder: '',
      required: false,
    })
    setOptionsText('')
    setEditingField(null)
  }

  // 打开添加对话框
  const handleOpenAdd = () => {
    resetForm()
    setShowAddDialog(true)
  }

  // 打开编辑对话框
  const handleOpenEdit = (field: CustomFieldDefinition) => {
    setNewField({ ...field })
    setOptionsText(field.options?.join(', ') || '')
    setEditingField(field)
    setShowAddDialog(true)
  }

  // 验证字段
  const validateField = (): boolean => {
    if (!newField.key.trim()) {
      toast.error('请输入字段键名')
      return false
    }
    if (!newField.label.trim()) {
      toast.error('请输入字段标签')
      return false
    }
    // 检查键名是否重复
    const existingField = fields.find(
      (f) => f.key === newField.key && f.key !== editingField?.key
    )
    if (existingField) {
      toast.error('字段键名已存在')
      return false
    }
    // 如果是选择类型，检查是否有选项
    if (newField.type === 'select' && !optionsText.trim()) {
      toast.error('请输入选项')
      return false
    }
    return true
  }

  // 保存字段
  const handleSave = () => {
    if (!validateField()) return

    const fieldToSave: CustomFieldDefinition = {
      ...newField,
      options:
        newField.type === 'select'
          ? optionsText.split(',').map((o) => o.trim()).filter(Boolean)
          : undefined,
    }

    if (editingField) {
      // 更新现有字段
      const updatedFields = fields.map((f) =>
        f.key === editingField.key ? fieldToSave : f
      )
      onChange(updatedFields)
      toast.success('字段已更新')
    } else {
      // 添加新字段
      onChange([...fields, fieldToSave])
      toast.success('字段已添加')
    }

    setShowAddDialog(false)
    resetForm()
  }

  // 删除字段
  const handleDelete = (key: string) => {
    const updatedFields = fields.filter((f) => f.key !== key)
    onChange(updatedFields)
    toast.success('字段已删除')
  }

  // 获取类型显示名称
  const getTypeLabel = (type: CustomFieldType): string => {
    const labels: Record<CustomFieldType, string> = {
      text: '文本',
      number: '数字',
      select: '选择',
      textarea: '多行文本',
    }
    return labels[type]
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">自定义字段</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenAdd}
            disabled={disabled}
          >
            <Plus className="h-4 w-4 mr-1" />
            添加字段
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {fields.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            暂无自定义字段，点击上方按钮添加
          </p>
        ) : (
          <div className="space-y-2">
            {fields.map((field) => (
              <div
                key={field.key}
                className="flex items-center justify-between p-2 bg-muted rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{field.label}</span>
                      {field.required && (
                        <Badge variant="destructive" className="text-xs px-1 py-0">
                          必填
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-mono">{field.key}</span>
                      <span>•</span>
                      <span>{getTypeLabel(field.type)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleOpenEdit(field)}
                    disabled={disabled}
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(field.key)}
                    disabled={disabled}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* 添加/编辑字段对话框 */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingField ? '编辑字段' : '添加字段'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="field-key">字段键名 *</Label>
              <Input
                id="field-key"
                placeholder="如：birthplace"
                value={newField.key}
                onChange={(e) =>
                  setNewField({ ...newField, key: e.target.value.replace(/\s+/g, '_') })
                }
                disabled={!!editingField}
              />
              <p className="text-xs text-muted-foreground">
                用于内部标识，只能包含字母、数字和下划线
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="field-label">显示标签 *</Label>
              <Input
                id="field-label"
                placeholder="如：出生地"
                value={newField.label}
                onChange={(e) => setNewField({ ...newField, label: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="field-type">字段类型</Label>
              <Select
                value={newField.type}
                onValueChange={(value: CustomFieldType) =>
                  setNewField({ ...newField, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">文本</SelectItem>
                  <SelectItem value="number">数字</SelectItem>
                  <SelectItem value="textarea">多行文本</SelectItem>
                  <SelectItem value="select">选择</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newField.type === 'select' && (
              <div className="space-y-2">
                <Label htmlFor="field-options">选项（用逗号分隔）*</Label>
                <Input
                  id="field-options"
                  placeholder="如：北京, 上海, 广州"
                  value={optionsText}
                  onChange={(e) => setOptionsText(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="field-placeholder">占位符</Label>
              <Input
                id="field-placeholder"
                placeholder="输入框提示文字"
                value={newField.placeholder || ''}
                onChange={(e) =>
                  setNewField({ ...newField, placeholder: e.target.value })
                }
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="field-required"
                checked={newField.required}
                onChange={(e) =>
                  setNewField({ ...newField, required: e.target.checked })
                }
                className="rounded border-gray-300"
              />
              <Label htmlFor="field-required" className="text-sm font-normal">
                设为必填字段
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              取消
            </Button>
            <Button onClick={handleSave}>
              {editingField ? '保存' : '添加'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

/**
 * 自定义字段渲染组件
 * 根据字段定义渲染输入控件
 */
interface CustomFieldRendererProps {
  /** 字段定义 */
  field: CustomFieldDefinition
  /** 当前值 */
  value: string | undefined
  /** 值变更回调 */
  onChange: (key: string, value: string) => void
  /** 是否禁用 */
  disabled?: boolean
}

export function CustomFieldRenderer({
  field,
  value,
  onChange,
  disabled = false,
}: CustomFieldRendererProps) {
  const handleChange = (newValue: string) => {
    onChange(field.key, newValue)
  }

  switch (field.type) {
    case 'textarea':
      return (
        <div className="space-y-2">
          <Label htmlFor={`custom-${field.key}`}>
            {field.label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          <textarea
            id={`custom-${field.key}`}
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder={field.placeholder}
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            disabled={disabled}
          />
        </div>
      )

    case 'number':
      return (
        <div className="space-y-2">
          <Label htmlFor={`custom-${field.key}`}>
            {field.label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          <Input
            id={`custom-${field.key}`}
            type="number"
            placeholder={field.placeholder}
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            disabled={disabled}
          />
        </div>
      )

    case 'select':
      return (
        <div className="space-y-2">
          <Label htmlFor={`custom-${field.key}`}>
            {field.label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          <Select
            value={value || ''}
            onValueChange={handleChange}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder || '请选择'} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )

    case 'text':
    default:
      return (
        <div className="space-y-2">
          <Label htmlFor={`custom-${field.key}`}>
            {field.label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          <Input
            id={`custom-${field.key}`}
            type="text"
            placeholder={field.placeholder}
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            disabled={disabled}
          />
        </div>
      )
  }
}
