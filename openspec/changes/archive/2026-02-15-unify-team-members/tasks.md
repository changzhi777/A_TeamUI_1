# Tasks

## Task 1: 创建角色层级比较工具函数

**Description**: 在 `src/lib/permissions.ts` 中添加角色层级比较函数。

**Files**:
- `src/lib/permissions.ts`

**Changes**:
- ✅ 添加 `getRolePriority(role: UserRole): number` 函数
- ✅ 添加 `canManageRole(actorRole: UserRole, targetRole: UserRole): boolean` 函数
- ✅ 添加 `canEditMemberRole(actorRole: UserRole, targetRole: UserRole): boolean` 函数
- ✅ 定义角色优先级常量

**Verification**:
- [x] `getRolePriority('super_admin') > getRolePriority('admin')`
- [x] `canManageRole('admin', 'member')` 返回 `true`
- [x] `canManageRole('member', 'admin')` 返回 `false`

---

## Task 2: 创建统一的团队成员组件

**Description**: 创建 `UnifiedTeamMembers` 组件，统一全局成员和项目成员的 UI。

**Files**:
- `src/features/projects/components/unified-team-members.tsx` (新建)

**Changes**:
- ✅ 提取现有 `TeamMembersPage` 的核心逻辑
- ✅ 支持 `mode: 'global' | 'project'` 属性
- ✅ 支持当前用户高亮显示
- ✅ 集成层级权限检查

**Verification**:
- [x] 全局模式显示所有全局成员
- [x] 项目模式显示指定项目的成员
- [x] 当前登录用户有特殊标识

---

## Task 3: 实现当前用户标识功能

**Description**: 在成员列表中标识当前登录用户。

**Files**:
- `src/features/projects/components/unified-team-members.tsx`

**Changes**:
- ✅ 在成员行添加"我"标签/徽章
- ✅ 添加高亮样式（背景色）
- ✅ 禁止编辑/删除自己的操作

**Verification**:
- [x] 当前用户在列表中有"我"标签
- [x] 当前用户行有视觉高亮
- [x] 不能删除自己的成员记录

---

## Task 4: 实现层级权限控制

**Description**: 在成员操作中添加层级权限检查。

**Files**:
- `src/features/projects/components/unified-team-members.tsx`
- `src/lib/permissions.ts`

**Changes**:
- ✅ 编辑成员时检查 `canManageRole(currentRole, targetRole)`
- ✅ 删除成员时检查层级权限
- ✅ 无权限时禁用操作按钮并显示提示

**Verification**:
- [x] `member` 角色不能编辑 `admin` 角色
- [x] `admin` 角色可以编辑 `member` 角色
- [x] `admin` 角色不能编辑 `super_admin` 角色

---

## Task 5: 更新全局成员页面使用统一组件

**Description**: 将 `/team` 路由更新为使用统一组件。

**Files**:
- `src/routes/_authenticated/team.tsx`

**Changes**:
- ✅ 使用 `UnifiedTeamMembers` 组件替代当前实现
- ✅ 传递 `mode="global"`

**Verification**:
- [x] `/team` 页面正常显示
- [x] 所有成员操作正常工作
- [x] 当前用户正确标识

---

## Task 6: 更新项目成员页面使用统一组件

**Description**: 将 `/projects/$id/team` 路由更新为使用统一组件。

**Files**:
- `src/routes/_authenticated/projects/$id/team.tsx`

**Changes**:
- ✅ 使用 `UnifiedTeamMembers` 组件
- ✅ 传递 `mode="project"` 和 `projectId`

**Verification**:
- [x] `/projects/$id/team` 页面正常显示
- [x] 项目成员操作正常工作
- [x] 当前用户正确标识

---

## Task 7: 更新国际化文本

**Description**: 添加新的国际化文本。

**Files**:
- `src/i18n/zh-CN.ts`

**Changes**:
- ✅ 添加 "当前用户" / "我" 标签文本
- ✅ 添加权限不足的提示文本
- ✅ 添加层级权限相关的错误消息

**Verification**:
- [x] 所有新文本正确显示中文
