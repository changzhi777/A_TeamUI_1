# Design: 企业级治理系统架构

## 1. 权限系统架构

### 1.1 角色层级设计

```
┌─────────────────────────────────────────────────────┐
│                  super_admin                        │
│  (超级管理员 - 完全访问权限)                          │
│  - 用户管理  - 系统配置  - 权限分配  - 所有功能       │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│                     admin                           │
│  (管理员 - 项目级完全权限)                           │
│  - 项目CRUD  - 团队管理  - 功能模块CRUD              │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│                    member                           │
│  (普通成员 - 只读权限)                               │
│  - 项目查看  - 分镜查看  - 资产查看                  │
└─────────────────────────────────────────────────────┘
```

### 1.2 权限矩阵

| 功能模块 | super_admin | admin | member |
|---------|-------------|-------|--------|
| 项目管理 | CRUD | CRUD | R |
| 团队成员 | CRUD | CRUD | R |
| 分镜头 | CRUD | CRUD | R |
| 剧本 | CRUD | CRUD | R |
| 角色设计 | CRUD | CRUD | R |
| 资产库 | CRUD | CRUD | R |
| 系统设置 | RW | R | R |
| API配置 | RW | R | - |
| 用户权限 | RW | - | - |

### 1.3 侧边栏权限过滤

```typescript
interface NavItem {
  title: string
  url?: string
  icon?: LucideIcon
  items?: NavItem[]
  // 新增权限字段
  requiredRole?: UserRole[]
  requiredPermission?: Permission[]
}

// 权限过滤函数
function filterNavByPermission(items: NavItem[], userRole: UserRole): NavItem[] {
  return items.filter(item => {
    // 检查角色权限
    if (item.requiredRole && !item.requiredRole.includes(userRole)) {
      return false
    }
    // 递归检查子菜单
    if (item.items) {
      item.items = filterNavByPermission(item.items, userRole)
      // 如果子菜单全部被过滤，则隐藏父菜单
      return item.items.length > 0
    }
    return true
  })
}
```

## 2. 版权与版本管理系统

### 2.1 版本号存储

```json
// package.json
{
  "name": "帧服了短剧平台",
  "version": "0.1.0",
  "versionDisplay": "V0.1.0",
  "author": {
    "name": "外星动物（常智）IoTchange",
    "email": "14455975@qq.com"
  },
  "copyright": "©2026 IoTchange"
}
```

### 2.2 版本信息运行时访问

```typescript
// src/lib/version.ts
export const APP_VERSION = {
  display: import.meta.env.VITE_APP_VERSION || 'V0.1.0',
  major: 0,
  minor: 1,
  patch: 0,
  author: '外星动物（常智）IoTchange',
  email: '14455975@qq.com',
  copyright: '©2026 IoTchange',
}

export function getVersionString(): string {
  return `V${APP_VERSION.major}.${APP_VERSION.minor}.${APP_VERSION.patch}`
}
```

### 2.3 版权头模板

```typescript
/**
 * [组件/模块名称]
 * [功能描述]
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */
```

## 3. Git版本控制规范

### 3.1 分支策略

```
main (生产分支)
├── develop (开发分支)
│   ├── feature/* (功能分支)
│   ├── bugfix/* (修复分支)
│   └── refactor/* (重构分支)
└── release/* (发布分支)
```

### 3.2 Commit信息规范

```
<type>(<scope>): <subject>

type:
- feat: 新功能
- fix: 修复bug
- docs: 文档更新
- style: 代码格式
- refactor: 重构
- test: 测试
- chore: 构建/工具

scope: 影响范围（可选）
- auth, storyboard, assets, settings, etc.

示例:
feat(auth): 添加超级管理员角色权限
fix(storyboard): 修复分镜头导出问题
docs(readme): 更新版权信息
```

### 3.3 版本标签规范

```
v0.1.0 - 初始版本
v0.1.1 - 小修复
v0.2.0 - 功能迭代
v1.0.0 - 重大版本
```

## 4. 测试机制

### 4.1 测试层级

```
E2E Tests (Playwright)
├── 用户认证流程
├── 权限控制验证
└── 核心业务流程

Unit Tests (Vitest)
├── 工具函数
├── 组件测试
└── Store测试
```

### 4.2 测试覆盖率要求

| 类型 | 最低覆盖率 |
|------|-----------|
| 工具函数 | 80% |
| 业务逻辑 | 70% |
| UI组件 | 50% |

### 4.3 测试自动化

```yaml
# CI流程（预留）
test:
  - pnpm lint
  - pnpm test:unit
  - pnpm build
  - pnpm test:e2e
```

## 5. 代码审查机制

### 5.1 PR审查流程

```
1. 创建Feature分支
2. 开发 + 本地测试
3. 提交PR → develop
4. 代码审查（至少1人）
5. CI检查通过
6. 合并到develop
```

### 5.2 审查清单

- [ ] 代码包含版权头
- [ ] 遵循代码规范
- [ ] 新功能有测试覆盖
- [ ] 无安全漏洞
- [ ] 性能无明显下降
- [ ] 文档已更新

## 6. Swagger UI预留

### 6.1 API接口定义格式

```typescript
// src/lib/api/types.ts
/**
 * @openapi
 * components:
 *   schemas:
 *     Character:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 */
```

### 6.2 后端集成预留

```typescript
// src/lib/api/swagger-config.ts
export const SWAGGER_CONFIG = {
  enabled: import.meta.env.VITE_ENABLE_SWAGGER === 'true',
  url: import.meta.env.VITE_API_BASE_URL + '/swagger.json',
}
```

## 7. 系统设置中文化

### 7.1 显示设置映射

| 英文 | 中文 |
|------|------|
| Sidebar | 侧边栏 |
| Recents | 最近 |
| Home | 主页 |
| Applications | 应用程序 |
| Desktop | 桌面 |
| Downloads | 下载 |
| Documents | 文档 |

## 8. 实施优先级

1. **P0 - 立即实施**
   - 版权信息添加
   - 版本号管理
   - 侧边栏权限过滤

2. **P1 - 本迭代完成**
   - 权限管理增强
   - 团队成员权限界面
   - Git规范文档

3. **P2 - 下迭代**
   - 单元测试框架
   - 代码审查流程
   - Swagger预留接口
