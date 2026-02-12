# Testing Guide

本指南介绍 A_TeamUI 后端服务的测试框架和测试执行方法。

## 测试框架

我们使用 **Vitest** 作为测试框架，选择原因：
- 与 Vite 生态系统的兼容性
- 快速的测试执行
- 内置的 TypeScript 支持
- 良好的 watch 模式和 UI

## 安装测试依赖

```bash
cd server
pnpm install
```

测试依赖包括：
- `vitest` - 测试运行器
- `@vitest/coverage-v8` - 代码覆盖率工具

## 测试结构

```
server/
├── test/
│   ├── setup.ts              # 全局测试配置
│   ├── helpers/              # 测试辅助函数
│   │   ├── api-client.ts     # HTTP 请求客户端
│   │   ├── database.ts      # 数据库设置/清理
│   │   ├── test-data.ts     # 测试数据生成器
│   │   └── index.ts         # 导出所有辅助函数
│   ├── api/                 # API 端点测试
│   │   ├── auth.test.ts     # 认证 API 测试
│   │   ├── projects.test.ts # 项目 API 测试
│   │   └── storyboard.test.ts # 分镜头 API 测试
│   ├── middleware/          # 中间件测试
│   │   └── auth.test.ts     # 认证中间件测试
│   └── websocket/           # WebSocket 测试
│       └── server.test.ts   # WebSocket 服务器测试
```

## 运行测试

### 运行所有测试

```bash
pnpm test
```

### 监听模式（文件变化时自动重新运行）

```bash
pnpm test --watch
```

### 运行特定测试文件

```bash
pnpm test auth.test.ts
```

### 运行匹配模式的测试

```bash
pnpm test --testNamePattern="should login"
```

### UI 模式

```bash
pnpm test:ui
```

### 生成覆盖率报告

```bash
pnpm test:coverage
```

覆盖率报告将生成在 `coverage/` 目录。

## 测试环境

测试使用独立的环境配置（`.env.test`）：

- **数据库**: `a_teamui_test` - 独立的测试数据库
- **Redis**: 数据库 15 - 避免与开发环境冲突
- **端口**: 动态分配，避免端口冲突

在运行测试前，确保：

1. MySQL 运行并创建了测试数据库：
   ```sql
   CREATE DATABASE a_teamui_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. Redis 运行在默认端口（6379）

## 测试辅助函数

### createTestClient(app)

创建用于测试的 API 客户端：

```typescript
import { createTestClient } from './helpers'
import { authRouter } from '../src/api/auth'

const app = new Hono()
app.route('/api/auth', authRouter)
const client = createTestClient(app)

// Make requests
const response = await client.post('/api/auth/register', userData)
expect(response.status).toBe(200)
```

### setupTestDatabase() / cleanupTestDatabase()

设置和清理测试数据库：

```typescript
import { setupTestDatabase, cleanupTestDatabase } from './helpers'

beforeAll(async () => {
  await setupTestDatabase()  // 创建测试用户、清理数据
})

afterAll(async () => {
  await cleanupTestDatabase()  // 清理所有测试数据
})
```

### createTestUser() / createTestProject() / createTestShot()

创建测试数据：

```typescript
import { createTestUser, createTestProject, createTestShot } from './helpers'

const userId = await createTestUser({
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123',
  role: 'member',
})

const projectId = await createTestProject(userId, {
  name: 'Test Project',
  type: 'shortDrama',
})
```

## 编写测试

### 基本测试结构

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { createTestClient } from '../helpers'

describe('Feature Name', () => {
  let client: ApiClient

  beforeEach(() => {
    // 每个测试前的设置
    client = createTestClient(app)
  })

  it('should do something successfully', async () => {
    const response = await client.get('/api/endpoint')

    expect(response.status).toBe(200)
    expect(response.data.success).toBe(true)
  })
})
```

### API 测试最佳实践

1. **测试成功场景**: 验证正常操作流程
2. **测试错误场景**: 验证错误处理和边界条件
3. **测试认证**: 验证权限和访问控制
4. **测试验证**: 验证输入验证 schema
5. **清理数据**: 每个测试后清理创建的数据

```typescript
describe('POST /api/projects', () => {
  it('should create project with valid data', async () => {
    const authClient = client.withAuth(token)
    const response = await authClient.post('/api/projects', {
      name: 'Test Project',
      type: 'shortDrama',
    })

    expect(response.status).toBe(200)
    expect(response.data.data).toHaveProperty('id')
  })

  it('should fail with invalid type', async () => {
    const authClient = client.withAuth(token)
    const response = await authClient.post('/api/projects', {
      name: 'Test Project',
      type: 'invalid-type',
    })

    expect(response.status).toBe(400)
  })

  it('should require authentication', async () => {
    const response = await client.post('/api/projects', {
      name: 'Test Project',
    })

    expect(response.status).toBe(401)
  })
})
```

## 持续集成

测试应在 CI/CD 管道中运行：

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: password
          MYSQL_DATABASE: a_teamui_test
        ports:
          - 3306:3306

      redis:
        image: redis:7
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 20

      - name: Install dependencies
        run: cd server && pnpm install

      - name: Run tests
        run: cd server && pnpm test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## 故障排除

### 数据库连接失败

确保 MySQL 正在运行且测试数据库已创建：

```bash
mysql -u root -p
CREATE DATABASE a_teamui_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Redis 连接失败

确保 Redis 正在运行：

```bash
redis-cli ping
# 应该返回 PONG
```

### 测试超时

某些测试可能需要更多时间。可以在 `vitest.config.ts` 中调整超时：

```typescript
export default defineConfig({
  test: {
    testTimeout: 15000,  // 增加到 15 秒
    hookTimeout: 15000,
  },
})
```

## 下一步

- [ ] 添加更多集成测试
- [ ] 增加代码覆盖率目标（当前目标：80%）
- [ ] 添加性能测试
- [ ] 添加 E2E 测试（使用 Playwright 或类似工具）
