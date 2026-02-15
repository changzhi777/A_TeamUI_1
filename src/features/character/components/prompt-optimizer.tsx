/**
 * prompt-optimizer
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

/**
 * Prompt Optimizer Component
 * 提示词优化组件 - 基于六维角色模板 + AI 一键优化
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Sparkles,
  Copy,
  CheckCircle2,
  Loader2,
  Wand2,
  RefreshCw,
  Zap,
  ArrowRight,
} from 'lucide-react'
import type { SixDimensionTemplate, CharacterStyle } from '@/lib/types/character'
import { SIX_DIMENSION_FIELDS, getStylePrompt } from '@/lib/types/character'
import { aiApi } from '@/lib/api/ai'
import { toast } from 'sonner'

interface PromptOptimizerProps {
  /** 当前提示词 */
  currentPrompt?: string
  /** 提示词变更回调 */
  onPromptChange: (prompt: string) => void
  /** 角色名称（用于提示） */
  characterName?: string
  /** 当前选择的风格 */
  style?: CharacterStyle
}

/**
 * 生成空的六维模板
 */
function createEmptyTemplate(): SixDimensionTemplate {
  return {
    appearance: '',
    personality: '',
    background: '',
    behavior: '',
    speechStyle: '',
    relationships: '',
  }
}

/**
 * 提示词优化组件
 */
