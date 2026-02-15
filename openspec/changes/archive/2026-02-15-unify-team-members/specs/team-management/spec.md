# team-management Specification Delta

## ADDED Requirements

### Requirement: 统一团队成员 UI

系统 SHALL 为全局成员和项目成员提供统一的用户界面组件。

#### Scenario: 全局成员页面使用统一组件

- **WHEN** 用户访问 `/team` 页面
- **THEN** 系统 MUST 使用统一的成员列表组件
- **AND** UI 样式 MUST 与项目成员页面一致

#### Scenario: 项目成员页面使用统一组件

- **WHEN** 用户访问 `/projects/$id/team` 页面
- **THEN** 系统 MUST 使用统一的成员列表组件
- **AND** UI 样式 MUST 与全局成员页面一致

#### Scenario: 交互一致性

- **WHEN** 用户在任一成员页面执行操作
- **THEN** 搜索、筛选、排序、编辑、删除交互 MUST 完全一致

### Requirement: 当前用户标识

系统 SHALL 在成员列表中标识当前登录用户。

#### Scenario: 当前用户高亮显示

- **WHEN** 用户查看团队成员列表
- **THEN** 当前登录用户 MUST 有视觉高亮标识
- **AND** MUST 显示"我"或"当前用户"标签

#### Scenario: 自我保护

- **WHEN** 用户尝试删除自己的成员记录
- **THEN** 系统 MUST 禁止该操作
- **AND** MUST 显示"不能删除自己"的提示

#### Scenario: 用户角色同步

- **WHEN** 用户登录系统
- **THEN** 用户的团队成员角色 MUST 与 `auth-store` 中的角色同步
- **AND** 用户 MUST 自动出现在相关团队成员列表中

### Requirement: 层级权限控制

系统 SHALL 根据角色层级控制成员管理操作权限。

#### Scenario: 角色层级定义

- **WHEN** 系统定义角色层级
- **THEN** 优先级 MUST 如下（从高到低）：
  - `super_admin` - 最高优先级
  - `admin` - 管理员
  - `director` - 导演
  - `screenwriter` / `editor` - 编剧/剪辑师（同级）
  - `member` - 普通成员

#### Scenario: 编辑层级权限检查

- **WHEN** 用户尝试编辑成员角色
- **THEN** 系统 MUST 检查 `canManageRole(actorRole, targetRole)`
- **AND IF** 目标角色优先级高于或等于操作者，MUST 禁止操作
- **AND** MUST 显示权限不足提示

#### Scenario: 删除层级权限检查

- **WHEN** 用户尝试删除成员
- **THEN** 系统 MUST 检查 `canManageRole(actorRole, targetRole)`
- **AND IF** 目标角色优先级高于或等于操作者，MUST 禁止操作

### Requirement: 多租户成员管理

系统 SHALL 支持多租户模式的成员管理。

#### Scenario: 超级管理员全局权限

- **WHEN** `super_admin` 角色用户访问成员管理
- **THEN** 用户 MUST 可以查看和管理所有团队的所有成员
- **AND** 可以创建新团队

#### Scenario: 项目管理员项目权限

- **WHEN** `admin` 角色用户访问成员管理
- **THEN** 用户 MUST 只能查看和管理所属项目的成员
- **AND** 不能管理其他项目的成员

#### Scenario: 普通成员只读权限

- **WHEN** 非 `super_admin`/`admin` 角色用户访问成员管理
- **THEN** 用户 MUST 只能查看成员列表
- **AND** 不能执行添加、编辑、删除操作
