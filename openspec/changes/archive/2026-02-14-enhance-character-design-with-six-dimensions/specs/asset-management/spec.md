# asset-management Specification Delta

## MODIFIED Requirements

### Requirement: 资产来源管理 (MODIFIED)
系统 SHALL 支持多种资产来源，并在资产元数据中记录来源信息和上传者。

#### Scenario: 记录资产上传者 (NEW)
- **GIVEN** 用户上传或同步资产
- **WHEN** 创建资产记录
- **THEN** 系统 MUST 记录上传者用户 ID
- **AND** 系统 MUST 记录上传者显示名称
- **AND** 上传者信息 MUST 从当前登录会话获取

#### Scenario: 显示资产上传者 (NEW)
- **GIVEN** 用户查看资产列表或详情
- **WHEN** 渲染资产信息
- **THEN** 系统 MUST 显示上传者名称
- **AND** 卡片视图 MUST 在底部显示上传者
- **AND** 表格视图 MUST 包含"上传者"列

#### Scenario: AI 生成资产的上传者 (NEW)
- **GIVEN** AI 生成内容保存为资产
- **WHEN** 创建资产记录
- **THEN** 系统 MUST 将发起生成的用户记录为上传者
- **AND** 系统 MUST 同时记录 aiGenerated 标志和 aiModel 信息

---

## ADDED Requirements

### Requirement: 资产卡片上传者显示
系统 SHALL 在资产卡片上显示上传者信息。

#### Scenario: 卡片显示上传者
- **GIVEN** 资产有上传者信息
- **WHEN** 用户查看资产卡片
- **THEN** 系统 MUST 在卡片底部显示上传者名称
- **AND** 上传者名称 MUST 使用次要文字样式
- **AND** 格式 SHOULD 为"上传者: XXX"

#### Scenario: 无上传者信息显示
- **GIVEN** 资产无上传者信息（旧数据）
- **WHEN** 显示资产卡片
- **THEN** 系统 MAY 显示"系统"或留空
- **AND** 系统 MUST NOT 显示错误信息

#### Scenario: 当前用户资产标识
- **GIVEN** 用户查看自己上传的资产
- **WHEN** 显示资产卡片
- **THEN** 系统 MAY 添加"我上传的"标识
- **AND** 标识 SHOULD 使用特殊样式区分