export function PromptOptimizer({
  currentPrompt = '',
  onPromptChange,
  characterName = '角色',
  style,
}: PromptOptimizerProps) {
  const [showDialog, setShowDialog] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [template, setTemplate] = useState<SixDimensionTemplate>(createEmptyTemplate())
  const [generatedPrompt, setGeneratedPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isQuickOptimizing, setIsQuickOptimizing] = useState(false)

  // 计算已填写的维度数量
  const filledDimensions = Object.values(template).filter((v) => v.trim()).length

  // 更新模板字段
  const handleFieldChange = (key: keyof SixDimensionTemplate, value: string) => {
    setTemplate((prev) => ({ ...prev, [key]: value }))
  }

  // 生成提示词
  const handleGenerate = async () => {
    if (filledDimensions === 0) {
      toast.error('请至少填写一个维度的信息')
      return
    }

    setIsGenerating(true)
    setGeneratedPrompt('')

    try {
      // 构建提示词生成请求
      const prompt = buildOptimizationPrompt(template, characterName, style)

      // 调用 AI API 生成优化后的提示词
      const result = await aiApi.generateText(prompt)

      if (result) {
        setGeneratedPrompt(result)
        toast.success('提示词已生成，请确认后应用')
      } else {
        // 如果 AI 生成失败，使用本地生成
        const localPrompt = buildLocalPrompt(template, characterName, style)
        setGeneratedPrompt(localPrompt)
        toast.success('提示词已生成（本地模式），请确认后应用')
      }
    } catch (error) {
      // AI 生成失败时使用本地生成
      const localPrompt = buildLocalPrompt(template, characterName, style)
      setGeneratedPrompt(localPrompt)
      toast.success('提示词已生成（本地模式），请确认后应用')
    } finally {
      setIsGenerating(false)
    }
  }

  // 应用生成的提示词
  const handleApply = () => {
    if (generatedPrompt) {
      onPromptChange(generatedPrompt)
      toast.success('提示词已应用')
      setShowConfirmDialog(false)
      setGeneratedPrompt('')
      setTemplate(createEmptyTemplate())
    }
  }

  // 从六维对话框直接应用
  const handleApplyFromDialog = () => {
    if (generatedPrompt) {
      onPromptChange(generatedPrompt)
      toast.success('提示词已应用')
      setShowDialog(false)
      setGeneratedPrompt('')
      setTemplate(createEmptyTemplate())
    }
  }

  // 取消应用
  const handleCancelApply = () => {
    setShowConfirmDialog(false)
    // 保留生成的提示词和模板，让用户可以重新打开对话框
    setShowDialog(true)
  }

  // 复制生成的提示词
  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPrompt)
    setCopied(true)
    toast.success('已复制到剪贴板')
    setTimeout(() => setCopied(false), 2000)
  }

  // 重置表单
  const handleReset = () => {
    setTemplate(createEmptyTemplate())
    setGeneratedPrompt('')
  }

  // AI 一键优化（快速模式）
  const handleQuickOptimize = async () => {
    if (!currentPrompt.trim()) {
      toast.error('请先输入基础提示词')
      return
    }

    setIsQuickOptimizing(true)

    try {
      // 调用 AI API 进行快速优化
      const result = await quickOptimizePrompt(currentPrompt, characterName, style)

      if (result) {
        // 显示确认对话框而不是直接应用
        setGeneratedPrompt(result)
        setShowConfirmDialog(true)
        toast.success('提示词已优化，请确认')
      } else {
        toast.error('优化失败，请重试')
      }
    } catch (error) {
      console.error('Quick optimize error:', error)
      toast.error('优化失败，请重试')
    } finally {
      setIsQuickOptimizing(false)
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        {/* AI 一键优化按钮 */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="default"
                size="sm"
                onClick={handleQuickOptimize}
                disabled={!currentPrompt.trim() || isQuickOptimizing}
                className="gap-2"
              >
                {isQuickOptimizing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    优化中...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    AI 优化
                  </>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>读取当前提示词，AI 自动优化为英文并增强描述</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* 六维模板优化按钮 */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDialog(true)}
          className="gap-2"
        >
          <Wand2 className="h-4 w-4" />
          六维优化
        </Button>
      </div>

      {/* 六维模板输入对话框 */}
      <Dialog open={showDialog} onOpenChange={(open) => {
        setShowDialog(open)
        if (!open) {
          // 对话框关闭时重置状态，确保下次打开是干净的输入界面
          setGeneratedPrompt('')
          setTemplate(createEmptyTemplate())
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              六维角色模板优化
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 左侧：六维模板输入 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">六维角色模板</h3>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {filledDimensions}/6 维度
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    disabled={isGenerating}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {SIX_DIMENSION_FIELDS.map((field) => (
                  <div key={field.key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={field.key} className="text-sm font-medium">
                        {field.label}
                      </Label>
                      {template[field.key] && (
                        <Badge variant="outline" className="text-xs">
                          已填写
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {field.description}
                    </p>
                    <Textarea
                      id={field.key}
                      placeholder={field.placeholder}
                      value={template[field.key]}
                      onChange={(e) =>
                        handleFieldChange(field.key, e.target.value)
                      }
                      rows={2}
                      disabled={isGenerating}
                    />
                  </div>
                ))}
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isGenerating || filledDimensions === 0}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    生成提示词
                  </>
                )}
              </Button>
            </div>

            {/* 右侧：预览区域 */}
            <div className="space-y-4">
              {/* 生成结果预览 */}
              {generatedPrompt ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-green-600">生成的提示词</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopy}
                    >
                      {copied ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <Card className="border-green-200 dark:border-green-800">
                    <CardContent className="p-4">
                      <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded-lg text-sm max-h-[200px] overflow-y-auto">
                        {generatedPrompt}
                      </div>
                    </CardContent>
                  </Card>

                  {/* 原提示词对比 */}
                  {currentPrompt && (
                    <div className="space-y-2 mt-4">
                      <h4 className="text-sm font-medium text-muted-foreground">当前提示词（将被替换）</h4>
                      <Card className="opacity-60">
                        <CardContent className="p-3">
                          <div className="bg-muted p-2 rounded text-xs max-h-[80px] overflow-y-auto">
                            {currentPrompt}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* 确认应用按钮 */}
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleReset}
                      className="flex-1"
                    >
                      重新生成
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleApplyFromDialog}
                      className="flex-1 gap-2"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      确认应用
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="font-medium">当前提示词</h3>
                  {currentPrompt ? (
                    <Card>
                      <CardContent className="p-4">
                        <div className="bg-muted/50 p-3 rounded-lg text-sm max-h-[400px] overflow-y-auto">
                          {currentPrompt}
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="border-dashed">
                      <CardContent className="p-8 text-center text-muted-foreground">
                        <Wand2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>暂无基础提示词</p>
                        <p className="text-xs mt-2">填写六维模板后将生成新的提示词</p>
                      </CardContent>
                    </Card>
                  )}

                  {/* 风格信息 */}
                  {style && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">已选风格</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Badge variant="secondary">{getStyleLabel(style)}</Badge>
                        <p className="text-xs text-muted-foreground mt-2">
                          风格关键词将自动添加到生成的提示词中
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 确认应用对话框 */}
      <Dialog open={showConfirmDialog} onOpenChange={(open) => {
        setShowConfirmDialog(open)
        if (!open) {
          // 对话框关闭时重置状态
          setGeneratedPrompt('')
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              确认应用新提示词
            </DialogTitle>
            <DialogDescription>
              请预览优化后的提示词，确认后将替换当前的基础提示词
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* 新提示词预览 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-green-600">优化后的提示词</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <Card>
                <CardContent className="p-4">
                  <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded-lg text-sm max-h-[200px] overflow-y-auto border border-green-200 dark:border-green-800">
                    {generatedPrompt}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 原提示词对比 */}
            {currentPrompt && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">当前提示词（将被替换）</Label>
                <Card className="opacity-60">
                  <CardContent className="p-4">
                    <div className="bg-muted p-3 rounded-lg text-sm max-h-[100px] overflow-y-auto">
                      {currentPrompt}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCancelApply}>
              返回修改
            </Button>
            <Button onClick={handleApply} className="gap-2">
              <ArrowRight className="h-4 w-4" />
              确认应用
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

/**
 * 获取风格的中文名称
 */
function getStyleLabel(style: CharacterStyle): string {
  const labels: Record<CharacterStyle, string> = {
    anime: '🎨 动漫人物',
    ghibli: '🌿 吉卜力风格',
    cinematic: '🎬 电影级真人',
  }
  return labels[style] || style
}

/**
 * 构建 AI 优化提示词请求
 * 基础信息使用中文，风格关键词使用英文
 */
function buildOptimizationPrompt(template: SixDimensionTemplate, characterName: string, style?: CharacterStyle): string {
  const filledFields = Object.entries(template)
    .filter(([_, value]) => value.trim())
    .map(([key, value]) => {
      const field = SIX_DIMENSION_FIELDS.find((f) => f.key === key)
      return `**${field?.label || key}**:\n${value}`
    })
    .join('\n\n')

  const stylePrompt = style ? getStylePrompt(style) : ''

  return `请根据以下角色信息，生成一段简洁、专业的角色外观描述提示词，用于 AI 图像生成。

要求：
1. 角色描述部分使用中文（外貌特征、服装、配饰等）
2. 在开头添加英文风格关键词
3. 在末尾添加英文质量关键词（如 high quality, detailed 等）
4. 提示词应该清晰、具体、易于理解
5. 控制在 200 字以内
6. 格式：[英文风格关键词], [中文角色描述], [英文质量关键词]
7. 不要包含角色名称

示例输出格式：
"anime style, vibrant colors, cel shading, 一个年轻女性，长黑发，蓝眼睛，穿着白色连衣裙，身材苗条，表情温柔，high quality, detailed, professional character design"

角色信息：
${filledFields}

${stylePrompt ? `请使用以下风格关键词: ${stylePrompt}` : '请根据角色特点选择合适的风格关键词。'}

请直接输出优化后的提示词，不需要任何解释。`
}

/**
 * 本地生成提示词（当 AI 不可用时使用）
 * 基础信息使用中文，风格关键词使用英文
 */
function buildLocalPrompt(template: SixDimensionTemplate, characterName: string, style?: CharacterStyle): string {
  const parts: string[] = []
  const chineseParts: string[] = []

  // 添加风格关键词（英文）
  const stylePrompt = style ? getStylePrompt(style) : ''
  if (stylePrompt) {
    parts.push(stylePrompt)
  }

  // 外貌特征（中文）
  if (template.appearance) {
    chineseParts.push(template.appearance)
  }

  // 性格特点（中文）
  if (template.personality) {
    chineseParts.push(`性格${template.personality.split(/[，,。.]/)[0]}`)
  }

  // 行为习惯（中文）
  if (template.behavior) {
    chineseParts.push(`${template.behavior.split(/[，,。.]/)[0]}`)
  }

  // 如果有中文描述，添加到提示词
  if (chineseParts.length > 0) {
    parts.push(chineseParts.join('，'))
  } else {
    // 如果没有任何信息，使用默认描述
    parts.push('一个角色')
  }

  // 添加英文质量关键词
  parts.push('high quality, detailed, professional character design, clean background')

  return parts.join(', ')
}

/**
 * AI 一键优化提示词
 * 基础信息使用中文，风格、样式、画风等使用英文
 */
async function quickOptimizePrompt(
  currentPrompt: string,
  characterName: string,
  style?: CharacterStyle
): Promise<string | null> {
  // 获取风格提示词（英文）
  const stylePrompt = getStylePrompt(style)

  const prompt = `You are a professional AI image prompt engineer. Please optimize the following character description prompt for image generation.

Requirements:
1. Keep the character description in Chinese (physical features, clothing, accessories, etc.)
2. Add English style/quality keywords at the beginning for image generation models
3. Enhance the description with more visual details while keeping Chinese
4. Keep the original meaning and character traits
5. Keep it concise (under 150 words total)
6. Format: [English style keywords], [Chinese character description], [English quality keywords]
7. Do NOT include character name in the prompt

Example output format:
"anime style, vibrant colors, cel shading, 一个年轻女性，长黑发，蓝眼睛，穿着白色连衣裙，身材苗条，表情温柔，high quality, detailed, professional character design"

Original prompt:
${currentPrompt}

${stylePrompt ? `Use these style keywords at the beginning: ${stylePrompt}` : 'Add appropriate style keywords based on the character description.'}

Please output only the optimized prompt following the format above, no explanations needed.`

  try {
    const result = await aiApi.generateText(prompt)
    return result
  } catch (error) {
    console.error('Quick optimize API error:', error)
    // 如果 AI 失败，返回简单的本地优化版本
    return localQuickOptimize(currentPrompt, stylePrompt)
  }
}

/**
 * 本地快速优化（当 AI 不可用时）
 * 基础信息使用中文，风格关键词使用英文
 */
function localQuickOptimize(currentPrompt: string, stylePrompt?: string): string {
  // 英文质量关键词
  const qualityKeywords = 'high quality, detailed, professional character design, clean background'

  // 如果有风格关键词，添加到开头
  if (stylePrompt) {
    return `${stylePrompt}, ${currentPrompt}, ${qualityKeywords}`
  }

  // 没有风格关键词，只添加质量关键词
  return `${currentPrompt}, ${qualityKeywords}`
}
