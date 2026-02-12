# storyboard Specification

## ADDED Requirements

### Requirement: 模版导出向导

系统 SHALL 提供向导式模版导出功能，支持多步选择和预览。

#### Scenario: 启动导出向导

- **WHEN** 用户在分镜头清单页面点击"导出模版"按钮
- **THEN** 系统 SHALL 打开导出向导对话框
- **AND** 对话框 SHALL 显示当前步骤（步骤 1/5）

#### Scenario: 选择模版类型

- **WHEN** 用户在导出向导步骤 1
- **THEN** 系统 SHALL 显示两种模版类型选项：
  - 空白模版：包含标准空白结构的模版
  - 数据模版：基于当前项目数据的模版
- **AND** 用户 MUST 选择一种类型才能继续

#### Scenario: 选择导出格式

- **WHEN** 用户在导出向导步骤 2
- **THEN** 系统 SHALL 显示三种导出格式选项：
  - CSV：适合 Excel 编辑
  - JSON：完整数据结构
  - Word：适合打印
- **AND** 每种格式 SHALL 显示格式说明

#### Scenario: 选择包含的列

- **WHEN** 用户在导出向导步骤 3
- **THEN** 系统 SHALL 显示所有可导出的列复选框
- **AND** SHALL 提供"全选"、"取消全选"、"推荐选择"快捷操作
- **AND** 至少 MUST 选择一列才能继续

#### Scenario: 预览和设置

- **WHEN** 用户在导出向导步骤 4
- **THEN** 系统 SHALL 显示数据预览（数据模版）或说明预览（空白模版）
- **AND** SHALL 允许用户输入自定义文件名
- **AND** SHALL 显示格式相关的额外选项（如是否包含示例数据）

#### Scenario: 确认导出

- **WHEN** 用户在导出向导步骤 5
- **THEN** 系统 SHALL 显示导出摘要（类型、格式、列数、文件名）
- **AND** 用户确认后 MUST 生成并下载文件
- **AND** 显示成功提示并关闭对话框

### Requirement: 空白模版导出

系统 SHALL 支持导出空白分镜头模版。

#### Scenario: 导出空白 CSV 模版

- **WHEN** 用户选择空白模版和 CSV 格式
- **THEN** 系统 SHALL 生成包含列标题的 CSV 文件
- **AND** 第二行 SHALL 为空白示例行或带说明的占位符

#### Scenario: 导出空白 JSON 模版

- **WHEN** 用户选择空白模版和 JSON 格式
- **THEN** 系统 SHALL 生成包含模版结构的 JSON 文件
- **AND** shots 数组 SHALL 为空或包含示例结构

#### Scenario: 导出空白 Word 模版

- **WHEN** 用户选择空白模版和 Word 格式
- **THEN** 系统 SHALL 生成包含表格结构的 Word 文档
- **AND** 表格 SHALL 包含所有选中的列标题

### Requirement: 数据模版导出

系统 SHALL 支持将当前项目数据导出为可复用模版。

#### Scenario: 导出数据 CSV 模版

- **WHEN** 用户选择数据模版和 CSV 格式
- **THEN** 系统 SHALL 生成包含当前项目数据的 CSV 文件
- **AND** 数据 SHALL 包含所有选中的列
- **AND** 字段值 SHALL 转换为中文标签（如景别显示为"远景"而非"extremeLong"）

#### Scenario: 导出数据 JSON 模版

- **WHEN** 用户选择数据模版和 JSON 格式
- **THEN** 系统 SHALL 生成包含完整数据的 JSON 文件
- **AND** 文件 SHALL 包含模版元数据（类型、版本、导出日期）
- **AND** shots 数据 SHALL 排除项目特定字段（id、projectId、createdAt、updatedAt）

#### Scenario: 导出数据 Word 模版

- **WHEN** 用户选择数据模版和 Word 格式
- **THEN** 系统 SHALL 生成包含数据和表格的 Word 文档
- **AND** 文档 SHALL 包含项目信息标题
- **AND** 表格 SHALL 包含所有分镜头数据

### Requirement: 模版导入向导

系统 SHALL 提供向导式模版导入功能，支持文件解析和灵活的数据合并。

#### Scenario: 启动导入向导

- **WHEN** 用户在分镜头清单页面点击"导入模版"按钮
- **THEN** 系统 SHALL 打开导入向导对话框
- **AND** 对话框 SHALL 显示当前步骤（步骤 1/5）

#### Scenario: 上传文件

- **WHEN** 用户在导入向导步骤 1
- **THEN** 系统 SHALL 显示拖拽上传区域和文件选择按钮
- **AND** SHALL 支持的文件格式：CSV、JSON
- **AND** 文件上传后 SHALL 自动解析和验证格式

#### Scenario: 预览解析数据

