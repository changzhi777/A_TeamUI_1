/**
 * projects
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import { api } from './client'
import type {
  PaginationParams,
  Project,
  ProjectFilterParams,
  SortParams,
} from '../types/api'

// Projects API endpoints
export const projectsApi = {
  /**
   * Get projects list with pagination, filtering, and sorting
   */
  async getProjects(
    params?: PaginationParams & ProjectFilterParams & SortParams
  ): Promise<{ projects: Project[]; total: number }> {
    return api.get<{ projects: Project[]; total: number }>('/projects', {
      params,
    })
  },

  /**
   * Get project by ID
   */
  async getProject(id: string): Promise<Project> {
    return api.get<Project>(`/projects/${id}`)
  },

  /**
   * Create a new project
   */
  async createProject(data: {
    name: string
    description?: string
    type: string
    status?: string
    episodeRange?: string
    director?: string
  }): Promise<Project> {
    return api.post<Project>('/projects', data)
  },

  /**
   * Update project
   */
  async updateProject(
    id: string,
    data: {
      name?: string
      description?: string
      type?: string
      status?: string
      episodeRange?: string
      director?: string
      totalShots?: number
      completedShots?: number
    }
  ): Promise<Project> {
    return api.put<Project>(`/projects/${id}`, data)
  },

  /**
   * Delete project
   */
  async deleteProject(id: string): Promise<void> {
    return api.delete<void>(`/projects/${id}`)
  },

  /**
   * Toggle favorite
   */
  async toggleFavorite(id: string): Promise<{ isFavorite: boolean }> {
    return api.post<{ isFavorite: boolean }>(`/projects/${id}/favorite`)
  },

  /**
   * Toggle pin
   */
  async togglePin(id: string): Promise<{ isPinned: boolean }> {
    return api.post<{ isPinned: boolean }>(`/projects/${id}/pin`)
  },

  /**
   * Get project members
   */
  async getMembers(
    projectId: string,
    params?: PaginationParams & { search?: string; role?: string }
  ): Promise<{
    members: Array<{
      id: string
      name: string
      email: string
      role: string
      joinedAt: string
    }>
    total: number
  }> {
    return api.get(`/projects/${projectId}/members`, { params })
  },

  /**
   * Add project member
   */
  async addMember(
    projectId: string,
    data: { email: string; role: string }
  ): Promise<{
    member: {
      id: string
      name: string
      email: string
      role: string
      joinedAt: string
    }
  }> {
    return api.post(`/projects/${projectId}/members`, data)
  },

  /**
   * Update member role
   */
  async updateMemberRole(
    projectId: string,
    memberId: string,
    role: string
  ): Promise<void> {
    return api.put<void>(`/projects/${projectId}/members/${memberId}`, { role })
  },

  /**
   * Remove member from project
   */
  async removeMember(projectId: string, memberId: string): Promise<void> {
    return api.delete<void>(`/projects/${projectId}/members/${memberId}`)
  },

  /**
   * Get script content
   */
  async getScript(projectId: string): Promise<{ content: string }> {
    return api.get<{ content: string }>(`/projects/${projectId}/script`)
  },

  /**
   * Update script content
   */
  async updateScript(projectId: string, content: string): Promise<void> {
    return api.put<void>(`/projects/${projectId}/script`, { content })
  },

  /**
   * Get script versions
   */
  async getScriptVersions(projectId: string): Promise<
    Array<{
      id: string
      content: string
      description: string
      createdAt: string
      createdBy: string
    }>
  > {
    return api.get(`/projects/${projectId}/versions`)
  },

  /**
   * Create script version
   */
  async createScriptVersion(
    projectId: string,
    data: { content: string; description?: string }
  ): Promise<void> {
    return api.post<void>(`/projects/${projectId}/versions`, data)
  },

  /**
   * Restore script version
   */
  async restoreScriptVersion(projectId: string, versionId: string): Promise<void> {
    return api.post<void>(`/projects/${projectId}/versions/${versionId}/restore`)
  },
}
