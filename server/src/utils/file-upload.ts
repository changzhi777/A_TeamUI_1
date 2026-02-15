/**
 * file-upload
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { nanoid } from 'nanoid'
import { env } from '../config'

export interface UploadResult {
  filename: string
  url: string
  path: string
}

export interface UploadOptions {
  maxSize?: number // bytes
  allowedTypes?: string[]
  subDir?: string
}

const DEFAULT_MAX_SIZE = 5 * 1024 * 1024 // 5MB
const DEFAULT_ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']

/**
 * Validate file upload
 */
export function validateFile(
  file: File,
  options: UploadOptions = {}
): { valid: boolean; error?: string } {
  const maxSize = options.maxSize ?? DEFAULT_MAX_SIZE
  const allowedTypes = options.allowedTypes ?? DEFAULT_ALLOWED_TYPES

  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`,
    }
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
    }
  }

  return { valid: true }
}

/**
 * Upload a file to local storage
 */
export async function uploadFile(
  file: File,
  options: UploadOptions = {}
): Promise<UploadResult> {
  // Validate file
  const validation = validateFile(file, options)
  if (!validation.valid) {
    throw new Error(validation.error)
  }

  // Create upload directory if it doesn't exist
  const subDir = options.subDir ?? 'avatars'
  const uploadDir = path.join(process.cwd(), env.upload.dir, subDir)

  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true })
  }

  // Generate unique filename
  const ext = path.extname(file.name)
  const filename = `${nanoid()}${ext}`
  const filepath = path.join(uploadDir, filename)

  // Save file
  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(filepath, buffer)

  // Generate URL
  const relativePath = path.join(env.upload.dir, subDir, filename).replace(/\\/g, '/')
  const url = `/uploads/${subDir}/${filename}`

  return {
    filename,
    url,
    path: filepath,
  }
}

/**
 * Delete a file from local storage
 */
export async function deleteFile(filePath: string): Promise<void> {
  try {
    const fs = await import('fs/promises')
    await fs.unlink(filePath)
  } catch (error) {
    console.error('Failed to delete file:', error)
    // Don't throw error if file doesn't exist
  }
}

/**
 * Extract filename from URL
 */
export function extractFilenameFromUrl(url: string): string | null {
  if (!url) return null

  const match = url.match(/\/uploads\/[^/]+\/(.+)$/)
  return match ? match[1] : null
}
