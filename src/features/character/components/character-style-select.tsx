/**
 * character-style-select
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

/**
 * Character Style Select Component
 * 人物风格选择组件
 */

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import {
  CHARACTER_STYLES,
  type CharacterStyle,
  type CharacterStyleOption,
} from '@/lib/types/character'

interface CharacterStyleSelectProps {
  value?: CharacterStyle
  onChange: (style: CharacterStyle | undefined) => void
  disabled?: boolean
}

/**
 * 获取风格的图标/emoji
 */
function getStyleIcon(id: CharacterStyle): string {
  switch (id) {
    case 'anime':
      return '🎨'
    case 'ghibli':
      return '🌿'
    case 'cinematic':
      return '🎬'
    default:
      return '✨'
  }
}

export function CharacterStyleSelect({
  value,
  onChange,
  disabled,
}: CharacterStyleSelectProps) {
  const selectedStyle = CHARACTER_STYLES.find((s) => s.id === value)

  const handleValueChange = (v: string) => {
    if (v === '__none__') {
      onChange(undefined)
    } else {
      onChange(v as CharacterStyle)
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="character-style">人物风格</Label>
      <Select
        value={value || '__none__'}
        onValueChange={handleValueChange}
        disabled={disabled}
      >
        <SelectTrigger id="character-style">
          <SelectValue placeholder="选择人物风格" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__none__">
            <span className="text-muted-foreground">不指定风格</span>
          </SelectItem>
          {CHARACTER_STYLES.map((style) => (
            <SelectItem key={style.id} value={style.id}>
              <div className="flex items-center gap-2">
                <span>{getStyleIcon(style.id)}</span>
                <span>{style.name}</span>
                <span className="text-xs text-muted-foreground">({style.nameEn})</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* 风格预览描述 */}
      {selectedStyle && (
        <div className="p-3 bg-muted/50 rounded-md space-y-2">
          <div className="text-sm font-medium flex items-center gap-2">
            <span>{getStyleIcon(selectedStyle.id)}</span>
            <span>{selectedStyle.name}</span>
          </div>
          <p className="text-xs text-muted-foreground">{selectedStyle.description}</p>
          <div className="text-xs">
            <span className="text-muted-foreground">提示词关键词：</span>
            <code className="ml-1 bg-background px-1.5 py-0.5 rounded text-xs">
              {selectedStyle.promptKeywords.slice(0, 50)}...
            </code>
          </div>
        </div>
      )}
    </div>
  )
}

export type { CharacterStyleSelectProps }
export type { CharacterStyle, CharacterStyleOption }
