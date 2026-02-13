# navigation Specification

## Purpose
TBD - created by archiving change fix-navigation-routes. Update Purpose after archive.
## Requirements
### Requirement: 项目上下文感知导航
系统 SHALL 支持项目上下文感知导航，当用户点击需要项目上下文的导航项时，系统 MUST 检查是否有当前选中的项目。

#### Scenario: 有项目上下文时导航
- **WHEN** 用户点击需要项目上下文的导航项（如"团队成员"、"分镜头创作"、"剧本编辑"）
- **AND** 系统检测到存在当前选中的项目
- **THEN** 系统 MUST 使用当前项目 ID 跳转到对应的项目特定路由（如 `/projects/$id/team`）

#### Scenario: 无项目上下文时显示提示
- **WHEN** 用户点击需要项目上下文的导航项
- **AND** 系统检测到不存在当前选中的项目
- **THEN** 系统 MUST 显示提示信息，告知用户需要先选择一个项目
- **AND** SHALL 提供"前往项目列表"的操作选项

### Requirement: 项目上下文状态管理
系统 SHALL 在 project-store 中维护当前项目上下文状态。

#### Scenario: 设置当前项目
- **WHEN** 用户点击项目卡片或进入项目详情页
- **THEN** 系统 MUST 将该项目 ID 设置为 `currentProjectId`
- **AND** 该状态 MUST 持久化到 localStorage

#### Scenario: 清除当前项目
- **WHEN** 用户进入项目列表页面
- **THEN** 系统 MAY 清除 `currentProjectId` 状态
- **AND** 当用户创建新项目时，新项目 MUST 自动成为当前项目

### Requirement: 侧边栏导航配置
侧边栏导航配置 SHALL 支持标记需要项目上下文的导航项。

#### Scenario: 标记需要项目的导航项
- **WHEN** 导航项需要项目上下文才能正常工作
- **THEN** 配置 SHALL 包含 `requiresProject: true` 标记
- **AND** 该标记 SHALL 被导航组件用于导航处理

### Requirement: 导航路由映射
系统 SHALL 将需要项目上下文的导航项路由映射到正确的项目特定路由。

#### Scenario: 路由映射
- **WHEN** 导航项被标记为需要项目上下文
- **THEN** 系统 MUST 将其路由映射到项目特定路径
- **AND** `/team` MUST 映射到 `/projects/$id/team`
- **AND** `/storyboard` MUST 映射到 `/projects/$id/storyboard`
- **AND** `/script` MUST 映射到 `/projects/$id/script`

---

## Delta: add-asset-management

### ADD: 资产管理路由
系统 SHALL 提供资产管理路由，用于访问全局资产库和项目资产。

#### Scenario: 访问全局资产库
- **WHEN** 用户点击侧边栏的"资产库"导航项
- **THEN** 系统 MUST 导航到 `/assets` 路由
- **AND** 显示全局资产库页面
- **AND** 不需要项目上下文

#### Scenario: 访问项目资产
- **WHEN** 用户访问项目详情中的资产标签页
- **THEN** 系统 MUST 导航到 `/projects/$id/assets` 路由
- **AND** 显示该项目专属的资产页面
- **AND** 仅项目成员可访问

#### Scenario: 资产管理导航项不依赖项目上下文
- **WHEN** 用户点击"资产库"导航项
- **THEN** 系统 MUST 直接导航到全局资产库
- **AND** 不检查项目上下文
- **AND** 全局资产库包含所有用户可访问的资产

