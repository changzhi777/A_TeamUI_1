# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个基于 Shadcn UI 和 Vite 构建的**AI 辅助短剧创作平台**，专注于短剧项目的管理、分镜头创作和团队协作。

## 常用命令

```bash
# 开发
pnpm run dev

# 构建（TypeScript 类型检查 + Vite 构建）
pnpm run build

# 代码检查
pnpm run lint

# 代码格式化
pnpm run format
pnpm run format:check  # 仅检查不修改

# 死代码检测
pnpm run knip

# 预览构建产物
pnpm run preview
```

## 技术栈

- **构建工具**：Vite + React SWC
- **路由**：TanStack Router（文件系统路由）
- **状态管理**：Zustand（用于 auth、projects、storyboard 状态）
- **数据获取**：TanStack Query
- **UI 库**：Shadcn UI（基于 Radix UI + TailwindCSS v4）
- **表单**：React Hook Form + Zod 验证
- **日期处理**：date-fns
- **数据表格**：TanStack Table
- **国际化**：自定义 i18n 系统
- **导出功能**：jsPDF、docx

## 项目架构

### 目录结构

```
src/
├── assets/              # 静态资源（Logo、品牌图标等）
├── components/
│   ├── ui/             # Shadcn UI 基础组件（ESLint 忽略）
│   ├── layout/         # 布局组件（Sidebar、Header、Nav）
│   ├── data-table/     # 可复用的 DataTable 组件集
│   └── auth/           # 认证相关组件（ProtectedRoute、PermissionGuard）
├── context/            # React Context Providers（主题、方向、字体等）
├── features/           # 功能模块（按业务逻辑组织）
│   ├── auth/           # 认证相关页面和组件
│   ├── errors/         # 错误页面组件
│   ├── projects/       # 项目管理功能
│   │   ├── components/ # 项目列表、详情、团队成员、剧本编辑器
│   ├── storyboard/     # 分镜头创作功能
│   │   └── components/ # 分镜头编辑器、表单、导出
│   └── dashboard/      # 仪表板（已废弃，重定向到项目列表）
├── routes/             # TanStack Router 文件系统路由
│   ├── (auth)/         # 认证路由布局组
│   ├── (errors)/       # 错误页面路由组
│   ├── _authenticated/ # 认证后的受保护路由
│   │   └── projects/   # 项目相关路由
│   │       └── $id/    # 项目详情相关路由
│   └── clerk/          # Clerk 集成路由（未使用）
├── stores/             # Zustand 状态管理
│   ├── auth-store.ts   # 认证和用户权限状态
│   ├── project-store.ts # 项目管理状态
│   └── storyboard-store.ts # 分镜头状态
├── hooks/              # 自定义 Hooks
│   ├── use-mobile.tsx
│   ├── use-dialog-state.tsx
│   ├── use-table-url-state.ts
│   └── use-permission-check.ts # 权限检查 Hook
├── lib/                # 工具函数和通用逻辑
│   ├── export/         # 导出功能（PDF、Word、JSON）
│   ├── cookies.ts      # Cookie 操作
│   └── utils.ts        # 通用工具函数
├── i18n/               # 国际化
│   ├── zh-CN.ts        # 中文翻译
│   └── context.tsx     # I18n Provider
├── config/             # 配置文件（字体等）
└── styles/             # 全局样式
```

### 路由架构

项目使用 TanStack Router 的文件系统路由：

- **`__root.tsx`**：根路由，设置全局组件
- **`_authenticated/route.tsx`**：受保护路由的布局，使用 `AuthenticatedLayout` 组件
- **`_authenticated/`**：重定向到 `/projects`
- **`(auth)`**：认证页面布局组（登录、注册、忘记密码等）
- **`(errors)`**：错误页面布局组（401、403、404、500、503）

### 主要功能路由

- `/projects` - 项目列表
- `/projects/$id` - 项目详情
- `/projects/$id/team` - 团队成员管理
- `/projects/$id/script` - 剧本编辑
- `/projects/$id/storyboard` - 分镜头创作

### 侧边栏数据结构

