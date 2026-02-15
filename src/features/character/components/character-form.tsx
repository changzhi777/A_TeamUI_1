/**
 * character-form
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

/**
 * Character Form Component
 * 角色创建/编辑表单组件
 */

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { X, Plus, Copy, CheckCircle2, Sparkles, Loader2 } from 'lucide-react'
import type { Character, CharacterAttributes, CharacterStyle } from '@/lib/types/character'
import { useCharacterStore } from '@/stores/character-store'
import { useProjectStore } from '@/stores/project-store'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PromptOptimizer } from './prompt-optimizer'
import { CharacterStyleSelect } from './character-style-select'
import { aiApi } from '@/lib/api/ai'

const formSchema = z.object({
  name: z.string().min(1, '请输入角色名称').max(50, '名称不能超过50个字符'),
  description: z.string().max(500, '描述不能超过500个字符').optional(),
  personality: z.string().max(1000, '个性描述不能超过1000个字符').optional(),
  basePrompt: z.string().max(1000, '提示词不能超过1000个字符').optional(),
})

type FormValues = z.infer<typeof formSchema>

interface CharacterFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  character?: Character | null
  projectId?: string
  onSuccess?: (characterId: string) => void
}

export function CharacterForm({
  open,
  onOpenChange,
  character,
  projectId,
  onSuccess,
}: CharacterFormProps) {
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [attributes, setAttributes] = useState<CharacterAttributes>({})
  const [customAttributeKey, setCustomAttributeKey] = useState('')
  const [customAttributeValue, setCustomAttributeValue] = useState('')
  const [codeCopied, setCodeCopied] = useState(false)
  const [style, setStyle] = useState<CharacterStyle | undefined>()
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(projectId)

  const createCharacter = useCharacterStore((state) => state.createCharacter)
  const updateCharacter = useCharacterStore((state) => state.updateCharacter)
  const projects = useProjectStore((state) => state.projects)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      personality: '',
      basePrompt: '',
    },
  })

  // 重置表单
  useEffect(() => {
    if (open) {
      if (character) {
        form.reset({
          name: character.name,
          description: character.description || '',
          personality: character.personality || '',
          basePrompt: character.basePrompt || '',
        })
        setTags(character.tags || [])
        setAttributes(character.attributes || {})
        setStyle(character.style)
        setSelectedProjectId(character.projectId || projectId)
      } else {
        form.reset({
          name: '',
          description: '',
          personality: '',
          basePrompt: '',
        })
        setTags([])
        setAttributes({})
        setStyle(undefined)
        setSelectedProjectId(projectId)
      }
    }
  }, [open, character, form, projectId])

  // 添加标签
  const handleAddTag = () => {
    const trimmed = tagInput.trim()
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed])
      setTagInput('')
    }
  }

  // 删除标签
  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  // 添加自定义属性
  const handleAddCustomAttribute = () => {
    const key = customAttributeKey.trim()
    const value = customAttributeValue.trim()
    if (key && value) {
      setAttributes({ ...attributes, [key]: value })
      setCustomAttributeKey('')
      setCustomAttributeValue('')
    }
  }

  // 删除属性
  const handleRemoveAttribute = (key: string) => {
    const newAttrs = { ...attributes }
    delete newAttrs[key]
    setAttributes(newAttrs)
  }

  // 更新预设属性
  const handleUpdatePresetAttribute = (key: string, value: string) => {
    setAttributes({ ...attributes, [key]: value })
  }

  // 提交表单
  const onSubmit = (values: FormValues) => {
    try {
      if (character) {
        // 更新现有角色
        updateCharacter(character.id, {
          name: values.name,
          description: values.description,
          personality: values.personality,
          basePrompt: values.basePrompt,
          tags,
          attributes,
          style,
          projectId: selectedProjectId,
        })
        toast.success('角色已更新')
        onSuccess?.(character.id)
      } else {
        // 创建新角色
        const id = createCharacter({
          name: values.name,
          description: values.description,
          personality: values.personality,
          basePrompt: values.basePrompt,
          tags,
          projectId: selectedProjectId,
        })
        // 更新属性和风格
        if (Object.keys(attributes).length > 0 || style) {
          updateCharacter(id, { attributes, style })
        }
        toast.success('角色已创建')
        onSuccess?.(id)
      }
      onOpenChange(false)
    } catch (error) {
      toast.error('操作失败，请重试')
    }
  }

  // 复制角色编号
  const handleCopyCode = () => {
    if (character?.code) {
      navigator.clipboard.writeText(character.code)
      setCodeCopied(true)
      toast.success('角色编号已复制')
      setTimeout(() => setCodeCopied(false), 2000)
    }
  }

  // 根据表单信息自动生成提示词
  const handleAutoGeneratePrompt = async () => {
    const name = form.getValues('name')
    const description = form.getValues('description') || ''
    const personality = form.getValues('personality') || ''

    // 检查是否有足够的信息生成提示词
    const hasBasicInfo = name || description || personality || tags.length > 0 || Object.keys(attributes).length > 0

    if (!hasBasicInfo) {
      toast.error('请先填写角色信息（名称、简介、个性、标签或属性）')
      return
    }

    setIsGeneratingPrompt(true)

    try {
      // 构建生成提示词的请求
      const prompt = buildAutoGeneratePrompt(name, description, personality, tags, attributes, style)

      // 调用 AI API 生成提示词
      const result = await aiApi.generateText(prompt)

      if (result) {
        form.setValue('basePrompt', result)
        toast.success('提示词已自动生成')
      } else {
        // 如果 AI 生成失败，使用本地生成
        const localPrompt = buildLocalAutoPrompt(name, description, personality, tags, attributes, style)
        form.setValue('basePrompt', localPrompt)
        toast.success('提示词已生成（本地模式）')
      }
    } catch (error) {
      console.error('Auto generate prompt error:', error)
      // 使用本地生成作为后备
      const localPrompt = buildLocalAutoPrompt(name, description, personality, tags, attributes, style)
      form.setValue('basePrompt', localPrompt)
      toast.success('提示词已生成（本地模式）')
    } finally {
      setIsGeneratingPrompt(false)
    }
  }

  // 预设属性字段
  const presetAttributes = [
    { key: 'age', label: '年龄' },
    { key: 'gender', label: '性别' },
    { key: 'height', label: '身高' },
    { key: 'occupation', label: '职业' },
    { key: 'hairColor', label: '发色' },
    { key: 'eyeColor', label: '瞳色' },
    { key: 'bodyType', label: '体型' },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{character ? '编辑角色' : '创建角色'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* 角色编号（仅编辑模式显示） */}
          {character && (
            <div className="space-y-2">
              <Label>角色编号</Label>
              <div className="flex items-center gap-2">
                <div className="flex-1 px-3 py-2 bg-muted rounded-md font-mono text-sm">
                  {character.code}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleCopyCode}
                  title="复制编号"
                >
                  {codeCopied ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                角色编号由系统自动生成，用于唯一标识角色
              </p>
            </div>
          )}

          {/* 基本信息 */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">基本信息</h4>

            {/* 项目名称选择 */}
            <div className="space-y-2">
              <Label htmlFor="project">项目名称（剧本）</Label>
              <Select
                value={selectedProjectId || '__none__'}
                onValueChange={(v) => setSelectedProjectId(v === '__none__' ? undefined : v)}
              >
                <SelectTrigger id="project">
                  <SelectValue placeholder="选择关联项目（可选）" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">
                    <span className="text-muted-foreground">不关联项目</span>
                  </SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      <div className="flex items-center gap-2">
                        <span>{project.name}</span>
                        <span className="text-xs text-muted-foreground font-mono">
                          #{project.id.slice(0, 8).toUpperCase()}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                选择项目后，角色将与该项目关联，方便管理和筛选
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">
                角色名称 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="输入角色名称"
                {...form.register('name')}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">角色简介</Label>
              <Textarea
                id="description"
                placeholder="简要描述这个角色的背景和特点..."
                rows={3}
                {...form.register('description')}
              />
              {form.formState.errors.description && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="personality">个性描述</Label>
              <Textarea
                id="personality"
                placeholder="描述角色的性格特点、行为习惯等..."
                rows={4}
                {...form.register('personality')}
              />
              {form.formState.errors.personality && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.personality.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">标签</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="输入标签后按回车添加"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddTag()
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={handleAddTag}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => handleRemoveTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 角色属性 */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">角色属性</h4>

            <div className="grid grid-cols-2 gap-3">
              {presetAttributes.map(({ key, label }) => (
                <div key={key} className="space-y-1">
                  <Label htmlFor={`attr-${key}`} className="text-xs">
                    {label}
                  </Label>
                  <Input
                    id={`attr-${key}`}
                    placeholder={`输入${label}`}
                    value={attributes[key] || ''}
                    onChange={(e) => handleUpdatePresetAttribute(key, e.target.value)}
                  />
                </div>
              ))}
            </div>

            {/* 自定义属性 */}
            <div className="space-y-2 pt-2 border-t">
              <Label className="text-xs">自定义属性</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="属性名"
                  value={customAttributeKey}
                  onChange={(e) => setCustomAttributeKey(e.target.value)}
                  className="flex-1"
                />
                <Input
                  placeholder="属性值"
                  value={customAttributeValue}
                  onChange={(e) => setCustomAttributeValue(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddCustomAttribute}
                  disabled={!customAttributeKey.trim() || !customAttributeValue.trim()}
                >
                  添加
                </Button>
              </div>

              {/* 已添加的自定义属性 */}
              {Object.entries(attributes)
                .filter(([key]) => !presetAttributes.some((p) => p.key === key))
                .map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between text-sm bg-muted px-3 py-2 rounded">
                    <span>
                      <strong>{key}:</strong> {value}
                    </span>
                    <X
                      className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-foreground"
                      onClick={() => handleRemoveAttribute(key)}
                    />
                  </div>
                ))}
            </div>
          </div>

          {/* 生成提示词 */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">生成提示词</h4>

            {/* 人物风格选择 */}
            <CharacterStyleSelect
              value={style}
              onChange={setStyle}
            />

            {/* 按钮区域 */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              {/* 自动生成按钮 */}
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleAutoGeneratePrompt}
                disabled={isGeneratingPrompt}
                className="gap-2"
              >
                {isGeneratingPrompt ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    自动生成
                  </>
                )}
              </Button>

              {/* AI 优化按钮 */}
              <PromptOptimizer
                key={open ? 'open' : 'closed'}
                currentPrompt={form.watch('basePrompt')}
                onPromptChange={(prompt) => form.setValue('basePrompt', prompt)}
                characterName={form.watch('name')}
                style={style}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="basePrompt">基础提示词</Label>
              <Textarea
                id="basePrompt"
                placeholder="描述角色的外观特征，用于 AI 生成图片。例如：一个年轻女性，长黑发，蓝眼睛，穿着白色连衣裙..."
                rows={4}
                {...form.register('basePrompt')}
              />
              <p className="text-xs text-muted-foreground">
                点击"自动生成"可根据上方填写的角色信息自动生成提示词，或使用"AI优化"对现有提示词进行优化。
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit">{character ? '保存更改' : '创建角色'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/**
 * 构建自动生成提示词的 AI 请求
 */
function buildAutoGeneratePrompt(
  name: string,
  description: string,
  personality: string,
  tags: string[],
  attributes: CharacterAttributes,
  style?: CharacterStyle
): string {
  // 预设属性的中文标签
  const attributeLabels: Record<string, string> = {
    age: '年龄',
    gender: '性别',
    height: '身高',
    occupation: '职业',
    hairColor: '发色',
    eyeColor: '瞳色',
    bodyType: '体型',
  }

  // 构建属性描述
  const attributesDesc = Object.entries(attributes)
    .filter(([_, value]) => value)
    .map(([key, value]) => {
      const label = attributeLabels[key] || key
      return `${label}: ${value}`
    })
    .join('\n')

  // 获取风格关键词
  const styleKeywords = style ? getStyleKeywords(style) : ''

  return `You are a professional AI image prompt engineer. Please generate a character description prompt for image generation based on the following character information.

Requirements:
1. Generate a detailed prompt describing the character's visual appearance (use Chinese for description)
2. Focus on physical features: body type, hair, eyes, clothing, accessories
3. Include personality traits that affect visual appearance (expression, posture, vibe)
4. Make it suitable for AI image generation models (Stable Diffusion, DALL-E, etc.)
5. Keep it concise (100-150 words)
6. Format: [English style keywords], [Chinese character description], [English quality keywords]
7. Do NOT include character name in the prompt
${styleKeywords ? `8. Start with these style keywords: ${styleKeywords}` : ''}

Character Information:
${description ? `- Description: ${description}` : ''}
${personality ? `- Personality: ${personality}` : ''}
${tags.length > 0 ? `- Tags: ${tags.join(', ')}` : ''}
${attributesDesc ? `- Attributes:\n${attributesDesc}` : ''}

Please output only the prompt following the format above, no explanations needed.`
}

/**
 * 本地自动生成提示词（当 AI 不可用时使用）
 * 基础信息使用中文，风格关键词使用英文
 */
function buildLocalAutoPrompt(
  _name: string,
  description: string,
  personality: string,
  tags: string[],
  attributes: CharacterAttributes,
  style?: CharacterStyle
): string {
  const parts: string[] = []
  const chineseParts: string[] = []

  // 添加风格关键词（英文）
  const styleKeywords = style ? getStyleKeywords(style) : ''
  if (styleKeywords) {
    parts.push(styleKeywords)
  }

  // 构建中文属性描述
  const attrParts: string[] = []
  if (attributes.age) attrParts.push(`${attributes.age}岁`)
  if (attributes.gender) attrParts.push(attributes.gender)
  if (attributes.height) attrParts.push(`身高${attributes.height}`)
  if (attributes.bodyType) attrParts.push(`${attributes.bodyType}体型`)
  if (attributes.hairColor) attrParts.push(`${attributes.hairColor}头发`)
  if (attributes.eyeColor) attrParts.push(`${attributes.eyeColor}眼睛`)
  if (attributes.occupation) attrParts.push(`职业是${attributes.occupation}`)

  // 添加自定义属性
  const presetKeys = ['age', 'gender', 'height', 'bodyType', 'hairColor', 'eyeColor', 'occupation']
  Object.entries(attributes)
    .filter(([key, value]) => value && !presetKeys.includes(key))
    .forEach(([key, value]) => {
      attrParts.push(`${key}: ${value}`)
    })

  if (attrParts.length > 0) {
    chineseParts.push(attrParts.join('，'))
  }

  // 添加描述
  if (description) {
    chineseParts.push(description)
  }

  // 添加个性（转换为视觉描述）
  if (personality) {
    chineseParts.push(`${personality.split(/[，,。.]/)[0]}的表情`)
  }

  // 添加标签
  if (tags.length > 0) {
    chineseParts.push(`特点：${tags.join('、')}`)
  }

  // 如果有中文描述，添加到提示词
  if (chineseParts.length > 0) {
    parts.push(chineseParts.join('，'))
  }

  // 添加英文质量关键词
  parts.push('high quality, detailed, professional character design, clean background')

  return parts.join(', ')
}

/**
 * 获取风格关键词
 */
function getStyleKeywords(style: CharacterStyle): string {
  const keywords: Record<CharacterStyle, string> = {
    anime: 'anime style, anime art, Japanese animation style, vibrant colors, expressive features, cel shading',
    ghibli: 'Studio Ghibli style, Miyazaki art style, hand-drawn animation, watercolor background, whimsical atmosphere, soft lighting, detailed nature',
    cinematic: 'cinematic, photorealistic, hyper-realistic, film photography, dramatic lighting, 8K resolution, professional photography, depth of field',
  }
  return keywords[style] || ''
}