- **WHEN** 用户在导入向导步骤 2
- **THEN** 系统 SHALL 显示文件解析信息（文件名、行数、列数、编码）
- **AND** SHALL 显示数据表格预览（前 10 行）
- **AND** SHALL 显示字段映射状态（哪些字段已识别，哪些缺失）

#### Scenario: 选择目标项目

- **WHEN** 用户在导入向导步骤 3
- **THEN** 系统 SHALL 显示现有项目列表
- **AND** SHALL 提供"创建新项目"选项
- **AND** SHALL 显示选中项目的当前分镜头数量

#### Scenario: 选择导入模式

- **WHEN** 用户在导入向导步骤 4
- **THEN** 系统 SHALL 显示三种导入模式：
  - 覆盖模式：清空现有数据后导入
  - 追加模式：追加到现有数据后（推荐）
  - 选择性合并：手动选择要导入的列

#### Scenario: 确认导入

- **WHEN** 用户在导入向导步骤 5
- **THEN** 系统 SHALL 显示导入摘要（文件、模式、影响范围）
- **AND** 用户确认后 MUST 执行导入
- **AND** 导入过程中 SHALL 显示进度指示
- **AND** 导入完成后 SHALL 显示成功提示并关闭对话框

### Requirement: CSV 文件导入

系统 SHALL 支持 CSV 文件的解析和导入。

#### Scenario: 解析 CSV 文件

- **WHEN** 用户上传 CSV 文件
- **THEN** 系统 SHALL 自动检测文件编码（UTF-8、GBK 等）
- **AND** 第一行 SHALL 识别为列标题
- **AND** SHALL 将列标题映射到系统字段

#### Scenario: 字段映射

- **WHEN** 系统 CSV 列标题
- **THEN** 系统 SHALL 支持标准列名映射：
  - "镜头编号" → shotNumber
  - "场次" → sceneNumber
  - "景别" → shotSize
  - "运镜方式" → cameraMovement
  - "时长" / "时长(秒)" → duration
  - "画面描述" → description
  - "对白/旁白" → dialogue
  - "音效说明" / "音效/配乐" → sound

#### Scenario: 数据验证

- **WHEN** CSV 数据解析完成
- **THEN** 系统 SHALL 验证必填字段（场次、景别、运镜方式、时长）
- **AND** SHALL 验证枚举值（景别、运镜方式）
- **AND** 验证失败时 SHALL 高亮错误行并显示具体错误

### Requirement: 导入数据处理

系统 SHALL 支持多种数据导入模式。

#### Scenario: 覆盖模式导入

- **WHEN** 用户选择覆盖模式并确认导入
- **THEN** 系统 SHALL 清空目标项目的所有现有分镜头
- **AND** 导入的数据 SHALL 从镜头编号 1 开始重新编号
- **AND** SHALL 在导入前创建数据备份（用于回滚）

#### Scenario: 追加模式导入

- **WHEN** 用户选择追加模式并确认导入
- **THEN** 系统 SHALL 保留目标项目的现有分镜头
- **AND** 导入的数据 SHALL 追加到现有数据后
- **AND** 导入数据的镜头编号 SHALL 从（现有数量 + 1）开始编号

#### Scenario: 选择性合并模式

- **WHEN** 用户选择选择性合并模式
- **THEN** 系统 SHALL 显示列选择界面
- **AND** 用户 SHALL 选择要导入的列
- **AND** 只更新选中列的数据，其他列保持不变

### Requirement: 导入错误处理

系统 SHALL 提供完善的错误处理和恢复机制。

#### Scenario: 文件格式错误

- **WHEN** 用户上传不支持的文件格式
- **THEN** 系统 SHALL 显示错误提示
- **AND** SHALL 列出支持的文件格式
- **AND** 提示用户重新选择文件

#### Scenario: 字段映射失败

- **WHEN** CSV 文件缺少必填字段
- **THEN** 系统 SHALL 显示缺失字段列表
- **AND** SHALL 提供字段映射配置界面
- **AND** 允许用户手动映射字段

#### Scenario: 导入失败回滚

- **WHEN** 导入过程中发生错误
- **THEN** 系统 SHALL 停止导入并显示错误信息
- **AND** SHALL 使用备份数据恢复到导入前状态
- **AND** SHALL 提供错误日志供用户排查

### Requirement: 导入进度反馈

系统 SHALL 在导入过程中提供实时进度反馈。

#### Scenario: 显示导入进度

- **WHEN** 导入数据量超过 50 条
- **THEN** 系统 SHALL 显示进度条
- **AND** SHALL 显示当前处理数量和总数量

#### Scenario: 导入完成提示

- **WHEN** 导入成功完成
- **THEN** 系统 SHALL 显示成功提示
- **AND** 提示 SHALL 包含导入的数量统计
- **AND** 提供"查看分镜头"按钮跳转到列表页面
