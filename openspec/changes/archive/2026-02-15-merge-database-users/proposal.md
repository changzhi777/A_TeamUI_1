# Proposal: merge-database-users

## Summary

将数据库用户表 (users) 与团队成员管理进行合并，实现统一的用户/成员管理界面。

## Background

当前系统存在两套用户数据：
1. **users 表**：存储所有注册用户的核心信息（email, name, role, avatar 等）
2. **project_members 表**：存储项目级别的成员关系

用户需要在团队成员管理中直接看到和操作数据库用户，实现：
- A) 前端展示合并：在团队成员列表中显示来自 users 表的数据库用户
- B) 数据关联合并：将 users 表的邮箱与 project_members 关联
- C) 用户管理界面：创建一个新的"用户管理"页面，管理所有系统用户

## Goals

1. 在 `/team` 全局成员页面显示所有数据库用户（来自 users 表）
2. 支持查看每个用户的项目参与情况（通过 project_members 关联）
3. 创建独立的 `/settings/users` 用户管理页面，供超级管理员使用
4. 保持现有的项目成员管理功能 (`/projects/$id/team`) 不变

## Non-Goals

- 不修改数据库 schema 结构
- 不修改后端 API 接口（已存在完整的 `/api/members` 接口）
- 不改变现有的权限验证逻辑

## Approach

### Phase 1: 更新 UnifiedTeamMembers 组件使用真实 API

当前 `UnifiedTeamMembers` 组件使用 mock 数据，需要改为调用 `/api/members` 接口获取真实的数据库用户。

### Phase 2: 创建用户管理页面

在设置模块下创建新的用户管理页面 `/settings/users`，提供：
- 用户列表（分页、搜索、筛选）
- 用户 CRUD 操作
- 用户项目分配管理

### Phase 3: 更新侧边栏导航

在设置菜单中添加"用户管理"入口（仅超级管理员可见）。

## User Stories

1. **作为超级管理员**，我想要查看系统中所有注册用户，以便进行统一管理
2. **作为超级管理员**，我想要为用户分配项目角色，以便控制项目访问权限
3. **作为项目管理员**，我想要在全局成员页面看到所有用户，以便邀请他们加入项目
4. **作为普通用户**，我想要看到自己在哪些项目中，以便了解自己的工作范围

## Risks

- 用户数据量增大时的分页性能
- 权限边界需要清晰定义（谁可以管理哪些用户）

## Dependencies

- 依赖 `unify-team-members` 提案已完成
- 依赖现有的 `/api/members` 后端 API
