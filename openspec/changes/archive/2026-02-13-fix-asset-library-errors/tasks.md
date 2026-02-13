# Tasks: fix-asset-library-errors

## 阶段 1：修复 AssetStore

- [x] **T1.1** 修复 AssetStore 类型定义
  - 使用 `selectedAssets.size` 替代 `selectedCount`
  - 类型导出正确

- [x] **T1.2** 修复 useAssetMutations 返回类型
  - 使用 `refetch` 替代 `refetchAssets`

## 阶段 2：修复资产组件

- [x] **T2.1** 修复 `asset-batch-actions.tsx`
  - 使用 `selectedAssets.size` 替代 `selectedCount`
  - 修复 `batchMoveToProject` 调用参数格式
  - 使用 `success` 替代 `successCount`
  - 添加 React 导入

- [x] **T2.2** 修复 `asset-import-export.tsx`
  - 使用 `useGlobalAssets` hook 替代直接访问 assets
  - 修复 `AssetBatchResult` 类型使用
  - 添加 React 导入

- [x] **T2.3** 修复 `asset-edit-dialog.tsx`
  - 修复 `updateAsset` 参数传递为对象格式 `{ id, data }`

- [x] **T2.4** 修复 `asset-library-page.tsx`
  - 使用 `selectedAssets.size` 替代 `selectedCount`
  - 使用 `refetch` 替代 `refetchAssets`
  - 将 AssetUploader 包装在 Dialog 组件中
  - 添加 React 导入

- [x] **T2.5** 检查 `asset-uploader.tsx`
  - Props 接口已正确

## 阶段 3：修复其他损坏文件

- [x] **T3.1** 修复 `director-detail.tsx`
  - 重写整个组件
  - 添加正确的导入
  - 修复组件引用
  - 添加 React 导入

- [x] **T3.2** 修复 TypeScript 配置
  - 更新 jsx 配置为 `react-jsx`
  - 添加 `jsxImportSource: react`

- [x] **T3.3** 修复 i18n 重复属性名
  - 删除 `zh-CN.ts` 中重复的 `memberAdded`, `memberRemoved`, `addTag`

- [x] **T3.4** 修复 Alert variant 类型
  - 替换 `variant="warning"` 为 className
  - 替换 `variant="info"` 为 className
  - 替换 `variant="success"` 为 className

- [x] **T3.5** 导出 ExportConfig 类型
  - 从 `template-export-dialog.tsx` 导出 `ExportConfig` 接口

## 阶段 4：验证

- [x] **T4.1** 资产库相关 TypeScript 错误已修复
- [ ] **T4.2** 其他模块 TypeScript 错误待修复（非资产库相关）
  - TanStack Router params 类型（需要更新 routeTree.gen.ts）
  - Store 方法签名（需要更新 store 实现）
  - API 客户端类型（需要更新 axios 配置）
  - 其他模块导入错误

## 完成条件

- [x] 资产库组件 TypeScript 编译无错误 ✅
- [ ] 项目完整 TypeScript 编译通过（需要修复其他模块）

## 修复摘要

### 资产库相关修复（已完成 ✅）

| 文件 | 修复内容 |
|------|---------|
| `asset-batch-actions.tsx` | selectedAssets.size, batchMoveToProject 参数格式, React 导入 |
| `asset-import-export.tsx` | useGlobalAssets hook, AssetBatchResult 类型, React 导入 |
| `asset-edit-dialog.tsx` | updateAsset 参数格式 `{ id, data }` |
| `asset-library-page.tsx` | selectedAssets.size, refetch, Dialog 包装, React 导入 |
| `director-detail.tsx` | 完全重写组件 |
| `tsconfig.app.json` | jsx: react-jsx, jsxImportSource: react |
| `zh-CN.ts` | 删除重复属性 |
| storyboard Alert 组件 | 替换 variant 为 className |
| `template-export-dialog.tsx` | 导出 ExportConfig 类型 |

### 剩余问题（非资产库相关）

1. **TanStack Router params 类型** - 需要重新生成路由类型
2. **Store 方法签名** - 方法名/签名与调用不匹配
3. **API 客户端** - axios 配置类型问题
4. **其他模块** - 缺少导入、模块不存在等
