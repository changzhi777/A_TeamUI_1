# character-design Spec Delta

## ADDED Requirements

### Requirement: 角色基础管理
系统 SHALL 提供角色的创建、编辑、删除和查看功能。

#### Scenario: 创建角色
- **WHEN** 用户点击"创建角色"按钮
- **THEN** 系统 MUST 显示角色创建表单
- **AND** 表单 MUST 包含名称、描述、个性、属性字段
- **AND** 用户 MUST 能够添加自定义标签

#### Scenario: 编辑角色
- **WHEN** 用户点击角色的编辑按钮
- **THEN** 系统 MUST 显示预填充的角色信息表单
- **AND** 用户 MUST 能够修改任何字段
- **AND** 保存后角色信息 MUST 更新

#### Scenario: 删除角色
- **WHEN** 用户点击角色的删除按钮
- **THEN** 系统 MUST 显示确认对话框
- **AND** 确认后角色及其所有图片 MUST 被删除

#### Scenario: 查看角色列表
- **WHEN** 用户访问角色设计页面
- **THEN** 系统 MUST 以卡片或表格形式显示所有角色
- **AND** 用户 MUST 能够切换视图模式

---

### Requirement: 角色属性和个性
系统 SHALL 支持记录角色的属性信息和个性描述。

#### Scenario: 编辑角色属性
- **WHEN** 用户在角色表单中编辑属性
- **THEN** 系统 MUST 提供常用属性字段（年龄、性别、身高、职业）
- **AND** 系统 MUST 支持添加自定义属性
- **AND** 属性 MUST 以键值对形式存储

#### Scenario: 编辑个性描述
- **WHEN** 用户编辑角色个性描述
- **THEN** 系统 MUST 提供多行文本输入
- **AND** 系统 MUST 支持最多 1000 字符的描述

---

### Requirement: 多视角图片生成
系统 SHALL 支持生成角色的多视角设计图。

#### Scenario: 生成角色基础形象
- **WHEN** 用户输入角色描述和提示词后点击生成
- **THEN** 系统 MUST 调用文生图 API 生成角色图片
- **AND** 系统 MUST 显示生成进度
- **AND** 生成成功后 MUST 显示在画廊中

#### Scenario: 生成多视角图片
- **WHEN** 用户选择要生成的视角类型（正面、侧面、背面、3/4视角）
- **THEN** 系统 MUST 基于角色基础提示词生成对应视角
- **AND** 每个视角 MUST 独立存储
- **AND** 用户 MUST 能够重新生成单个视角

#### Scenario: 生成失败处理
- **WHEN** 图片生成失败
- **THEN** 系统 MUST 显示错误信息
- **AND** 系统 MUST 提供重试按钮
- **AND** 失败的生成 MUST 不影响已有图片

---

### Requirement: 服装变更生成
系统 SHALL 支持基于角色基础形象生成不同服装的变体。

#### Scenario: 创建服装变体
- **WHEN** 用户输入服装描述并点击生成
- **THEN** 系统 MUST 结合角色基础提示词和服装描述生成新图片
- **AND** 系统 MUST 保存为独立的服装变体

#### Scenario: 管理服装变体
- **WHEN** 用户查看角色详情
- **THEN** 系统 MUST 显示所有服装变体
- **AND** 用户 MUST 能够删除服装变体
- **AND** 用户 MUST 能够设置默认服装

---

### Requirement: TTS 语音生成
系统 SHALL 支持为角色生成语音。

#### Scenario: 配置角色语音
- **WHEN** 用户选择角色语音风格
- **THEN** 系统 MUST 提供预设语音风格选项
- **AND** 用户 MUST 能够输入测试文本

#### Scenario: 生成角色语音
- **WHEN** 用户点击生成语音按钮
- **THEN** 系统 MUST 调用 TTS API 生成语音
- **AND** 系统 MUST 提供音频播放器
- **AND** 用户 MUST 能够下载生成的音频

#### Scenario: 语音生成失败
- **WHEN** TTS 生成失败
- **THEN** 系统 MUST 显示错误信息
- **AND** 系统 MUST 提供重试选项

---

### Requirement: API 设置管理
系统 SHALL 提供 AI API 的配置管理功能。

#### Scenario: 访问 API 设置
- **WHEN** 用户访问设置页面的 API 设置
- **THEN** 系统 MUST 显示 API 配置表单
- **AND** 表单 MUST 包含文生图 API Key 和 TTS API Key 字段

#### Scenario: 配置 API Key
- **WHEN** 用户输入 API Key 并保存
- **THEN** 系统 MUST 验证 Key 格式
- **AND** 系统 MUST 将 Key 安全存储在本地
- **AND** 系统 MUST 使用配置的 Key 进行 API 调用

#### Scenario: 默认 API Key
- **WHEN** 用户未配置自定义 API Key
- **THEN** 系统 MUST 使用默认的智谱 API Key
- **AND** 默认 Key 为 `e4e536bc68fa4595a1b71d336f54367c.Or91ji5jZl59zasg`

#### Scenario: 清除 API Key
- **WHEN** 用户点击清除按钮
- **THEN** 系统 MUST 清除保存的 API Key
- **AND** 系统 MUST 恢复使用默认 Key

---

### Requirement: 角色与项目关联
系统 SHALL 支持将角色与项目关联。

#### Scenario: 关联角色到项目
- **WHEN** 用户在项目上下文中创建角色
- **THEN** 角色 MUST 自动关联到当前项目
- **AND** 项目角色 MUST 仅在项目成员间可见

#### Scenario: 全局角色
- **WHEN** 用户在全局角色页面创建角色
- **THEN** 角色 MUST 为全局角色
- **AND** 全局角色 MUST 在所有项目中可用

---

### Requirement: 角色数据持久化
系统 SHALL 持久化角色数据。

#### Scenario: 保存角色数据
- **WHEN** 用户创建或编辑角色
- **THEN** 系统 MUST 将数据保存到 localStorage
- **AND** 刷新页面后数据 MUST 保持

#### Scenario: 导出角色数据
- **WHEN** 用户导出角色
- **THEN** 系统 MUST 生成包含角色信息和图片 URL 的 JSON 文件
