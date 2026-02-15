/**
 * asset-data-table
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

/**
 * Asset Data Table Component
 * 资产数据表组件 - 表格视图
 */

import { useState, useMemo } from 'react'
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  type RowSelectionState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  Image,
  Music,
  Video,
  FileText,
  Sparkles,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Copy,
  ChevronDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { DataTablePagination } from '@/components/data-table'
import type { Asset } from '@/lib/types/assets'
import {
  getAssetTypeName,
  getAssetSourceName,
  formatAssetFileSize,
} from '@/lib/types/assets'
import { useAssetStore, useAssetMutations } from '@/stores/asset-store'
import { useAuthStore } from '@/stores/auth-store'
import { AssetPreviewDialog } from './asset-preview-dialog'
import { AssetEditDialog } from './asset-edit-dialog'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface AssetDataTableProps {
  assets: Asset[]
  onUpdate?: () => void
}

// 获取资产类型图标
function getTypeIcon(type: string) {
  switch (type) {
    case 'image':
      return <Image className="h-4 w-4" />
    case 'audio':
      return <Music className="h-4 w-4" />
    case 'video':
      return <Video className="h-4 w-4" />
    case 'script':
      return <FileText className="h-4 w-4" />
    case 'aiGenerated':
      return <Sparkles className="h-4 w-4" />
    default:
      return <FileText className="h-4 w-4" />
  }
}

// 获取类型颜色
function getTypeColor(type: string) {
  switch (type) {
    case 'image':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    case 'audio':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    case 'video':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
    case 'script':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
    case 'aiGenerated':
      return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
  }
}

