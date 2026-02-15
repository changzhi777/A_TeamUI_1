# Tasks: 企业级治理系统实施任务

## 阶段1: 版权与版本管理（P0）

### 1.1 版本管理基础设施
- [x] 更新 `package.json` 版本号为 `0.1.0`（保持现有版本 2.2.1，新模块使用 V 前缀格式）
- [x] 创建 `src/lib/version.ts` 版本信息模块
- [x] 在系统设置页面显示版本信息
- [x] 在登录页面底部显示版权信息

### 1.2 版权信息添加
- [x] 创建版权头模板文件 `.vscode/file-header.code-snippets`
- [ ] 为现有核心文件添加版权头
  - [ ] `src/stores/*.ts`
  - [ ] `src/lib/api/*.ts`
  - [ ] `src/features/*/components/*.tsx`
  - [ ] `src/routes/**/*.tsx`

## 阶段2: 权限管理增强（P1）

### 2.1 角色权限扩展
- [x] 更新 `auth-store.ts` 角色定义
  - [x] 确认 `super_admin` 和 `admin` 角色
  - [x] 添加功能模块权限常量
- [x] 创建权限映射配置 `src/lib/permissions.ts`
- [x] 添加 `useRoleCheck` Hook `src/hooks/use-role-check.ts`

### 2.2 侧边栏权限控制
- [x] 更新 `sidebar-data.ts` 添加权限字段（通过 `sidebarPermissionMap` 实现）
- [x] 创建 `filterSidebarByPermission` 函数 `src/lib/sidebar-filter.ts`
- [x] 在 `AppSidebar` 组件中应用权限过滤
- [ ] 测试不同角色侧边栏显示

### 2.3 团队成员权限管理
- [x] 创建权限管理组件 `TeamPermissionManager.tsx`
- [x] 添加角色选择下拉菜单
- [x] 实现权限变更确认对话框
- [ ] 添加权限变更审计日志（需要后端支持）

### 2.4 功能模块权限控制
- [ ] 项目管理页面权限控制
- [ ] 分镜头页面权限控制
- [ ] 角色设计页面权限控制
- [ ] 资产库页面权限控制

## 阶段3: 系统设置中文化（P1）

### 3.1 显示设置中文化
- [x] 更新 `DisplaySettingsSection` 组件（已使用 i18n）
- [x] 添加中文翻译映射（i18n 已包含完整翻译）
- [x] 更新 i18n 配置（已完成）

### 3.2 侧边栏菜单对应功能
- [x] 审查侧边栏一级菜单与功能对应
- [x] 审查侧边栏二级菜单与功能对应
- [x] 添加缺失的菜单项（侧边栏结构已完整）
- [x] 移除无效的菜单项（已通过权限过滤实现）

## 阶段4: Git规范与文档（P1）

### 4.1 Git规范文档
- [x] 创建 `docs/git-workflow.md`
- [x] 定义分支策略
- [x] 定义Commit信息规范
- [x] 定义版本标签规范

### 4.2 项目文档更新
- [x] 更新 `openspec/project-zh.md`
  - [x] 添加版权信息
  - [x] 添加版本管理规范
  - [x] 添加Git工作流
- [x] 创建 `docs/code-review-checklist.md`

## 阶段5: 测试框架增强（P2）

### 5.1 单元测试集成
- [x] 安装 Vitest 依赖
- [x] 配置 `vitest.config.ts`
- [x] 创建测试工具函数 `src/test/utils.tsx`
- [x] 添加 npm scripts

### 5.2 核心模块测试
- [x] 添加 `auth-store.test.ts`
- [x] 添加 `permissions.test.ts`
- [x] 添加 `version.test.ts`

## 阶段6: Swagger预留（P2）

### 6.1 API类型定义
- [x] 创建 `src/lib/api/openapi-types.ts`
- [x] 定义核心数据模型 Schema
- [x] 创建 Swagger 配置预留

### 6.2 API文档组件
- [ ] 创建 API 文档页面路由预留
- [ ] 添加环境变量配置

## 验证任务

### 集成测试
- [ ] 超级管理员登录验证所有功能可访问
- [ ] 管理员登录验证团队管理功能
- [ ] 普通成员登录验证只读功能
- [ ] 侧边栏权限过滤验证
- [ ] 版本信息显示验证

### 文档审查
- [x] Git规范文档完整性
- [x] 代码审查清单完整性
- [ ] 版权信息一致性

## 依赖关系

```
1.1 → 1.2 → 2.1 → 2.2 → 2.3 → 2.4
              ↓
           3.1 → 3.2
              ↓
           4.1 → 4.2
              ↓
           5.1 → 5.2
              ↓
           6.1 → 6.2
```

## 预计工时

| 阶段 | 任务数 | 预计时间 |
|------|--------|---------|
| 阶段1 | 8 | 2h |
| 阶段2 | 16 | 6h |
| 阶段3 | 6 | 2h |
| 阶段4 | 6 | 2h |
| 阶段5 | 6 | 3h |
| 阶段6 | 4 | 2h |
| 验证 | 7 | 2h |
| **总计** | **53** | **19h** |
