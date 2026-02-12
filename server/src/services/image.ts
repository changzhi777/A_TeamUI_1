import sharp from 'sharp'
import { mkdir } from 'fs/promises'
import { join, dirname } from 'path'
import { existsSync } from 'fs'

export interface ImageDimensions {
  width: number
  height: number
}

export interface ThumbnailOptions {
  width?: number
  height?: number
  quality?: number
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside'
}

export const ThumbnailSize = {
  SMALL: { width: 150, height: 150 },
  MEDIUM: { width: 300, height: 300 },
  LARGE: { width: 600, height: 600 },
} as const

/**
 * Image processing service
 */
export class ImageService {
  private uploadsDir: string

  constructor() {
    this.uploadsDir = join(process.cwd(), 'uploads')
  }

  /**
   * Generate thumbnail for an image
   */
  async generateThumbnail(
    inputPath: string,
    outputPath: string,
    options: ThumbnailOptions = {}
  ): Promise<void> {
    const {
      width = 300,
      height = 300,
      quality = 80,
      fit = 'cover',
    } = options

    // Ensure output directory exists
    const outputDir = dirname(outputPath)
    if (!existsSync(outputDir)) {
      await mkdir(outputDir, { recursive: true })
    }

    await sharp(inputPath)
      .resize(width, height, {
        fit,
        position: 'center',
      })
      .jpeg({ quality })
      .toFile(outputPath)
  }

  /**
   * Generate multiple thumbnail sizes
   */
  async generateThumbnails(
    inputPath: string,
    relativePath: string
  ): Promise<Record<string, string>> {
    const thumbnails: Record<string, string> = []

    for (const [size, dimensions] of Object.entries(ThumbnailSize)) {
      const thumbnailPath = join(this.uploadsDir, 'thumbnails', size.toLowerCase(), relativePath)

      try {
        await this.generateThumbnail(inputPath, thumbnailPath, {
          ...dimensions,
          quality: size === 'SMALL' ? 70 : 80,
        })

        // Return URL path (not filesystem path)
        thumbnails[size] = `/uploads/thumbnails/${size.toLowerCase()}/${relativePath}`
      } catch (error) {
        console.error(`Failed to generate ${size} thumbnail:`, error)
      }
    }

    return thumbnails
  }

  /**
   * Get image metadata
   */
  async getMetadata(imagePath: string): Promise<ImageDimensions> {
    const metadata = await sharp(imagePath).metadata()
    return {
      width: metadata.width || 0,
      height: metadata.height || 0,
    }
  }

  /**
   * Resize image to specific dimensions
   */
  async resize(
    inputPath: string,
    outputPath: string,
    dimensions: ImageDimensions,
    options: { quality?: number; fit?: sharp.FitEnum } = {}
  ): Promise<void> {
    const { quality = 90, fit = 'cover' } = options

    // Ensure output directory exists
    const outputDir = dirname(outputPath)
    if (!existsSync(outputDir)) {
      await mkdir(outputDir, { recursive: true })
    }

    await sharp(inputPath)
      .resize(dimensions.width, dimensions.height, {
        fit,
        position: 'center',
      })
      .jpeg({ quality })
      .toFile(outputPath)
  }

  /**
   * Crop image to square (for avatars)
   */
  async cropToSquare(
    inputPath: string,
    outputPath: string,
    size: number = 200,
    quality: number = 90
  ): Promise<void> {
    // Ensure output directory exists
    const outputDir = dirname(outputPath)
    if (!existsSync(outputDir)) {
      await mkdir(outputDir, { recursive: true })
    }

    // Get metadata to determine crop dimensions
    const metadata = await sharp(inputPath).metadata()
    const minDimension = Math.min(metadata.width || 0, metadata.height || 0)

    await sharp(inputPath)
      .resize(minDimension, minDimension, {
        fit: 'cover',
        position: 'center',
      })
      .resize(size, size, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({ quality })
      .toFile(outputPath)
  }

  /**
   * Optimize image (reduce file size without changing dimensions)
   */
  async optimize(
    inputPath: string,
    outputPath: string,
    quality: number = 85
  ): Promise<void> {
    // Ensure output directory exists
    const outputDir = dirname(outputPath)
    if (!existsSync(outputDir)) {
      await mkdir(outputDir, { recursive: true })
    }

    await sharp(inputPath)
      .jpeg({ quality })
      .toFile(outputPath)
  }

  /**
   * Convert image format
   */
  async convertFormat(
    inputPath: string,
    outputPath: string,
    format: 'jpeg' | 'png' | 'webp'
  ): Promise<void> {
    // Ensure output directory exists
    const outputDir = dirname(outputPath)
    if (!existsSync(outputDir)) {
      await mkdir(outputDir, { recursive: true })
    }

    const pipeline = sharp(inputPath)

    switch (format) {
      case 'jpeg':
        await pipeline.jpeg().toFile(outputPath)
        break
      case 'png':
        await pipeline.png().toFile(outputPath)
        break
      case 'webp':
        await pipeline.webp().toFile(outputPath)
        break
    }
  }
}

// Export singleton instance
export const imageService = new ImageService()
