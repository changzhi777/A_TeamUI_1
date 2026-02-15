/**
 * shot-list-table
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import { useState, useMemo } from 'react'
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { ChevronDown, Check, Image as ImageIcon, Edit2, Trash2, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  DataTableToolbar,
  DataTablePagination,
} from '@/components/data-table'
import { type StoryboardShot, useStoryboardStore } from '@/stores/storyboard-store'
import { type Project } from '@/stores/project-store'
import { useCustomFieldStore } from '@/stores/custom-field-store'
import { CustomFieldValueDisplay } from './custom-field-renderer'
import type { CustomFieldConfig } from '@/lib/types/api'

interface ShotListTableProps {
  shots: StoryboardShot[]
  projects: Project[]
  onBatchDelete: () => void
  onEdit?: (shot: StoryboardShot) => void
  onDelete?: (shotId: string) => void
}

function getShotSizeLabel(size: string) {
  const labels: Record<string, string> = {
    extremeLong: '远景',
    long: '全景',
    medium: '中景',
    closeUp: '近景',
    extremeCloseUp: '特写',
  }
  return labels[size] || size
}

function getCameraMovementLabel(movement: string) {
  const labels: Record<string, string> = {
    static: '固定',
    pan: '摇',
    tilt: '俯仰',
    dolly: '推拉',
    truck: '平移',
    pedestral: '升降',
    crane: '吊臂',
    handheld: '手持',
    steadicam: '斯坦尼康',
    tracking: '跟拍',
    arc: '弧形',
  }
  return labels[movement] || movement
}

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function getProjectName(projectId: string, projects: Project[]) {
  const project = projects.find((p) => p.id === projectId)
  return project?.name || '未知项目'
}

// 截断文本到指定字符数（中文字符）
function truncateText(text: string, maxLength: number): string {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function ShotListTable({ shots, projects, onBatchDelete, onEdit, onDelete }: ShotListTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  // 季数、集数和项目默认隐藏
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    seasonNumber: false,
    episodeNumber: false,
    projectId: false,
  })
  const [rowSelection, setRowSelection] = useState({})

  const { toggleShotSelection, deselectAllShots, selectedShotIds } = useStoryboardStore()
  const { getVisibleFields } = useCustomFieldStore()

  // Get visible custom fields (merged global + project-specific)
  // For simplicity, we use the first shot's projectId to get fields
  // In a real scenario with mixed projects, you might want to handle this differently
  const projectId = shots.length > 0 ? shots[0].projectId : undefined
  const customFields = useMemo(() => {
    return projectId ? getVisibleFields(projectId) : []
  }, [projectId, getVisibleFields])

  // 景别选项
  const shotSizeOptions = [
    { label: '远景', value: 'extremeLong' },
    { label: '全景', value: 'long' },
    { label: '中景', value: 'medium' },
    { label: '近景', value: 'closeUp' },
    { label: '特写', value: 'extremeCloseUp' },
  ]

  // 运镜方式选项
  const movementOptions = [
    { label: '固定', value: 'static' },
    { label: '摇', value: 'pan' },
    { label: '俯仰', value: 'tilt' },
    { label: '推拉', value: 'dolly' },
    { label: '平移', value: 'truck' },
    { label: '升降', value: 'pedestral' },
    { label: '吊臂', value: 'crane' },
    { label: '手持', value: 'handheld' },
    { label: '斯坦尼康', value: 'steadicam' },
    { label: '跟拍', value: 'tracking' },
    { label: '弧形', value: 'arc' },
  ]

  // 动态生成季数选项（基于当前数据）
  const seasonOptions = useMemo(() => {
    const seasons = new Set<number>()
    shots.forEach((shot) => {
      if (shot.seasonNumber !== undefined && shot.seasonNumber !== null) {
        seasons.add(shot.seasonNumber)
      }
    })
    return Array.from(seasons)
      .sort((a, b) => a - b)
      .map((s) => ({ label: `第${s}季`, value: String(s) }))
  }, [shots])

  // 动态生成集数选项（基于当前数据）
  const episodeOptions = useMemo(() => {
    const episodes = new Set<number>()
    shots.forEach((shot) => {
      if (shot.episodeNumber !== undefined && shot.episodeNumber !== null) {
        episodes.add(shot.episodeNumber)
      }
    })
    return Array.from(episodes)
      .sort((a, b) => a - b)
      .map((e) => ({ label: `第${e}集`, value: String(e) }))
  }, [shots])

  // 生成自定义字段的筛选选项（仅 select 类型）
  const customFieldFilters = useMemo(() => {
    return customFields
      .filter((field) => field.type === 'select' || field.type === 'multiselect')
      .map((field) => ({
        columnId: `custom_${field.id}`,
        title: field.name,
        options: field.options?.map((opt, idx) => ({ label: opt, value: String(idx) })) || [],
      }))
  }, [customFields])

  // Generate custom field columns
  const customFieldColumns: ColumnDef<StoryboardShot>[] = useMemo(() => {
    return customFields.map((field) => ({
      id: `custom_${field.id}`,
      accessorFn: (row: StoryboardShot) => row.customFields?.[field.id] ?? null,
      header: field.name,
      cell: ({ row }) => {
        const value = row.original.customFields?.[field.id] ?? null
        return (
          <div className="max-w-[150px]">
            <CustomFieldValueDisplay field={field} value={value} />
          </div>
        )
      },
    }))
  }, [customFields])

  // Base columns
  const baseColumns: ColumnDef<StoryboardShot>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected()
              ? true
              : table.getIsSomePageRowsSelected()
                ? 'indeterminate'
                : false
          }
          onCheckedChange={(value) => {
            table.toggleAllPageRowsSelected(!!value)
            // 同步到 store
            if (value) {
              table.getRowModel().rows.forEach((row) => {
                toggleShotSelection(row.original.id)
              })
            } else {
              deselectAllShots()
            }
          }}
          aria-label="全选"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => {
            row.toggleSelected(!!value)
            toggleShotSelection(row.original.id)
          }}
          aria-label="选择行"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'shotNumber',
      header: '镜头编号',
      cell: ({ row }) => <div className="w-[80px]">{row.getValue('shotNumber')}</div>,
    },
    {
      accessorKey: 'seasonNumber',
      header: '季数',
      cell: ({ row }) => {
        const value = row.getValue('seasonNumber') as number | undefined
        return <div className="w-[60px]">{value ?? '-'}</div>
      },
    },
    {
      accessorKey: 'episodeNumber',
      header: '集数',
      cell: ({ row }) => {
        const value = row.getValue('episodeNumber') as number | undefined
        return <div className="w-[60px]">{value ?? '-'}</div>
      },
    },
    {
      accessorKey: 'sceneNumber',
      header: '场次',
      cell: ({ row }) => <div className="w-[80px]">{row.getValue('sceneNumber')}</div>,
    },
    {
      accessorKey: 'shotSize',
      header: '景别',
      cell: ({ row }) => (
        <Badge variant="outline">{getShotSizeLabel(row.getValue('shotSize'))}</Badge>
      ),
    },
    {
      accessorKey: 'cameraMovement',
      header: '运镜方式',
      cell: ({ row }) => (
        <Badge variant="secondary">{getCameraMovementLabel(row.getValue('cameraMovement'))}</Badge>
      ),
    },
    {
      accessorKey: 'duration',
      header: '时长',
      cell: ({ row }) => <div>{formatDuration(row.getValue('duration'))}</div>,
    },
    {
      accessorKey: 'description',
      header: '画面描述',
      cell: ({ row }) => {
        const description = row.getValue('description') as string
        return (
          <div className="whitespace-nowrap" title={description}>
            {truncateText(description, 8)}
          </div>
        )
      },
    },
    {
      accessorKey: 'dialogue',
      header: '对白/旁白',
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate" title={row.getValue('dialogue')}>
          {row.getValue('dialogue') || '-'}
        </div>
      ),
    },
    {
      accessorKey: 'sound',
      header: '音效说明',
      cell: ({ row }) => {
        const sound = row.getValue('sound') as string
        return (
          <div className="whitespace-nowrap" title={sound || ''}>
            {sound ? truncateText(sound, 5) : '-'}
          </div>
        )
      },
    },
    {
      accessorKey: 'projectId',
      header: '项目',
      cell: ({ row }) => (
        <div className="max-w-[150px] truncate" title={getProjectName(row.getValue('projectId'), projects)}>
          {getProjectName(row.getValue('projectId'), projects)}
        </div>
      ),
    },
    {
      accessorKey: 'image',
      header: '配图',
      cell: ({ row }) => {
        const image = row.getValue('image') as string | undefined
        if (!image) {
          return (
            <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center">
              <ImageIcon className="h-5 w-5 text-muted-foreground" />
            </div>
          )
        }
        return (
          <div className="w-12 h-12 rounded-md overflow-hidden bg-muted">
            <img
              src={image}
              alt="配图"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )
      },
    },
    {
      id: 'actions',
      header: '操作',
      cell: ({ row }) => {
        const shot = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => onEdit?.(shot)}
              >
                <Edit2 className="mr-2 h-4 w-4" />
                编辑
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete?.(shot.id)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                删除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  // Merge base columns with custom field columns (before actions column)
  const columns: ColumnDef<StoryboardShot>[] = useMemo(() => {
    const actionsIndex = baseColumns.findIndex((col) => col.id === 'actions')
    const colsBeforeActions = baseColumns.slice(0, actionsIndex)
    const colsAfterActions = baseColumns.slice(actionsIndex)
    return [...colsBeforeActions, ...customFieldColumns, ...colsAfterActions]
  }, [customFieldColumns])

  const table = useReactTable({
    data: shots,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <div className="space-y-4">
      {/* 工具栏 */}
      <DataTableToolbar
        table={table}
        searchPlaceholder="搜索场次、画面描述、对白..."
        searchKey="description"
        filters={[
          ...(seasonOptions.length > 0
            ? [{ columnId: 'seasonNumber' as const, title: '季数', options: seasonOptions }]
            : []),
          ...(episodeOptions.length > 0
            ? [{ columnId: 'episodeNumber' as const, title: '集数', options: episodeOptions }]
            : []),
          {
            columnId: 'shotSize',
            title: '景别',
            options: shotSizeOptions,
          },
          {
            columnId: 'cameraMovement',
            title: '运镜方式',
            options: movementOptions,
          },
          ...customFieldFilters,
        ]}
      />

      {/* 批量操作栏 */}
      {selectedShotIds.length > 0 && (
        <div className="flex items-center justify-between rounded-lg border bg-card p-3">
          <div className="flex items-center gap-2">
            <span className="text-sm">
              已选择 <strong>{selectedShotIds.length}</strong> 个镜头
            </span>
          </div>
          <div className="flex gap-2">
            <Button variant="destructive" size="sm" onClick={onBatchDelete}>
              批量删除
            </Button>
            <Button variant="ghost" size="sm" onClick={deselectAllShots}>
              取消选择
            </Button>
          </div>
        </div>
      )}

      {/* 列显示/隐藏 */}
      <div className="flex items-center justify-end gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              显示列 <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[150px]">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {typeof column.columnDef.header === 'string'
                      ? column.columnDef.header
                      : column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 表格 */}
      <div className="rounded-md border overflow-x-auto">
        <div className="min-w-[800px]">
        <Table className="compact-table [&_td]:py-1.5 [&_td]:px-2 [&_th]:py-2 [&_th]:px-2">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  没有找到匹配的分镜头
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        </div>
      </div>

      {/* 分页 */}
      <DataTablePagination table={table} />
    </div>
  )
}
