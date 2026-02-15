/**
 * custom-field-renderer
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { DatePicker } from '@/components/ui/date-picker'
import { MultiSelect } from '@/components/ui/multi-select'
import type { CustomFieldConfig, CustomFieldValue } from '@/lib/types/api'

interface CustomFieldRendererProps {
  field: CustomFieldConfig
  value: CustomFieldValue
  onChange: (value: CustomFieldValue) => void
  disabled?: boolean
  compact?: boolean // Use compact layout for tables
}

// Render a custom field based on its type
export function CustomFieldRenderer({
  field,
  value,
  onChange,
  disabled = false,
  compact = false,
}: CustomFieldRendererProps) {
  const handleChange = (newValue: CustomFieldValue) => {
    onChange(newValue)
  }

  const renderField = () => {
    switch (field.type) {
      case 'text':
        return (
          <Input
            value={(value as string) ?? ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={`输入${field.name}`}
            disabled={disabled}
            className={compact ? 'h-8' : ''}
          />
        )

      case 'textarea':
        return (
          <Textarea
            value={(value as string) ?? ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={`输入${field.name}`}
            disabled={disabled}
            rows={compact ? 2 : 3}
            className={compact ? 'text-sm' : ''}
          />
        )

      case 'number':
        return (
          <Input
            type="number"
            value={(value as number) ?? ''}
            onChange={(e) => handleChange(e.target.value ? Number(e.target.value) : null)}
            placeholder={`输入${field.name}`}
            disabled={disabled}
            className={compact ? 'h-8' : ''}
          />
        )

      case 'select':
        return (
          <Select
            value={(value as string) ?? ''}
            onValueChange={(val) => handleChange(val || null)}
            disabled={disabled}
          >
            <SelectTrigger className={compact ? 'h-8' : ''}>
              <SelectValue placeholder={`选择${field.name}`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">无</SelectItem>
              {field.options?.map((option, index) => (
                <SelectItem key={index} value={String(index)}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'multiselect':
        return (
          <MultiSelect
            options={
              field.options?.map((option, index) => ({
                label: option,
                value: String(index),
              })) || []
            }
            value={(value as string[]) ?? []}
            onValueChange={(vals) => handleChange(vals.length > 0 ? vals : null)}
            placeholder={`选择${field.name}`}
            disabled={disabled}
            className={compact ? 'h-8' : ''}
          />
        )

      case 'date':
        return (
          <DatePicker
            date={value ? new Date(value as string) : undefined}
            onDateChange={(date) => handleChange(date ? date.toISOString() : null)}
            disabled={disabled}
            className={compact ? 'h-8' : ''}
          />
        )

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={(value as boolean) ?? false}
              onCheckedChange={(checked) => handleChange(checked as boolean)}
              disabled={disabled}
            />
            {!compact && <span className="text-sm">{value ? '是' : '否'}</span>}
          </div>
        )

      default:
        return (
          <Input
            value={(value as string) ?? ''}
            onChange={(e) => handleChange(e.target.value)}
            disabled={disabled}
            className={compact ? 'h-8' : ''}
          />
        )
    }
  }

  if (compact) {
    return renderField()
  }

  return (
    <div className="grid gap-2">
      <Label htmlFor={field.id} className="flex items-center gap-1">
        {field.name}
        {field.required && <span className="text-destructive">*</span>}
      </Label>
      {renderField()}
    </div>
  )
}

// Display a custom field value for read-only views (like tables)
interface CustomFieldValueDisplayProps {
  field: CustomFieldConfig
  value: CustomFieldValue
  className?: string
}

export function CustomFieldValueDisplay({
  field,
  value,
  className = '',
}: CustomFieldValueDisplayProps) {
  if (value === null || value === undefined || value === '') {
    return <span className="text-muted-foreground">-</span>
  }

  switch (field.type) {
    case 'text':
    case 'textarea': {
      const text = String(value)
      return (
        <span className={className} title={text}>
          {text.length > 50 ? `${text.slice(0, 50)}...` : text}
        </span>
      )
    }

    case 'number':
      return <span className={className}>{String(value)}</span>

    case 'select': {
      if (field.options && typeof value === 'string') {
        const index = parseInt(value, 10)
        const label = field.options[index]
        return (
          <Badge variant="outline" className={className}>
            {label || String(value)}
          </Badge>
        )
      }
      return <span className={className}>{String(value)}</span>
    }

    case 'multiselect': {
      if (Array.isArray(value) && field.options) {
        return (
          <div className="flex flex-wrap gap-1">
            {value.slice(0, 3).map((v, i) => {
              const index = parseInt(v, 10)
              return (
                <Badge key={i} variant="secondary" className="text-xs">
                  {field.options[index] || v}
                </Badge>
              )
            })}
            {value.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{value.length - 3}
              </Badge>
            )}
          </div>
        )
      }
      return <span className={className}>{Array.isArray(value) ? value.join(', ') : '-'}</span>
    }

    case 'date': {
      // Format date for display - compute outside JSX
      let dateStr: string
      try {
        const date = new Date(value as string)
        dateStr = isNaN(date.getTime()) ? String(value) : date.toLocaleDateString('zh-CN')
      } catch {
        dateStr = String(value)
      }
      return <span className={className}>{dateStr}</span>
    }

    case 'checkbox':
      return (
        <Badge variant={(value as boolean) ? 'default' : 'outline'} className={className}>
          {(value as boolean) ? '是' : '否'}
        </Badge>
      )

    default:
      return <span className={className}>{String(value)}</span>
  }
}

// Render all custom fields for a form
interface CustomFieldsFormProps {
  fields: CustomFieldConfig[]
  values: Record<string, CustomFieldValue>
  onChange: (fieldId: string, value: CustomFieldValue) => void
  disabled?: boolean
  compact?: boolean
}

export function CustomFieldsForm({
  fields,
  values,
  onChange,
  disabled = false,
  compact = false,
}: CustomFieldsFormProps) {
  if (fields.length === 0) return null

  return (
    <div className={`grid gap-4 ${compact ? 'grid-cols-2' : ''}`}>
      {fields.map((field) => (
        <CustomFieldRenderer
          key={field.id}
          field={field}
          value={values[field.id] ?? field.defaultValue ?? null}
          onChange={(value) => onChange(field.id, value)}
          disabled={disabled}
          compact={compact}
        />
      ))}
    </div>
  )
}

// Export helper functions
export function getInitialCustomFieldValues(
  fields: CustomFieldConfig[]
): Record<string, CustomFieldValue> {
  const values: Record<string, CustomFieldValue> = {}
  fields.forEach((field) => {
    values[field.id] = field.defaultValue ?? null
  })
  return values
}

export function mergeCustomFieldValues(
  existing: Record<string, CustomFieldValue> | undefined,
  fields: CustomFieldConfig[]
): Record<string, CustomFieldValue> {
  const result = getInitialCustomFieldValues(fields)
  if (existing) {
    Object.keys(existing).forEach((key) => {
      if (result.hasOwnProperty(key)) {
        result[key] = existing[key]
      }
    })
  }
  return result
}
