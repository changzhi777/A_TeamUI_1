# Proposal: implement-task-queue

## Why

当前系统的 API 调用直接同步执行，对于耗时操作（如批量数据处理、AI 生成、文件导出等）会导致前端等待时间过长，影响用户体验。同时，高并发访问可能对 MySQL 数据库造成压力。

需要实现一个任务队列系统来：
1. 异步处理耗时操作，提升前端响应速度
2. 使用 Redis 缓存热点数据，减少 MySQL 访问压力
3. 提供任务管理和监控功能
4. 实现任务执行状态的消息提醒

## What Changes

### 后端功能

1. **任务队列服务**
   - 基于 Redis 实现任务队列（使用 Bull 或直接使用 Redis List）
   - 支持任务优先级、重试、超时处理
   - 任务状态管理（pending、running、completed、failed）

2. **任务调度 API**
   - 创建任务 API
   - 查询任务状态 API
   - 取消任务 API
   - 任务列表管理 API

3. **WebSocket 实时通知**
   - 任务状态变更实时推送
   - 任务完成/失败消息提醒

4. **Redis 缓存优化**
   - API 响应缓存
   - 查询结果缓存
   - 热点数据预热

### 前端功能

1. **任务队列管理界面**
   - 在"系统状态"下新增"任务队列"菜单
   - 任务列表展示（状态、进度、创建时间等）
   - 任务详情查看
   - 任务取消/重试操作

2. **消息提醒**
   - 任务完成/失败通知
   - 浏览器通知支持

## Scope

### 后端文件（新建/修改）

- `server/src/services/task-queue.ts` - 任务队列服务
- `server/src/services/task-worker.ts` - 任务执行器
- `server/src/api/tasks/index.ts` - 任务管理 API
- `server/src/websocket/task-notifications.ts` - 任务通知
- `server/src/config/redis.ts` - Redis 配置扩展

### 前端文件（新建/修改）

- `src/features/tasks/pages/task-queue-page.tsx` - 任务队列页面
- `src/features/tasks/components/task-list.tsx` - 任务列表组件
- `src/features/tasks/components/task-detail.tsx` - 任务详情组件
- `src/routes/_authenticated/settings/tasks.tsx` - 路由
- `src/stores/task-store.ts` - 任务状态管理
- `src/lib/api/tasks.ts` - 任务 API

## Goals

1. 异步处理耗时 API 调用，提升用户体验
2. 减少 MySQL 数据库压力
3. 提供可视化的任务管理界面
4. 实现实时任务状态通知

## Non-Goals

- 不修改现有的认证和权限系统
- 不修改数据库 schema
- 不实现分布式任务调度（单机版优先）
