# Design: test-character-design-module

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    角色设计模块测试架构                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │ 前端页面测试 │    │ API 调用测试 │    │ 任务队列测试 │         │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘         │
│         │                  │                  │                 │
│         v                  v                  v                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              MCP 浏览器工具 (截图分析)                    │   │
│  │  - mcp__zai-mcp-server__analyze_image                   │   │
│  │  - mcp__zai-mcp-server__extract_text_from_screenshot    │   │
│  │  - mcp__zai-mcp-server__diagnose_error_screenshot       │   │
│  └─────────────────────────────────────────────────────────┘   │
│         │                  │                  │                 │
│         v                  v                  v                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │  前端组件   │    │  后端 API   │    │  Redis 队列 │         │
│  │ (React)     │    │  (Hono)     │    │  (Task Queue)│        │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Test Flow

### Phase 1: 环境验证
1. 检查后端服务状态 (`/health`)
2. 检查前端服务状态 (`/character`)
3. 验证数据库连接
4. 验证 Redis 连接

### Phase 2: 页面功能测试
1. 访问角色列表页面
2. 截图分析页面元素
3. 测试创建角色功能
4. 测试编辑角色功能
5. 测试删除角色功能

### Phase 3: AI 生成功能测试
1. 测试图片生成（直接模式）
2. 测试图片生成（任务队列模式）
3. 测试语音生成
4. 测试服装变体生成

### Phase 4: API 调用验证
1. 测试 `/api/tasks` 创建任务
2. 测试 `/api/tasks` 查询任务
3. 测试 `/api/tasks/:id` 获取详情
4. 测试 `/api/tasks/:id` 取消任务
5. 测试 `/api/tasks/:id/retry` 重试任务

### Phase 5: 任务队列执行测试
1. 提交图片生成任务
2. 监控任务状态变化
3. 验证任务结果
4. 测试任务失败重试

## Test Tools

### MCP 工具使用
```typescript
// 分析页面截图
mcp__zai-mcp-server__analyze_image({
  image_source: "screenshot_url",
  prompt: "分析页面是否有错误提示、缺失元素或布局问题"
})

// 提取文本内容
mcp__zai-mcp-server__extract_text_from_screenshot({
  image_source: "screenshot_url",
  prompt: "提取页面中的所有文本内容和错误信息"
})

// 诊断错误截图
mcp__zai-mcp-server__diagnose_error_screenshot({
  image_source: "error_screenshot_url",
  prompt: "分析错误原因并提供修复建议"
})
```

### curl API 测试
```bash
# 测试后端健康状态
curl http://localhost:3001/health

# 测试任务 API
curl http://localhost:3001/api/tasks

# 创建任务
curl -X POST http://localhost:3001/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"type":"image_generation","payload":{...}}'
```

## Error Detection Strategy

### 前端错误检测
1. 检查控制台错误（通过截图分析错误提示）
2. 检查页面加载状态
3. 检查表单验证提示
4. 检查加载动画和状态指示器

### API 错误检测
1. 检查 HTTP 状态码
2. 检查响应格式
3. 检查错误消息
4. 检查超时处理

### 任务队列错误检测
1. 检查任务状态转换
2. 检查错误日志
3. 检查重试机制
4. 检查结果存储
