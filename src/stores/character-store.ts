/**
 * character-store
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

/**
 * Character Store
 * 角色状态管理
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type {
  Character,
  CreateCharacterParams,
  UpdateCharacterParams,
  CostumeVariant,
  CharacterImage,
  ViewType,
  CustomView,
  GenerationTask,
  GenerationStatus,
} from '@/lib/types/character'
import { createCustomViewType, MAX_CUSTOM_VIEWS, getStylePrompt } from '@/lib/types/character'
import { syncCharacterToAssetAsync, deleteCharacterAssetAsync } from '@/lib/services/character-asset-sync'
import { aiApi } from '@/lib/api/ai'

/**
 * 生成任务状态
 */
interface GenerationTaskState {
  taskId: string
  characterId: string
  type: 'image' | 'costume' | 'voice'
  status: GenerationStatus
  progress: number
  error?: string
  result?: string
}

/**
 * 角色 Store 状态
 */
interface CharacterState {
  // 数据
  characters: Character[]
  selectedCharacterId: string | null

  // 生成任务
  generationTasks: Map<string, GenerationTaskState>

  // CRUD 操作
  createCharacter: (params: CreateCharacterParams) => string
  updateCharacter: (id: string, params: UpdateCharacterParams) => void
  deleteCharacter: (id: string) => void
  getCharacterById: (id: string) => Character | undefined
  getCharactersByProject: (projectId: string) => Character[]
  getGlobalCharacters: () => Character[]

  // 选择操作
  selectCharacter: (id: string | null) => void

  // 图片操作
  updateCharacterView: (characterId: string, viewType: ViewType, image: CharacterImage | undefined) => void
  deleteCharacterView: (characterId: string, viewType: ViewType) => void

  // 自定义视角操作
  addCustomView: (characterId: string, name: string) => CustomView | null
  renameCustomView: (characterId: string, customViewId: string, newName: string) => boolean
  removeCustomView: (characterId: string, customViewId: string) => boolean

  // 服装操作
  addCostume: (characterId: string, costume: CostumeVariant) => void
  updateCostume: (characterId: string, costumeId: string, updates: Partial<CostumeVariant>) => void
  deleteCostume: (characterId: string, costumeId: string) => void

  // 语音操作
  updateCharacterVoice: (
    characterId: string,
    voice: { style: string; sampleUrl?: string; sampleText?: string }
  ) => void
  deleteCharacterVoice: (characterId: string) => void

  // 生成任务管理
  startGenerationTask: (
    characterId: string,
    type: 'image' | 'costume' | 'voice'
  ) => string
  updateGenerationTask: (
    taskId: string,
    updates: Partial<GenerationTaskState>
  ) => void
  completeGenerationTask: (taskId: string, result?: string) => void
  failGenerationTask: (taskId: string, error: string) => void
  getGenerationTask: (taskId: string) => GenerationTaskState | undefined
  clearCompletedTasks: () => void

  // 导出
  exportCharacter: (id: string) => string | null
  importCharacter: (data: string) => Character | null
}

/**
 * 生成唯一 ID
 */
