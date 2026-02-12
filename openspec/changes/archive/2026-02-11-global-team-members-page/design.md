# global-team-members-page 设计文档

## Context

`TeamMembersPage` 组件已经实现了全局成员视图（当 `project` 为 `undefined` 时显示所有成员），但缺少独立的路由入口。当前用户必须通过 `/projects/$id/team` 访问，这限制了功能的可访问性。

**约束条件：**
- 必须复用现有的 `TeamMembersPage` 组件
- 不能破坏现有的项目成员管理功能
- 必须保持路由结构的一致性

**利益相关者：**
- 管理员：需要快速访问所有成员
- 项目经理：需要在项目上下文外管理团队成员

## Goals / Non-Goals

**Goals:**
- 提供独立的 `/team` 路由
- 移除侧边栏中的项目依赖限制
- 支持全局成员的搜索、筛选、排序

**Non-Goals:**
- 修改 `TeamMembersPage` 组件的核心逻辑
- 创建新的成员管理页面组件

## Decisions

### 1. 路由结构

**决策：** 创建 `/routes/_authenticated/team.tsx` 作为独立路由

**替代方案考虑：**
- 选项 A：使用嵌套路由 `/members`（选中）
  - 优点：更清晰的语义
  - 缺点：需要更新所有相关链接
- 选项 B：保持 `/team` 路径（选中）
  - 优点：与现有侧边栏配置一致
  - 缺点：无

### 2. 组件复用

**决策：** 直接复用 `TeamMembersPage` 组件，利用其已有的全局视图逻辑

**理由：**
- 组件已经支持 `project` 为 `undefined` 的情况
- 避免代码重复
- 保持功能一致性

### 3. 侧边栏配置

**决策：** 移除 `requiresProject: true` 限制

**理由：**
- 独立路由不再需要项目上下文
- 允许用户直接访问

## Migration Plan

**迁移步骤：**
1. 创建 `/routes/_authenticated/team.tsx`
2. 更新 `sidebar-data.ts` 移除项目依赖
3. 测试 `/team` 路由访问
4. 测试从侧边栏导航

**回滚计划：**
- 保留 Git 历史记录
- 如有问题可快速回滚

## Open Questions

1. **是否需要面包屑导航调整？**
   - 全局页面不需要项目面包屑
   - 建议：保持现有面包屑逻辑（组件已处理）

2. **是否需要权限限制？**
   - 当前组件已有权限检查
   - 建议：保持现有权限逻辑
