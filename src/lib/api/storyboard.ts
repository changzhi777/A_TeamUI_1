/**
 * storyboard
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import { api } from './client'
import type { StoryboardShot, PaginationParams, SortParams, CustomFieldValue } from '../types/api'

// Shot creation/update data types
export interface ShotCreateData {
  sceneNumber?: string
  seasonNumber?: number
  episodeNumber?: number
  shotSize: string
  cameraMovement: string
  duration: number
  description?: string
  dialogue?: string
  sound?: string
  customFields?: Record<string, CustomFieldValue>
}

export interface ShotUpdateData {
  sceneNumber?: string
  seasonNumber?: number
  episodeNumber?: number
  shotSize?: string
  cameraMovement?: string
  duration?: number
  description?: string
  dialogue?: string
  sound?: string
  customFields?: Record<string, CustomFieldValue>
}

// Storyboard API endpoints
export const storyboardApi = {
  /**
   * Get storyboard shots for a project
   */
  async getShots(
    projectId: string,
    params?: PaginationParams & SortParams & { sceneNumber?: string; seasonNumber?: number; episodeNumber?: number }
  ): Promise<{ shots: StoryboardShot[]; total: number }> {
    return api.get<{ shots: StoryboardShot[]; total: number }>(
      `/projects/${projectId}/shots`,
      { params }
    )
  },

  /**
   * Get single shot by ID
   */
  async getShot(shotId: string): Promise<StoryboardShot> {
    return api.get<StoryboardShot>(`/shots/${shotId}`)
  },

  /**
   * Create a new storyboard shot
   */
  async createShot(
    projectId: string,
    data: ShotCreateData
  ): Promise<StoryboardShot> {
    return api.post<StoryboardShot>(`/projects/${projectId}/shots`, data)
  },

  /**
   * Update storyboard shot
   */
  async updateShot(
    shotId: string,
    data: ShotUpdateData
  ): Promise<StoryboardShot> {
    return api.put<StoryboardShot>(`/shots/${shotId}`, data)
  },

  /**
   * Delete storyboard shot
   */
  async deleteShot(shotId: string): Promise<void> {
    return api.delete<void>(`/shots/${shotId}`)
  },

  /**
   * Batch reorder shots
   */
  async reorderShots(data: {
    shotIds: string[]
    projectId: string
  }): Promise<{ shots: StoryboardShot[] }> {
    return api.post<{ shots: StoryboardShot[] }>('/shots/reorder', data)
  },

  /**
   * Batch duplicate shots
   */
  async duplicateShots(data: {
    shotIds: string[]
    projectId: string
  }): Promise<{ shots: StoryboardShot[] }> {
    return api.post<{ shots: StoryboardShot[] }>('/shots/duplicate', data)
  },

  /**
   * Batch delete shots
   */
  async batchDeleteShots(data: { shotIds: string[] }): Promise<void> {
    return api.delete<void>('/shots/batch', { data })
  },

  /**
   * Upload/update shot image
   */
  async uploadShotImage(
    shotId: string,
    file: File
  ): Promise<{ imageUrl: string; thumbnailUrl: string }> {
    const formData = new FormData()
    formData.append('image', file)

    return api.put<{ imageUrl: string; thumbnailUrl: string }>(
      `/shots/${shotId}/image`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
  },

  /**
   * Delete shot image
   */
  async deleteShotImage(shotId: string): Promise<void> {
    return api.delete<void>(`/shots/${shotId}/image`)
  },
}
