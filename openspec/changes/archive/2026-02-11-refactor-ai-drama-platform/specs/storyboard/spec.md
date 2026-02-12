## ADDED Requirements

### Requirement: 分镜头编辑器
系统 SHALL 提供分镜头创建、编辑、删除和排序功能。

#### Scenario: 创建新分镜头
- **WHEN** 用户点击"添加镜头"按钮
- **THEN** MUST 显示分镜头表单，包含以下字段：
  - 镜头编号（自动生成）
  - 场次
  - 景别（远景/全景/中景/近景/特写）
  - 运镜方式（推/拉/摇/移/跟/固定）
  - 时长
  - 画面描述
  - 对白/旁白
  - 音效/配乐说明

#### Scenario: 编辑分镜头
- **WHEN** 用户点击分镜头编辑按钮
- **THEN** MUST 显示编辑表单，预填充当前数据
- **AND** 保存后 MUST 更新分镜头信息

#### Scenario: 删除分镜头
- **WHEN** 用户点击删除按钮并确认
- **THEN** 分镜头 MUST 从列表中移除
- **AND** 后续镜头编号 SHALL 自动重新排序

#### Scenario: 拖拽排序
- **WHEN** 用户拖动分镜头卡片到新位置
- **THEN** 分镜头顺序 MUST 更新
- **AND** 镜头编号 SHALL 自动重新计算

### Requirement: 分镜头视图模式
系统 SHALL 支持多种分镜头查看方式。

#### Scenario: 列表视图
- **WHEN** 用户选择列表视图
- **THEN** 分镜头 MUST 以垂直列表形式显示
- **AND** 每行 SHALL 显示镜头编号、时长、画面描述摘要

#### Scenario: 时间轴视图
- **WHEN** 用户选择时间轴视图
- **THEN** 分镜头 MUST 按时间顺序横向排列
- **AND** SHALL 显示每个镜头的时长和累计时间

#### Scenario: 网格视图
- **WHEN** 用户选择网格视图
- **THEN** 分镜头 MUST 以卡片网格形式显示
- **AND** 每张卡片 SHALL 显示配图缩略图（如有）和关键信息

### Requirement: 分镜头配图
系统 SHALL 支持为分镜头添加参考图片。

#### Scenario: 上传本地图片
- **WHEN** 用户点击"上传图片"按钮
- **THEN** MUST 打开文件选择器，支持 JPG、PNG 格式
- **AND** 图片预览 MUST 显示在分镜头卡片中
- **AND** 图片 SHALL 转换为 Base64 存储（限制 2MB）

#### Scenario: 删除配图
- **WHEN** 用户点击图片删除按钮
- **THEN** 图片 MUST 从分镜头中移除

#### Scenario: AI 生成图片（预留）
- **WHEN** 用户点击"AI 生成配图"按钮
- **THEN** MUST 显示"此功能即将推出"提示
- **AND** SHALL 不执行实际 API 调用

### Requirement: 分镜头导出
系统 SHALL 支持将分镜头导出为多种格式。

#### Scenario: 导出为 PDF
- **WHEN** 用户点击"导出 PDF"按钮
- **THEN** MUST 生成包含所有分镜头的 PDF 文档
- **AND** 文档 MUST 包含：项目信息、分镜头列表、配图（如有）
- **AND** MUST 自动下载文件

#### Scenario: 导出为 Word
- **WHEN** 用户点击"导出 Word"按钮
- **THEN** MUST 生成包含所有分镜头的 Word 文档
- **AND** 文档格式 SHALL 适合打印和编辑
- **AND** MUST 自动下载文件

#### Scenario: 导出为 JSON
- **WHEN** 用户点击"导出 JSON"按钮
- **THEN** MUST 下载包含完整项目数据的 JSON 文件
- **AND** 该文件 MAY 用于数据备份或迁移

#### Scenario: 从 JSON 导入
- **WHEN** 用户上传 JSON 备份文件
- **THEN** 系统 MUST 解析并恢复项目数据
- **AND** SHALL 提示用户确认是否覆盖现有数据

### Requirement: AI 自动生成（预留接口）
系统 SHALL 预留 AI 生成分镜头的功能接口。

#### Scenario: AI 生成按钮显示
- **WHEN** 用户在分镜头编辑页面
- **THEN** MUST 显示"AI 生成分镜头"按钮
- **AND** 按钮 SHALL 带有"即将推出"标签

#### Scenario: 点击 AI 生成按钮
- **WHEN** 用户点击 AI 生成按钮
- **THEN** MUST 显示模态对话框，说明此功能即将推出
- **AND** SHALL 提供"通知我"按钮（收集用户邮箱，暂不发送）
