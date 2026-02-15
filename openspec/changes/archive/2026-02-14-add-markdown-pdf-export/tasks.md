# Tasks

## Phase 1: 类型定义更新
- [x] 1.1 更新 `ExportFormat` 类型，添加 `'md'` 和 `'pdf'` 选项
- [x] 1.2 更新 `generateFilename` 函数支持新格式

## Phase 2: Markdown 导出实现
- [x] 2.1 创建 `src/lib/export/markdown.ts` 文件
- [x] 2.2 实现 `exportBlankMarkdownTemplate` 函数
- [x] 2.3 实现 `exportDataMarkdownTemplate` 函数
- [x] 2.4 在 `src/lib/export/index.ts` 中导出新函数

## Phase 3: PDF 导出实现（向导模板）
- [x] 3.1 在 `src/lib/export/template.ts` 中添加 PDF 导出函数
- [x] 3.2 实现 `exportBlankPDFTemplate` 函数
- [x] 3.3 实现 `exportDataPDFTemplate` 函数

## Phase 4: UI 更新
- [x] 4.1 更新 `step2-format-selection.tsx`，添加 MD 和 PDF 格式选项卡片
- [x] 4.2 更新 `template-export-dialog.tsx` 中的 `handleExport` 逻辑

## Phase 5: 测试验证
- [x] 5.1 验证空白向导的 MD 导出（构建通过）
- [x] 5.2 验证数据向导的 MD 导出（构建通过）
- [x] 5.3 验证空白向导的 PDF 导出（构建通过）
- [x] 5.4 验证数据向导的 PDF 导出（构建通过）
