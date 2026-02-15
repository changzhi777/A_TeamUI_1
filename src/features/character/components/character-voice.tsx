/**
 * character-voice
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

/**
 * Character Voice Component
 * 角色语音组件
 */

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Volume2,
  Play,
  Pause,
  Download,
  Loader2,
  Trash2,
  Clock,
} from 'lucide-react'
import type { Character, VoiceStyle, GLMTTSVoice } from '@/lib/types/character'
import { VOICE_STYLES, GLM_TTS_VOICES } from '@/lib/types/character'
import { useCharacterStore } from '@/stores/character-store'
import { aiApi } from '@/lib/api/ai'
import {
  useCharacterTasks,
  useTaskQueueEnabled,
} from '../hooks/use-character-tasks'
import { toast } from 'sonner'

interface CharacterVoiceProps {
  character: Character
  /** 启用任务队列模式（可选，默认自动检测） */
  useTaskQueue?: boolean
}

export function CharacterVoice({ character, useTaskQueue: forceTaskQueue }: CharacterVoiceProps) {
  // 获取当前语音配置，判断使用的模型类型
  const voiceConfig = aiApi.getVoiceAPIConfig()
  const isGLMTTS = voiceConfig.model === 'glm-tts'

  // 根据模型类型获取有效的音色列表
  const validVoices = isGLMTTS ? GLM_TTS_VOICES : VOICE_STYLES
  const validVoiceIds = validVoices.map((v) => v.id)

  // 验证音色是否在有效列表中
  const isValidVoice = (voiceId: string) => validVoiceIds.includes(voiceId)

  // 根据模型类型选择默认音色，并验证有效性
  const getDefaultVoice = () => {
    const preferredVoice = character.voice?.style || voiceConfig.defaultVoice
    if (preferredVoice && isValidVoice(preferredVoice)) {
      return preferredVoice
    }
    // 返回模型类型的默认音色
    return isGLMTTS ? 'tongtong' : 'alloy'
  }

  const [voiceStyle, setVoiceStyle] = useState(getDefaultVoice())
  const [sampleText, setSampleText] = useState(character.voice?.sampleText || '')
  const [isGenerating, setIsGenerating] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(character.voice?.sampleUrl || null)
  const [isPlaying, setIsPlaying] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)

  const updateCharacterVoice = useCharacterStore((state) => state.updateCharacterVoice)
  const deleteCharacterVoice = useCharacterStore((state) => state.deleteCharacterVoice)

  // Task queue mode detection
  const taskQueueEnabled = useTaskQueueEnabled()
  const useTaskQueueMode = forceTaskQueue ?? taskQueueEnabled

  // Task queue integration
  const {
    runningTTSTask,
    createTTSTask,
    getTTSResult,
    isTaskRunning,
  } = useCharacterTasks({
    characterId: character.id,
    autoRefresh: useTaskQueueMode,
  })

  // Monitor running task completion
  useEffect(() => {
    if (!useTaskQueueMode || !runningTTSTask) return

    // Check if task completed
    if (runningTTSTask.status === 'completed') {
      const result = getTTSResult(runningTTSTask)
      if (result?.audioUrl) {
        setAudioUrl(result.audioUrl)
        updateCharacterVoice(character.id, {
          style: result.voiceStyle,
          sampleUrl: result.audioUrl,
          sampleText: result.text,
        })
        toast.success('语音已生成')
      }
    } else if (runningTTSTask.status === 'failed') {
      toast.error(runningTTSTask.error || '生成失败')
    }
  }, [useTaskQueueMode, runningTTSTask, getTTSResult, updateCharacterVoice, character.id])

  // 生成语音 - 任务队列模式
  const handleGenerateVoiceWithTaskQueue = async () => {
    if (!sampleText.trim()) {
      toast.error('请输入要转换为语音的文本')
      return
    }

    try {
      await createTTSTask({
        characterId: character.id,
        characterName: character.name,
        text: sampleText,
        voiceStyle,
        callback: {
          type: 'character_voice',
          characterId: character.id,
        },
      })

      toast.info('已提交生成任务，请稍候...')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '提交任务失败')
    }
  }

  // 生成语音 - 直接模式
  const handleGenerateVoiceDirect = async () => {
    if (!sampleText.trim()) {
      toast.error('请输入要转换为语音的文本')
      return
    }

    setIsGenerating(true)

    try {
      const url = await aiApi.generateTTS(sampleText, voiceStyle)

      setAudioUrl(url)
      updateCharacterVoice(character.id, {
        style: voiceStyle,
        sampleUrl: url,
        sampleText,
      })

      toast.success('语音已生成')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '生成失败，请重试')
    } finally {
      setIsGenerating(false)
    }
  }

  // 根据模式选择生成方法
  const handleGenerateVoice = useTaskQueueMode
    ? handleGenerateVoiceWithTaskQueue
    : handleGenerateVoiceDirect

  // 判断是否正在生成
  const isCurrentlyGenerating = useTaskQueueMode
    ? !!runningTTSTask && isTaskRunning(runningTTSTask)
    : isGenerating

  // 播放/暂停
  const handlePlayPause = () => {
    if (!audioRef.current || !audioUrl) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  // 下载语音
  const handleDownload = async () => {
    if (!audioUrl) return

    try {
      const response = await fetch(audioUrl)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${character.name}_voice.mp3`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch {
      toast.error('下载失败')
    }
  }

  // 删除语音
  const handleDeleteVoice = () => {
    deleteCharacterVoice(character.id)
    setAudioUrl(null)
    setIsPlaying(false)
    toast.success('语音已删除')
  }

  // 音频播放结束
  const handleAudioEnded = () => {
    setIsPlaying(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Volume2 className="h-5 w-5" />
          角色语音
        </h3>
        {character.voice && (
          <Button variant="ghost" size="sm" onClick={handleDeleteVoice}>
            <Trash2 className="h-4 w-4 mr-2" />
            删除语音
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          {/* 语音风格选择 */}
          <div className="space-y-2">
            <Label>
              {isGLMTTS ? 'GLM-TTS 音色' : '语音风格'}
            </Label>
            <Select value={voiceStyle} onValueChange={setVoiceStyle}>
              <SelectTrigger>
                <SelectValue placeholder={isGLMTTS ? '选择音色' : '选择语音风格'} />
              </SelectTrigger>
              <SelectContent>
                {isGLMTTS ? (
                  // GLM-TTS 音色列表
                  (validVoices as GLMTTSVoice[]).map((voice) => (
                    <SelectItem key={voice.id} value={voice.id}>
                      <div className="flex items-center gap-2">
                        <span>{voice.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({voice.gender === 'female' ? '女声' : '男声'})
                        </span>
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  // 传统语音风格列表
                  (validVoices as VoiceStyle[]).map((style) => (
                    <SelectItem key={style.id} value={style.id}>
                      <div className="flex flex-col">
                        <span>{style.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {style.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* 示例文本 */}
          <div className="space-y-2">
            <Label htmlFor="sampleText">试听文本</Label>
            <Textarea
              id="sampleText"
              placeholder="输入要转换为语音的文本，例如角色的台词..."
              rows={4}
              value={sampleText}
              onChange={(e) => setSampleText(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              建议输入角色的典型台词，以便测试语音效果
            </p>
          </div>

          {/* 生成按钮 */}
          <div className="space-y-2">
            {useTaskQueueMode && runningTTSTask && isTaskRunning(runningTTSTask) && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>生成中 {runningTTSTask.progress}%</span>
                <Progress value={runningTTSTask.progress} className="flex-1 h-2" />
              </div>
            )}
            {useTaskQueueMode && (
              <div className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                <Clock className="h-3 w-3" />
                任务队列模式已启用
              </div>
            )}
            <Button
              onClick={handleGenerateVoice}
              disabled={isCurrentlyGenerating || !sampleText.trim()}
              className="w-full"
            >
              {isCurrentlyGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {useTaskQueueMode ? '处理中...' : '生成中...'}
                </>
              ) : (
                <>
                  {useTaskQueueMode && <Clock className="h-4 w-4 mr-2" />}
                  {!useTaskQueueMode && <Volume2 className="h-4 w-4 mr-2" />}
                  {useTaskQueueMode ? '提交任务' : '生成语音'}
                </>
              )}
            </Button>
          </div>

          {/* 音频播放器 */}
          {audioUrl && (
            <div className="bg-muted p-4 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">语音预览</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handlePlayPause}>
                    {isPlaying ? (
                      <>
                        <Pause className="h-4 w-4 mr-1" />
                        暂停
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-1" />
                        播放
                      </>
                    )}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-1" />
                    下载
                  </Button>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                <p>
                  <strong>{isGLMTTS ? '音色：' : '风格：'}</strong>
                  {isGLMTTS
                    ? GLM_TTS_VOICES.find((v) => v.id === voiceStyle)?.name
                    : VOICE_STYLES.find((s) => s.id === voiceStyle)?.name
                  }
                </p>
                <p className="mt-1 line-clamp-2">
                  <strong>文本：</strong>
                  {sampleText}
                </p>
              </div>

              <audio
                ref={audioRef}
                src={audioUrl}
                onEnded={handleAudioEnded}
                className="hidden"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
