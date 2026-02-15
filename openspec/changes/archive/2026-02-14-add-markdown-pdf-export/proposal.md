# Proposal: Add Markdown and PDF Export Formats

## Summary
为"导出分镜头向导"功能增加 Markdown (.md) 和 PDF 格式支持，使用户能够以更多样化的格式导出分镜头数据。

## Motivation
当前导出向导仅支持 CSV、JSON 和 Word 格式。用户可能需要：
- **Markdown 格式**：便于在文档工具（如 Notion、Obsidian、GitHub）中使用
- **PDF 格式**：便于打印和分享，无需编辑能力

## Scope
- 在导出向导的格式选择步骤中添加 MD 和 PDF 选项
- 实现 Markdown 格式导出功能
- 实现 PDF 格式导出功能（向导模板，区别于现有的 PDF 导出）
- 更新相关类型定义和导出逻辑

## Out of Scope
- 修改现有的 CSV、JSON、Word 导出逻辑
- 导入 Markdown 或 PDF 文件的功能
- 自定义 PDF 模板样式

## Dependencies
- 现有的 `src/lib/export/template.ts` 导出框架
- 现有的 `src/lib/export/pdf.ts` PDF 导出功能（可复用部分逻辑）
