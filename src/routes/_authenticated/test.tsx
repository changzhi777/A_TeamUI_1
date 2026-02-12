import { createFileRoute } from '@tanstack/react-router'

export function TestPage() {
  return (
    <div className="h-svh w-full flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Test Page</h1>
        <p className="text-muted-foreground mb-8">This is a test page to check if the app is working correctly.</p>
        <a href="/storyboard-list" className="text-primary underline">Go to Storyboard List</a>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/_authenticated/test')({
  component: TestPage,
})
