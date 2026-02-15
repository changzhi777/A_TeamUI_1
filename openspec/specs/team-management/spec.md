# team-management Specification

## Purpose
TBD - created by archiving change enhance-team-members. Update Purpose after archive.
## Requirements
### Requirement: 成员搜索

系统 SHALL 提供成员搜索功能，允许用户按姓名或邮箱搜索团队成员。

#### Scenario: 按姓名搜索

- **WHEN** 用户在搜索框中输入成员姓名
- **THEN** 系统实时过滤显示匹配的成员

#### Scenario: 按邮箱搜索

- **WHEN** 用户在搜索框中输入成员邮箱
- **THEN** 系统实时过滤显示匹配的成员

#### Scenario: 清除搜索

- **WHEN** 用户清除搜索框内容
- **THEN** 系统显示所有成员

### Requirement: 成员排序

系统 SHALL 提供成员排序功能，允许用户按不同字段对成员列表进行排序。

#### Scenario: 按姓名排序

- **WHEN** 用户选择按姓名排序
- **THEN** 系统按成员姓名的字母顺序显示成员

#### Scenario: 按加入时间排序

- **WHEN** 用户选择按加入时间排序
- **THEN** 系统按成员加入时间倒序显示成员（最新加入的在前）

#### Scenario: 按角色排序

- **WHEN** 用户选择按角色排序
- **THEN** 系统按成员角色优先级显示成员

### Requirement: 角色筛选

系统 SHALL 提供角色筛选功能，允许用户按成员角色过滤显示。

#### Scenario: 按角色筛选

- **WHEN** 用户点击角色筛选按钮
- **THEN** 系统只显示该角色的成员

#### Scenario: 显示全部成员

- **WHEN** 用户点击"全部"按钮
- **THEN** 系统显示所有角色的成员

#### Scenario: 空筛选结果

- **WHEN** 某角色下没有成员
- **THEN** 系统显示空状态提示

### Requirement: 成员编辑

系统 SHALL 允许有权限的用户编辑成员信息。

#### Scenario: 编辑成员姓名

- **WHEN** 有权限的用户修改成员姓名
- **THEN** 系统更新成员姓名并显示成功提示

#### Scenario: 编辑成员邮箱

- **WHEN** 有权限的用户修改成员邮箱
- **THEN** 系统验证邮箱格式后更新并显示成功提示

#### Scenario: 编辑成员角色

- **WHEN** 有权限的用户修改成员角色
- **THEN** 系统更新成员角色并显示成功提示

#### Scenario: 无权限编辑

- **WHEN** 无权限的用户尝试编辑成员
- **THEN** 系统显示权限不足提示

### Requirement: 权限验证

系统 SHALL 在执行成员管理操作前验证用户权限。

#### Scenario: 添加成员权限检查

- **WHEN** 用户尝试添加成员
- **THEN** 系统检查用户是否有 `project:manage_members` 权限
- **AND IF** 无权限，显示权限不足提示

#### Scenario: 删除成员权限检查

- **WHEN** 用户尝试删除成员
- **THEN** 系统检查用户是否有 `project:manage_members` 权限
- **AND IF** 无权限，显示权限不足提示

#### Scenario: 编辑成员权限检查

- **WHEN** 用户尝试编辑成员
- **THEN** 系统检查用户是否有 `project:manage_members` 权限
- **AND IF** 无权限，显示权限不足提示

### Requirement: 操作反馈

系统 SHALL 在成员管理操作后提供即时反馈。

#### Scenario: 添加成功反馈

- **WHEN** 用户成功添加成员
- **THEN** 系统显示 Toast 成功提示

#### Scenario: 添加失败反馈

- **WHEN** 添加成员失败
- **THEN** 系统显示 Toast 错误提示

#### Scenario: 删除成功反馈

- **WHEN** 用户成功删除成员
- **THEN** 系统显示 Toast 成功提示

#### Scenario: 编辑成功反馈

- **WHEN** 用户成功编辑成员
- **THEN** 系统显示 Toast 成功提示

### Requirement: 确认对话框

系统 SHALL 在删除成员操作前显示确认对话框。

#### Scenario: 删除确认

- **WHEN** 用户点击删除成员按钮
- **THEN** 系统显示确认对话框
- **AND** 对话框显示成员姓名和警告信息

#### Scenario: 取消删除

- **WHEN** 用户在确认对话框中点击取消
- **THEN** 系统关闭对话框且不删除成员

#### Scenario: 确认删除

- **WHEN** 用户在确认对话框中点击确认
- **THEN** 系统删除成员并关闭对话框

### Requirement: 成员统计

系统 SHALL 显示成员统计信息。

#### Scenario: 成员总数显示

- **WHEN** 用户查看成员页面
- **THEN** 系统显示项目成员总数

#### Scenario: 角色分布显示

- **WHEN** 用户查看成员页面
- **THEN** 系统显示各角色的成员数量

### Requirement: 表单验证

系统 SHALL 验证成员表单输入。

#### Scenario: 邮箱格式验证

- **WHEN** 用户输入无效的邮箱格式
- **THEN** 系统显示邮箱格式错误提示

#### Scenario: 必填字段验证

- **WHEN** 用户提交空白的必填字段
- **THEN** 系统显示必填字段错误提示

#### Scenario: 邮箱唯一性验证

- **WHEN** 用户输入已存在的邮箱
- **THEN** 系统显示邮箱已存在提示

### Requirement: 空状态处理

系统 SHALL 提供友好的空状态提示。

#### Scenario: 无成员空状态

- **WHEN** 项目没有成员
- **THEN** 系统显示空状态引导添加成员

#### Scenario: 搜索无结果

- **WHEN** 搜索没有匹配结果
- **THEN** 系统显示搜索无结果提示

#### Scenario: 筛选无结果

- **WHEN** 筛选条件没有匹配成员
- **THEN** 系统显示筛选无结果提示

### Requirement: 直接访问团队成员

系统 SHALL 允许用户直接访问团队成员页面，无需先选择项目。

#### Scenario: 从侧边栏访问

- **WHEN** 用户在侧边栏点击"团队成员"链接
- **THEN** 系统导航到 `/team` 页面
- **AND** 显示所有团队成员列表

#### Scenario: 直接URL访问

- **WHEN** 用户直接在浏览器访问 `/team` URL
- **THEN** 系统显示全局团队成员页面
- **AND** 无需项目上下文

#### Scenario: 全局成员管理

- **WHEN** 用户在全局成员页面进行操作
- **THEN** 系统支持搜索、筛选、排序所有成员
- **AND** 支持添加、编辑、删除全局成员

### Requirement: 路由独立性

团队成员页面 SHALL 作为独立路由存在，不依赖于项目路由。

#### Scenario: 独立路由配置

- **WHEN** 系统配置路由
- **THEN** `/team` 路由独立于 `/projects` 路由存在
- **AND** 可以直接访问

#### Scenario: 导航菜单无项目依赖

- **WHEN** 用户查看侧边栏导航
- **THEN** "团队成员"链接无需项目选择即可点击
- **AND** 不显示"需要选择项目"的禁用状态

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

