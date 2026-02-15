# character-design Specification

## Purpose
TBD - created by archiving change add-character-design. Update Purpose after archive.
## Requirements
### Requirement: 角色基础管理
系统 SHALL 提供角色的创建、编辑、删除和查看功能。

#### Scenario: 编辑角色
- **WHEN** 用户点击角色的编辑按钮
- **THEN** 系统 MUST 显示预填充的角色信息表单
- **AND** 用户 MUST 能够修改任何字段
- **AND** 用户 MUST 能够选择人物风格
- **AND** 保存后角色信息 MUST 更新

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
系统 SHALL 支持生成角色的多视角设计图，并支持添加自定义视角。

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

### Requirement: 角色编号系统
系统 SHALL 为每个角色自动分配唯一的角色编号。

#### Scenario: 生成项目角色编号
- **GIVEN** 用户在项目下创建新角色
- **WHEN** 角色创建成功
- **THEN** 系统 MUST 自动生成格式为 `PROJ-XXX-CHAR-XXX` 的编号
- **AND** 项目序号 MUST 为 3 位数字，左补零
- **AND** 角色序号 MUST 为 3 位数字，左补零
- **AND** 角色序号 MUST 在同一项目内递增

#### Scenario: 生成全局角色编号
- **GIVEN** 用户在全局创建新角色
- **WHEN** 角色创建成功
- **THEN** 系统 MUST 自动生成格式为 `GLOBAL-CHAR-XXX` 的编号
- **AND** 角色序号 MUST 为 3 位数字，左补零
- **AND** 角色序号 MUST 全局递增

#### Scenario: 显示角色编号
- **GIVEN** 角色已创建且有编号
- **WHEN** 用户查看角色卡片、列表或详情
- **THEN** 系统 MUST 显示角色编号
- **AND** 编号 MUST 显示在角色名称附近
- **AND** 用户 MUST 能够复制编号

#### Scenario: 编号不可修改
- **GIVEN** 角色已创建
- **WHEN** 用户编辑角色
- **THEN** 编号字段 MUST 为只读
- **AND** 系统 MUST NOT 允许手动修改编号

---

### Requirement: 角色保存到资产库
系统 SHALL 支持将角色及其所有素材保存到资产库。

#### Scenario: 保存角色到资产库
- **GIVEN** 用户查看角色详情
- **WHEN** 用户点击"保存到资产库"按钮
- **THEN** 系统 MUST 创建类型为 `character` 的资产
- **AND** 资产 MUST 包含角色基础信息（名称、编号、描述、个性、属性）
- **AND** 资产 MUST 包含所有视角图片引用
- **AND** 资产 MUST 包含所有服装变体图片引用
- **AND** 资产 MUST 包含语音样本引用

#### Scenario: 显示同步状态
- **GIVEN** 角色可保存到资产库
- **WHEN** 用户查看角色详情
- **THEN** 系统 MUST 显示当前同步状态
- **AND** 未同步状态 MUST 显示"保存到资产库"按钮
- **AND** 已同步状态 MUST 显示"已同步"标识和"更新资产"按钮

#### Scenario: 保存成功反馈
- **GIVEN** 用户点击保存到资产库
- **WHEN** 保存成功
- **THEN** 系统 MUST 显示成功提示
- **AND** 角色的同步状态 MUST 更新为已同步
- **AND** 系统 MUST 记录关联的资产ID

---

### Requirement: 角色资产双向同步
系统 SHALL 保持角色与资产库中对应资产的双向同步。

#### Scenario: 角色更新同步到资产
- **GIVEN** 角色已同步到资产库
- **WHEN** 用户修改角色信息
- **THEN** 系统 MUST 自动更新资产库中对应的角色资产
- **AND** 更新 MUST 包含所有变更的字段
- **AND** 更新 MUST 在 3 秒内完成

#### Scenario: 角色删除同步到资产
- **GIVEN** 角色已同步到资产库
- **WHEN** 用户删除角色
- **THEN** 系统 MUST 同步删除资产库中对应的角色资产
- **AND** 系统 MUST 显示删除确认对话框，提示资产库同步删除

#### Scenario: 资产更新同步到角色
- **GIVEN** 角色资产在资产库中被编辑
- **WHEN** 用户在资产库中修改角色资产信息
- **THEN** 系统 MUST 自动更新对应的角色
- **AND** 更新 MUST 反映在角色详情页

---

### Requirement: 管理员角色复制转换
系统 SHALL 支持管理员在项目角色和全局角色之间复制转换。

#### Scenario: 项目角色复制为全局角色
- **GIVEN** 用户是管理员或超级管理员
- **AND** 存在项目角色
- **WHEN** 用户选择"复制为全局角色"
- **THEN** 系统 MUST 创建新的全局角色
- **AND** 新角色 MUST 分配全局编号
- **AND** 新角色 MUST 复制原角色的所有信息和素材
- **AND** 新角色 MUST 保存到全局资产库
- **AND** 原角色和复制后的角色 MUST 相互独立

