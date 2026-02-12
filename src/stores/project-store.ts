import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { projectsApi } from '@/lib/api/projects'
import { getWebSocketClient } from '@/lib/websocket/client'
import { handleServerError } from '@/lib/handle-server-error'
import { toast } from 'sonner'
// 导入API类型，用于类型兼容
import type { Project as ApiProject } from '@/lib/types/api'

// 项目类型定义
export type ProjectStatus = 'planning' | 'filming' | 'postProduction' | 'completed'
export type ProjectType = 'shortDrama' | 'realLifeDrama' | 'aiPodcast' | 'advertisement' | 'mv' | 'documentary' | 'other'
export type MemberRole = 'admin' | 'member' | 'director' | 'screenwriter' | 'cinematographer' | 'editor' | 'actor'

// Store 内部使用的 Project 类型（包含 members 字段）
// 与 API Project 类型不同，API 返回的 Project 没有 members
export interface Project {
  id: string
  name: string
  description: string
  type: ProjectType
  status: ProjectStatus
  episodeRange: string
  createdAt: string
  updatedAt: string
  createdBy: string
  director: string
  members?: ProjectMember[]  // 可选成员列表
  // 剧本相关
  scriptContent?: string
  scriptVersions?: ScriptVersion[]
  // 分镜头统计
  totalShots: number
  completedShots: number
  // 收藏和置顶
  isFavorite: boolean
  isPinned: boolean
  pinnedAt?: string
}

export interface ProjectMember {
  id: string
  name: string
  email: string
  role: MemberRole | string  // 允许 MemberRole 或 string（从 API 返回）
  joinedAt: string
}

export interface GlobalMember extends ProjectMember {
  projectId?: string
}

export interface ScriptVersion {
  id: string
  content: string
  createdAt: string
  createdBy: string
  description?: string
}

// 同步状态类型
export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error'

interface ProjectState {
  // 数据
  projects: Project[]
  currentProject: Project | null
  currentProjectId: string | null
  selectedProjectId: string | null

  // 同步状态
  syncStatus: SyncStatus
  lastSyncAt: string | null
  isOnline: boolean

  // 加载状态
  isLoading: boolean
  error: string | null

  // 项目操作
  loadProjects: (forceRefresh?: boolean) => Promise<void>
  loadProject: (id: string) => Promise<void>
  createProject: (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'members'>) => Promise<string>
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>
  deleteProject: (id: string) => Promise<void>

  // 状态管理
  setCurrentProject: (project: Project | null) => void
  setCurrentProjectId: (id: string | null) => void
  clearCurrentProject: () => void
  getProjectById: (id: string) => Project | undefined
  getAllProjects: () => Project[]

  // 成员管理
  loadMembers: (projectId: string) => Promise<void>
  addMember: (projectId: string, member: { email: string; role: MemberRole }) => Promise<void>
  removeMember: (projectId: string, memberId: string) => Promise<void>
  updateMemberRole: (projectId: string, memberId: string, role: MemberRole) => Promise<void>

  // 剧本管理
  loadScript: (projectId: string) => Promise<void>
  updateScript: (projectId: string, content: string) => Promise<void>
  loadScriptVersions: (projectId: string) => Promise<void>
  createScriptVersion: (projectId: string, content: string, description?: string) => Promise<void>
  restoreScriptVersion: (projectId: string, versionId: string) => Promise<void>

  // 分镜头统计更新（由 storyboard store 调用）
  updateShotProgress: (projectId: string, total: number, completed: number) => void

  // 收藏和置顶
  toggleFavorite: (id: string) => Promise<void>
  togglePin: (id: string) => Promise<void>

  // 项目选定
  selectProject: (id: string | null) => void
  getSelectedProject: () => Project | null
  ensureSelectedProject: () => void

  // 同步控制
  syncWithServer: () => Promise<void>
  setOnlineStatus: (isOnline: boolean) => void
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      // 初始状态
      projects: [],
      currentProject: null,
      currentProjectId: null,
      selectedProjectId: null,
      syncStatus: 'idle',
      lastSyncAt: null,
      isOnline: navigator.onLine,
      isLoading: false,
      error: null,

      // 加载项目列表
      loadProjects: async (forceRefresh = false) => {
        const state = get()

        // 如果有缓存且不强制刷新，直接使用缓存
        if (!forceRefresh && state.projects.length > 0 && state.syncStatus === 'synced') {
          return
        }

        try {
          set({ isLoading: true, error: null, syncStatus: 'syncing' })

          const { projects } = await projectsApi.getProjects({
            page: 1,
            pageSize: 100,
          })

          set({
            projects,
            syncStatus: 'synced',
            lastSyncAt: new Date().toISOString(),
            isLoading: false,
          })

          // 订阅项目更新（如果已连接 WebSocket）
          const wsClient = getWebSocketClient()
          if (wsClient.isConnected()) {
            projects.forEach((project) => {
              wsClient.subscribe(project.id)
            })
          }
        } catch (error) {
          console.error('Load projects error:', error)
          handleServerError(error)
          set({
            error: error instanceof Error ? error.message : 'Failed to load projects',
            isLoading: false,
            syncStatus: 'error',
          })
        }
      },

