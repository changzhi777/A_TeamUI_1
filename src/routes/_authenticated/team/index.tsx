import { createFileRoute } from '@tanstack/react-router'
import { TeamMembersPage } from '@/features/projects/components/team-members'

export const Route = createFileRoute('/_authenticated/team/')({
  component: TeamMembersPage,
})
