import { ArrowUpDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/i18n'

export type MemberSortType = 'name' | 'joinedAt' | 'role'

interface MemberSortSelectProps {
  value: MemberSortType
  onChange: (value: MemberSortType) => void
}

export function MemberSortSelect({ value, onChange }: MemberSortSelectProps) {
  const { t } = useI18n()

  const sortOptions: { value: MemberSortType; label: string }[] = [
    { value: 'name', label: t.project.sortByNameMember },
    { value: 'joinedAt', label: t.project.sortByJoinedAt },
    { value: 'role', label: t.project.sortByRoleMember },
  ]

  const selectedOption = sortOptions.find((opt) => opt.value === value)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <ArrowUpDown className="h-4 w-4" />
          {selectedOption?.label || t.project.sortMembers}
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