function generateId(): string {
  return `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 角色编号计数器存储键
 */
const CHARACTER_CODE_COUNTERS_KEY = 'character-code-counters'

/**
 * 获取角色编号计数器
 */
function getCodeCounters(): { global: number; projects: Record<string, number> } {
  if (typeof window === 'undefined') {
    return { global: 0, projects: {} }
  }
  const stored = localStorage.getItem(CHARACTER_CODE_COUNTERS_KEY)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      return { global: 0, projects: {} }
    }
  }
  return { global: 0, projects: {} }
}

/**
 * 保存角色编号计数器
 */
function saveCodeCounters(counters: { global: number; projects: Record<string, number> }): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(CHARACTER_CODE_COUNTERS_KEY, JSON.stringify(counters))
}

/**
 * 生成角色编号
 * @param projectId 项目ID，如果为空则生成全局编号
 * @param projectCode 项目编号（如 "001"），用于生成项目角色编号
 */
function generateCharacterCode(projectId?: string, projectCode?: string): string {
  const counters = getCodeCounters()

  if (projectId && projectCode) {
    // 项目角色: PROJ-XXX-CHAR-XXX
    const projectCharCount = (counters.projects[projectId] || 0) + 1
    counters.projects[projectId] = projectCharCount
    saveCodeCounters(counters)
    return `PROJ-${projectCode.padStart(3, '0')}-CHAR-${String(projectCharCount).padStart(3, '0')}`
  } else {
    // 全局角色: GLOBAL-CHAR-XXX
    counters.global += 1
    saveCodeCounters(counters)
    return `GLOBAL-CHAR-${String(counters.global).padStart(3, '0')}`
  }
}

/**
 * 为现有角色生成编号（数据迁移用）
 */
function generateCodeForExistingCharacter(character: Character, allCharacters: Character[]): string {
  const projectId = character.projectId

  if (projectId) {
    // 统计同一项目中已有的角色数量
    const projectChars = allCharacters.filter(
      (c) => c.projectId === projectId && c.code && c.code.startsWith('PROJ-')
    )
    const count = projectChars.length + 1
    // 使用项目ID的后3位作为项目编号（如果没有则使用001）
    const projectSeq = projectId.slice(-3) || '001'
    return `PROJ-${projectSeq.padStart(3, '0')}-CHAR-${String(count).padStart(3, '0')}`
  } else {
    // 统计全局角色数量
    const globalChars = allCharacters.filter(
      (c) => !c.projectId && c.code && c.code.startsWith('GLOBAL-')
    )
    const count = globalChars.length + 1
    return `GLOBAL-CHAR-${String(count).padStart(3, '0')}`
  }
}

/**
 * 创建角色 Store
 */
export const useCharacterStore = create<CharacterState>()(
  persist(
    immer((set, get) => ({
      // 初始状态
      characters: [],
      selectedCharacterId: null,
      generationTasks: new Map(),

      // CRUD 操作
      createCharacter: (params) => {
        const id = generateId()
        const now = new Date().toISOString()
        const code = generateCharacterCode(params.projectId)

        const newCharacter: Character = {
          id,
          code,
          name: params.name,
          description: params.description || '',
          personality: params.personality || '',
          attributes: params.attributes || {},
          tags: params.tags || [],
          basePrompt: params.basePrompt || '',
          views: {},
          customViews: [],
          costumes: [],
          projectId: params.projectId,
          syncedToAsset: false,
          createdAt: now,
          updatedAt: now,
        }

        set((state) => {
          state.characters.push(newCharacter)
        })

        return id
      },

      updateCharacter: (id, params) => {
        let shouldSyncAsset = false
        let characterToSync: Character | null = null

        set((state) => {
          const index = state.characters.findIndex((c) => c.id === id)
          if (index !== -1) {
            const character = state.characters[index]

            // 检查是否需要更新图片提示词
            const shouldUpdatePrompts =
              params.basePrompt !== undefined && params.basePrompt !== character.basePrompt

            // 检查是否需要更新风格关键词
            const styleChanged = params.style !== undefined && params.style !== character.style

            state.characters[index] = {
              ...character,
              ...params,
              attributes: params.attributes
                ? { ...character.attributes, ...params.attributes }
                : character.attributes,
              updatedAt: new Date().toISOString(),
            }

            // 如果基础提示词或风格变化，更新所有已生成图片的提示词
            if (shouldUpdatePrompts || styleChanged) {
              const updatedCharacter = state.characters[index]
              const newBasePrompt = params.basePrompt ?? character.basePrompt
              const newStyle = params.style ?? character.style
              const styleKeywords = getStylePrompt(newStyle)

              // 更新多视角图片的提示词
              Object.keys(updatedCharacter.views).forEach((viewType) => {
                const view = updatedCharacter.views[viewType as ViewType]
                if (view && newBasePrompt) {
                  // 重新构建提示词
                  const newPrompt = aiApi.buildCharacterPrompt(
                    newBasePrompt,
                    viewType as ViewType,
                    undefined,
                    styleKeywords
                  )
                  view.prompt = newPrompt
                }
              })

              // 更新服装变体的提示词
              updatedCharacter.costumes.forEach((costume) => {
                if (newBasePrompt) {
                  const newPrompt = aiApi.buildCostumePrompt(newBasePrompt, costume.description, styleKeywords)
                  costume.prompt = newPrompt
                }
              })
            }

            // 如果角色已同步到资产库，需要更新资产
            if (state.characters[index].syncedToAsset) {
              shouldSyncAsset = true
              characterToSync = state.characters[index]
            }
          }
        })

        // 异步同步到资产库（不阻塞主流程）
        if (shouldSyncAsset && characterToSync) {
          syncCharacterToAssetAsync(characterToSync).catch((error) => {
            console.error('Failed to sync character to asset:', error)
          })
        }
      },

      deleteCharacter: (id) => {
        const character = get().getCharacterById(id)
        const syncedToAsset = character?.syncedToAsset
        const assetId = character?.assetId

        set((state) => {
          state.characters = state.characters.filter((c) => c.id !== id)
          if (state.selectedCharacterId === id) {
            state.selectedCharacterId = null
          }
        })

        // 异步删除关联的资产（不阻塞主流程）
        if (syncedToAsset && assetId) {
          deleteCharacterAssetAsync(id).catch((error) => {
            console.error('Failed to delete character asset:', error)
          })
        }
      },

      getCharacterById: (id) => {
        return get().characters.find((c) => c.id === id)
      },

      getCharactersByProject: (projectId) => {
        return get().characters.filter((c) => c.projectId === projectId)
      },

      getGlobalCharacters: () => {
        return get().characters.filter((c) => !c.projectId)
      },

      // 选择操作
      selectCharacter: (id) => {
        set((state) => {
          state.selectedCharacterId = id
        })
      },

      // 图片操作
      updateCharacterView: (characterId, viewType, image) => {
        let shouldSyncAsset = false
        let characterToSync: Character | null = null

        set((state) => {
          const character = state.characters.find((c) => c.id === characterId)
          if (character) {
            if (image) {
              character.views[viewType] = image
            } else {
              delete character.views[viewType]
            }
            character.updatedAt = new Date().toISOString()
            if (character.syncedToAsset) {
              shouldSyncAsset = true
              characterToSync = character
            }
          }
        })

        // 异步同步到资产库
        if (shouldSyncAsset && characterToSync) {
          syncCharacterToAssetAsync(characterToSync).catch((error) => {
            console.error('Failed to sync character to asset:', error)
          })
        }
      },

      deleteCharacterView: (characterId, viewType) => {
        let shouldSyncAsset = false
        let characterToSync: Character | null = null

        set((state) => {
          const character = state.characters.find((c) => c.id === characterId)
          if (character && character.views[viewType]) {
            delete character.views[viewType]
            character.updatedAt = new Date().toISOString()
            if (character.syncedToAsset) {
              shouldSyncAsset = true
              characterToSync = character
            }
          }
        })

        // 异步同步到资产库
        if (shouldSyncAsset && characterToSync) {
          syncCharacterToAssetAsync(characterToSync).catch((error) => {
            console.error('Failed to sync character to asset:', error)
          })
        }
      },

      // 自定义视角操作
      addCustomView: (characterId, name) => {
        let result: CustomView | null = null

        set((state) => {
          const character = state.characters.find((c) => c.id === characterId)
          if (!character) return

          // 检查是否达到最大数量
          if ((character.customViews?.length || 0) >= MAX_CUSTOM_VIEWS) {
            return
          }

          // 初始化 customViews 数组
          if (!character.customViews) {
            character.customViews = []
          }

          // 检查名称是否重复
          if (character.customViews.some((v) => v.name === name)) {
            return
          }

          // 创建自定义视角
          const customId = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          const customView: CustomView = {
            id: customId,
            name,
          }

          character.customViews.push(customView)
          character.updatedAt = new Date().toISOString()
          result = customView
        })

        return result
      },

      renameCustomView: (characterId, customViewId, newName) => {
        let success = false

        set((state) => {
          const character = state.characters.find((c) => c.id === characterId)
          if (!character || !character.customViews) return

          // 检查名称是否与其他视角重复
          if (character.customViews.some((v) => v.id !== customViewId && v.name === newName)) {
            return
          }

          const view = character.customViews.find((v) => v.id === customViewId)
          if (view) {
            view.name = newName
            character.updatedAt = new Date().toISOString()
            success = true
          }
        })

        return success
      },

      removeCustomView: (characterId, customViewId) => {
        let success = false

        set((state) => {
          const character = state.characters.find((c) => c.id === characterId)
          if (!character || !character.customViews) return

          const index = character.customViews.findIndex((v) => v.id === customViewId)
          if (index !== -1) {
            // 删除自定义视角定义
            character.customViews.splice(index, 1)
            // 删除对应的图片
            const viewType = createCustomViewType(customViewId)
            delete character.views[viewType]
            character.updatedAt = new Date().toISOString()
            success = true
          }
        })

        return success
      },

      // 服装操作
      addCostume: (characterId, costume) => {
        let shouldSyncAsset = false
        let characterToSync: Character | null = null

        set((state) => {
          const character = state.characters.find((c) => c.id === characterId)
          if (character) {
            character.costumes.push(costume)
            character.updatedAt = new Date().toISOString()
            if (character.syncedToAsset) {
              shouldSyncAsset = true
              characterToSync = character
            }
          }
        })

        // 异步同步到资产库
        if (shouldSyncAsset && characterToSync) {
          syncCharacterToAssetAsync(characterToSync).catch((error) => {
            console.error('Failed to sync character to asset:', error)
          })
        }
      },

      updateCostume: (characterId, costumeId, updates) => {
        let shouldSyncAsset = false
        let characterToSync: Character | null = null

        set((state) => {
          const character = state.characters.find((c) => c.id === characterId)
          if (character) {
            const index = character.costumes.findIndex((c) => c.id === costumeId)
            if (index !== -1) {
              character.costumes[index] = {
                ...character.costumes[index],
                ...updates,
              }
              character.updatedAt = new Date().toISOString()
              if (character.syncedToAsset) {
                shouldSyncAsset = true
                characterToSync = character
              }
            }
          }
        })

        // 异步同步到资产库
        if (shouldSyncAsset && characterToSync) {
          syncCharacterToAssetAsync(characterToSync).catch((error) => {
            console.error('Failed to sync character to asset:', error)
          })
        }
      },

      deleteCostume: (characterId, costumeId) => {
        let shouldSyncAsset = false
        let characterToSync: Character | null = null

        set((state) => {
          const character = state.characters.find((c) => c.id === characterId)
          if (character) {
            character.costumes = character.costumes.filter((c) => c.id !== costumeId)
            character.updatedAt = new Date().toISOString()
            if (character.syncedToAsset) {
              shouldSyncAsset = true
              characterToSync = character
            }
          }
        })

        // 异步同步到资产库
        if (shouldSyncAsset && characterToSync) {
          syncCharacterToAssetAsync(characterToSync).catch((error) => {
            console.error('Failed to sync character to asset:', error)
          })
        }
      },

      // 语音操作
      updateCharacterVoice: (characterId, voice) => {
        let shouldSyncAsset = false
        let characterToSync: Character | null = null

        set((state) => {
          const character = state.characters.find((c) => c.id === characterId)
          if (character) {
            character.voice = voice
            character.updatedAt = new Date().toISOString()
            if (character.syncedToAsset) {
              shouldSyncAsset = true
              characterToSync = character
            }
          }
        })

        // 异步同步到资产库
        if (shouldSyncAsset && characterToSync) {
          syncCharacterToAssetAsync(characterToSync).catch((error) => {
            console.error('Failed to sync character to asset:', error)
          })
        }
      },

      deleteCharacterVoice: (characterId) => {
        let shouldSyncAsset = false
        let characterToSync: Character | null = null

        set((state) => {
          const character = state.characters.find((c) => c.id === characterId)
          if (character) {
            delete character.voice
            character.updatedAt = new Date().toISOString()
            if (character.syncedToAsset) {
              shouldSyncAsset = true
              characterToSync = character
            }
          }
        })

        // 异步同步到资产库
        if (shouldSyncAsset && characterToSync) {
          syncCharacterToAssetAsync(characterToSync).catch((error) => {
            console.error('Failed to sync character to asset:', error)
          })
        }
      },

      // 生成任务管理
      startGenerationTask: (characterId, type) => {
        const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        set((state) => {
          state.generationTasks.set(taskId, {
            taskId,
            characterId,
            type,
            status: 'generating',
            progress: 0,
          })
        })
        return taskId
      },

      updateGenerationTask: (taskId, updates) => {
        set((state) => {
          const task = state.generationTasks.get(taskId)
          if (task) {
            state.generationTasks.set(taskId, { ...task, ...updates })
          }
        })
      },

      completeGenerationTask: (taskId, result) => {
        set((state) => {
          const task = state.generationTasks.get(taskId)
          if (task) {
            state.generationTasks.set(taskId, {
              ...task,
              status: 'success',
              progress: 100,
              result,
            })
          }
        })
      },

      failGenerationTask: (taskId, error) => {
        set((state) => {
          const task = state.generationTasks.get(taskId)
          if (task) {
            state.generationTasks.set(taskId, {
              ...task,
              status: 'error',
              error,
            })
          }
        })
      },

      getGenerationTask: (taskId) => {
        return get().generationTasks.get(taskId)
      },

      clearCompletedTasks: () => {
        set((state) => {
          for (const [id, task] of state.generationTasks) {
            if (task.status === 'success' || task.status === 'error') {
              state.generationTasks.delete(id)
            }
          }
        })
      },

      // 导出
      exportCharacter: (id) => {
        const character = get().getCharacterById(id)
        if (!character) return null
        return JSON.stringify(character, null, 2)
      },

      importCharacter: (data) => {
        try {
          const character = JSON.parse(data) as Character
          if (!character.id || !character.name) {
            return null
          }
          // 生成新 ID 和编号避免冲突
          const newId = generateId()
          const newCode = generateCharacterCode(character.projectId)
          const now = new Date().toISOString()
          const importedCharacter: Character = {
            ...character,
            id: newId,
            code: newCode,
            syncedToAsset: false,
            assetId: undefined,
            createdAt: now,
            updatedAt: now,
          }
          set((state) => {
            state.characters.push(importedCharacter)
          })
          return importedCharacter
        } catch {
          return null
        }
      },
    })),
    {
      name: 'character-storage',
      partialize: (state) => ({
        characters: state.characters,
        selectedCharacterId: state.selectedCharacterId,
      }),
      // 数据迁移：为现有角色生成编号
      onRehydrateStorage: () => (state) => {
        if (state && state.characters) {
          let needsMigration = false
          state.characters = state.characters.map((character) => {
            // 如果角色没有编号或没有 syncedToAsset 字段，需要迁移
            if (!character.code || character.syncedToAsset === undefined) {
              needsMigration = true
              return {
                ...character,
                code: character.code || generateCodeForExistingCharacter(character, state.characters),
                syncedToAsset: character.syncedToAsset ?? false,
                assetId: character.assetId,
              }
            }
            return character
          })
          // 如果有迁移，需要保存
          if (needsMigration) {
            setTimeout(() => {
              useCharacterStore.persist.rehydrate()
            }, 0)
          }
        }
      },
    }
  )
)

/**
 * 获取所有角色
 */
export function useCharacters() {
  return useCharacterStore((state) => state.characters)
}

/**
 * 获取选中的角色
 */
export function useSelectedCharacter() {
  const selectedId = useCharacterStore((state) => state.selectedCharacterId)
  const characters = useCharacterStore((state) => state.characters)
  return selectedId ? characters.find((c) => c.id === selectedId) : null
}

/**
 * 获取角色详情
 */
export function useCharacter(id: string) {
  return useCharacterStore((state) => state.getCharacterById(id))
}
