import { createFileRoute } from '@tanstack/react-router'
import { ScriptEditorPage } from '@/features/projects/components/script-editor'

export const Route = createFileRoute('/_authenticated/projects/$id/script')({
  component: ScriptEditorPage,
})
