# Design: 测试数据文件和导入导出功能

## Context

导入导出向导的 UI 已完成，包括：
- 6 步导入向导（文件上传 → 格式验证 → 字段映射 → 数据预览 → 导入选项 → 导入结果）
- 5 步导出向导（类型选择 → 格式选择 → 列选择 → 预览设置 → 确认导出）
- CSV 和 JSON 格式支持

但缺少：
1. 测试数据文件生成
2. 实际的导入执行逻辑
3. 方便用户测试的入口

## Goals / Non-Goals

**Goals:**
- 提供一键生成测试数据文件的功能
- 实现完整的导入执行逻辑
- 用户可以通过 UI 下载测试文件并测试导入流程

**Non-Goals:**
- 不修改导出向导的 UI 和流程
- 不修改 CSV/JSON 解析逻辑
- 不添加新的文件格式支持

## Decisions

### 1. 测试数据内容

**Decision:** 使用现有的 `mock-shots.ts` 模板作为测试数据基础

**Reasoning:**
- 已有丰富的镜头模板（7 种项目类型）
- 数据结构符合系统要求
- 可以展示不同景别、运镜方式等

### 2. 测试数据格式

**Decision:** 同时提供 CSV 和 JSON 两种格式的测试文件

**Reasoning:**
- 覆盖两种导入路径
- 用户可以选择测试格式
- JSON 格式包含更多元数据（如 instructions）

### 3. 下载入口位置

**Decision:** 在分镜头清单页面的操作区域添加"下载测试数据"按钮

**Reasoning:**
- 与导入/导出按钮在同一区域
- 用户容易发现
- 不干扰主流程

### 4. 导入逻辑实现

**Decision:** 在 `TemplateImportDialog` 的 `handleImport` 函数中实现实际导入

**Reasoning:**
- 当前只有模拟延迟
- 需要调用 `convertToStoryboardShot` 和 store 的 `addShot` 方法
- 需要处理导入模式（追加/替换）

## Technical Implementation

### 新增文件

```typescript
// src/lib/test-data-files.ts

/**
 * 生成 CSV 格式的测试数据
 * @param shots 示例分镜头数据
 * @param filename 文件名
 */
export function generateTestCSVFile(shots: ParsedShot[], filename: string): void

/**
 * 生成 JSON 格式的测试数据
 * @param shots 示例分镜头数据
 * @param filename 文件名
 */
export function generateTestJSONFile(shots: ParsedShot[], filename: string): void

/**
 * 获取测试用的分镜头数据
 * @returns 包含 10 个示例分镜头的数组
 */
export function getTestShotData(): ParsedShot[]
```

### 修改文件

**`storyboard-list-page.tsx`:**
- 添加"下载测试数据"按钮
- 提供 CSV/JSON 格式选择

**`template-import-dialog.tsx`:**
- 实现 `handleImport` 函数的实际逻辑
- 调用 `useStoryboardStore` 的方法添加数据
- 处理导入模式（追加/替换）

## Risks / Trade-offs

### Risk: 导入数据覆盖

**Description:** 用户选择"替换"模式可能丢失现有数据

**Mitigation:**
- 添加确认提示
- 清楚说明影响范围
- 提供"取消"选项

### Risk: 数据格式不兼容

**Description:** 用户可能上传格式不正确的文件

**Mitigation:**
- 格式验证步骤已存在
- 错误信息友好
- 支持的字段映射

## Migration Plan

**步骤:**
1. 创建 `test-data-files.ts`
2. 在分镜头清单页面添加下载按钮
3. 完善导入对话框的导入逻辑
4. 测试完整流程

**回滚:**
- 移除下载按钮
- 删除 `test-data-files.ts`
- 恢复导入对话框的模拟逻辑

## Open Questions

无。需求明确，实现方案清晰。