      // 加载单个项目
      loadProject: async (id) => {
        try {
          set({ isLoading: true, error: null })

          const project = await projectsApi.getProject(id)

          // 更新缓存中的项目
          set((state) => ({
            projects: state.projects.some((p) => p.id === id)
              ? state.projects.map((p) => (p.id === id ? project : p))
              : [...state.projects, project],
            currentProject: project,
            currentProjectId: id,
            isLoading: false,
            syncStatus: 'synced',
          }))

          // 订阅项目更新
          const wsClient = getWebSocketClient()
          if (wsClient.isConnected()) {
            wsClient.subscribe(id)
          }

          // 设置当前项目的成员（从后端加载）
          if (project.members) {
            set((state) => ({
              currentProject: {
                ...state.currentProject!,
                members: project.members,
              },
            }))
          }
        } catch (error) {
          console.error('Load project error:', error)
          handleServerError(error)
          set({
            error: error instanceof Error ? error.message : 'Failed to load project',
            isLoading: false,
            syncStatus: 'error',
          })
        }
      },

      // 创建项目
      createProject: async (data) => {
        try {
          set({ isLoading: true, error: null })

          const project = await projectsApi.createProject({
            name: data.name,
            description: data.description,
            type: data.type,
            status: data.status,
            episodeRange: data.episodeRange,
            director: data.director,
          })

          // 乐观更新：先添加到本地状态
          set((state) => ({
            projects: [...state.projects, { ...data, ...project }],
            isLoading: false,
            syncStatus: 'synced',
          }))

          toast.success('项目创建成功')

          return project.id
        } catch (error) {
          console.error('Create project error:', error)
          handleServerError(error)
          set({
            error: error instanceof Error ? error.message : 'Failed to create project',
            isLoading: false,
            syncStatus: 'error',
          })
          throw error
        }
      },

      // 更新项目
      updateProject: async (id, updates) => {
        try {
          set({ isLoading: true, error: null, syncStatus: 'syncing' })

          // 乐观更新：先更新本地状态
          const timestamp = new Date().toISOString()
          set((state) => ({
            projects: state.projects.map((p) =>
              p.id === id
                ? { ...p, ...updates, updatedAt: timestamp }
                : p
            ),
            currentProject:
              state.currentProject?.id === id
                ? { ...state.currentProject, ...updates, updatedAt: timestamp }
                : state.currentProject,
          }))

          // 调用 API 更新
          await projectsApi.updateProject(id, updates)

          set({
            syncStatus: 'synced',
            lastSyncAt: new Date().toISOString(),
            isLoading: false,
          })

          toast.success('项目更新成功')
        } catch (error) {
          console.error('Update project error:', error)
          handleServerError(error)

          // 回滚：重新加载项目数据
          get().loadProject(id)

          set({
            error: error instanceof Error ? error.message : 'Failed to update project',
            isLoading: false,
            syncStatus: 'error',
          })
        }
      },

      // 删除项目
      deleteProject: async (id) => {
        try {
          set({ isLoading: true, error: null })

          await projectsApi.deleteProject(id)

          // 从本地状态移除
          set((state) => ({
            projects: state.projects.filter((p) => p.id !== id),
            currentProject: state.currentProject?.id === id ? null : state.currentProject,
            isLoading: false,
            syncStatus: 'synced',
          }))

          // 取消订阅
          const wsClient = getWebSocketClient()
          if (wsClient.isConnected()) {
            wsClient.unsubscribe(id)
          }

          toast.success('项目已删除')
        } catch (error) {
          console.error('Delete project error:', error)
          handleServerError(error)
          set({
            error: error instanceof Error ? error.message : 'Failed to delete project',
            isLoading: false,
            syncStatus: 'error',
          })
        }
      },

      // 设置当前项目
      setCurrentProject: (project) => {
        const wsClient = getWebSocketClient()

        // 切换项目时取消旧订阅，订阅新项目
        if (get().currentProject?.id && project?.id !== get().currentProject?.id) {
          if (wsClient.isConnected()) {
            wsClient.unsubscribe(get().currentProject!.id)
          }
        }

        if (project && wsClient.isConnected()) {
          wsClient.subscribe(project.id)
        }

        set({ currentProject: project, currentProjectId: project?.id ?? null })
      },

