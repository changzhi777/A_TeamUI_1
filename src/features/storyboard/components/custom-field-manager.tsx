/**
 * custom-field-manager
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  Copy,
  GripVertical,
  ChevronDown,
  ChevronUp,
  ChevronRight,
} from 'lucide-react'
import {
  useCustomFieldStore,
  formatFieldValue,
  getDefaultValueForType,
} from '@/stores/custom-field-store'
import type { CustomFieldConfig, CustomFieldType } from '@/lib/types/api'

interface CustomFieldManagerProps {
  projectId?: string // If provided, manage project-level fields; otherwise, manage global fields
  onFieldChange?: () => void
}

const FIELD_TYPE_LABELS: Record<CustomFieldType, string> = {
  text: '文本',
  textarea: '多行文本',
  number: '数字',
  select: '下拉选择',
  multiselect: '多选',
  date: '日期',
  checkbox: '复选框',
}

const FIELD_TYPE_DESCRIPTIONS: Record<CustomFieldType, string> = {
  text: '单行文本输入',
  textarea: '多行文本输入，适合较长内容',
  number: '数字输入',
  select: '从预设选项中单选',
  multiselect: '从预设选项中多选',
  date: '日期选择',
  checkbox: '是/否选项',
}

// Field editor dialog
interface FieldEditorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  field?: CustomFieldConfig
  projectId?: string
  onSave: (data: Omit<CustomFieldConfig, 'id' | 'createdAt' | 'updatedAt'>) => void
}

function FieldEditorDialog({ open, onOpenChange, field, projectId, onSave }: FieldEditorDialogProps) {
  const [name, setName] = useState(field?.name || '')
  const [type, setType] = useState<CustomFieldType>(field?.type || 'text')
  const [required, setRequired] = useState(field?.required || false)
  const [visible, setVisible] = useState(field?.visible ?? true)
  const [options, setOptions] = useState<string[]>(field?.options || ['选项1', '选项2', '选项3'])
  const [defaultValue, setDefaultValue] = useState<string>(
    field?.defaultValue !== undefined && field?.defaultValue !== null ? String(field.defaultValue) : ''
  )
  const [optionsText, setOptionsText] = useState(
    field?.options?.join('\n') || '选项1\n选项2\n选项3'
  )

  // Reset form when dialog opens
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setName(field?.name || '')
      setType(field?.type || 'text')
      setRequired(field?.required || false)
      setVisible(field?.visible ?? true)
      setOptions(field?.options || ['选项1', '选项2', '选项3'])
      setDefaultValue(
        field?.defaultValue !== undefined && field?.defaultValue !== null ? String(field.defaultValue) : ''
      )
      setOptionsText(field?.options?.join('\n') || '选项1\n选项2\n选项3')
    }
    onOpenChange(newOpen)
  }

  const handleOptionsChange = (text: string) => {
    setOptionsText(text)
    setOptions(text.split('\n').filter((line) => line.trim()))
  }

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('请输入字段名称')
      return
    }

    if ((type === 'select' || type === 'multiselect') && options.length < 2) {
      toast.error('下拉选项至少需要2个选项')
      return
    }

    const config: Omit<CustomFieldConfig, 'id' | 'createdAt' | 'updatedAt'> = {
      name: name.trim(),
      type,
      required,
      visible,
      order: field?.order ?? 0,
      projectId,
    }

    // Add options for select/multiselect types
    if (type === 'select' || type === 'multiselect') {
      config.options = options
    }

    // Add default value if provided
    if (defaultValue.trim()) {
      if (type === 'number') {
        config.defaultValue = Number(defaultValue)
      } else if (type === 'checkbox') {
        config.defaultValue = defaultValue === 'true'
      } else if (type === 'multiselect') {
        config.defaultValue = defaultValue.split(',').map((s) => s.trim())
      } else {
        config.defaultValue = defaultValue
      }
    }

    onSave(config)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{field ? '编辑字段' : '添加字段'}</DialogTitle>
          <DialogDescription>
            {field ? '修改自定义字段配置' : '创建新的自定义字段'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Field name */}
          <div className="grid gap-2">
            <Label htmlFor="name">字段名称 *</Label>
            <Input
              id="name"
              placeholder="如: 拍摄地点"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Field type */}
          <div className="grid gap-2">
            <Label htmlFor="type">字段类型 *</Label>
            <Select
              value={type}
              onValueChange={(value) => setType(value as CustomFieldType)}
            >
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(FIELD_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    <div>
                      <div>{label}</div>
                      <div className="text-xs text-muted-foreground">
                        {FIELD_TYPE_DESCRIPTIONS[value as CustomFieldType]}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Options for select/multiselect */}
          {(type === 'select' || type === 'multiselect') && (
            <div className="grid gap-2">
              <Label htmlFor="options">下拉选项（每行一个）</Label>
              <Textarea
                id="options"
                placeholder="选项1&#10;选项2&#10;选项3"
                value={optionsText}
                onChange={(e) => handleOptionsChange(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                当前 {options.length} 个选项
              </p>
            </div>
          )}

          {/* Default value */}
          <div className="grid gap-2">
            <Label htmlFor="defaultValue">默认值（可选）</Label>
            {type === 'checkbox' ? (
              <Select
                value={defaultValue}
                onValueChange={setDefaultValue}
              >
                <SelectTrigger id="defaultValue">
                  <SelectValue placeholder="选择默认值" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">无</SelectItem>
                  <SelectItem value="true">是</SelectItem>
                  <SelectItem value="false">否</SelectItem>
                </SelectContent>
              </Select>
            ) : type === 'select' ? (
              <Select
                value={defaultValue}
                onValueChange={setDefaultValue}
              >
                <SelectTrigger id="defaultValue">
                  <SelectValue placeholder="选择默认值" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">无</SelectItem>
                  {options.map((option, index) => (
                    <SelectItem key={index} value={String(index)}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : type === 'multiselect' ? (
              <Input
                id="defaultValue"
                placeholder="用逗号分隔，如: 0,1"
                value={defaultValue}
                onChange={(e) => setDefaultValue(e.target.value)}
              />
            ) : (
              <Input
                id="defaultValue"
                type={type === 'number' ? 'number' : type === 'date' ? 'date' : 'text'}
                placeholder={type === 'number' ? '0' : type === 'date' ? '' : '输入默认值'}
                value={defaultValue}
                onChange={(e) => setDefaultValue(e.target.value)}
              />
            )}
          </div>

          {/* Required and visible toggles */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch
                id="required"
                checked={required}
                onCheckedChange={setRequired}
              />
              <Label htmlFor="required">必填字段</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="visible"
                checked={visible}
                onCheckedChange={setVisible}
              />
              <Label htmlFor="visible">默认显示</Label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button type="button" onClick={handleSave}>
            {field ? '保存' : '添加'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Main component
export function CustomFieldManager({ projectId, onFieldChange }: CustomFieldManagerProps) {
  const {
    fields,
    createField,
    updateField,
    deleteField,
    duplicateField,
    reorderFields,
  } = useCustomFieldStore()

  const [editorOpen, setEditorOpen] = useState(false)
  const [editingField, setEditingField] = useState<CustomFieldConfig | undefined>()
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    visible: true,
    hidden: false,
  })

  // Filter fields by scope
  const scopedFields = projectId
    ? fields.filter((f) => f.projectId === projectId)
    : fields.filter((f) => f.projectId === undefined)

  // Sort by order
  const sortedFields = [...scopedFields].sort((a, b) => a.order - b.order)

  // Separate visible and hidden fields
  const visibleFields = sortedFields.filter((f) => f.visible)
  const hiddenFields = sortedFields.filter((f) => !f.visible)

  const handleCreate = () => {
    setEditingField(undefined)
    setEditorOpen(true)
  }

  const handleEdit = (field: CustomFieldConfig) => {
    setEditingField(field)
    setEditorOpen(true)
  }

  const handleDelete = (id: string) => {
    deleteField(id)
    toast.success('字段已删除')
    onFieldChange?.()
  }

  const handleDuplicate = (id: string) => {
    const newField = duplicateField(id, projectId)
    if (newField) {
      toast.success('字段已复制')
      onFieldChange?.()
    }
  }

  const handleSave = (data: Omit<CustomFieldConfig, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingField) {
      updateField(editingField.id, data)
      toast.success('字段已更新')
    } else {
      // Set order for new field
      const newOrder = scopedFields.length
      createField({ ...data, order: newOrder })
      toast.success('字段已添加')
    }
    onFieldChange?.()
  }

  const handleMoveUp = (field: CustomFieldConfig) => {
    const currentIndex = sortedFields.findIndex((f) => f.id === field.id)
    if (currentIndex <= 0) return

    const newOrder = [...sortedFields]
    ;[newOrder[currentIndex - 1], newOrder[currentIndex]] = [
      newOrder[currentIndex],
      newOrder[currentIndex - 1],
    ]

    reorderFields(newOrder.map((f) => f.id), projectId)
    onFieldChange?.()
  }

  const handleMoveDown = (field: CustomFieldConfig) => {
    const currentIndex = sortedFields.findIndex((f) => f.id === field.id)
    if (currentIndex >= sortedFields.length - 1) return

    const newOrder = [...sortedFields]
    ;[newOrder[currentIndex], newOrder[currentIndex + 1]] = [
      newOrder[currentIndex + 1],
      newOrder[currentIndex],
    ]

    reorderFields(newOrder.map((f) => f.id), projectId)
    onFieldChange?.()
  }

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  // Render field list
  const renderFieldList = (fieldList: CustomFieldConfig[], section: string) => (
    <div className="space-y-2">
      {fieldList.map((field) => (
        <div
          key={field.id}
          className="flex items-center justify-between rounded-lg border bg-card p-3"
        >
          <div className="flex items-center gap-3">
            <div className="flex flex-col gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={() => handleMoveUp(field)}
                disabled={sortedFields.indexOf(field) === 0}
              >
                <ChevronUp className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={() => handleMoveDown(field)}
                disabled={sortedFields.indexOf(field) === sortedFields.length - 1}
              >
                <ChevronDown className="h-3 w-3" />
              </Button>
            </div>
            <div>
              <div className="font-medium">{field.name}</div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline" className="text-xs">
                  {FIELD_TYPE_LABELS[field.type]}
                </Badge>
                {field.required && (
                  <Badge variant="secondary" className="text-xs">
                    必填
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleEdit(field)}>
                <Pencil className="mr-2 h-4 w-4" />
                编辑
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDuplicate(field.id)}>
                <Copy className="mr-2 h-4 w-4" />
                复制
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDelete(field.id)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                删除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ))}
    </div>
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>
              {projectId ? '项目自定义字段' : '全局自定义字段'}
            </CardTitle>
            <CardDescription>
              {projectId
                ? '配置当前项目的自定义字段，仅在当前项目生效'
                : '配置全局自定义字段，对所有项目生效'}
            </CardDescription>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            添加字段
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {scopedFields.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>暂无自定义字段</p>
            <p className="text-sm mt-1">点击上方按钮添加新字段</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Visible fields section */}
            {visibleFields.length > 0 && (
              <div>
                <button
                  className="flex items-center gap-2 w-full text-left font-medium mb-2"
                  onClick={() => toggleSection('visible')}
                >
                  {expandedSections.visible ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  显示的字段 ({visibleFields.length})
                </button>
                {expandedSections.visible && renderFieldList(visibleFields, 'visible')}
              </div>
            )}

            {/* Hidden fields section */}
            {hiddenFields.length > 0 && (
              <div>
                <button
                  className="flex items-center gap-2 w-full text-left font-medium mb-2 text-muted-foreground"
                  onClick={() => toggleSection('hidden')}
                >
                  {expandedSections.hidden ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  隐藏的字段 ({hiddenFields.length})
                </button>
                {expandedSections.hidden && renderFieldList(hiddenFields, 'hidden')}
              </div>
            )}
          </div>
        )}
      </CardContent>

      <FieldEditorDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        field={editingField}
        projectId={projectId}
        onSave={handleSave}
      />
    </Card>
  )
}

// Export field editor for use in other components
export { FieldEditorDialog }