#### Scenario: 全局角色复制到项目
- **GIVEN** 用户是管理员或超级管理员
- **AND** 存在全局角色
- **WHEN** 用户选择"复制到项目"并选择目标项目
- **THEN** 系统 MUST 在目标项目创建新角色
- **AND** 新角色 MUST 分配项目角色编号
- **AND** 新角色 MUST 复制原角色的所有信息和素材
- **AND** 新角色 MUST 保存到项目资产库
- **AND** 原角色和复制后的角色 MUST 相互独立

#### Scenario: 权限控制
- **GIVEN** 普通成员用户
- **WHEN** 访问角色复制转换功能
- **THEN** 系统 MUST 隐藏或禁用复制转换按钮
- **AND** 系统 MUST 仅允许项目管理员执行项目内复制
- **AND** 系统 MUST 仅允许超级管理员执行全局转换

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

### Requirement: 自定义视角管理
系统 SHALL 支持用户添加、编辑和删除自定义视角。

#### Scenario: 添加自定义视角
- **GIVEN** 用户查看角色多视角图片区域
- **WHEN** 用户点击"添加自定义视角"按钮
- **THEN** 系统 MUST 显示自定义视角命名对话框
- **AND** 用户 MUST 能够输入视角名称（最多 20 字符）
- **AND** 保存后系统 MUST 创建新的自定义视角槽位

#### Scenario: 自定义视角命名限制
- **GIVEN** 用户创建自定义视角
- **WHEN** 输入视角名称
- **THEN** 系统 MUST 验证名称不为空
- **AND** 系统 MUST 验证名称不与已有视角重复
- **AND** 系统 MUST 验证名称不包含特殊字符

#### Scenario: 删除自定义视角
- **GIVEN** 存在自定义视角
- **WHEN** 用户点击删除按钮
- **THEN** 系统 MUST 显示确认对话框
- **AND** 确认后视角及其图片 MUST 被删除
- **AND** 固定视角不可删除

#### Scenario: 重命名自定义视角
- **GIVEN** 存在自定义视角
- **WHEN** 用户点击重命名
- **THEN** 系统 MUST 显示编辑对话框
- **AND** 保存后视角名称 MUST 更新

#### Scenario: 自定义视角图片操作
- **GIVEN** 自定义视角已创建
- **WHEN** 用户操作自定义视角卡片
- **THEN** 系统 MUST 支持本地上传图片
- **AND** 系统 MUST 支持 AI 生成图片
- **AND** 系统 MUST 支持预览和下载

#### Scenario: 自定义视角数量限制
- **GIVEN** 用户添加自定义视角
- **WHEN** 已达到最大数量限制（10个）
- **THEN** 系统 MUST 禁用"添加自定义视角"按钮
- **AND** 系统 MUST 显示已达上限提示

### Requirement: 人物风格选择
系统 SHALL 支持为角色选择预设的人物风格。

#### Scenario: 选择动漫人物风格
- **GIVEN** 用户在编辑角色
- **WHEN** 用户选择"动漫人物"风格
- **THEN** 系统 MUST 在提示词前添加动漫风格的英文关键词
- **AND** 关键词 MUST 包含 "anime style" 等描述
- **AND** 生成图片时 MUST 应用该风格

#### Scenario: 选择吉卜力风格
- **GIVEN** 用户在编辑角色
- **WHEN** 用户选择"吉卜力风格"
- **THEN** 系统 MUST 在提示词前添加吉卜力风格的英文关键词
- **AND** 关键词 MUST 包含 "Studio Ghibli style" 等描述
- **AND** 生成图片时 MUST 应用该风格

#### Scenario: 选择电影级真人风格
- **GIVEN** 用户在编辑角色
- **WHEN** 用户选择"电影级真人"风格
- **THEN** 系统 MUST 在提示词前添加电影级真人的英文关键词
- **AND** 关键词 MUST 包含 "cinematic, photorealistic" 等描述
- **AND** 生成图片时 MUST 应用该风格

#### Scenario: 风格持久化
- **GIVEN** 用户选择了人物风格
- **WHEN** 保存角色
- **THEN** 系统 MUST 保存风格选择到角色数据
- **AND** 下次编辑时 MUST 恢复已选风格

---

### Requirement: AI 提示词优化
系统 SHALL 提供 AI 一键优化基础提示词的功能。

#### Scenario: 一键优化提示词
- **GIVEN** 用户已输入基础提示词
- **WHEN** 用户点击"AI 优化"按钮
- **THEN** 系统 MUST 读取当前基础提示词内容
- **AND** 系统 MUST 调用 AI API 进行优化
- **AND** 优化后 MUST 将结果替换原提示词

#### Scenario: 优化为英文提示词
- **GIVEN** 用户的基础提示词为中文
- **WHEN** 执行 AI 优化
- **THEN** 系统 MUST 将中文转换为英文
- **AND** 系统 MUST 保持原意不变
- **AND** 系统 MUST 增强描述细节

#### Scenario: 优化时添加风格
- **GIVEN** 用户已选择人物风格
- **WHEN** 执行 AI 优化
- **THEN** 系统 MUST 在优化结果中包含风格关键词
- **AND** 风格关键词 MUST 与已选风格匹配

#### Scenario: 优化失败处理
- **GIVEN** 用户点击 AI 优化
- **WHEN** AI API 调用失败
- **THEN** 系统 MUST 显示错误提示
- **AND** 系统 MUST 保留原有提示词不变
- **AND** 系统 MUST 提供重试选项

