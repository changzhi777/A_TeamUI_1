/**
 * index
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import { Hono } from 'hono'
import type { JWTPayloadContext } from '../../middleware'
import { db } from '../../config/database'
import { users } from '../../models'
import { eq } from 'drizzle-orm'
import {
  sendSuccess,
  sendError,
  sendUnauthorized,
  sendValidationError,
  sendInternalError,
} from '../../utils/response'
import { uploadFile, deleteFile, extractFilenameFromUrl } from '../../utils/file-upload'
import { imageService } from '../../services/image'

export const uploadRouter = new Hono<JWTPayloadContext>()

// POST /api/upload/avatar - Upload user avatar
uploadRouter.post('/avatar', async (c) => {
  try {
    const user = c.get('user')
    if (!user) {
      return sendUnauthorized(c)
    }

    // Parse form data
    const formData = await c.req.formData()
    const file = formData.get('file') as File | null
    const cropDataStr = formData.get('crop') as string | null

    if (!file) {
      return sendValidationError(c, { file: ['No file provided'] })
    }

    // Upload file to temp location first
    const uploadResult = await uploadFile(file, {
      maxSize: 2 * 1024 * 1024, // 2MB for avatars
      allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
      subDir: 'avatars/temp',
    })

    let finalUrl = uploadResult.url
    const filename = uploadResult.filename

    // If crop data provided, crop the image
    if (cropDataStr) {
      try {
        const crop = JSON.parse(cropDataStr) as {
          x?: number
          y?: number
          width?: number
          height?: number
          size?: number
        }

        const targetSize = crop.size || 200

        // Get image metadata
        const metadata = await imageService.getMetadata(uploadResult.path)

        // Calculate crop dimensions
        let cropX = crop.x ?? 0
        let cropY = crop.y ?? 0
        let cropWidth = crop.width ?? metadata.width
        let cropHeight = crop.height ?? metadata.height

        // If no specific crop, center crop to square
        if (!crop.x && !crop.y && !crop.width && !crop.height) {
          const minDimension = Math.min(metadata.width, metadata.height)
          cropX = Math.floor((metadata.width - minDimension) / 2)
          cropY = Math.floor((metadata.height - minDimension) / 2)
          cropWidth = minDimension
          cropHeight = minDimension
        }

        // Generate cropped avatar
        const croppedFilename = `avatar_${user.userId}_${Date.now()}.jpg`
        const croppedPath = `${process.cwd()}/uploads/avatars/${croppedFilename}`

        await imageService.cropToSquare(
          uploadResult.path,
          croppedPath,
          targetSize,
          90 // Quality
        )

        finalUrl = `/uploads/avatars/${croppedFilename}`

        // Delete temp file
        const fs = await import('fs/promises')
        await fs.unlink(uploadResult.path).catch(() => {})
      } catch (cropError) {
        console.error('Avatar crop error:', cropError)
        // Use original if crop fails
      }
    } else {
      // No crop, just move from temp to avatars
      const finalPath = `${process.cwd()}/uploads/avatars/${filename}`
      const fs = await import('fs/promises')
      await fs.rename(uploadResult.path, finalPath).catch(() => {})
      finalUrl = `/uploads/avatars/${filename}`
    }

    // Get current user to delete old avatar
    const currentUser = await db
      .select()
      .from(users)
      .where(eq(users.id, user.userId))
      .get()

    if (currentUser?.avatar) {
      // Extract old filename and delete
      const oldFilename = extractFilenameFromUrl(currentUser.avatar)
      if (oldFilename) {
        const oldPath = `${process.cwd()}/uploads/avatars/${oldFilename}`
        await deleteFile(oldPath).catch(() => {
          // Ignore errors when deleting old file
        })
      }
    }

    // Update user avatar in database
    await db
      .update(users)
      .set({
        avatar: finalUrl,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, user.userId))

    return sendSuccess(c, {
      url: finalUrl,
      filename,
    })
  } catch (error) {
    console.error('Avatar upload error:', error)
    if (error instanceof Error) {
      return sendError(c, error.message, 400)
    }
    return sendInternalError(c)
  }
})

// DELETE /api/upload/avatar - Delete current user's avatar
uploadRouter.delete('/avatar', async (c) => {
  try {
    const user = c.get('user')
    if (!user) {
      return sendUnauthorized(c)
    }

    // Get current user
    const currentUser = await db
      .select({ avatar: users.avatar })
      .from(users)
      .where(eq(users.id, user.userId))
      .get()

    if (!currentUser) {
      return sendError(c, 'User not found', 404)
    }

    // Delete file from filesystem
    if (currentUser.avatar) {
      const filename = extractFilenameFromUrl(currentUser.avatar)
      if (filename) {
        const filePath = `${process.cwd()}/uploads/avatars/${filename}`
        await deleteFile(filePath)
      }
    }

    // Update database
    await db
      .update(users)
      .set({
        avatar: null,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, user.userId))

    return sendSuccess(c, { message: 'Avatar deleted successfully' })
  } catch (error) {
    console.error('Avatar delete error:', error)
    return sendInternalError(c)
  }
})

// POST /api/upload/image - Upload general image (for storyboards, etc.)
uploadRouter.post('/image', async (c) => {
  try {
    const user = c.get('user')
    if (!user) {
      return sendUnauthorized(c)
    }

    // Parse form data
    const formData = await c.req.formData()
    const file = formData.get('file') as File | null
    const type = formData.get('type') as string | null // 'storyboard' or other

    if (!file) {
      return sendValidationError(c, { file: ['No file provided'] })
    }

    // Upload file
    const result = await uploadFile(file, {
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
      subDir: type ?? 'images',
    })

    return sendSuccess(c, {
      url: result.url,
      filename: result.filename,
    })
  } catch (error) {
    console.error('Image upload error:', error)
    if (error instanceof Error) {
      return sendError(c, error.message, 400)
    }
    return sendInternalError(c)
  }
})
