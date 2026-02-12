import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { useI18n } from '@/i18n'
import { useProjectStore } from '@/stores/project-store'
import { ArrowLeft, History, Save, Eye } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function ScriptEditorPage() {
  const { t } = useI18n()
  const { id } = useParams({ strict: false })
  const navigate = useNavigate()
  const getProjectById = useProjectStore((state) => state.getProjectById)
  const updateScript = useProjectStore((state) => state.updateScript)
  const addScriptVersion = useProjectStore((state) => state.addScriptVersion)
  const restoreScriptVersion = useProjectStore((state) => state.restoreScriptVersion)

  const project = getProjectById(id)
  const [content, setContent] = useState(project?.scriptContent || '')
  const [showHistory, setShowHistory] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [unsavedChanges, setUnsavedChanges] = useState(false)

  // 自动保存
  useEffect(() => {
    if (!project) return

    const timer = setTimeout(() => {
      if (content !== project.scriptContent) {
        updateScript(project.id, content)
        setLastSaved(new Date())
        setUnsavedChanges(false)
      }
    }, 2000) // 2秒后自动保存

    return () => clearTimeout(timer)
  }, [content, project, updateScript])

  useEffect(() => {
    setUnsavedChanges(content !== (project?.scriptContent || ''))
  }, [content, project])

  const handleSave = () => {
    if (!project) return
    updateScript(project.id, content)
    setLastSaved(new Date())
    setUnsavedChanges(false)
  }

  const handleSaveVersion = () => {
    if (!project) return
    addScriptVersion(project.id, {
      content,
      createdBy: 'current-user',
    })
    setLastSaved(new Date())
  }

  const handleRestoreVersion = (versionId: string) => {
    if (!project) return
    restoreScriptVersion(project.id, versionId)
    setContent(project.scriptContent || '')
    setShowHistory(false)
  }

  if (!project) {
    return (
      <>
        <Header>
          <div className="ms-auto flex items-center space-x-4">
            <ThemeSwitch />
            <ProfileDropdown />
          </div>
        </Header>
        <Main>
          <div className="flex flex-col items-center justify-center py-12">
            <h2 className="text-2xl font-bold mb-4">项目不存在</h2>
            <Button onClick={() => navigate({ to: '/projects' })}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回项目列表
            </Button>
          </div>
        </Main>
      </>
    )
  }

  const versionCount = project.scriptVersions?.length || 0

  return (
    <>
      <Header>
        <TopNav links={[]} />
        <div className="ms-auto flex items-center space-x-4">
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/projects">项目列表</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/projects/$id" params={{ id: project.id }}>
                  {project.name}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>剧本编辑</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">剧本编辑</h1>
            <p className="text-muted-foreground">
              {project.name}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowHistory(true)}>
              <History className="mr-2 h-4 w-4" />
              历史版本 ({versionCount})
            </Button>
            <Button variant="outline" onClick={handleSaveVersion}>
              <Save className="mr-2 h-4 w-4" />
              保存版本
            </Button>
            <Button onClick={handleSave} disabled={!unsavedChanges}>
              {unsavedChanges ? '保存' : '已保存'}
            </Button>
          </div>
        </div>

        {/* 状态栏 */}
        <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
          <div>
            {lastSaved ? (
              <span>自动保存于 {lastSaved.toLocaleTimeString('zh-CN')}</span>
            ) : (
              <span>开始编辑以自动保存</span>
            )}
            {unsavedChanges && <span className="ml-2 text-orange-500">• 有未保存的更改</span>}
          </div>
          <div>
            {content.length} 字符
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 编辑器 */}
          <Card className="lg:col-span-1 lg:col-start-1">
            <CardHeader>
              <CardTitle>剧本内容</CardTitle>
              <CardDescription>
                支持 Markdown 格式编写剧本
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={`# ${project.name}

## 第一场

**场景：** 室内，咖啡厅，日

**人物：**
- 李明，男，25岁
- 王芳，女，24岁

李明走进咖啡厅，环顾四周，看到王芳坐在窗边。

**李明**
（微笑）
好久不见。

王芳抬起头，表情复杂。
`}
                className="min-h-[600px] font-mono text-sm resize-none"
              />
            </CardContent>
          </Card>

          {/* 预览 */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>预览</CardTitle>
              <CardDescription>
                剧本预览（仅显示格式）
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="min-h-[600px] max-h-[600px] overflow-auto prose prose-sm dark:prose-invert">
                {content ? (
                  <div className="whitespace-pre-wrap">{content}</div>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    开始编写剧本...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </Main>

      {/* 历史版本对话框 */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>历史版本</DialogTitle>
            <DialogDescription>
              查看和恢复剧本的历史版本
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[400px] overflow-auto">
            {versionCount === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                暂无历史版本
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>版本</TableHead>
                    <TableHead>保存时间</TableHead>
                    <TableHead>创建人</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {project.scriptVersions?.map((version, index) => (
                    <TableRow key={version.id}>
                      <TableCell className="font-medium">
                        v{versionCount - index}
                      </TableCell>
                      <TableCell>
                        {new Date(version.createdAt).toLocaleString('zh-CN')}
                      </TableCell>
                      <TableCell>{version.createdBy}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRestoreVersion(version.id)}
                        >
                          恢复
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
