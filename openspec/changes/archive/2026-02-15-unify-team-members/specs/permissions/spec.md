# permissions Specification Delta

## ADDED Requirements

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
