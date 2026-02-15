/**
 * upload
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import { api } from './client'

export interface UploadResult {
  url: string
  filename: string
}

/**
 * Upload user avatar
 */
export async function uploadAvatar(file: File): Promise<UploadResult> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/upload/avatar`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${api.getAccessToken()}`,
    },
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Upload failed')
  }

  const data = await response.json()
  return data.data
}

/**
 * Delete current user's avatar
 */
export async function deleteAvatar(): Promise<{ message: string }> {
  return api.delete('/upload/avatar')
}

/**
 * Upload general image (for storyboards, etc.)
 */
export async function uploadImage(file: File, type?: string): Promise<UploadResult> {
  const formData = new FormData()
  formData.append('file', file)
  if (type) {
    formData.append('type', type)
  }

  const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/upload/image`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${api.getAccessToken()}`,
    },
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Upload failed')
  }

  const data = await response.json()
  return data.data
}
