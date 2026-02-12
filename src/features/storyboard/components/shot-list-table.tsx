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

export function ShotListTable({ shots, projects, onBatchDelete, onEdit, onDelete }: ShotListTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})

  const { toggleShotSelection, deselectAllShots, selectedShotIds } = useStoryboardStore()

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

  const columns: ColumnDef<StoryboardShot>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
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
      cell: ({ row }) => (
        <div className="max-w-[300px] truncate" title={row.getValue('description')}>
          {row.getValue('description')}
        </div>
      ),
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
      cell: ({ row }) => (
        <div className="max-w-[150px] truncate" title={row.getValue('sound')}>
          {row.getValue('sound') || '-'}
        </div>
      ),
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
        <Table>
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
