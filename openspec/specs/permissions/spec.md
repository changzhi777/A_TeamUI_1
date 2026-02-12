# permissions Specification

## Purpose
TBD - created by archiving change enhance-auth-permissions. Update Purpose after archive.
## Requirements
### Requirement: 角色定义
系统 SHALL 支持多种用户角色，每个角色拥有不同的权限集。

#### Scenario: 角色层级
- **WHEN** 系统定义用户角色
- **THEN** MUST 支持以下角色：
  - `super_admin` - 超级管理员，拥有所有权限
  - `admin` - 管理员，可管理项目和团队成员
  - `director` - 导演，可编辑分镜头和剧本
  - `screenwriter` - 编剧，可编辑剧本
  - `editor` - 剪辑师，可编辑分镜头
  - `member` - 普通成员，只读权限

#### Scenario: 角色继承
- **WHEN** 用户拥有高等级角色
- **THEN** 用户 MUST 自动拥有低等级角色的所有权限
- **AND** `super_admin` MUST 拥有所有角色的权限

### Requirement: 资源权限
系统 SHALL 支持资源级别的权限控制。

#### Scenario: 项目权限
- **WHEN** 定义项目相关的权限
- **THEN** MUST 支持以下权限类型：
  - `project:read` - 查看项目
  - `project:write` - 编辑项目信息
  - `project:delete` - 删除项目
  - `project:manage_members` - 管理团队成员

#### Scenario: 剧本权限
- **WHEN** 定义剧本相关的权限
- **THEN** MUST 支持以下权限类型：
  - `script:read` - 查看剧本
  - `script:write` - 编辑剧本

#### Scenario: 分镜头权限
- **WHEN** 定义分镜头相关的权限
- **THEN** MUST 支持以下权限类型：
  - `storyboard:read` - 查看分镜头
  - `storyboard:write` - 编辑分镜头
  - `storyboard:delete` - 删除分镜头

### Requirement: 角色权限映射
系统 SHALL 为每个角色定义默认的权限集。

#### Scenario: super_admin 权限
- **WHEN** 用户是 super_admin
- **THEN** 用户 MUST 拥有所有权限
- **AND** MUST 能够执行所有操作

#### Scenario: admin 权限
- **WHEN** 用户是 admin
- **THEN** 用户 MUST 拥有项目读写和管理权限
- **AND** MUST 能够管理项目成员
- **AND** MUST 能够删除项目

#### Scenario: director 权限
- **WHEN** 用户是 director
- **THEN** 用户 MUST 能够查看和编辑项目
- **AND** MUST 能够编辑剧本和分镜头
- **AND** MUST 不能管理项目成员

#### Scenario: screenwriter 权限
- **WHEN** 用户是 screenwriter
- **THEN** 用户 MUST 能够查看项目和剧本
- **AND** MUST 能够编辑剧本
- **AND** MUST 不能编辑分镜头

#### Scenario: editor 权限
- **WHEN** 用户是 editor
- **THEN** 用户 MUST 能够查看项目和分镜头
- **AND** MUST 能够编辑分镜头
- **AND** MUST 不能编辑剧本

#### Scenario: member 权限
- **WHEN** 用户是 member
- **THEN** 用户 MUST 只能查看项目内容
- **AND** MUST 不能进行任何编辑操作

### Requirement: 特殊权限授予
系统 SHALL 支持为特定用户在特定资源上授予额外权限。

#### Scenario: 授予额外权限
- **WHEN** 管理员为用户授予特殊权限
- **THEN** 系统 MUST 允许在项目级别覆盖角色权限
- **AND** 特殊权限 MUST 仅对指定项目有效
- **AND** MUST 记录权限授予历史

#### Scenario: 撤销特殊权限
- **WHEN** 管理员撤销特殊权限
- **THEN** 用户的权限 MUST 恢复为角色默认权限
- **AND** MUST 记录权限撤销历史

### Requirement: 权限检查
系统 SHALL 提供统一的权限检查机制。

#### Scenario: 检查角色权限
- **WHEN** 代码检查用户是否有某项权限
- **THEN** 系统 MUST 根据用户角色和特殊权限进行判断
- **AND** MUST 返回布尔值结果
- **AND** MUST 提供友好的权限不足提示

#### Scenario: 检查资源权限
- **WHEN** 代码检查用户是否能操作特定资源
- **THEN** 系统 MUST 检查用户在该资源上的权限
- **AND** MUST 考虑角色权限和特殊权限
- **AND** MUST 返回布尔值结果

### Requirement: 权限组件
系统 SHALL 提供权限控制组件。

#### Scenario: 条件渲染
- **WHEN** 使用 `PermissionGuard` 组件
- **THEN** 组件 MUST 根据用户权限决定是否渲染子内容
- **AND** MUST 支持角色和权限两种检查方式
- **AND** MUST 提供 fallback 内容

#### Scenario: 路由保护
- **WHEN** 使用 `ProtectedRoute` 组件
- **THEN** 组件 MUST 检查用户是否有访问权限
- **AND** 无权限时 MUST 重定向到错误页面
- **AND** MUST 支持动态权限检查

### Requirement: 权限审计
系统 SHALL 记录权限相关的操作。

#### Scenario: 权限变更记录
- **WHEN** 用户角色或权限发生变更
- **THEN** 系统 MUST 记录变更时间、操作人、变更内容
- **AND** 记录 MUST 不可修改

#### Scenario: 敏感操作审计
- **WHEN** 用户执行敏感操作（删除项目、管理成员等）
- **THEN** 系统 MUST 记录操作人、操作时间、操作内容
- **AND** 记录 MUST 用于后续审计

### Requirement: 权限 Hook
系统 SHALL 提供便捷的权限检查 Hook。

#### Scenario: usePermissions Hook
- **WHEN** 组件使用 `usePermissions` Hook
- **THEN** Hook MUST 提供当前用户的权限信息
- **AND** MUST 提供权限检查方法
- **AND** MUST 响应权限变化

#### Scenario: usePermissionCheck Hook
- **WHEN** 组件使用 `usePermissionCheck` Hook
- **THEN** Hook MUST 提供带提示的权限检查方法
- **AND** 检查失败时 MUST 自动显示提示
- **AND** MUST 支持多种权限检查场景