      // 设置当前项目 ID
      setCurrentProjectId: (id) => {
        const project = id ? get().projects.find((p) => p.id === id) : null
        get().setCurrentProject(project)
      },

      // 清除当前项目
      clearCurrentProject: () => {
        const wsClient = getWebSocketClient()
        if (get().currentProject && wsClient.isConnected()) {
          wsClient.unsubscribe(get().currentProject!.id)
        }

        set({ currentProject: null, currentProjectId: null })
      },

      // 根据 ID 获取项目
      getProjectById: (id) => {
        return get().projects.find((p) => p.id === id)
      },

      // 获取所有项目
      getAllProjects: () => {
        return get().projects
      },

      // 加载项目成员
      loadMembers: async (projectId) => {
        try {
          const { members } = await projectsApi.getMembers(projectId)

          // 更新项目成员
          set((state) => ({
            projects: state.projects.map((p) =>
              p.id === projectId ? { ...p, members } : p
            ),
            currentProject:
              state.currentProject?.id === projectId
                ? { ...state.currentProject, members }
                : state.currentProject,
          }))
        } catch (error) {
          console.error('Load members error:', error)
          handleServerError(error)
        }
      },

      // 添加成员
      addMember: async (projectId, member) => {
        try {
          const { member: newMember } = await projectsApi.addMember(projectId, member)

          // 乐观更新
          set((state) => ({
            projects: state.projects.map((p) =>
              p.id === projectId
                ? { ...p, members: [...p.members, newMember] }
                : p
            ),
            currentProject:
              state.currentProject?.id === projectId
                ? {
                    ...state.currentProject,
                    members: [...state.currentProject.members, newMember],
                  }
                : state.currentProject,
          }))

          toast.success('成员添加成功')
        } catch (error) {
          console.error('Add member error:', error)
          handleServerError(error)
        }
      },

      // 移除成员
      removeMember: async (projectId, memberId) => {
        try {
          await projectsApi.removeMember(projectId, memberId)

          set((state) => ({
            projects: state.projects.map((p) =>
              p.id === projectId
                ? { ...p, members: p.members.filter((m) => m.id !== memberId) }
                : p
            ),
            currentProject:
              state.currentProject?.id === projectId
                ? {
                    ...state.currentProject,
                    members: state.currentProject.members.filter((m) => m.id !== memberId),
                  }
                : state.currentProject,
          }))

          toast.success('成员已移除')
        } catch (error) {
          console.error('Remove member error:', error)
          handleServerError(error)
        }
      },

      // 更新成员角色
      updateMemberRole: async (projectId, memberId, role) => {
        try {
          await projectsApi.updateMemberRole(projectId, memberId, role)

          set((state) => ({
            projects: state.projects.map((p) =>
              p.id === projectId
                ? {
                    ...p,
                    members: p.members.map((m) =>
                      m.id === memberId ? { ...m, role } : m
                    ),
                  }
                : p
            ),
            currentProject:
              state.currentProject?.id === projectId
                ? {
                    ...state.currentProject,
                    members: state.currentProject.members.map((m) =>
                      m.id === memberId ? { ...m, role } : m
                    ),
                  }
                : state.currentProject,
          }))

          toast.success('成员角色已更新')
        } catch (error) {
          console.error('Update member role error:', error)
          handleServerError(error)
        }
      },

      // 加载剧本
      loadScript: async (projectId) => {
        try {
          const { content } = await projectsApi.getScript(projectId)

          set((state) => ({
            projects: state.projects.map((p) =>
              p.id === projectId ? { ...p, scriptContent: content } : p
            ),
            currentProject:
              state.currentProject?.id === projectId
                ? { ...state.currentProject, scriptContent: content }
                : state.currentProject,
          }))
        } catch (error) {
          console.error('Load script error:', error)
          handleServerError(error)
        }
      },

      // 更新剧本
      updateScript: async (projectId, content) => {
        try {
          // 乐观更新
          const timestamp = new Date().toISOString()
          set((state) => ({
            projects: state.projects.map((p) =>
              p.id === projectId
                ? { ...p, scriptContent: content, updatedAt: timestamp }
                : p
            ),
            currentProject:
              state.currentProject?.id === projectId
                ? { ...state.currentProject, scriptContent: content, updatedAt: timestamp }
                : state.currentProject,
          }))

          await projectsApi.updateScript(projectId, content)

          set({
            syncStatus: 'synced',
            lastSyncAt: timestamp,
          })

          toast.success('剧本已保存')
        } catch (error) {
          console.error('Update script error:', error)
          handleServerError(error)

          // 回滚：重新加载剧本
          get().loadScript(projectId)
        }
      },

