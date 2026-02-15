# Design: Task Queue System

## Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Frontend     │────▶│   API Server    │────▶│     Redis       │
│  (Task UI)      │     │  (Task API)     │     │  (Task Queue)   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                       │
        │                       │                       ▼
        │                       │               ┌─────────────────┐
        │                       │               │ Task Worker     │
        │                       │               │ (Consumer)      │
        │                       │               └─────────────────┘
        │                       │                       │
        │◀──────────────────────┼───────────────────────│
        │     WebSocket         │                       │
        │   (Notifications)     │                       ▼
        │                       │               ┌─────────────────┐
        │                       │               │    MySQL        │
        │                       │               │   (Storage)     │
        │                       │               └─────────────────┘
```

## Task Queue Implementation

### Option 1: BullMQ (Recommended)

- 成熟的 Redis 任务队列库
- 支持优先级、延迟、重试、进度跟踪
- 内置 UI 监控（可选）

### Option 2: Direct Redis Implementation

- 使用 Redis List 作为队列
- 轻量级，无额外依赖
- 需要自己实现更多功能

**Decision**: 使用 Option 2（Direct Redis），保持轻量级，与现有代码风格一致

## Task Data Structure

```typescript
interface Task {
  id: string
  type: 'export' | 'import' | 'ai_generate' | 'batch_process' | 'custom'
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  priority: 'low' | 'normal' | 'high'
  payload: Record<string, unknown>
  result?: Record<string, unknown>
  error?: string
  progress: number // 0-100
  createdAt: string
  startedAt?: string
  completedAt?: string
  createdBy: string
  retryCount: number
  maxRetries: number
}
```

## Redis Keys

```
task:queue:{priority}     - 任务队列 (List)
task:{taskId}             - 任务详情 (Hash)
task:running              - 正在执行的任务 (Set)
tasks:user:{userId}       - 用户任务列表 (List)
task:events:{taskId}      - 任务事件流 (List)
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/tasks | 创建任务 |
| GET | /api/tasks | 获取任务列表 |
| GET | /api/tasks/:id | 获取任务详情 |
| DELETE | /api/tasks/:id | 取消任务 |
| POST | /api/tasks/:id/retry | 重试任务 |

## WebSocket Events

| Event | Description |
|-------|-------------|
| task:created | 任务创建 |
| task:started | 任务开始执行 |
| task:progress | 任务进度更新 |
| task:completed | 任务完成 |
| task:failed | 任务失败 |
| task:cancelled | 任务取消 |

## Frontend State Management

使用 Zustand 管理任务状态：

```typescript
interface TaskStore {
  tasks: Task[]
  loading: boolean
  error: string | null

  fetchTasks: () => Promise<void>
  createTask: (type: string, payload: unknown) => Promise<Task>
  cancelTask: (id: string) => Promise<void>
  retryTask: (id: string) => Promise<void>

  // WebSocket handlers
  onTaskCreated: (task: Task) => void
  onTaskUpdated: (task: Task) => void
}
```

## Caching Strategy

1. **API Response Caching**
   - 缓存频繁访问的 API 响应
   - TTL: 根据数据类型设置

2. **Query Result Caching**
   - 缓存复杂查询结果
   - 数据变更时失效

3. **Hot Data Pre-warming**
   - 系统启动时预热热点数据
   - 定期刷新缓存
