# Proposal: fix-asset-upload-wizard

## 概述

修正"资产库"中"上传资产"功能的 500 错误，并将其升级为横版向导式组件。

## 问题分析

### 当前问题

1. **API 签名不匹配**：
   - `assets.ts` API 定义：`uploadAsset(data: { file, name, type, source, scope, ... })`
   - `asset-store.ts` 调用：`assetsApi.uploadAsset(file, metadata, onProgress)` - 传递 3 个独立参数
   - API 期望对象参数，但 Store 传递独立参数

2. **缺少必填字段**：
   - API 要求必填字段：`name`, `type`, `source`, `scope`
   - 当前组件只传递 `file` 和 `metadata`，缺少必填字段

3. **用户体验差**：
   - 当前上传组件是简单的表单，用户无法指定资产类型、来源、描述等元数据
   - 缺少分步引导，容易导致用户填写不完整

### 解决方案

1. **修复 API 调用签名**：统一使用对象参数格式
2. **升级为横版向导式组件**：
   - 步骤 1：选择文件
   - 步骤 2：填写元数据（类型、来源、标签、描述）
   - 步骤 3：确认上传

## 范围

### 包含

- 修复 `asset-store.ts` 中 `uploadMutation` 的 API 调用
- 重新设计 `AssetUploader` 组件为横版向导式
- 添加元数据收集步骤
- 支持批量上传时的统一元数据或单独配置

### 不包含

- 后端 API 实现（仍使用模拟数据）
- 文件存储优化
- 大文件分片上传

## 影响范围

- `src/stores/asset-store.ts` - 修复上传 mutation
- `src/features/assets/components/asset-uploader.tsx` - 重构为向导式
- `src/features/assets/pages/asset-library-page.tsx` - 可能需要调整对话框尺寸

## 验收标准

- [ ] 上传功能不再报 500 错误
- [ ] 用户可以选择文件并填写元数据
- [ ] 向导式组件有清晰的步骤指示
- [ ] 支持单文件和多文件上传
- [ ] 上传进度显示正常
- [ ] 上传完成后资产列表自动刷新
