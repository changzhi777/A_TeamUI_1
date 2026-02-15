# Design: Add Character Card Voice Playback

## Overview

在角色卡片上添加一个简单的音频播放按钮，允许用户直接在卡片列表中预览角色语音。

## Approach

### 方案选择

**方案 A（推荐）：在现有语音徽章上添加播放功能**
- 将现有的"语音"徽章改造为可点击的播放按钮
- 点击时播放/暂停音频
- 显示播放状态图标

**方案 B：添加独立的播放按钮**
- 在徽章旁边添加单独的播放按钮
- 保持徽章仅作为标识

**选择方案 A**，原因：
1. 更紧凑的 UI
2. 交互更直观
3. 不增加额外的视觉元素

## Implementation Details

### 组件修改

修改 `CharacterCard` 组件：

1. **状态管理**
   - 添加 `isPlaying` 状态跟踪播放状态
   - 使用 `useRef` 管理 Audio 实例

2. **播放逻辑**
   ```tsx
   const audioRef = useRef<HTMLAudioElement | null>(null)
   const [isPlaying, setIsPlaying] = useState(false)

   const handlePlayVoice = (e: React.MouseEvent) => {
     e.stopPropagation()
     if (!character.voice?.sampleUrl) return

     if (audioRef.current) {
       if (isPlaying) {
         audioRef.current.pause()
         setIsPlaying(false)
       } else {
         audioRef.current.play()
         setIsPlaying(true)
       }
     }
   }
   ```

3. **UI 更新**
   - 播放时显示 `VolumeX`（暂停图标）或动画效果
   - 非播放时显示 `Volume2`（播放图标）
   - 添加点击事件阻止冒泡

### 生命周期管理

- 组件卸载时暂停并清理音频资源
- 音频播放结束时自动重置状态

## UI Mock

```
┌─────────────────────────┐
│ [角色图片]              │
│                         │
│    [2 视角] [3 服装]    │
│                  [▶ 语音] │ ← 可点击播放
├─────────────────────────┤
│ PROJ-001-CHAR-001 [已同步]│
│ 角色名称                 │
│ 角色描述...              │
└─────────────────────────┘
```

## Error Handling

- 无语音样本时：不显示播放按钮，保持现有徽章样式
- 音频加载失败：显示错误提示，自动重置状态
