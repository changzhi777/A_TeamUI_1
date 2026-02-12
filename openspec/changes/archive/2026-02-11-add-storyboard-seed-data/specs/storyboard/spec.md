## ADDED Requirements

### Requirement: 分镜头模拟数据自动生成

系统 SHALL 在应用启动时为演示项目自动生成分镜头模拟数据。

#### Scenario: 应用启动时自动生成

- **WHEN** 用户登录并首次访问分镜头相关页面
- **THEN** 系统 MUST 检查所有演示项目是否已存在分镜头数据
- **AND** 对于没有分镜头的项目，MUST 自动生成模拟数据
- **AND** 生成的分镜头数量 SHALL 与项目的 `totalShots` 字段一致

#### Scenario: 根据项目规模生成

- **WHEN** 为项目生成分镜头数据
- **THEN** 生成的分镜头数量 MUST 等于项目的 `totalShots` 值
- **AND** 当 `totalShots` 大于模板数量时，MUST 循环复用模板
- **AND** 循环复用的镜头 SHALL 使用不同的场次编号

#### Scenario: 根据项目类型选择模板

- **WHEN** 为项目生成分镜头数据
- **THEN** 系统 MUST 根据项目的 `type` 字段选择对应的镜头模板
- **AND** 支持 7 种项目类型：`shortDrama`、`realLifeDrama`、`aiPodcast`、`advertisement`、`mv`、`documentary`、`other`
- **AND** 每种类型 SHALL 使用不同风格的镜头描述

#### Scenario: 避免覆盖用户数据

- **WHEN** 应用启动时检查数据
- **THEN** 系统 SHALL 只为没有分镜头数据的项目生成
- **AND** MUST 不覆盖已存在的分镜头数据
- **AND** MUST 区分模拟数据和用户手动创建的数据

### Requirement: 手动重新生成分镜头数据

系统 SHALL 提供手动重新生成分镜头数据的功能。

#### Scenario: 重新生成数据按钮

- **WHEN** 用户在分镜头清单页面
- **THEN** 页面 MUST 显示"重新生成数据"按钮
- **AND** 按钮 SHALL 使用刷新/重置图标
- **AND** 点击按钮 MUST 显示确认对话框

#### Scenario: 强制重新生成

- **WHEN** 用户确认重新生成数据
- **THEN** 系统 MUST 清除所有现有的模拟分镜头数据
- **AND** MUST 根据当前项目重新生成分镜头
- **AND** MUST 显示生成进度和成功提示

#### Scenario: 取消重新生成

- **WHEN** 用户在确认对话框中选择取消
- **THEN** 系统 MUST 不执行任何数据变更
- **AND** MUST 关闭对话框
- **AND** 分镜头数据 SHALL 保持原状

### Requirement: 模拟数据清除功能

系统 SHALL 提供清除模拟分镜头数据的功能。

#### Scenario: 清除模拟数据

- **WHEN** 用户选择清除模拟数据
- **THEN** 系统 MUST 显示确认对话框
- **AND** 对话框 SHALL 说明将删除所有模拟生成的分镜头
- **AND** 确认后 MUST 删除所有标记为模拟数据的分镜头
- **AND** MUST 保留用户手动创建的分镜头（如有标记）

#### Scenario: 清除后的状态

- **WHEN** 模拟数据被清除后
- **THEN** 分镜头清单页面 MUST 显示空状态提示
- **AND** 页面 MUST 提供"生成演示数据"按钮
- **AND** 用户点击后 MUST 重新生成模拟数据
