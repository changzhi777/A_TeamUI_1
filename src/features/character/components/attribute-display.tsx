/**
 * attribute-display
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

/**
 * Attribute Display Component
 * 属性中文显示组件
 */

import { ATTRIBUTE_LABELS_ZH } from '@/lib/types/character'

interface AttributeDisplayProps {
  /** 属性键名 */
  attributeKey: string
  /** 属性值 */
  value: string | undefined
  /** 是否显示原始键名（当没有中文翻译时） */
  showRawKey?: boolean
  /** 自定义类名 */
  className?: string
}

/**
 * 获取属性的中文名称
 * @param key 属性键名
 * @returns 中文名称，如果没有则返回原始键名
 */
export function getAttributeLabel(key: string): string {
  return ATTRIBUTE_LABELS_ZH[key] || key
}

/**
 * 属性显示组件
 * 自动将属性键名转换为中文显示
 */
export function AttributeDisplay({
  attributeKey,
  value,
  showRawKey = true,
  className,
}: AttributeDisplayProps) {
  if (!value) return null

  const label = getAttributeLabel(attributeKey)

  // 如果没有中文翻译且不显示原始键名，则返回 null
  if (!ATTRIBUTE_LABELS_ZH[attributeKey] && !showRawKey) {
    return null
  }

  return (
    <div className={className}>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  )
}

/**
 * 属性列表显示组件
 * 用于显示所有属性的列表
 */
interface AttributeListProps {
  /** 属性对象 */
  attributes: Record<string, string | undefined>
  /** 是否显示没有中文翻译的属性 */
  showUnlabeled?: boolean
  /** 自定义类名 */
  className?: string
  /** 每个属性的渲染器 */
  itemClassName?: string
}

export function AttributeList({
  attributes,
  showUnlabeled = true,
  className,
  itemClassName,
}: AttributeListProps) {
  const entries = Object.entries(attributes).filter(([_, value]) => value)

  // 过滤没有中文翻译的属性（如果需要）
  const filteredEntries = showUnlabeled
    ? entries
    : entries.filter(([key]) => ATTRIBUTE_LABELS_ZH[key])

  if (filteredEntries.length === 0) {
    return (
      <div className={className}>
        <p className="text-muted-foreground text-sm">暂无属性信息</p>
      </div>
    )
  }

  return (
    <div className={className}>
      {filteredEntries.map(([key, value]) => (
        <AttributeDisplay
          key={key}
          attributeKey={key}
          value={value}
          className={itemClassName}
        />
      ))}
    </div>
  )
}
