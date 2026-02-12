import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Shield } from 'lucide-react'
import { useI18n } from '@/i18n'
import type { ProjectMember, MemberRole } from '@/stores/project-store'

interface MemberStatsProps {
  members: ProjectMember[]
}

export function MemberStats({ members }: MemberStatsProps) {
  const { t } = useI18n()

  // 计算各角色数量
  const roleCounts = members.reduce((acc, member) => {
    acc[member.role] = (acc[member.role] || 0) + 1
    return acc
  }, {} as Record<MemberRole, number>)

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* 总数 */}
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">成员总数</span>
            <span className="text-lg font-semibold">{members.length}</span>
          </div>

          {/* 角色分布 */}
          <div className="flex items-center gap-2 flex-wrap">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <div className="flex gap-1.5 flex-wrap">
              {Object.entries(roleCounts).map(([role, count]) => (
                <Badge key={role} variant="secondary" className="gap-1">
                  {t.project.role[role as MemberRole]}
                  <span className="text-muted-foreground">({count})</span>
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
