/**
 * avatar-crop
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import { Hono } from 'hono'
import type { JWTPayloadContext } from '../../middleware'
import { uploadFile } from '../../utils/file-upload'
import { imageService } from '../../services/image'
import { sendSuccess, sendError, sendUnauthorized, sendValidationError, sendInternalError } from '../../utils/response'

export const uploadRouter = new Hono<JWTPayloadContext>()

// POST /api/upload/avatar/crop - Crop and upload avatar
uploadRouter.post('/avatar/crop', async (c) => {
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

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return sendError(c, 'Only image files are allowed (JPEG, PNG, GIF, WebP)', 400)
    }

    // Parse crop data
    let crop: {
      x?: number
      y?: number
      width?: number
      height?: number
      size?: number
    } = {}

    if (cropDataStr) {
      try {
        crop = JSON.parse(cropDataStr)
      } catch (e) {
        return sendError(c, 'Invalid crop data format', 400)
      }
    }

    // First upload to temp location
    const uploadResult = await uploadFile(file, {
      maxSize: 2 * 1024 * 1024, // 2MB
      allowedTypes,
      subDir: 'avatars/temp',
    })

    // Generate cropped avatar
    const targetSize = crop.size || 200
    const croppedFilename = `avatar_${user.userId}_${Date.now()}.jpg`
    const croppedPath = `${process.cwd()}/uploads/avatars/${croppedFilename}`

    // Get metadata and calculate crop dimensions
    const metadata = await imageService.getMetadata(uploadResult.path)

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

    // Extract crop area first
    const tempCropPath = `${process.cwd()}/uploads/avatars/temp_crop_${Date.now()}.jpg`

    try {
      // Crop to specified area
      await imageService.cropToSquare(
        uploadResult.path,
        tempCropPath,
        Math.max(cropWidth, cropHeight),
        95
      )

      // Then resize to target size
      await imageService.resize(
        tempCropPath,
        croppedPath,
        { width: targetSize, height: targetSize },
        { quality: 90 }
      )

      // Clean up temp files
      const fs = await import('fs/promises')
      await fs.unlink(uploadResult.path).catch(() => {})
      await fs.unlink(tempCropPath).catch(() => {})

      // Return URL
      return sendSuccess(c, {
        url: `/uploads/avatars/${croppedFilename}`,
        filename: croppedFilename,
      })
    } catch (cropError) {
      console.error('Avatar crop error:', cropError)

      // Fallback: use original resized
      await imageService.resize(
        uploadResult.path,
        croppedPath,
        { width: targetSize, height: targetSize },
        { quality: 90 }
      )

      return sendSuccess(c, {
        url: `/uploads/avatars/${croppedFilename}`,
        filename: croppedFilename,
      })
    }
  } catch (error) {
    console.error('Avatar crop upload error:', error)
    if (error instanceof Error) {
      return sendError(c, error.message, 400)
    }
    return sendInternalError(c)
  }
})
