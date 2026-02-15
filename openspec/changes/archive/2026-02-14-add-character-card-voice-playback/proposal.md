# Proposal: Add Character Card Voice Playback

## Why

当前角色卡片只显示"语音"徽章标识，用户需要进入角色详情页才能播放语音。这增加了用户操作步骤，不利于快速预览角色语音效果。

### 当前问题：
1. 角色卡片仅显示语音标识徽章，无法直接播放
2. 用户必须点击进入角色详情页才能听到语音
3. 快速浏览多个角色时，无法即时对比语音效果

## What Changes

在角色卡片上添加语音播放按钮，实现以下功能：

1. **播放按钮** - 当角色有语音样本时，在卡片上显示播放按钮
2. **播放状态** - 显示播放/暂停状态
3. **快速预览** - 用户无需进入详情页即可预览角色语音

## Scope

- `src/features/character/components/character-card.tsx` - 添加播放按钮和播放逻辑

## Risks

- 低风险：仅修改单个组件，不影响其他功能
- 音频资源管理：需要确保音频正确加载和释放

## Related

- character-design spec
- voice-api spec
