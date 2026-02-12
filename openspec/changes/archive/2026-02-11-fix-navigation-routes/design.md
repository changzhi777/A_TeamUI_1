# Design: 修复侧边栏导航路由

## Context
当前侧边栏导航配置在 `src/components/layout/data/sidebar-data.ts` 中，包含三个指向不存在路由的导航项：
- "团队成员" → `/team`
- "分镜头创作" → `/storyboard`
- "剧本编辑" → `/script

实际功能路由都是**项目特定的**：
- `/projects/$id/team` - 团队成员管理
- `/projects/$id/storyboard` - 分镜头创作
- `/projects/$id/script` - 剧本编辑

项目列表页面的操作菜单中已经正确使用了这些路由（通过 `<Link to="/projects/$id/team" params={{ id: project.id }}>`），但侧边栏作为全局导航无法直接使用这些路由。

## Goals / Non-Goals
- **Goals**:
  - 修复侧边栏导航的失效路由
  - 提供清晰的用户引导，让用户理解这些功能需要先选择项目
  - 保持现有路由架构不变（继续使用项目特定路由）

- **Non-Goals**:
  - 不创建新的全局路由（如 `/team`、`/storyboard`）
  - 不改变现有的项目特定路由架构
  - 不重构整个导航系统

## Decisions

### 决策1：使用项目上下文感知导航
**方案**：修改侧边栏导航逻辑，当用户点击需要项目上下文的导航项时：
1. 检查 `projectStore` 中是否有 `currentProjectId`
2. 如果有，使用该 ID 构建正确的项目路由
3. 如果没有，显示提示并引导用户选择项目

**理由**：
- 保持现有路由架构不变
- 符合应用的业务逻辑（团队成员、分镜头、剧本都是项目级别的功能）
- 提供清晰的用户引导

**替代方案**：
- 创建全局路由并重定向到最近的项目 → 复杂度高，用户可能不知道会被重定向到哪个项目
- 移除这些导航项 → 降低用户体验，无法快速访问这些功能

### 决策2：添加 `currentProjectId` 到 projectStore
**方案**：在 `src/stores/project-store.ts` 中添加 `currentProjectId` 状态，用于跟踪用户当前操作的项目。

**理由**：
- 提供全局项目上下文
- 支持侧边栏导航的上下文感知
- 为未来可能的功能扩展（如全局快捷操作）提供基础

### 决策3：使用自定义导航处理器
**方案**：在 `src/components/layout/sidebar.tsx` 中添加导航处理逻辑，而不是在 sidebar-data.ts 中硬编码路由。

**理由**：
- 保持 `sidebar-data.ts` 作为静态配置数据
- 将导航逻辑集中在 Sidebar 组件中
- 支持更灵活的导航行为（如条件跳转、确认提示等）

## Risks / Trade-offs
- **风险**：用户可能在没有项目上下文时感到困惑
  - **缓解**：提供清晰的提示和引导，引导用户选择或创建项目
- **权衡**：需要修改 Sidebar 组件逻辑
  - **理由**：这是解决导航失效问题的必要修改，改动范围可控

## Migration Plan
1. 在 `project-store.ts` 中添加 `currentProjectId` 状态和相关方法
2. 修改 `sidebar-data.ts`，将需要项目上下文的导航项标记为 `requiresProject: true`
3. 修改 `Sidebar` 组件，添加导航处理逻辑
4. 测试导航功能：
   - 有项目上下文时能正确跳转
   - 无项目上下文时显示提示
   - 切换项目后导航更新

## Open Questions
- 无
