/**
 * api-settings
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

/**
 * API Management Page
 * API 管理页面
 */

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Key, Eye, EyeOff, Trash2, Check, Loader2, MessageSquare, Image, Mic } from 'lucide-react'
import { aiApi } from '@/lib/api/ai'
import {
  type APIManagementConfig,
  type TextAPIConfig,
  type ImageAPIConfig,
  type VoiceAPIConfig,
  TEXT_MODELS,
  IMAGE_MODELS,
  VOICE_MODELS,
  IMAGE_RESOLUTIONS,
  DEFAULT_API_CONFIG,
  GLM_TTS_VOICES,
  VOICE_STYLES,
} from '@/lib/types/character'
import { toast } from 'sonner'

// 表单 Schema
const textFormSchema = z.object({
  apiKey: z.string().min(1, '请输入 API Key'),
  model: z.string().min(1, '请选择模型'),
  baseUrl: z.string().url('请输入有效的 URL').optional().or(z.literal('')),
  enableThinking: z.boolean().optional(),
})

const imageFormSchema = z.object({
  apiKey: z.string().min(1, '请输入 API Key'),
  model: z.string().min(1, '请选择模型'),
  baseUrl: z.string().url('请输入有效的 URL').optional().or(z.literal('')),
  defaultResolution: z.string().min(1, '请选择分辨率'),
  customWidth: z.number().min(512).max(2048).optional(),
  customHeight: z.number().min(512).max(2048).optional(),
})

const voiceFormSchema = z.object({
  apiKey: z.string().min(1, '请输入 API Key'),
  model: z.string().min(1, '请选择模型'),
  baseUrl: z.string().url('请输入有效的 URL').optional().or(z.literal('')),
  defaultVoice: z.string().optional(),
  speed: z.number().min(0.5).max(2.0).optional(),
  volume: z.number().min(0.1).max(2.0).optional(),
  responseFormat: z.enum(['wav', 'pcm', 'mp3']).optional(),
})

type TextFormValues = z.infer<typeof textFormSchema>
type ImageFormValues = z.infer<typeof imageFormSchema>
type VoiceFormValues = z.infer<typeof voiceFormSchema>

// 服务提供商选项
const PROVIDERS = [
  { id: 'zhipu', name: '智谱 AI' },
  { id: 'openai', name: 'OpenAI' },
  { id: 'custom', name: '自定义' },
]

