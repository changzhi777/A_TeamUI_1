# User Management Specification

## ADDED Requirements

### Requirement: Global User List Display

系统 SHALL 在全局团队成员页面显示所有注册用户（来自 users 表）。

#### Scenario: View all database users in team list

- **Given** 用户已登录系统
- **When** 用户访问 `/team` 页面
- **Then** 系统显示所有数据库用户列表
- **And** 每个用户显示：姓名、邮箱、角色、参与项目数

#### Scenario: Search users by name or email

- **Given** 用户在全局成员页面
- **When** 用户在搜索框输入关键词
- **Then** 系统过滤显示匹配的用户

#### Scenario: Filter users by role

- **Given** 用户在全局成员页面
- **When** 用户选择角色筛选条件
- **Then** 系统仅显示该角色的用户

---

### Requirement: User CRUD Operations

系统 SHALL 支持对用户的创建、读取、更新、删除操作。

#### Scenario: Create new user

- **Given** 用户具有超级管理员权限
- **When** 用户点击"添加成员"并填写信息
- **Then** 系统在 users 表创建新用户记录
- **And** 显示操作成功提示

#### Scenario: Update user information

- **Given** 用户具有相应权限
- **When** 用户编辑某个成员的信息
- **Then** 系统更新 users 表中的记录
- **And** 显示操作成功提示

#### Scenario: Delete user with permission check

- **Given** 用户尝试删除某个成员
- **When** 当前用户角色优先级高于目标用户
- **Then** 系统删除该用户
- **And** 显示操作成功提示

#### Scenario: Delete user without permission

- **Given** 用户尝试删除某个成员
- **When** 当前用户角色优先级不高于目标用户
- **Then** 系统拒绝删除操作
- **And** 显示权限不足提示

---

### Requirement: Project Assignment

系统 SHALL 支持将用户分配到项目。

#### Scenario: Assign user to project

- **Given** 用户具有项目管理权限
- **When** 用户为某个成员分配项目
- **Then** 系统在 project_members 表创建关联记录
- **And** 显示操作成功提示

#### Scenario: Remove user from project

- **Given** 用户具有项目管理权限
- **When** 用户移除某个成员的项目参与
- **Then** 系统删除 project_members 表中的关联记录
- **And** 显示操作成功提示

#### Scenario: View user's project list

- **Given** 用户在成员详情页
- **When** 查看某个成员的项目参与情况
- **Then** 系统显示该成员参与的所有项目列表

---

### Requirement: User Management Page

系统 SHALL 提供独立的用户管理页面供超级管理员使用。

#### Scenario: Access user management page

- **Given** 用户是超级管理员 (super_admin)
- **When** 用户访问 `/settings/users`
- **Then** 系统显示用户管理页面

#### Scenario: Non-super-admin access denied

- **Given** 用户不是超级管理员
- **When** 用户尝试访问 `/settings/users`
- **Then** 系统重定向到 403 错误页面

#### Scenario: User management sidebar entry

- **Given** 用户是超级管理员
- **When** 用户查看侧边栏设置菜单
- **Then** 显示"用户管理"菜单项

#### Scenario: Non-super-admin no sidebar entry

- **Given** 用户不是超级管理员
- **When** 用户查看侧边栏设置菜单
- **Then** 不显示"用户管理"菜单项

---

### Requirement: Current User Identification

系统 SHALL 在用户列表中标识当前登录用户。

#### Scenario: Highlight current user in list

- **Given** 用户已登录系统
- **When** 用户查看成员列表
- **Then** 当前用户的行有特殊高亮样式
- **And** 显示"我"标签

#### Scenario: Prevent self-deletion

- **Given** 用户查看自己的成员记录
- **When** 用户尝试删除自己
- **Then** 删除按钮被禁用
