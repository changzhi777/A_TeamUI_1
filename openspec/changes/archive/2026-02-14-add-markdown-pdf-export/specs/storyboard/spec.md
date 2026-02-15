# storyboard Specification Delta

## MODIFIED Requirements

### Requirement: 分镜头导出

系统 SHALL 支持将分镜头导出为多种格式。

#### Scenario: 导出为 Markdown（新增）
- **WHEN** 用户在导出向导中选择"Markdown"格式
- **THEN** MUST 生成包含分镜头数据的 Markdown 文件
- **AND** 文件 MUST 使用表格格式展示数据
- **AND** 空白向导 MUST 包含列标题和示例行
- **AND** 数据向导 MUST 包含所有分镜头数据
- **AND** MUST 自动下载 `.md` 文件

#### Scenario: 导出为 PDF 向导（新增）
- **WHEN** 用户在导出向导中选择"PDF"格式
- **THEN** MUST 生成包含分镜头数据的 PDF 文件
- **AND** 文件 MUST 使用表格格式展示数据
- **AND** 空白向导 MUST 包含列标题和示例行
- **AND** 数据向导 MUST 包含所有分镜头数据
- **AND** MUST 自动下载 `.pdf` 文件

#### Scenario: 格式选择界面（修改）
- **WHEN** 用户进入导出向导的格式选择步骤
- **THEN** MUST 显示以下格式选项：
  - CSV（Excel兼容）
  - JSON（完整数据结构）
  - Word（专业排版）
  - Markdown（文档工具兼容）（新增）
  - PDF（打印和分享）（新增）