export function ApiSettings() {
  const [activeTab, setActiveTab] = useState<'text' | 'image' | 'voice'>('text')
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({
    text: false,
    image: false,
    voice: false,
  })
  const [testing, setTesting] = useState<'text' | 'image' | 'voice' | null>(null)
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [providers, setProviders] = useState<APIManagementConfig['text']['provider'][]>({
    text: 'zhipu',
    image: 'zhipu',
    voice: 'zhipu',
  } as APIManagementConfig['text']['provider'][])
  const [useCustomResolution, setUseCustomResolution] = useState(false)

  // 文本 API 表单
  const textForm = useForm<TextFormValues>({
    resolver: zodResolver(textFormSchema),
    defaultValues: {
      apiKey: '',
      model: 'glm-4.7-flash',
      baseUrl: '',
      enableThinking: false,
    },
  })

  // 文生图 API 表单
  const imageForm = useForm<ImageFormValues>({
    resolver: zodResolver(imageFormSchema),
    defaultValues: {
      apiKey: '',
      model: 'glm-image',
      baseUrl: '',
      defaultResolution: '1280x1280',
    },
  })

  // 语音 API 表单
  const voiceForm = useForm<VoiceFormValues>({
    resolver: zodResolver(voiceFormSchema),
    defaultValues: {
      apiKey: '',
      model: 'glm-tts',
      baseUrl: '',
      defaultVoice: 'tongtong',
      speed: 1.0,
      volume: 1.0,
      responseFormat: 'wav',
    },
  })

  // 加载保存的配置
  useEffect(() => {
    const config = aiApi.getAPIConfig()

    textForm.reset({
      apiKey: config.text.apiKey,
      model: config.text.model,
      baseUrl: config.text.baseUrl || '',
      enableThinking: config.text.enableThinking,
    })

    imageForm.reset({
      apiKey: config.image.apiKey,
      model: config.image.model,
      baseUrl: config.image.baseUrl || '',
      defaultResolution: config.image.defaultResolution,
      customWidth: config.image.customResolution?.width,
      customHeight: config.image.customResolution?.height,
    })
    setUseCustomResolution(!!config.image.customResolution)

    voiceForm.reset({
      apiKey: config.voice.apiKey,
      model: config.voice.model,
      baseUrl: config.voice.baseUrl || '',
      defaultVoice: config.voice.defaultVoice,
      speed: config.voice.speed,
      volume: config.voice.volume,
      responseFormat: config.voice.responseFormat,
    })

    setProviders({
      text: config.text.provider,
      image: config.image.provider,
      voice: config.voice.provider,
    } as APIManagementConfig['text']['provider'][])
  }, [textForm, imageForm, voiceForm])

  // 保存文本 API 配置
  const onSaveText = (values: TextFormValues) => {
    aiApi.saveTextAPIConfig({
      provider: providers.text,
      apiKey: values.apiKey,
      model: values.model,
      baseUrl: values.baseUrl || undefined,
      enableThinking: values.enableThinking,
    })
    toast.success('文本 API 配置已保存')
  }

  // 保存文生图 API 配置
  const onSaveImage = (values: ImageFormValues) => {
    aiApi.saveImageAPIConfig({
      provider: providers.image,
      apiKey: values.apiKey,
      model: values.model,
      baseUrl: values.baseUrl || undefined,
      defaultResolution: useCustomResolution ? '1280x1280' : values.defaultResolution,
      customResolution: useCustomResolution
        ? { width: values.customWidth || 1280, height: values.customHeight || 1280 }
        : undefined,
    })
    toast.success('文生图 API 配置已保存')
  }

  // 保存语音 API 配置
  const onSaveVoice = (values: VoiceFormValues) => {
    aiApi.saveVoiceAPIConfig({
      provider: providers.voice,
      apiKey: values.apiKey,
      model: values.model,
      baseUrl: values.baseUrl || undefined,
      defaultVoice: values.defaultVoice,
      speed: values.speed,
      volume: values.volume,
      responseFormat: values.responseFormat,
    })
    toast.success('语音 API 配置已保存')
  }

  // 测试 API 连接
  const handleTestConnection = async (type: 'text' | 'image' | 'voice') => {
    setTesting(type)

    // 先保存当前配置
    if (type === 'text') {
      const values = textForm.getValues()
      aiApi.saveTextAPIConfig({
        provider: providers.text,
        apiKey: values.apiKey,
        model: values.model,
        baseUrl: values.baseUrl || undefined,
      })
    } else if (type === 'image') {
      const values = imageForm.getValues()
      aiApi.saveImageAPIConfig({
        provider: providers.image,
        apiKey: values.apiKey,
        model: values.model,
        baseUrl: values.baseUrl || undefined,
        defaultResolution: values.defaultResolution,
      })
    } else {
      const values = voiceForm.getValues()
      aiApi.saveVoiceAPIConfig({
        provider: providers.voice,
        apiKey: values.apiKey,
        model: values.model,
        baseUrl: values.baseUrl || undefined,
      })
    }

    try {
      const success = await aiApi.testAPIConnection(type)
      if (success) {
        const names = { text: '文本', image: '文生图', voice: '语音' }
        toast.success(`${names[type]} API 连接成功`)
      } else {
        toast.error('连接测试失败，请检查 API Key')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '连接测试失败')
    } finally {
      setTesting(null)
    }
  }

  // 重置为默认配置
  const handleReset = () => {
    textForm.reset({
      apiKey: DEFAULT_API_CONFIG.text.apiKey,
      model: DEFAULT_API_CONFIG.text.model,
      baseUrl: DEFAULT_API_CONFIG.text.baseUrl || '',
      enableThinking: DEFAULT_API_CONFIG.text.enableThinking,
    })
    imageForm.reset({
      apiKey: DEFAULT_API_CONFIG.image.apiKey,
      model: DEFAULT_API_CONFIG.image.model,
      baseUrl: DEFAULT_API_CONFIG.image.baseUrl || '',
      defaultResolution: DEFAULT_API_CONFIG.image.defaultResolution,
    })
    voiceForm.reset({
      apiKey: DEFAULT_API_CONFIG.voice.apiKey,
      model: DEFAULT_API_CONFIG.voice.model,
      baseUrl: DEFAULT_API_CONFIG.voice.baseUrl || '',
      defaultVoice: DEFAULT_API_CONFIG.voice.defaultVoice,
      speed: DEFAULT_API_CONFIG.voice.speed,
      volume: DEFAULT_API_CONFIG.voice.volume,
      responseFormat: DEFAULT_API_CONFIG.voice.responseFormat,
    })
    setProviders({ text: 'zhipu', image: 'zhipu', voice: 'zhipu' } as APIManagementConfig['text']['provider'][])
    setUseCustomResolution(false)
    setShowResetDialog(false)
    toast.success('已重置为默认配置，请点击保存生效')
  }

  // 获取当前提供商的模型列表
  const getModelsForProvider = (type: 'text' | 'image' | 'voice', provider: string) => {
    if (type === 'text') return TEXT_MODELS[provider as keyof typeof TEXT_MODELS] || []
    if (type === 'image') return IMAGE_MODELS[provider as keyof typeof IMAGE_MODELS] || []
    return VOICE_MODELS[provider as keyof typeof VOICE_MODELS] || []
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">API 管理</h3>
        <p className="text-sm text-muted-foreground">
          配置 AI 服务的 API Key，用于角色图片和语音生成
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="text" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            文本 API
          </TabsTrigger>
          <TabsTrigger value="image" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            文生图 API
          </TabsTrigger>
          <TabsTrigger value="voice" className="flex items-center gap-2">
            <Mic className="h-4 w-4" />
            语音 API
          </TabsTrigger>
        </TabsList>

        {/* 文本 API Tab */}
        <TabsContent value="text" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                文本 API 配置
              </CardTitle>
              <CardDescription>
                用于 AI 文本生成和对话功能（默认：GLM-4.7-Flash）
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={textForm.handleSubmit(onSaveText)} className="space-y-4">
                <div className="space-y-2">
                  <Label>服务提供商</Label>
                  <Select
                    value={providers.text}
                    onValueChange={(v) => {
                      setProviders((prev) => ({ ...prev, text: v as typeof prev.text }))
                      // 切换提供商时重置模型
                      const models = TEXT_MODELS[v as keyof typeof TEXT_MODELS]
                      if (models && models.length > 0) {
                        textForm.setValue('model', models[0].id)
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PROVIDERS.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="textApiKey">API Key</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="textApiKey"
                        type={showKeys.text ? 'text' : 'password'}
                        placeholder="输入 API Key"
                        {...textForm.register('apiKey')}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full"
                        onClick={() => setShowKeys((prev) => ({ ...prev, text: !prev.text }))}
                      >
                        {showKeys.text ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleTestConnection('text')}
                      disabled={testing === 'text'}
                    >
                      {testing === 'text' ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                      <span className="ml-2">测试</span>
                    </Button>
                  </div>
                  {textForm.formState.errors.apiKey && (
                    <p className="text-sm text-destructive">{textForm.formState.errors.apiKey.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="textModel">模型</Label>
                  <Select
                    value={textForm.watch('model')}
                    onValueChange={(v) => textForm.setValue('model', v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择模型" />
                    </SelectTrigger>
                    <SelectContent>
                      {getModelsForProvider('text', providers.text).map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          <div className="flex flex-col">
                            <span>{model.name}</span>
                            <span className="text-xs text-muted-foreground">{model.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {providers.text === 'zhipu' && (
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>思考模式</Label>
                      <p className="text-xs text-muted-foreground">
                        启用深度思考模式，提升复杂任务处理能力
                      </p>
                    </div>
                    <Switch
                      checked={textForm.watch('enableThinking')}
                      onCheckedChange={(v) => textForm.setValue('enableThinking', v)}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="textBaseUrl">API 基础 URL（可选）</Label>
                  <Input
                    id="textBaseUrl"
                    placeholder="https://open.bigmodel.cn/api/paas/v4"
                    {...textForm.register('baseUrl')}
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="submit">保存配置</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 文生图 API Tab */}
        <TabsContent value="image" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                文生图 API 配置
              </CardTitle>
              <CardDescription>
                用于生成角色多视角图片和服装变体（默认：GLM-Image）
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={imageForm.handleSubmit(onSaveImage)} className="space-y-4">
                <div className="space-y-2">
                  <Label>服务提供商</Label>
                  <Select
                    value={providers.image}
                    onValueChange={(v) => {
                      setProviders((prev) => ({ ...prev, image: v as typeof prev.image }))
                      const models = IMAGE_MODELS[v as keyof typeof IMAGE_MODELS]
                      if (models && models.length > 0) {
                        imageForm.setValue('model', models[0].id)
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PROVIDERS.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imageApiKey">API Key</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="imageApiKey"
                        type={showKeys.image ? 'text' : 'password'}
                        placeholder="输入 API Key"
                        {...imageForm.register('apiKey')}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full"
                        onClick={() => setShowKeys((prev) => ({ ...prev, image: !prev.image }))}
                      >
                        {showKeys.image ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleTestConnection('image')}
                      disabled={testing === 'image'}
                    >
                      {testing === 'image' ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                      <span className="ml-2">测试</span>
                    </Button>
                  </div>
                  {imageForm.formState.errors.apiKey && (
                    <p className="text-sm text-destructive">{imageForm.formState.errors.apiKey.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imageModel">模型</Label>
                  <Select
                    value={imageForm.watch('model')}
                    onValueChange={(v) => imageForm.setValue('model', v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择模型" />
                    </SelectTrigger>
                    <SelectContent>
                      {getModelsForProvider('image', providers.image).map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          <div className="flex flex-col">
                            <span>{model.name}</span>
                            <span className="text-xs text-muted-foreground">{model.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 分辨率设置 */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>默认分辨率</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">自定义</span>
                      <Switch
                        checked={useCustomResolution}
                        onCheckedChange={setUseCustomResolution}
                      />
                    </div>
                  </div>

                  {!useCustomResolution ? (
                    <Select
                      value={imageForm.watch('defaultResolution')}
                      onValueChange={(v) => imageForm.setValue('defaultResolution', v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择分辨率" />
                      </SelectTrigger>
                      <SelectContent>
                        {IMAGE_RESOLUTIONS.map((res) => (
                          <SelectItem key={res.id} value={res.id}>
                            <div className="flex items-center gap-2">
                              <span>{res.label}</span>
                              <span className="text-xs text-muted-foreground">({res.aspectRatio})</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="customWidth">宽度 (512-2048)</Label>
                        <Input
                          id="customWidth"
                          type="number"
                          step={32}
                          min={512}
                          max={2048}
                          placeholder="1280"
                          {...imageForm.register('customWidth', { valueAsNumber: true })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="customHeight">高度 (512-2048)</Label>
                        <Input
                          id="customHeight"
                          type="number"
                          step={32}
                          min={512}
                          max={2048}
                          placeholder="1280"
                          {...imageForm.register('customHeight', { valueAsNumber: true })}
                        />
                      </div>
                      <p className="col-span-2 text-xs text-muted-foreground">
                        自定义尺寸需为 32 的整数倍
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imageBaseUrl">API 基础 URL（可选）</Label>
                  <Input
                    id="imageBaseUrl"
                    placeholder="https://open.bigmodel.cn/api/paas/v4"
                    {...imageForm.register('baseUrl')}
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="submit">保存配置</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 语音 API Tab */}
        <TabsContent value="voice" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="h-5 w-5" />
                语音 API 配置
              </CardTitle>
              <CardDescription>
                用于生成角色语音（默认：GLM-TTS 超拟人语音合成）
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={voiceForm.handleSubmit(onSaveVoice)} className="space-y-4">
                <div className="space-y-2">
                  <Label>服务提供商</Label>
                  <Select
                    value={providers.voice}
                    onValueChange={(v) => {
                      setProviders((prev) => ({ ...prev, voice: v as typeof prev.voice }))
                      const models = VOICE_MODELS[v as keyof typeof VOICE_MODELS]
                      if (models && models.length > 0) {
                        voiceForm.setValue('model', models[0].id)
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PROVIDERS.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="voiceApiKey">API Key</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="voiceApiKey"
                        type={showKeys.voice ? 'text' : 'password'}
                        placeholder="输入 API Key"
                        {...voiceForm.register('apiKey')}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full"
                        onClick={() => setShowKeys((prev) => ({ ...prev, voice: !prev.voice }))}
                      >
                        {showKeys.voice ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleTestConnection('voice')}
                      disabled={testing === 'voice'}
                    >
                      {testing === 'voice' ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                      <span className="ml-2">测试</span>
                    </Button>
                  </div>
                  {voiceForm.formState.errors.apiKey && (
                    <p className="text-sm text-destructive">{voiceForm.formState.errors.apiKey.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="voiceModel">模型</Label>
                  <Select
                    value={voiceForm.watch('model')}
                    onValueChange={(v) => voiceForm.setValue('model', v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择模型" />
                    </SelectTrigger>
                    <SelectContent>
                      {getModelsForProvider('voice', providers.voice).map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          <div className="flex flex-col">
                            <span>{model.name}</span>
                            <span className="text-xs text-muted-foreground">{model.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* GLM-TTS 音色选择 */}
                {voiceForm.watch('model') === 'glm-tts' && (
                  <div className="space-y-4 rounded-lg border p-4">
                    <div>
                      <h4 className="font-medium">GLM-TTS 超拟人语音设置</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        新一代智谱语音大模型，支持情感表达增强、动态调参
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>预设音色</Label>
                      <Select
                        value={voiceForm.watch('defaultVoice') || 'tongtong'}
                        onValueChange={(v) => voiceForm.setValue('defaultVoice', v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="选择音色" />
                        </SelectTrigger>
                        <SelectContent>
                          {GLM_TTS_VOICES.map((voice) => (
                            <SelectItem key={voice.id} value={voice.id}>
                              <div className="flex items-center gap-2">
                                <span>{voice.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  ({voice.gender === 'female' ? '女声' : '男声'})
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>语速</Label>
                        <span className="text-sm text-muted-foreground">
                          {voiceForm.watch('speed')?.toFixed(1) || '1.0'}x
                        </span>
                      </div>
                      <Slider
                        value={[voiceForm.watch('speed') || 1.0]}
                        min={0.5}
                        max={2.0}
                        step={0.1}
                        onValueChange={([v]) => voiceForm.setValue('speed', v)}
                      />
                      <p className="text-xs text-muted-foreground">0.5x - 2.0x，默认 1.0x</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>音量</Label>
                        <span className="text-sm text-muted-foreground">
                          {voiceForm.watch('volume')?.toFixed(1) || '1.0'}x
                        </span>
                      </div>
                      <Slider
                        value={[voiceForm.watch('volume') || 1.0]}
                        min={0.1}
                        max={2.0}
                        step={0.1}
                        onValueChange={([v]) => voiceForm.setValue('volume', v)}
                      />
                      <p className="text-xs text-muted-foreground">0.1x - 2.0x，默认 1.0x</p>
                    </div>

                    <div className="space-y-2">
                      <Label>响应格式</Label>
                      <Select
                        value={voiceForm.watch('responseFormat') || 'wav'}
                        onValueChange={(v) => voiceForm.setValue('responseFormat', v as 'wav' | 'pcm' | 'mp3')}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="选择格式" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="wav">WAV（无损）</SelectItem>
                          <SelectItem value="pcm">PCM（原始）</SelectItem>
                          <SelectItem value="mp3">MP3（压缩）</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* 非 GLM-TTS 模型使用通用音色选择 */}
                {voiceForm.watch('model') !== 'glm-tts' && (
                  <div className="space-y-2">
                    <Label>默认音色</Label>
                    <Select
                      value={voiceForm.watch('defaultVoice') || 'alloy'}
                      onValueChange={(v) => voiceForm.setValue('defaultVoice', v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择音色" />
                      </SelectTrigger>
                      <SelectContent>
                        {VOICE_STYLES.map((style) => (
                          <SelectItem key={style.id} value={style.id}>
                            <div className="flex flex-col">
                              <span>{style.name}</span>
                              <span className="text-xs text-muted-foreground">{style.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="voiceBaseUrl">API 基础 URL（可选）</Label>
                  <Input
                    id="voiceBaseUrl"
                    placeholder="https://open.bigmodel.cn/api/paas/v4"
                    {...voiceForm.register('baseUrl')}
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="submit">保存配置</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 重置按钮 */}
      <div className="flex justify-start">
        <Button variant="outline" onClick={() => setShowResetDialog(true)}>
          <Trash2 className="h-4 w-4 mr-2" />
          重置为默认配置
        </Button>
      </div>

      {/* 重置确认对话框 */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>重置 API 配置</AlertDialogTitle>
            <AlertDialogDescription>
              这将重置所有 API 配置为默认值（智谱 API）。您当前的自定义配置将被覆盖。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleReset}>确认重置</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
