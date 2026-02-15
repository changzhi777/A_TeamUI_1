/**
 * global-script-editor
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import React, { useState, useEffect } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Link, useNavigate } from '@tanstack/react-router'
import { useI18n } from '@/i18n'
import { useProjectStore } from '@/stores/project-store'
import { ArrowLeft, History, Save, Eye, FolderOpen } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export function GlobalScriptEditorPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const getAllProjects = useProjectStore((state) => state.getAllProjects)
  const getProjectById = useProjectStore((state) => state.getProjectById)
  const updateScript = useProjectStore((state) => state.updateScript)
  const addScriptVersion = useProjectStore((state) => state.loadScriptVersions)
  const restoreScriptVersion = useProjectStore((state) => state.restoreScriptVersion)

  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const [content, setContent] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [unsavedChanges, setUnsavedChanges] = useState(false)

  const projects = getAllProjects()
  const selectedProject = selectedProjectId ? getProjectById(selectedProjectId) : null

  useEffect(() => {
    if (selectedProject) {
      setContent(selectedProject.scriptContent || '')
    } else {
      setContent('')
    }
  }, [selectedProjectId, selectedProject])

  useEffect(() => {
    if (!selectedProject) return

    const timer = setTimeout(() => {
      if (content !== selectedProject.scriptContent) {
        updateScript(selectedProject.id, content)
        setLastSaved(new Date())
        setUnsavedChanges(false)
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [content, selectedProject, updateScript])

  useEffect(() => {
    setUnsavedChanges(content !== (selectedProject?.scriptContent || ''))
  }, [content, selectedProject])

  const handleSave = () => {
    if (!selectedProject) return
    updateScript(selectedProject.id, content)
    setLastSaved(new Date())
    setUnsavedChanges(false)
  }

  const handleSaveVersion = () => {
    if (!selectedProject) return
    addScriptVersion(selectedProject.id, content)
    setLastSaved(new Date())
  }

  const handleRestoreVersion = (versionId: string) => {
    if (!selectedProject) return
    restoreScriptVersion(selectedProject.id, versionId)
    setContent(selectedProject.scriptContent || '')
    setShowHistory(false)
  }

  const versionCount = selectedProject?.scriptVersions?.length || 0

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
              <BreadcrumbPage>剧本编辑</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">剧本编辑</h1>
            <p className="text-muted-foreground">创建和管理项目剧本</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate({ to: '/projects' })}
            >
              <FolderOpen className="mr-2 h-4 w-4" />
              管理项目
            </Button>
            {selectedProject && (
              <>
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
              </>
            )}
          </div>
        </div>

        <div className="mb-4">
          <label className="text-sm font-medium mb-2 block">选择项目</label>
          <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder="请选择一个项目开始编辑剧本" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  <div className="flex items-center justify-between w-full">
                    <span>{project.name}</span>
                    <Badge variant="outline" className="ml-2">
                      {project.type === 'shortDrama' && '动漫短剧'}
                      {project.type === 'realLifeDrama' && '真人短剧'}
                      {project.type === 'aiPodcast' && 'AI播客'}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {!selectedProjectId ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FolderOpen className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">请选择一个项目</h3>
              <p className="text-sm text-muted-foreground mb-4">
                选择一个项目后即可开始编辑剧本
              </p>
              {projects.length === 0 && (
                <Button onClick={() => navigate({ to: '/projects' })}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  创建项目
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
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
                    placeholder={`# ${selectedProject.name}

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
          </>
        )}
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
                  {selectedProject?.scriptVersions?.map((version, index) => (
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
