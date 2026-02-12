import { createFileRoute } from '@tanstack/react-router'
import { DirectorDetailPage } from '@/features/projects/components/director-detail'

export const Route = createFileRoute('/_authenticated/director/$director')({
  component: DirectorDetailPage,
})
