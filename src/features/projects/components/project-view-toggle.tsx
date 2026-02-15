/**
 * project-view-toggle
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import React from 'react'
import { List, FolderOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

export type ViewMode = 'list' | 'group'

interface ProjectViewToggleProps {
  value: ViewMode
  onChange: (value: ViewMode) => void
}

export function ProjectViewToggle({ value, onChange }: ProjectViewToggleProps) {
  return (
    <ToggleGroup type="single" value={value} onValueChange={onChange}>
      <ToggleGroupItem value="list" aria-label="列表视图">
        <List className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="group" aria-label="分组视图">
        <FolderOpen className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
