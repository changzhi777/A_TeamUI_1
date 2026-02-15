/**
 * character-export
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

/**
 * Character Export Service
 * 角色文件夹导出服务
 */

import JSZip from 'jszip'
import type { Character, CharacterImage, CostumeVariant, ViewType } from '@/lib/types/character'
import { VIEW_TYPE_LABELS } from '@/lib/types/character'
import { filesApi } from '@/lib/api/files'
import { toast } from 'sonner'

/**
 * 视角文件名映射
 */
const VIEW_FILENAMES: Record<ViewType, string> = {
  front: 'front',
  side: 'side',
  back: 'back',
  threeQuarter: 'three-quarter',
}

/**
 * 获取图片 Blob（优先使用缓存）
 * @param url 图片 URL
 * @returns Blob 数据
 */
async function getImageAsBlob(url: string): Promise<Blob> {
  // 优先从缓存获取
  const cachedResult = await filesApi.getFileByUrl(url)
  if (cachedResult?.blob) {
    return cachedResult.blob
  }

  // 缓存不存在，直接下载
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.status}`)
  }
  return response.blob()
}

/**
 * 获取文件扩展名
 * @param url 图片 URL
 * @returns 扩展名（如 .png, .jpg）
 */
function getImageExtension(url: string): string {
  const match = url.match(/\.(png|jpe?g|webp|gif)(\?|$)/i)
  return match ? `.${match[1].toLowerCase()}` : '.png'
}

/**
 * 角色导出数据结构
 */
interface CharacterExportData {
  info: {
    code: string
    name: string
    description: string
    personality: string
    attributes: Record<string, string | undefined>
    tags: string[]
    createdAt: string
    updatedAt: string
    projectId?: string
  }
  prompt: {
    basePrompt: string
    generatedPrompts: {
      views: Record<string, { prompt: string; generatedAt: string } | undefined>
      costumes: Array<{
        id: string
        name: string
        prompt: string
        generatedAt: string
      }>
    }
  }
  voice?: {
    style: string
    sampleText?: string
  }
}

/**
 * 将角色数据转换为导出格式
 */
function createExportData(character: Character): CharacterExportData {
  return {
    info: {
      code: character.code,
      name: character.name,
      description: character.description,
      personality: character.personality,
      attributes: character.attributes,
      tags: character.tags,
      createdAt: character.createdAt,
      updatedAt: character.updatedAt,
      projectId: character.projectId,
    },
    prompt: {
      basePrompt: character.basePrompt,
      generatedPrompts: {
        views: {
          front: character.views.front
            ? { prompt: character.views.front.prompt, generatedAt: character.views.front.generatedAt }
            : undefined,
          side: character.views.side
            ? { prompt: character.views.side.prompt, generatedAt: character.views.side.generatedAt }
            : undefined,
          back: character.views.back
            ? { prompt: character.views.back.prompt, generatedAt: character.views.back.generatedAt }
            : undefined,
          threeQuarter: character.views.threeQuarter
            ? { prompt: character.views.threeQuarter.prompt, generatedAt: character.views.threeQuarter.generatedAt }
            : undefined,
        },
        costumes: character.costumes.map((c) => ({
          id: c.id,
          name: c.name,
          prompt: c.prompt,
          generatedAt: c.generatedAt,
        })),
      },
    },
    voice: character.voice
      ? {
          style: character.voice.style,
          sampleText: character.voice.sampleText,
        }
      : undefined,
  }
}

/**
 * 导出角色为 ZIP 文件
 * @param character 角色数据
 * @returns Promise<void>
 */
export async function exportCharacterAsZip(character: Character): Promise<void> {
  const zip = new JSZip()

  // 创建根目录（使用角色编号）
  const rootFolder = zip.folder(character.code)
  if (!rootFolder) {
    throw new Error('Failed to create root folder')
  }

  // 1. 添加 info.json
  const exportData = createExportData(character)
  rootFolder.file('info.json', JSON.stringify(exportData.info, null, 2))

  // 2. 添加 prompt.json
  rootFolder.file('prompt.json', JSON.stringify(exportData.prompt, null, 2))

  // 3. 下载并添加视角图片
  const viewsFolder = rootFolder.folder('views')
  if (viewsFolder) {
    const viewEntries = Object.entries(character.views) as [ViewType, CharacterImage | undefined][]
    const viewPromises = viewEntries.map(async ([viewType, image]) => {
      if (!image?.url) return

      try {
        const blob = await getImageAsBlob(image.url)
        const ext = getImageExtension(image.url)
        const filename = `${VIEW_FILENAMES[viewType]}${ext}`
        viewsFolder.file(filename, blob)
      } catch (error) {
        console.warn(`Failed to download ${viewType} view image:`, error)
      }
    })
    await Promise.all(viewPromises)
  }

  // 4. 下载并添加服装变体图片
  if (character.costumes.length > 0) {
    const costumesFolder = rootFolder.folder('costumes')
    if (costumesFolder) {
      const costumePromises = character.costumes.map(async (costume, index) => {
        if (!costume.imageUrl) return

        try {
          const blob = await getImageAsBlob(costume.imageUrl)
          const ext = getImageExtension(costume.imageUrl)
          const filename = `costume-${index + 1}${ext}`
          costumesFolder.file(filename, blob)
        } catch (error) {
          console.warn(`Failed to download costume ${index + 1} image:`, error)
        }
      })
      await Promise.all(costumePromises)
    }
  }

  // 5. 下载并添加语音样本
  if (character.voice?.sampleUrl) {
    const voiceFolder = rootFolder.folder('voice')
    if (voiceFolder) {
      try {
        const blob = await getImageAsBlob(character.voice.sampleUrl)
        const ext = character.voice.sampleUrl.match(/\.(wav|mp3|ogg)(\?|$)/i)?.[1] || 'wav'
        voiceFolder.file(`sample.${ext}`, blob)
      } catch (error) {
        console.warn('Failed to download voice sample:', error)
      }
    }
  }

  // 6. 生成并下载 ZIP 文件
  const content = await zip.generateAsync({ type: 'blob' })
  const url = URL.createObjectURL(content)
  const link = document.createElement('a')
  link.href = url
  link.download = `${character.code}.zip`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  toast.success(`角色 "${character.name}" 已导出为文件夹`)
}

/**
 * 批量导出多个角色
 * @param characters 角色列表
 */
export async function exportCharactersAsZip(characters: Character[]): Promise<void> {
  if (characters.length === 0) {
    toast.warning('没有可导出的角色')
    return
  }

  if (characters.length === 1) {
    await exportCharacterAsZip(characters[0])
    return
  }

  // 多个角色导出到一个 ZIP
  const zip = new JSZip()

  for (const character of characters) {
    const characterFolder = zip.folder(character.code)
    if (!characterFolder) continue

    // 添加 info.json
    const exportData = createExportData(character)
    characterFolder.file('info.json', JSON.stringify(exportData.info, null, 2))
    characterFolder.file('prompt.json', JSON.stringify(exportData.prompt, null, 2))

    // 下载视角图片
    const viewsFolder = characterFolder.folder('views')
    if (viewsFolder) {
      const viewEntries = Object.entries(character.views) as [ViewType, CharacterImage | undefined][]
      for (const [viewType, image] of viewEntries) {
        if (!image?.url) continue
        try {
          const blob = await getImageAsBlob(image.url)
          const ext = getImageExtension(image.url)
          viewsFolder.file(`${VIEW_FILENAMES[viewType]}${ext}`, blob)
        } catch (error) {
          console.warn(`Failed to download ${viewType} view:`, error)
        }
      }
    }

    // 下载服装图片
    if (character.costumes.length > 0) {
      const costumesFolder = characterFolder.folder('costumes')
      if (costumesFolder) {
        for (let i = 0; i < character.costumes.length; i++) {
          const costume = character.costumes[i]
          if (!costume.imageUrl) continue
          try {
            const blob = await getImageAsBlob(costume.imageUrl)
            const ext = getImageExtension(costume.imageUrl)
            costumesFolder.file(`costume-${i + 1}${ext}`, blob)
          } catch (error) {
            console.warn(`Failed to download costume ${i + 1}:`, error)
          }
        }
      }
    }

    // 下载语音样本
    if (character.voice?.sampleUrl) {
      const voiceFolder = characterFolder.folder('voice')
      if (voiceFolder) {
        try {
          const blob = await getImageAsBlob(character.voice.sampleUrl)
          const ext = character.voice.sampleUrl.match(/\.(wav|mp3|ogg)(\?|$)/i)?.[1] || 'wav'
          voiceFolder.file(`sample.${ext}`, blob)
        } catch (error) {
          console.warn('Failed to download voice sample:', error)
        }
      }
    }
  }

  // 生成并下载 ZIP
  const content = await zip.generateAsync({ type: 'blob' })
  const url = URL.createObjectURL(content)
  const link = document.createElement('a')
  link.href = url
  link.download = `characters-${Date.now()}.zip`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  toast.success(`已导出 ${characters.length} 个角色`)
}
