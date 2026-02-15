/**
 * project-sort-select
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import React from 'react'
import { ArrowUpDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

export type SortType = 'createdAt' | 'updatedAt' | 'name'

interface ProjectSortSelectProps {
  value: SortType
  onChange: (value: SortType) => void
}

const sortOptions: { value: SortType; label: string }[] = [
  { value: 'createdAt', label: '最新创建' },
  { value: 'updatedAt', label: '最近更新' },
  { value: 'name', label: '名称 A-Z' },
]

export function ProjectSortSelect({ value, onChange }: ProjectSortSelectProps) {
  const selectedOption = sortOptions.find((opt) => opt.value === value)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <ArrowUpDown className="h-4 w-4" />
          {selectedOption?.label || '排序'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {sortOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
