/**
 * character-page
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

/**
 * Character Page
 * 角色设计页面
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Plus,
  Search,
  Upload,
  Image as ImageIcon,
  Shirt,
  Volume2,
  FileText,
  Loader2,
  Save,
  CheckCircle2,
  RefreshCw,
  Copy,
  FolderArchive,
  Download,
  FileSpreadsheet,
  FileJson,
  MoreVertical,
  Trash2,
} from 'lucide-react'
import { CharacterList } from '../components/character-list'
import { CharacterForm } from '../components/character-form'
import { CharacterGallery } from '../components/character-gallery'
import { CostumeGenerator } from '../components/costume-generator'
import { CharacterVoice } from '../components/character-voice'
import { CharacterCopyDialog } from '../components/character-copy-dialog'
import { AttributeList, getAttributeLabel } from '../components/attribute-display'
import { useCharacterStore, useCharacters } from '@/stores/character-store'
import type { Character } from '@/lib/types/character'
import { toast } from 'sonner'
import { getCharacterSyncStatus, syncCharacterToAssetAsync } from '@/lib/services/character-asset-sync'
import { exportCharacterAsZip } from '@/lib/services/character-export'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/stores/auth-store'

export function CharacterPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null)
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null)
  const [importing, setImporting] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [showCopyDialog, setShowCopyDialog] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const characters = useCharacters()
  const importCharacter = useCharacterStore((state) => state.importCharacter)
  const deleteCharacter = useCharacterStore((state) => state.deleteCharacter)
  const { user } = useAuthStore()

  // 检查管理员权限
  const isAdmin = user?.role === 'admin'

  // 过滤角色
  const filteredCharacters = characters.filter((char) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      char.name.toLowerCase().includes(query) ||
      char.description?.toLowerCase().includes(query) ||
      char.tags.some((tag) => tag.toLowerCase().includes(query))
    )
  })

  // 导入角色
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setImporting(true)

    try {
      const text = await file.text()
      const imported = importCharacter(text)
      if (imported) {
        toast.success(`角色 "${imported.name}" 已导入`)
      } else {
        toast.error('导入失败：文件格式无效')
      }
    } catch {
      toast.error('导入失败：无法读取文件')
    } finally {
      setImporting(false)
      event.target.value = ''
    }
  }

  // 同步到资产库
  const handleSyncToAsset = async () => {
    if (!selectedCharacter) return

    setSyncing(true)
    try {
      const assetId = await syncCharacterToAssetAsync(selectedCharacter)
      if (assetId) {
        toast.success('角色已同步到资产库')
        // 刷新选中的角色
        const updated = characters.find((c) => c.id === selectedCharacter.id)
        if (updated) {
          setSelectedCharacter(updated)
        }
      } else {
        toast.error('同步失败，请重试')
      }
    } catch (error) {
      toast.error('同步失败：' + (error instanceof Error ? error.message : '未知错误'))
    } finally {
      setSyncing(false)
    }
  }

  // 导出为文件夹
  const handleExportAsFolder = async () => {
    if (!selectedCharacter) return

    setExporting(true)
    try {
      await exportCharacterAsZip(selectedCharacter)
    } catch (error) {
      toast.error('导出失败：' + (error instanceof Error ? error.message : '未知错误'))
    } finally {
      setExporting(false)
    }
  }

  // 下载 JSON 模板
  const handleDownloadJSONTemplate = () => {
    const template = {
      name: '角色名称',
      description: '角色简介（可选）',
      personality: '个性描述（可选）',
      attributes: {
        age: '年龄',
        gender: '性别',
        height: '身高',
        occupation: '职业',
        hairColor: '发色',
        eyeColor: '瞳色',
        bodyType: '体型',
      },
      tags: ['标签1', '标签2'],
      basePrompt: '基础提示词，描述角色的外观特征（可选）',
      style: 'anime | ghibli | cinematic（可选）',
      projectId: '项目ID（可选，留空则为全局角色）',
    }

    const jsonStr = JSON.stringify(template, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'character-template.json'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success('JSON 模板已下载')
  }

  // 下载 CSV 模板
  const handleDownloadCSVTemplate = () => {
    const headers = [
      'name',
      'description',
      'personality',
      'age',
      'gender',
      'height',
      'occupation',
      'hairColor',
      'eyeColor',
      'bodyType',
      'tags',
      'basePrompt',
      'style',
      'projectId',
    ]

    const exampleData = [
      '角色名称',
      '角色简介',
      '个性描述',
      '25',
      '女',
      '168cm',
      '设计师',
      '黑色',
      '棕色',
      '苗条',
      '开朗|独立|勇敢',
      '一个年轻女性，长黑发，棕色眼睛',
      'anime',
      '',
    ]

    const csvContent = [
      headers.join(','),
      exampleData.join(','),
    ].join('\n')

    // 添加 BOM 以支持中文
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'character-template.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success('CSV 模板已下载')
  }

  // 删除角色
  const handleDeleteCharacter = () => {
    if (!selectedCharacter) return

    deleteCharacter(selectedCharacter.id)
    toast.success('角色已删除')
    setShowDeleteDialog(false)
    setSelectedCharacter(null)
  }

  return (
    <div className="flex flex-col h-full">
      {/* 页面头部 */}
      <div className="border-b bg-background/95 backdrop-blur sticky top-0 z-10">
        <div className="flex h-16 items-center px-6 gap-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">角色设计</h1>
            <span className="text-sm text-muted-foreground">
              共 {characters.length} 个角色
            </span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* 导入 */}
            <Button variant="outline" asChild>
              <label className="cursor-pointer">
                <Upload className="mr-2 h-4 w-4" />
                导入
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleImport}
                  disabled={importing}
                />
              </label>
            </Button>

            {/* 创建角色 */}
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              创建角色
            </Button>

            {/* 下载模板下拉菜单 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleDownloadCSVTemplate}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  下载 CSV 模板
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownloadJSONTemplate}>
                  <FileJson className="h-4 w-4 mr-2" />
                  下载 JSON 模板
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* 搜索栏 */}
        <div className="flex items-center px-6 pb-4 gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索角色名称、描述或标签..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-auto p-6">
        {selectedCharacter ? (
          // 角色详情视图
          <div className="space-y-6">
            {/* 返回按钮 */}
            <Button
              variant="ghost"
              onClick={() => setSelectedCharacter(null)}
            >
              ← 返回列表
            </Button>

            {/* 角色头部信息 */}
            <div className="flex items-start gap-6">
              <div className="w-32 h-32 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                {selectedCharacter.views.front?.url ? (
                  <img
                    src={selectedCharacter.views.front.url}
                    alt={selectedCharacter.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold">{selectedCharacter.name}</h2>
                  {(() => {
                    const syncStatus = getCharacterSyncStatus(selectedCharacter)
                    return syncStatus.synced ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        已同步到资产库
                      </Badge>
                    ) : null
                  })()}
                </div>
                <p className="text-sm font-mono text-muted-foreground mt-1">
                  {selectedCharacter.code}
                </p>
                {selectedCharacter.description && (
                  <p className="text-muted-foreground mt-1">
                    {selectedCharacter.description}
                  </p>
                )}
                {selectedCharacter.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {selectedCharacter.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-1 bg-secondary rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingCharacter(selectedCharacter)}
                  >
                    编辑信息
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSyncToAsset}
                    disabled={syncing}
                  >
                    {syncing ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : selectedCharacter.syncedToAsset ? (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {selectedCharacter.syncedToAsset ? '更新资产' : '保存到资产库'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportAsFolder}
                    disabled={exporting}
                  >
                    {exporting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <FolderArchive className="h-4 w-4 mr-2" />
                    )}
                    导出文件夹
                  </Button>
                  {isAdmin && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCopyDialog(true)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      复制角色
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:text-amber-500 dark:hover:bg-amber-950"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    删除角色
                  </Button>
                </div>
              </div>
            </div>

            <Separator />

            {/* 标签页 */}
            <Tabs defaultValue="gallery" className="w-full">
              <TabsList>
                <TabsTrigger value="gallery">
                  <ImageIcon className="h-4 w-4 mr-2" />
                  多视角图片
                </TabsTrigger>
                <TabsTrigger value="costumes">
                  <Shirt className="h-4 w-4 mr-2" />
                  服装变体
                </TabsTrigger>
                <TabsTrigger value="voice">
                  <Volume2 className="h-4 w-4 mr-2" />
                  角色语音
                </TabsTrigger>
                <TabsTrigger value="info">
                  <FileText className="h-4 w-4 mr-2" />
                  属性信息
                </TabsTrigger>
              </TabsList>

              <TabsContent value="gallery" className="mt-4">
                <CharacterGallery character={selectedCharacter} />
              </TabsContent>

              <TabsContent value="costumes" className="mt-4">
                <CostumeGenerator character={selectedCharacter} />
              </TabsContent>

              <TabsContent value="voice" className="mt-4">
                <CharacterVoice character={selectedCharacter} />
              </TabsContent>

              <TabsContent value="info" className="mt-4">
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(selectedCharacter.attributes)
                    .filter(([_, value]) => value)
                    .map(([key, value]) => (
                      <div key={key} className="p-3 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">{getAttributeLabel(key)}</p>
                        <p className="font-medium">{value}</p>
                      </div>
                    ))}
                </div>

                {selectedCharacter.personality && (
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">个性描述</p>
                    <p>{selectedCharacter.personality}</p>
                  </div>
                )}

                {selectedCharacter.basePrompt && (
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">生成提示词</p>
                    <p className="text-sm">{selectedCharacter.basePrompt}</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          // 角色列表视图
          <CharacterList
            characters={filteredCharacters}
            onSelect={(char) => setSelectedCharacter(char)}
            onEdit={(char) => setEditingCharacter(char)}
          />
        )}
      </div>

      {/* 创建角色对话框 */}
      <CharacterForm
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={(id) => {
          setShowCreateDialog(false)
          const newChar = characters.find((c) => c.id === id)
          if (newChar) {
            setSelectedCharacter(newChar)
          }
        }}
      />

      {/* 编辑角色对话框 */}
      <CharacterForm
        open={!!editingCharacter}
        onOpenChange={(open) => !open && setEditingCharacter(null)}
        character={editingCharacter}
        onSuccess={() => {
          setEditingCharacter(null)
          // 刷新选中的角色
          if (selectedCharacter) {
            const updated = characters.find((c) => c.id === selectedCharacter.id)
            if (updated) {
              setSelectedCharacter(updated)
            }
          }
        }}
      />

      {/* 复制角色对话框 */}
      {selectedCharacter && (
        <CharacterCopyDialog
          open={showCopyDialog}
          onOpenChange={setShowCopyDialog}
          character={selectedCharacter}
          onSuccess={(newId) => {
            setShowCopyDialog(false)
            const newChar = characters.find((c) => c.id === newId)
            if (newChar) {
              setSelectedCharacter(newChar)
            }
          }}
        />
      )}

      {/* 删除角色确认对话框 */}
      {selectedCharacter && (
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-500">
                <Trash2 className="h-5 w-5" />
                确认删除角色
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-3">
                  <p>
                    您确定要删除角色 <strong>"{selectedCharacter.name}"</strong> 吗？
                  </p>
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
                      ⚠️ 警告：此操作不可撤销！
                    </p>
                    <ul className="text-xs text-amber-700 dark:text-amber-300 mt-2 space-y-1 list-disc list-inside">
                      <li>所有关联的图片将被删除</li>
                      <li>所有服装变体将被删除</li>
                      <li>语音样本将被删除</li>
                      <li>角色数据无法恢复</li>
                    </ul>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    角色编号：<span className="font-mono">{selectedCharacter.code}</span>
                  </p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteCharacter}
                className="bg-amber-500 hover:bg-amber-600 text-white dark:bg-amber-600 dark:hover:bg-amber-700"
              >
                确认删除
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}
