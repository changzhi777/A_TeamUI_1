# 修复资产库 TypeScript 错误方案

## Why

资产库页面出现 500 错误，经诊断发现是由于大量 TypeScript 编译错误导致的。主要问题：

1. **AssetState 类型不完整**：
   - 缺少 `selectedCount` getter
   - 缺少 `assets` 属性
   - 缺少 `refetchAssets` 方法

2. **组件与类型不匹配**：
   - `asset-batch-actions.tsx` 使用 `successCount` 而非 `success`
   - `asset-import-export.tsx` 类型错误
   - `asset-edit-dialog.tsx` 参数传递错误
   - `asset-library-page.tsx` 和 `asset-uploader.tsx` props 不匹配

3. **其他严重错误**：
   - `director-detail.tsx` 文件损坏，缺少大量导入

## What Changes

### 1. 修复 AssetStore 类型
- 添加 `selectedCount` getter
- 修复 `useAssetMutations` 返回类型

### 2. 修复资产组件
- `asset-batch-actions.tsx` - 修复类型使用
- `asset-import-export.tsx` - 修复类型和逻辑
- `asset-edit-dialog.tsx` - 修复参数传递
- `asset-library-page.tsx` - 修复 store 使用
- `asset-uploader.tsx` - 修复 props 接口

### 3. 修复 director-detail.tsx
- 恢复缺失的导入
- 修复组件引用

## Impact

- 修改文件：
  - `src/stores/asset-store.ts`
  - `src/features/assets/components/*.tsx`
  - `src/features/assets/pages/asset-library-page.tsx`
  - `src/features/projects/components/director-detail.tsx`

## Dependencies

- 无外部依赖
- 需要确保 TypeScript 编译通过
