# permissions Specification Delta

## Purpose
扩展现有权限系统，增加超级管理员角色和侧边栏权限控制功能。

## MODIFIED Requirements

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

## ADDED Requirements

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