export function AssetDataTable({ assets, onUpdate }: AssetDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const { selectedAssets, toggleSelectAsset, selectAllAssets, clearSelection, isSelected } = useAssetStore()
  const { deleteAsset } = useAssetMutations()
  const { canManageAsset, canDeleteAsset } = useAuthStore()

  // 对话框状态
  const [previewAsset, setPreviewAsset] = useState<Asset | null>(null)
  const [editAsset, setEditAsset] = useState<Asset | null>(null)
  const [deleteAssetId, setDeleteAssetId] = useState<string | null>(null)
  const [deleteAssetName, setDeleteAssetName] = useState<string>('')

  // 定义表格列
  const columns: ColumnDef<Asset>[] = useMemo(() => [
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
            if (value) {
              selectAllAssets(assets.map((a) => a.id))
            } else {
              clearSelection()
            }
          }}
          aria-label="全选"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={isSelected(row.original.id)}
          onCheckedChange={(value) => {
            row.toggleSelected(!!value)
            toggleSelectAsset(row.original.id)
          }}
          aria-label="选择行"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: 'thumbnail',
      header: '缩略图',
      cell: ({ row }) => {
        const asset = row.original
        if (asset.thumbnailUrl || asset.type === 'image') {
          return (
            <div className="w-12 h-12 rounded overflow-hidden bg-muted flex-shrink-0">
              <img
                src={asset.thumbnailUrl || asset.url}
                alt={asset.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          )
        }
        return (
          <div className="w-12 h-12 rounded bg-muted flex items-center justify-center flex-shrink-0">
            {getTypeIcon(asset.type)}
          </div>
        )
      },
      enableSorting: false,
    },
    {
      accessorKey: 'name',
      header: '名称',
      cell: ({ row }) => (
        <div className="max-w-[200px]">
          <div className="font-medium truncate" title={row.getValue('name')}>
            {row.getValue('name')}
          </div>
          {row.original.aiGenerated && (
            <Badge variant="outline" className="text-xs mt-1 bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
              <Sparkles className="h-3 w-3 mr-1" />
              AI
            </Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'type',
      header: '类型',
      cell: ({ row }) => {
        const type = row.getValue('type') as string
        return (
          <Badge variant="outline" className={cn('font-normal', getTypeColor(type))}>
            {getTypeIcon(type)}
            <span className="ml-1">{getAssetTypeName(type as any)}</span>
          </Badge>
        )
      },
    },
    {
      accessorKey: 'source',
      header: '来源',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {getAssetSourceName(row.getValue('source') as any)}
        </span>
      ),
    },
    {
      accessorKey: 'fileSize',
      header: '大小',
      cell: ({ row }) => (
        <span className="text-sm tabular-nums">
          {formatAssetFileSize(row.getValue('fileSize'))}
        </span>
      ),
    },
    {
      accessorKey: 'tags',
      header: '标签',
      cell: ({ row }) => {
        const tags = row.getValue('tags') as string[]
        if (!tags || tags.length === 0) {
          return <span className="text-muted-foreground text-sm">-</span>
        }
        return (
          <div className="flex flex-wrap gap-1 max-w-[150px]">
            {tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs px-1.5 py-0">
                {tag}
              </Badge>
            ))}
            {tags.length > 2 && (
              <span className="text-xs text-muted-foreground">+{tags.length - 2}</span>
            )}
          </div>
        )
      },
      enableSorting: false,
    },
    {
      accessorKey: 'uploadedByName',
      header: '上传者',
      cell: ({ row }) => (
        <span className="text-sm">{row.getValue('uploadedByName')}</span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: '上传时间',
      cell: ({ row }) => {
        const date = new Date(row.getValue('createdAt'))
        return (
          <span className="text-sm text-muted-foreground tabular-nums">
            {format(date, 'yyyy-MM-dd HH:mm', { locale: zhCN })}
          </span>
        )
      },
    },
    {
      id: 'actions',
      header: '操作',
      cell: ({ row }) => {
        const asset = row.original
        const canEdit = canManageAsset(asset.uploadedBy)
        const canDel = canDeleteAsset(asset.uploadedBy)

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setPreviewAsset(asset)}>
                <Eye className="mr-2 h-4 w-4" />
                预览
              </DropdownMenuItem>
              {canEdit && (
                <DropdownMenuItem onClick={() => setEditAsset(asset)}>
                  <Edit className="mr-2 h-4 w-4" />
                  编辑
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => {
                  navigator.clipboard.writeText(asset.url)
                  toast.success('链接已复制')
                }}
              >
                <Copy className="mr-2 h-4 w-4" />
                复制链接
              </DropdownMenuItem>
              {canDel && <DropdownMenuSeparator />}
              {canDel && (
                <DropdownMenuItem
                  onClick={() => {
                    setDeleteAssetId(asset.id)
                    setDeleteAssetName(asset.name)
                  }}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  删除
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
      enableSorting: false,
      enableHiding: false,
    },
  ], [assets, isSelected, toggleSelectAsset, selectAllAssets, clearSelection, canManageAsset, canDeleteAsset])

  const table = useReactTable({
    data: assets,
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

  // 确认删除
  const handleConfirmDelete = async () => {
    if (!deleteAssetId) return
    try {
      await deleteAsset(deleteAssetId)
      toast.success('资产已删除')
      setDeleteAssetId(null)
      setDeleteAssetName('')
      onUpdate?.()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '删除失败')
    }
  }

  return (
    <div className="space-y-4">
      {/* 列显示/隐藏 */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          共 {assets.length} 个资产
        </div>
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
                const header = typeof column.columnDef.header === 'string'
                  ? column.columnDef.header
                  : column.id
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {header}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 表格 */}
      <div className="rounded-md border overflow-x-auto">
        <div className="min-w-[1000px]">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={isSelected(row.original.id) && 'selected'}
                    className="cursor-pointer hover:bg-muted/50"
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
                    没有找到匹配的资产
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* 分页 */}
      <DataTablePagination table={table} />

      {/* 预览对话框 */}
      {previewAsset && (
        <AssetPreviewDialog
          asset={previewAsset}
          open={!!previewAsset}
          onOpenChange={(open) => !open && setPreviewAsset(null)}
        />
      )}

      {/* 编辑对话框 */}
      {editAsset && (
        <AssetEditDialog
          asset={editAsset}
          open={!!editAsset}
          onOpenChange={(open) => {
            if (!open) {
              setEditAsset(null)
              onUpdate?.()
            }
          }}
          onSuccess={() => {
            setEditAsset(null)
            onUpdate?.()
          }}
        />
      )}

      {/* 删除确认对话框 */}
      <AlertDialog open={!!deleteAssetId} onOpenChange={(open) => !open && setDeleteAssetId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除资产"{deleteAssetName}"吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground">
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
