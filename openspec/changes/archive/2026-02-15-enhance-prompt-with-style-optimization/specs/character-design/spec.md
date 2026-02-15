# character-design Specification Delta

## ADDED Requirements

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

## MODIFIED Requirements

### Requirement: 角色基础管理
系统 SHALL 提供角色的创建、编辑、删除和查看功能。

#### Scenario: 编辑角色
- **WHEN** 用户点击角色的编辑按钮
- **THEN** 系统 MUST 显示预填充的角色信息表单
- **AND** 用户 MUST 能够修改任何字段
- **AND** 用户 MUST 能够选择人物风格
- **AND** 保存后角色信息 MUST 更新
