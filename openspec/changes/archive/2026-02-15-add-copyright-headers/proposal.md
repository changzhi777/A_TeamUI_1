# Proposal: add-copyright-headers

## Why

项目中部分代码文件缺少统一的版权信息头注释。为了保护知识产权、明确代码归属、便于版本追踪，需要为所有源代码文件添加标准化的版权信息头。

## What Changes

1. 为所有 TypeScript/TSX 源文件添加统一的版权信息头注释
2. 版权信息包含：作者、邮箱、版权声明、版本号
3. 版本号从 V0.1.0 开始，遵循语义化版本规范
4. 建立 Git 版本管理规范

## 版权信息格式

```typescript
/**
 * [文件描述/组件名称]
 * [可选：简短功能说明]
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */
```

## Scope

### 需要添加版权头的文件

- `src/` 目录下的所有 `.ts` 和 `.tsx` 文件（约 335 个）
- `server/src/` 目录下的所有 `.ts` 文件（约 50 个）

### 排除的文件

- `src/components/ui/` - Shadcn UI 组件（第三方库）
- 自动生成的文件（如 `routeTree.gen.ts`）
- 配置文件（如 `vite.config.ts`、`tsconfig.json` 等）

## Goals

1. 所有源代码文件包含统一的版权信息头
2. 版本号管理规范化
3. 符合软件工程最佳实践

## Non-Goals

- 不修改第三方库代码
- 不修改自动生成的代码
- 不影响现有功能逻辑
