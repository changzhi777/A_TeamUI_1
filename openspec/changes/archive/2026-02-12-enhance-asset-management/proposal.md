# 完善资产管理功能

## Why

当前资产管理功能已完成前端基础架构，但存在以下问题：
1. **API 为占位实现**：所有 API 函数只返回空数据，功能无法实际使用
2. **缺少元数据编辑**：用户无法编辑资产名称、描述和标签
3. **缺少模拟数据**：无法演示和测试功能
4. **性能未优化**：大列表可能存在性能问题
5. **缺少导入导出**：无法批量管理资产元数据

## What Changes

### 1. 添加模拟数据服务
- 创建本地模拟资产数据
- 实现模拟 API 服务层
- 支持本地存储持久化

### 2. 完善前端功能
- 资产元数据编辑对话框
- 标签管理（添加/删除/搜索）
- 批量操作（选择、移动、删除）
- 资产移动/复制功能

### 3. 性能优化
- 使用虚拟滚动优化大列表
- 图片懒加载
- 分页加载

### 4. 导入导出功能
- CSV 格式导出资产清单
- CSV 格式导入资产元数据
- 前端纯实现（不依赖后端）

## Impact

- 修改文件：
  - `src/lib/api/assets.ts` - 实现模拟 API
  - `src/stores/asset-store.ts` - 完善状态管理
  - `src/features/assets/components/*` - 添加新组件
  - `openspec/specs/asset-management/spec.md` - 更新规范

- 新增文件：
  - `src/lib/mocks/asset-mock.ts` - 模拟数据服务
  - `src/features/assets/components/asset-edit-dialog.tsx` - 编辑对话框
  - `src/features/assets/components/asset-batch-actions.tsx` - 批量操作

## Dependencies

- 无外部依赖
- 使用现有 UI 组件库
- 使用 localStorage 进行数据持久化
