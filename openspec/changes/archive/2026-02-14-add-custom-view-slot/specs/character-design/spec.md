# character-design Specification Delta

## MODIFIED Requirements

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

## ADDED Requirements

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
