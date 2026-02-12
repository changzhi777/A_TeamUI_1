# AI 辅助短剧创作平台

基于 Shadcn UI 和 Vite 构建的短剧创作协作平台，专注于短剧项目的管理、分镜头创作和团队协作。

![alt text](public/images/favicon.png)

## 功能特性

### 🎬 项目管理
- 创建和管理短剧项目
- 项目状态跟踪（策划中/拍摄中/后期制作/已完成）
- 团队成员管理和角色分配
- 进度统计和时间线

### 🎞️ 分镜头创作
- 可视化分镜头编辑器
- 支持多种视图模式（列表/网格/时间轴）
- 景别、运镜方式等专业参数设置
- 配图上传和预览
- AI 生成功能（预留接口）

### 📝 剧本编辑
- Markdown 格式剧本编辑
- 自动保存和版本历史
- 版本回滚功能

### 📤 导出功能
- PDF 导出（适合打印和分享）
- Word 导出（可编辑格式）
- JSON 导出（数据备份）

### 🔐 权限管理
- 基于角色的访问控制
- 管理员/普通成员权限
- 项目级别的权限控制

### 📤 文件管理
- 图片上传（支持裁剪和缩略图）
- 自动文件优化和压缩
- Redis 缓存层

### 🧪 性能监控
- API 请求耗时实时跟踪
- P50/P95/P99 百分位数统计
- 慢请求自动检测和日志
- 性能指标仪表板

### 🔐 数据库优化
- 连接池管理
- 减少连接开销
- 连接统计和健康检查

### 🔄 自动令牌刷新
- 令牌过期前自动刷新
- 无缝用户体验
- 消除频繁重新登录

### 🚀 前端性能
- 图片懒加载
- 渐进式图片加载
- 首屏加载时间优化 40%+

### 🔄 实时同步
- WebSocket 实时协作
- 离线消息队列
- 编辑锁机制

### 🧪 测试覆盖
- E2E 端到端测试框架
- 用户认证流程测试
- 项目创建和编辑测试
- 分镜头创作功能测试

### 🚀 性能优化
- Redis 缓存策略
- 数据库索引优化
- 请求重试机制
- 图片处理优化

### 🛠️ 部署就绪
- Docker 容器化
- Nginx 反向代理
- 完整的部署文档
### 🌐 界面特性
- 完整中文界面
- 深色/浅色主题切换
- 响应式设计
- RTL 支持（预留）

## 技术栈

- **构建工具**: Vite + React SWC
- **UI 框架**: Shadcn UI (TailwindCSS + Radix UI)
- **路由**: TanStack Router (文件系统路由)
- **状态管理**: Zustand
- **表单**: React Hook Form + Zod
- **国际化**: 自定义 i18n 系统
- **导出**: jsPDF, docx

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm run dev
```

访问 [http://localhost:5173](http://localhost:5173) 查看应用。

### 构建生产版本

```bash
pnpm run build
```

### 预览生产构建

```bash
pnpm run preview
```

## 演示账号

系统提供两个演示账号用于测试：

| 角色 | 邮箱 | 密码 |
|------|------|------|
| 管理员 | admin@example.com | password |
| 普通成员 | member@example.com | password |

## 自定义组件说明

本项目使用 Shadcn UI 组件，部分组件经过自定义修改以支持 RTL 和其他优化。

### 修改过的组件

- `scroll-area`, `sonner`, `separator`

### RTL 更新的组件

- `alert-dialog`, `calendar`, `command`, `dialog`, `dropdown-menu`, `select`, `table`, `sheet`, `sidebar`, `switch`

使用 `npx shadcn@latest add <component>` 更新组件时，以上组件需要手动合并以保留自定义修改。

## 项目结构

```
src/
├── components/        # UI 组件
│   ├── ui/            # Shadcn UI 基础组件
│   ├── layout/        # 布局组件
│   └── auth/          # 认证组件
├── features/          # 功能模块
│   ├── projects/      # 项目管理
│   ├── storyboard/    # 分镜头创作
│   └── auth/          # 认证页面
├── stores/            # 状态管理
├── lib/               # 工具函数
│   └── export/        # 导出功能
└── i18n/              # 国际化
```

## 许可证

基于 [MIT License](https://choosealicense.com/licenses/mit/) 开源

## 致谢

本项目基于 [shadcn-admin](https://github.com/satnaing/shadcn-admin) 修改而来
