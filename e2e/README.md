# E2E 测试指南

## 概述

此目录包含端到端（E2E）测试，使用 Playwright 测试框架自动化测试 AI 短剧平台的核心用户流程。

## 测试覆盖范围

### 1. 用户认证 (`auth/login.spec.ts`)
- ✅ 管理员登录
- ✅ 普通成员登录
- ✅ 错误密码登录
- ✅ 空密码验证
- ✅ 记住登录状态
- ✅ 表单验证
- ✅ 回车键提交

### 2. 项目管理 (`projects/project-creation.spec.ts`)
- ✅ 创建新项目
- ✅ 项目表单验证
- ✅ 取消项目创建
- ✅ 创建不同类型项目
- ✅ 项目收藏功能
- ✅ 项目置顶功能
- ✅ 项目删除

### 3. 分镜头创作 (`storyboard/storyboard.spec.ts`)
- ✅ 创建新分镜头
- ✅ 分镜头重新排序
- ✅ 分镜头复制
- ✅ 批量删除
- ✅ 图片上传
- ✅ 视图模式切换
- ✅ 分镜头筛选
- ✅ 自动保存
- ✅ 导出功能

## 环境要求

### 开发环境
- Node.js >= 18
- pnpm >= 8
- 测试服务器运行在 `http://localhost:3001`
- 前端应用运行在 `http://localhost:5173`

### 浏览器
- Chromium（默认）
- Firefox（可选）

## 运行测试

### 安装依赖
```bash
pnpm install
```

### 运行所有测试
```bash
# 运行所有 E2E 测试（无头模式）
pnpm run test:e2e

# 运行测试并显示浏览器窗口
pnpm run test:e2e:ui

# 调试模式（显示浏览器）
pnpm run test:e2e:debug

# 运行特定测试文件
pnpm exec playwright test storyboard.spec.ts
```

### 查看测试报告
```bash
# 生成 HTML 报告
pnpm run test:e2e

# 打开报告
open playwright-report/index.html
```

## 测试数据

### 测试用户
- **管理员**: admin@example.com / password
- **普通成员**: member@example.com / password

### 项目命名规范
- 项目名称格式：`E2E测试项目-${Date.now()}`
- 自动清理：测试完成后，项目会被标记为可删除

## 编写测试的最佳实践

1. **测试独立性**
   - 每个测试应该独立运行，不依赖其他测试
   - 使用 `beforeEach` 和 `afterEach` 进行清理

2. **等待策略**
   - 使用 `waitForNetworkIdle()` 等待网络请求完成
   - 使用 `waitForSelector()` 等待元素出现
   - 设置合理的超时时间

3. **选择器策略**
   - 优先使用稳定的属性选择器（如 `data-*`、`aria-label`）
   - 避免使用脆弱的 CSS 选择器
   - 使用 `locator()` 而非 `locator()`

4. **断言策略**
   - 断言应该具体和有意义
   - 验证关键用户流程，而不仅仅是视觉元素
   - 使用 `expect().toBeVisible()` 而非 `expect().toBeTruthy()`

5. **数据管理**
   - 每个测试使用唯一的项目名称
   - 测试后自动清理测试数据
   - 使用全局设置辅助函数

6. **错误处理**
   - 使用 try-catch 捕获意外错误
   - 失败时截图并保存日志
   - 提供清晰的错误信息

7. **命名规范**
   - 测试文件使用 `.spec.ts` 扩展名
   - 测试组使用 `test.describe()` 组织
   - 测试名称使用描述性中文命名
   - 使用 `testId` 跟踪测试执行

## 常见问题排查

### 测试超时
- 增加超时时间：`{ timeout: 10000 }`
- 检查元素定位器是否正确
- 使用 Playwright Inspector 调试选择器

### 网络问题
- 确保测试服务器正在运行
- 检查 `BASE_URL` 配置是否正确
- 查看网络请求是否完成

### 元素未找到
- 检查应用是否正确加载
- 增加适当的等待时间
- 检查元素是否在 iframe 中

### 测试数据混乱
- 清理测试数据
- 使用唯一的测试数据
- 隔离测试环境

## CI/CDN 集成

### GitHub Actions 示例
```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: pnpm install
      - run: pnpm run test:e2e
      - uses: actions/upload-artifact@v4
        with:
          name: test-report
          path: playwright-report/
```

### Docker 测试
```dockerfile
FROM mcr.microsoft.com/playwright:v1.48.0-jammy
WORKDIR /app
COPY package.json package-lock.json pnpm-lock.yaml ./
RUN pnpm install
RUN pnpm run test:e2e
```

## 下一步改进

- [ ] 添加视觉回归测试
- [ ] 添加性能监控
- [ ] 增加移动端测试
- [ ] 添加 API 集成测试
- [ ] 添加多用户协作测试
