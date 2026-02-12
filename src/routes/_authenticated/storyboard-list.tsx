import { createFileRoute } from '@tanstack/react-router'
import { StoryboardListPage } from '@/features/storyboard/components/storyboard-list-page'

export const Route = createFileRoute('/_authenticated/storyboard-list')({
  component: StoryboardListPage,
})
