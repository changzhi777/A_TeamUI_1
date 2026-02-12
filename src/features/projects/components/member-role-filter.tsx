import { Button } from '@/components/ui/button'
import { useI18n } from '@/i18n'
import type { MemberRole } from '@/stores/project-store'

interface MemberRoleFilterProps {
  value: MemberRole | 'all'
  onChange: (value: MemberRole | 'all') => void
  memberCounts: Record<MemberRole | 'all', number>
}

const roleOrder: (MemberRole | 'all')[] = [
  'all',
  'admin',
  'director',
  'screenwriter',
  'cinematographer',
  'editor',
  'actor',
  'member',
]

export function MemberRoleFilter({
  value,
  onChange,
  memberCounts,
}: MemberRoleFilterProps) {
  const { t } = useI18n()

  return (
    <div className="flex gap-2 flex-wrap">
      {roleOrder.map((role) => {
        const count = memberCounts[role] || 0
        const label = role === 'all' ? t.common.all : t.project.role[role]

        return (
          <Button
            key={role}
            variant={value === role ? 'default' : 'outline'}
            size="sm"
            onClick={() => onChange(role)}
            className="gap-1.5"
          >
            {label}
            <span className="text-muted-foreground">({count})</span>
          </Button>
        )
      })}
    </div>
  )
}
