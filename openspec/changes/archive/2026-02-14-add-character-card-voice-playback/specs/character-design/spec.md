## ADDED Requirements

### Requirement: 角色卡片语音播放
系统 SHALL 支持在角色卡片上直接播放角色语音。

#### Scenario: 显示语音播放按钮
- **GIVEN** 角色有语音样本 (voice.sampleUrl 存在)
- **WHEN** 用户查看角色卡片
- **THEN** 系统 MUST 在卡片上显示语音播放按钮
- **AND** 按钮 MUST 显示在图片区域的右下角

#### Scenario: 播放角色语音
- **GIVEN** 角色卡片显示语音播放按钮
- **WHEN** 用户点击播放按钮
- **THEN** 系统 MUST 播放角色的语音样本
- **AND** 点击事件 MUST NOT 触发卡片的 onClick 事件
- **AND** 按钮图标 MUST 切换为暂停/停止状态

#### Scenario: 暂停语音播放
- **GIVEN** 语音正在播放
- **WHEN** 用户再次点击播放按钮
- **THEN** 系统 MUST 暂停音频播放
- **AND** 按钮图标 MUST 切换回播放状态

#### Scenario: 播放结束自动重置
- **GIVEN** 语音正在播放
- **WHEN** 音频播放完成
- **THEN** 系统 MUST 自动将播放状态重置为未播放
- **AND** 按钮图标 MUST 切换回播放状态

#### Scenario: 无语音样本时不显示播放按钮
- **GIVEN** 角色没有语音样本 (voice.sampleUrl 不存在)
- **WHEN** 用户查看角色卡片
- **THEN** 系统 MUST NOT 显示语音播放按钮
- **AND** 系统 MAY 显示静态的语音标识徽章

#### Scenario: 组件卸载时清理资源
- **GIVEN** 语音正在播放
- **WHEN** 角色卡片组件被卸载
- **THEN** 系统 MUST 停止音频播放
- **AND** 系统 MUST 释放音频资源
