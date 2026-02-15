# Tasks

## Task 1: 更新 UnifiedTeamMembers 组件使用真实 API

**Description**: 将 `UnifiedTeamMembers` 组件从 mock 数据切换到真实的 `/api/members` API。

**Files**:
- `src/features/projects/components/unified-team-members.tsx`

**Changes**:
- [x] 移除 mock 数据生成逻辑
- [x] 使用 `getMembers()` API 获取成员列表
- [x] 实现分页状态管理
- [x] 实现搜索和筛选功能
- [x] 处理加载和错误状态

**Verification**:
- [x] 全局成员页面显示真实的数据库用户
- [x] 分页功能正常工作
- [x] 搜索功能正常工作
- [x] 角色筛选功能正常工作

---

## Task 2: 实现成员 CRUD 操作

**Description**: 实现创建、更新、删除成员的功能。

**Files**:
- `src/features/projects/components/unified-team-members.tsx`

**Changes**:
- [x] 集成 `addMember()` API 创建新用户
- [x] 集成 `updateMember()` API 更新用户信息
- [x] 集成 `deleteMember()` API 删除用户
- [x] 添加操作确认对话框
- [x] 处理操作成功/失败的反馈

**Verification**:
- [x] 可以创建新用户
- [x] 可以编辑用户信息
- [x] 可以删除用户（有权限检查）
- [x] 操作后有 toast 反馈

---

## Task 3: 实现项目分配功能

**Description**: 实现将用户分配到项目的功能。

**Files**:
- `src/features/projects/components/unified-team-members.tsx`

**Changes**:
- [x] 添加"分配项目"对话框
- [x] 使用 `addMemberToProject()` API
- [x] 使用 `removeMemberFromProject()` API
- [x] 显示用户当前参与的项目列表

**Verification**:
- [x] 可以为用户分配项目
- [x] 可以移除用户的项目参与
- [x] 显示用户参与的项目数量

---

## Task 4: 创建用户管理页面组件

**Description**: 创建独立的用户管理页面组件 `UserManagementPage`。

**Files**:
- `src/features/settings/components/user-management-page.tsx` (新建)

**Changes**:
- [x] 创建用户管理页面布局
- [x] 实现用户数据表格
- [x] 实现分页、搜索、排序功能
- [x] 实现用户删除功能
- [x] 实现项目数量显示

**Verification**:
- [x] 页面正常渲染
- [x] 数据表格显示正确
- [x] 所有功能正常工作

---

## Task 5: 创建用户管理路由

**Description**: 添加用户管理页面的路由配置。

**Files**:
- `src/routes/_authenticated/settings/users.tsx` (新建)

**Changes**:
- [x] 创建路由文件
- [x] 配置权限检查（仅 super_admin 可访问）
- [x] 添加页面标题和元数据

**Verification**:
- [x] `/settings/users` 路由正常工作
- [x] 非超级管理员无法访问

---

## Task 6: 更新侧边栏导航

**Description**: 在设置菜单中添加用户管理入口。

**Files**:
- `src/components/layout/data/sidebar-data.ts`

**Changes**:
- [x] 在"设置"分组下添加"用户管理"菜单项
- [x] 配置权限检查（仅 super_admin 可见）

**Verification**:
- [x] 超级管理员可以看到用户管理菜单
- [x] 非超级管理员看不到该菜单
- [x] 点击菜单可以正确跳转

---

## Task 7: 更新国际化文本

**Description**: 添加用户管理相关的国际化文本。

**Files**:
- `src/i18n/zh-CN.ts`

**Changes**:
- [x] 添加"用户管理"标题文本
- [x] 添加用户相关操作文本
- [x] 添加项目分配相关文本

**Verification**:
- [x] 所有新文本正确显示中文
