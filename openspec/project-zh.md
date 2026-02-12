# 项目上下文

## 目的

本项目是一个基于 Shadcn UI 和 Vite 构建的 **AI 辅助短剧创作平台**，专注于短剧项目的管理、分镜头创作和团队协作。

## 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite
- **路由**: TanStack Router（文件系统路由）
- **状态管理**: Zustand
- **数据获取**: TanStack Query
- **UI 库**: Shadcn UI（基于 Radix UI + TailwindCSS v4）
- **表单**: React Hook Form + Zod 验证
- **日期处理**: date-fns
- **数据表格**: TanStack Table
- **国际化**: 自定义 i18n 系统
- **导出**: jsPDF、docx

## 项目约定

### 代码风格

- **单引号**: 使用单引号而非双引号
- **无分号**: 语句末尾不使用分号
- **组件命名**: PascalCase 用于组件，camelCase 用于工具函数和变量
- **文件命名**: kebab-case 用于文件名
- **代码格式化**: 使用 Prettier 自动格式化
- **注释**: 与现有代码库注释语言保持一致（中文）

### 架构模式

- **功能模块化**: 按功能域组织代码（auth、projects、storyboard 等）
- **关注点分离**: 使用 hooks 和 stores 分离业务逻辑
- **类型安全**: 启用 TypeScript strict 模式进行类型检查
- **可测试性**: 编写可测试的组件和工具函数

### 测试策略

- **E2E 测试**: 使用 Playwright 进行端到端测试
- **单元测试**: 为关键工具函数编写单元测试
- **手动测试**: 开发前进行手动功能测试

### Git 工作流

- **分支策略**: 使用功能分支进行开发，main 分支保持稳定
- **提交规范**: 使用 Conventional Commits 格式
- **代码审查**: 所有合并需要通过 Pull Request 进行

## 领域知识

### 短剧创作

项目支持分镜头创作和管理，包括：
- 分镜头编辑器（列表、时间轴、网格视图）
- 分镜头配图功能
- 分镜头导入导出（JSON、PDF、Word）
- 模板系统（短剧模板管理）

### 团队协作

- 多用户实时协作编辑
- 团队成员权限管理
- 项目状态同步

### 用户认证

- JWT Token 认证
- 角色权限管理（admin/member）
- 会话管理

## 重要约束

- **数据存储**: 使用 MySQL + Redis 进行数据持久化和缓存
- **实时通信**: WebSocket 支持实时协作
- **浏览器兼容**: 支持现代浏览器（Chrome、Firefox、Edge）
- **性能**: 分镜头列表支持大量数据渲染

## 外部依赖

- **数据库**: MySQL 8.0
- **缓存**: Redis 7.0
- **后端**: Node.js + Express/Koa
- **前端构建**: Vite