侧边栏导航由 `src/components/layout/data/sidebar-data.ts` 驱动，类型定义在 `types.ts`：

- **项目管理**：项目列表、团队成员
- **创作工具**：分镜头创作、剧本编辑
- **设置**：系统设置、帮助中心

### 数据模型架构

#### 项目状态 (project-store.ts)
- 项目 CRUD 操作
- 团队成员管理
- 剧本版本管理
- 进度跟踪

#### 分镜头状态 (storyboard-store.ts)
- 分镜头 CRUD 操作
- 排序和选择
- 视图模式切换
- 图片管理

#### 认证状态 (auth-store.ts)
- 用户认证和登录
- 角色权限（admin/member）
- 权限检查方法

### 导出功能架构

导出功能位于 `src/lib/export/`：

- **PDF 导出**：生成包含项目信息和分镜头的 PDF 文档
- **Word 导出**：生成可编辑的 Word 文档
- **JSON 导出**：完整项目数据备份

### 权限系统架构

权限系统基于用户角色：

- **admin**：管理员，完整权限
- **member**：普通成员，受限权限

权限组件：
- `<ProtectedRoute>` - 保护需要登录的路由
- `<PermissionGuard>` - 根据权限显示/隐藏内容
- `<AdminOnly>` - 仅管理员可见

权限 Hook：
- `usePermissionCheck()` - 权限检查和提示
- `usePermissionGuard()` - 操作包装

## 组件更新注意事项

### Shadcn UI 组件

项目包含自定义修改的 Shadcn 组件（支持 RTL 和其他优化）：

**修改过的组件**（需手动合并更新）：
- `scroll-area`、`sonner`、`separator`

**RTL 更新的组件**（主要为 RTL 支持）：
- `alert-dialog`、`calendar`、`command`、`dialog`、`dropdown-menu`、`select`、`table`、`sheet`、`sidebar`、`switch`

使用 `npx shadcn@latest add <component>` 更新组件时，以上组件需要手动合并以保留自定义修改。

## 代码风格

- **ESLint**：`src/components/ui` 目录被忽略，不进行检查
- **Prettier**：自动排序导入（使用 `@trivago/prettier-plugin-sort-imports`），配置了特定的导入顺序（第三方库 → 项目模块）
- **TypeScript**：强制类型导入（`@typescript-eslint/consistent-type-imports`）
- **未使用变量**：以下划线 `_` 开头的变量名会被忽略
- **代码格式**：单引号、无分号、LF 换行符、尾随逗号

## 自定义 Hooks

- **`useMobile()`**：检测移动端视口（<768px）
- **`useDialogState<T>()`**：对话框状态管理，支持字符串类型切换（如 "approve" | "reject"）
- **`useTableUrlState()`**：将 TanStack Table 状态（分页、过滤、排序）同步到 URL 查询参数
- **`usePermissionCheck()`**：权限检查和用户提示

## 工具函数

`src/lib/utils.ts` 提供常用工具：

- **`cn()`**：合并 Tailwind 类名（clsx + tailwind-merge）
- **`sleep()`**：异步延迟
- **`getPageNumbers()`**：生成分页页码数组（带省略号）

其他库模块：

- **`handle-server-error.ts`**：统一的 Axios 错误处理，通过 toast 显示错误信息
- **`cookies.ts`**：Cookie 操作封装（getCookie、setCookie、removeCookie）
- **`export/`**：导出功能（PDF、Word、JSON）

## 演示账号

系统提供两个演示账号用于测试：

- **管理员**：admin@example.com / password
- **普通成员**：member@example.com / password

## 主题与国际化

- **主题**：通过 `ThemeProvider` 管理亮/暗模式
- **方向**：通过 `DirectionProvider` 支持 LTR/RTL
- **字体**：通过 `FontProvider` 管理字体选择
- **国际化**：通过 `I18nProvider` 提供中文界面（预留多语言扩展）

## AI 功能预留

系统预留了以下 AI 功能接口（未实现）：

- AI 生成分镜头
- AI 生成配图
- AI 辅助剧本创作

这些功能显示"即将推出"提示，预留了扩展接口。

<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->