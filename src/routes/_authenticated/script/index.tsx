import { createFileRoute } from '@tanstack/react-router'
import { GlobalScriptEditorPage } from '@/features/projects'

export const Route = createFileRoute('/_authenticated/script/')({
  component: GlobalScriptEditorPage,
})