      // 加载剧本版本
      loadScriptVersions: async (projectId) => {
        try {
          const versions = await projectsApi.getScriptVersions(projectId)

          set((state) => ({
            projects: state.projects.map((p) =>
              p.id === projectId ? { ...p, scriptVersions: versions } : p
            ),
            currentProject:
              state.currentProject?.id === projectId
                ? { ...state.currentProject, scriptVersions: versions }
                : state.currentProject,
          }))
        } catch (error) {
          console.error('Load script versions error:', error)
          handleServerError(error)
        }
      },

      // 创建剧本版本
      createScriptVersion: async (projectId, content, description) => {
        try {
          await projectsApi.createScriptVersion(projectId, { content, description })

          // 重新加载版本列表
          await get().loadScriptVersions(projectId)

          toast.success('版本已创建')
        } catch (error) {
          console.error('Create script version error:', error)
          handleServerError(error)
        }
      },

      // 恢复剧本版本
      restoreScriptVersion: async (projectId, versionId) => {
        try {
          await projectsApi.restoreScriptVersion(projectId, versionId)

          // 重新加载剧本
          await get().loadScript(projectId)

          toast.success('版本已恢复')
        } catch (error) {
          console.error('Restore script version error:', error)
          handleServerError(error)
        }
      },

      // 更新分镜头统计（由 storyboard store 调用）
      updateShotProgress: (projectId, total, completed) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? { ...p, totalShots: total, completedShots: completed }
              : p
          ),
          currentProject:
            state.currentProject?.id === projectId
              ? { ...state.currentProject, totalShots: total, completedShots: completed }
              : state.currentProject,
        }))
      },

      // 切换收藏
      toggleFavorite: async (id) => {
        try {
          const { isFavorite } = await projectsApi.toggleFavorite(id)

          set((state) => ({
            projects: state.projects.map((p) =>
              p.id === id ? { ...p, isFavorite } : p
            ),
            currentProject:
              state.currentProject?.id === id
                ? { ...state.currentProject, isFavorite }
                : state.currentProject,
          }))
        } catch (error) {
          console.error('Toggle favorite error:', error)
          handleServerError(error)
        }
      },

      // 切换置顶
      togglePin: async (id) => {
        try {
          const { isPinned } = await projectsApi.togglePin(id)

          const timestamp = new Date().toISOString()

          set((state) => ({
            projects: state.projects.map((p) =>
              p.id === id
                ? { ...p, isPinned, pinnedAt: isPinned ? timestamp : undefined }
                : p
            ),
            currentProject:
              state.currentProject?.id === id
                ? { ...state.currentProject, isPinned, pinnedAt: isPinned ? timestamp : undefined }
                : state.currentProject,
          }))
        } catch (error) {
          console.error('Toggle pin error:', error)
          handleServerError(error)
        }
      },

      // 选择项目
      selectProject: (id) => {
        set({ selectedProjectId: id })
      },

      // 获取选中的项目
      getSelectedProject: () => {
        const state = get()
        if (!state.selectedProjectId) return null
        return state.projects.find((p) => p.id === state.selectedProjectId) || null
      },

      // 确保有选中的项目
      ensureSelectedProject: () => {
        const state = get()
        if (!state.selectedProjectId && state.projects.length > 0) {
          set({ selectedProjectId: state.projects[0].id })
        } else if (
          state.selectedProjectId &&
          !state.projects.find((p) => p.id === state.selectedProjectId)
        ) {
          if (state.projects.length > 0) {
            set({ selectedProjectId: state.projects[0].id })
          } else {
            set({ selectedProjectId: null })
          }
        }
      },

      // 同步服务器数据
      syncWithServer: async () => {
        try {
          set({ syncStatus: 'syncing' })
          await get().loadProjects(true)
        } catch (error) {
          console.error('Sync with server error:', error)
          set({ syncStatus: 'error' })
        }
      },

      // 设置在线状态
      setOnlineStatus: (isOnline) => {
        set({ isOnline })

        // 如果恢复在线，尝试同步
        if (isOnline && get().syncStatus !== 'synced') {
          get().syncWithServer()
        }
      },
    }),
    {
      name: 'project-storage',
      // 只持久化必要的数据
      partialize: (state) => ({
        projects: state.projects,
        currentProjectId: state.currentProjectId,
        selectedProjectId: state.selectedProjectId,
        lastSyncAt: state.lastSyncAt,
      }),
    }
  )
)

// 监听网络状态变化
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    useProjectStore.getState().setOnlineStatus(true)
  })

  window.addEventListener('offline', () => {
    useProjectStore.getState().setOnlineStatus(false)
  })
}
