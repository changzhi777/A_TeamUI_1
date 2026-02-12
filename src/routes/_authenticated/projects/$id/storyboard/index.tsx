import { createFileRoute } from '@tanstack/react-router'
import { StoryboardPage } from '@/features/storyboard'

export const Route = createFileRoute('/_authenticated/projects/$id/storyboard/')({
  component: StoryboardPage,
})
