# permissions Specification

## Purpose
TBD - created by archiving change enhance-auth-permissions. Update Purpose after archive.
## Requirements
### Requirement: 角色定义
系统 SHALL 支持多种用户角色，每个角色拥有不同的权限集。

#### Scenario: 角色层级 (MODIFIED)
- **WHEN** 系统定义用户角色
- **THEN** MUST 支持以下角色：
  - `super_admin` - 超级管理员，拥有所有权限，可管理所有用户和系统配置
  - `admin` - 管理员，可管理项目和团队成员，拥有功能模块的完整权限
  - `director` - 导演，可编辑分镜头和剧本
  - `screenwriter` - 编剧，可编辑剧本
  - `editor` - 剪辑师，可编辑分镜头
  - `member` - 普通成员，只读权限

#### Scenario: super_admin 权限 (MODIFIED)
- **WHEN** 用户是 super_admin
- **THEN** 用户 MUST 拥有所有权限
- **AND** MUST 能够执行所有操作
- **AND** MUST 能够管理所有用户角色
- **AND** MUST 能够访问系统配置
- **AND** MUST 能够分配其他管理员权限

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

### Requirement: 侧边栏权限控制
系统 SHALL 根据用户角色动态过滤侧边栏菜单。

#### Scenario: 菜单项权限配置
- **WHEN** 定义侧边栏菜单
- **THEN** 每个菜单项 MUST 可配置所需角色
- **AND** 每个菜单项 MUST 可配置所需权限
- **AND** 未配置权限的菜单项 MUST 默认对所有角色可见

#### Scenario: 菜单过滤
- **WHEN** 用户查看侧边栏
- **THEN** 系统 MUST 根据用户角色过滤菜单
- **AND** 无权限的菜单项 MUST 完全隐藏
- **AND** 子菜单过滤后为空的父菜单 MUST 隐藏

#### Scenario: 动态菜单更新
- **WHEN** 用户角色发生变更
- **THEN** 侧边栏菜单 MUST 立即更新
- **AND** 新角色无权限的菜单 MUST 立即隐藏

### Requirement: 功能模块权限
系统 SHALL 为各功能模块定义细粒度权限。

#### Scenario: 权限类型定义
- **WHEN** 定义功能模块权限
- **THEN** MUST 支持以下操作类型：
  - `read` - 只读/查看权限
  - `write` - 编辑/修改权限
  - `delete` - 删除权限
  - `manage` - 管理权限（包含所有操作）

#### Scenario: 角色功能权限映射
- **WHEN** 用户访问功能模块
- **THEN** 系统根据角色授予以下权限：
  - `super_admin`: 所有模块的 `manage` 权限
  - `admin`: 所有模块的 `manage` 权限
  - `member`: 所有模块的 `read` 权限

### Requirement: 团队成员权限管理
系统 SHALL 允许管理员管理团队成员的角色和权限。

#### Scenario: 角色分配界面
- **WHEN** 管理员访问团队成员管理
- **THEN** 系统必须显示角色选择下拉菜单
- **AND** 菜单必须列出所有可用角色
- **AND** 必须显示当前角色

#### Scenario: 角色变更权限
- **WHEN** 用户尝试更改成员角色
- **THEN** 系统 MUST 检查操作者权限
- **AND** 只有 `super_admin` 可以创建/分配 `admin` 角色
- **AND** `admin` 可以分配 `director`、`screenwriter`、`editor`、`member` 角色
- **AND** 无权限时 MUST 显示提示

#### Scenario: 权限变更审计
- **WHEN** 成员角色发生变更
- **THEN** 系统 MUST 记录变更信息
- **AND** 必须记录操作者、被操作者、变更前角色、变更后角色、变更时间

### Requirement: 角色层级比较

系统 SHALL 提供角色层级比较功能。

#### Scenario: 获取角色优先级

- **WHEN** 代码需要比较角色层级
- **THEN** 系统 MUST 提供 `getRolePriority(role)` 函数
- **AND** 返回数值越大优先级越高

#### Scenario: 判断管理权限

- **WHEN** 代码需要判断是否可以管理某角色
- **THEN** 系统 MUST 提供 `canManageRole(actorRole, targetRole)` 函数
- **AND** 仅当 `actorRole` 优先级 > `targetRole` 优先级时返回 `true`

#### Scenario: 角色层级常量

- **WHEN** 系统初始化
- **THEN** 以下角色优先级 MUST 生效：
  - `super_admin`: 100
  - `admin`: 80
  - `director`: 60
  - `screenwriter`: 40
  - `editor`: 40
  - `member`: 20

