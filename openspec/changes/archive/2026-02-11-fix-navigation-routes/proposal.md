# Change: 修复侧边栏导航路由

## Why
当前侧边栏导航中的"团队成员"、"分镜头创作"、"剧本编辑"三个菜单项指向的路由（`/team`、`/storyboard`、`/script`）在代码库中不存在，导致用户点击这些导航项时无法正常跳转到对应的功能页面。

实际存在的路由是**项目特定的**：`/projects/$id/team`、`/projects/$id/storyboard`、`projects/$id/script`，这些路由需要一个项目ID参数才能正常工作。

## What Changes
- **MODIFIED** 侧边栏导航逻辑：将全局导航项改为上下文感知的导航
- **ADDED** 项目上下文检查机制：当用户点击这些导航项时，检查是否有当前选中的项目
- **ADDED** 无项目时的引导：如果没有选中项目，引导用户先选择项目或创建新项目
- **REMOVED** 无效的全局路由链接：`/team`、`/storyboard`、`/script`

## Impact
- Affected specs: `navigation` (新增)
- Affected code: `src/components/layout/data/sidebar-data.ts`、`src/components/layout/sidebar.tsx`、`src/stores/project-store.ts`
- User experience: 修复导航失效问题，提供清晰的项目上下文引导
