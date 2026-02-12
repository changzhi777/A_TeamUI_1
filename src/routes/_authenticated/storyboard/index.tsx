import { createFileRoute } from '@tanstack/react-router'
import { GlobalStoryboardPage } from '@/features/storyboard'

export const Route = createFileRoute('/_authenticated/storyboard/')({
  component: GlobalStoryboardPage,
})
