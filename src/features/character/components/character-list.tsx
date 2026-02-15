/**
 * character-list
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

/**
 * Character List Component
 * 角色列表组件
 */

import { useState } from 'react'
import { CharacterCard } from './character-card'
import { Button } from '@/components/ui/button'
import { Grid3x3, Table, LayoutGrid } from 'lucide-react'
import type { Character } from '@/lib/types/character'
import { cn } from '@/lib/utils'

type ViewMode = 'grid' | 'card' | 'table'

interface CharacterListProps {
  characters: Character[]
  onSelect?: (character: Character) => void
  onEdit?: (character: Character) => void
}

export function CharacterList({ characters, onSelect, onEdit }: CharacterListProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('card')

  if (characters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="text-6xl mb-4">👤</div>
        <h3 className="text-lg font-semibold mb-2">暂无角色</h3>
        <p className="text-muted-foreground text-center max-w-md">
          点击"创建角色"按钮开始创建您的第一个角色，或从已有剧本中提取角色信息。
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 视图切换 */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          共 {characters.length} 个角色
        </span>
        <div className="flex items-center border rounded-md">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setViewMode('grid')}
            className={cn(
              'rounded-none border-r h-9 w-9',
              viewMode === 'grid' && 'bg-accent'
            )}
            title="紧凑网格"
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setViewMode('card')}
            className={cn(
              'rounded-none border-r h-9 w-9',
              viewMode === 'card' && 'bg-accent'
            )}
            title="卡片视图"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setViewMode('table')}
            className={cn(
              'rounded-none h-9 w-9',
              viewMode === 'table' && 'bg-accent'
            )}
            title="表格视图"
          >
            <Table className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 列表内容 */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {characters.map((character) => (
            <CharacterCard
              key={character.id}
              character={character}
              onClick={() => onSelect?.(character)}
              onEdit={() => onEdit?.(character)}
            />
          ))}
        </div>
      )}

      {viewMode === 'card' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {characters.map((character) => (
            <CharacterCard
              key={character.id}
              character={character}
              onClick={() => onSelect?.(character)}
              onEdit={() => onEdit?.(character)}
            />
          ))}
        </div>
      )}

      {viewMode === 'table' && (
        <div className="rounded-md border overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="h-10 px-4 text-left align-middle font-medium">角色</th>
                <th className="h-10 px-4 text-left align-middle font-medium">编号</th>
                <th className="h-10 px-4 text-left align-middle font-medium">描述</th>
                <th className="h-10 px-4 text-left align-middle font-medium">标签</th>
                <th className="h-10 px-4 text-left align-middle font-medium">视角</th>
                <th className="h-10 px-4 text-left align-middle font-medium">服装</th>
                <th className="h-10 px-4 text-left align-middle font-medium">同步</th>
                <th className="h-10 px-4 text-left align-middle font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {characters.map((character) => {
                const mainImage =
                  character.views.front?.url ||
                  character.views.threeQuarter?.url ||
                  character.views.side?.url ||
                  character.views.back?.url
                const viewCount = Object.values(character.views).filter(Boolean).length

                return (
                  <tr
                    key={character.id}
                    className="border-b cursor-pointer hover:bg-muted/50"
                    onClick={() => onSelect?.(character)}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded overflow-hidden bg-muted flex-shrink-0">
                          {mainImage ? (
                            <img
                              src={mainImage}
                              alt={character.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-lg">👤</span>
                            </div>
                          )}
                        </div>
                        <span className="font-medium">{character.name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-mono text-xs text-muted-foreground">
                        {character.code}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                        {character.description || '-'}
                      </p>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {character.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-1.5 py-0.5 bg-secondary rounded"
                          >
                            {tag}
                          </span>
                        ))}
                        {character.tags.length > 2 && (
                          <span className="text-xs text-muted-foreground">
                            +{character.tags.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-center">{viewCount}</td>
                    <td className="p-4 text-center">{character.costumes.length}</td>
                    <td className="p-4 text-center">
                      {character.syncedToAsset ? (
                        <span className="text-xs text-green-600 dark:text-green-400">✓ 已同步</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          onEdit?.(character)
                        }}
                      >
                        编辑
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
