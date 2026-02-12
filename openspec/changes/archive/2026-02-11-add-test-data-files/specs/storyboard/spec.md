## ADDED Requirements

### Requirement: 测试数据文件下载

系统 SHALL 提供测试数据文件下载功能，方便用户测试导入向导。

#### Scenario: 下载测试数据按钮

- **WHEN** 用户在分镜头清单页面
- **THEN** 页面 MUST 显示"下载测试数据"按钮
- **AND** 按钮 SHALL 提供 CSV 和 JSON 两种格式选择

#### Scenario: 生成 CSV 测试文件

- **WHEN** 用户选择下载 CSV 格式测试数据
- **THEN** 系统 MUST 生成包含示例分镜头的 CSV 文件
- **AND** 文件 MUST 包含表头和示例数据行
- **AND** MUST 自动触发下载
- **AND** 文件 MUST 支持 Excel 正确显示中文

#### Scenario: 生成 JSON 测试文件

- **WHEN** 用户选择下载 JSON 格式测试数据
- **THEN** 系统 MUST 生成包含示例分镜头的 JSON 文件
- **AND** 文件 MUST 符合导入向导的格式要求
- **AND** MUST 包含模板元数据（type、version、instructions）
- **AND** MUST 自动触发下载

#### Scenario: 测试数据内容

- **WHEN** 生成测试数据文件
- **THEN** 数据 MUST 包含至少 10 个示例分镜头
- **AND** MUST 覆盖不同的景别（远景、全景、中景、近景、特写）
- **AND** MUST 覆盖不同的运镜方式（固定、摇、推拉、跟拍等）
- **AND** MUST 包含画面描述、对白、音效等示例内容

### Requirement: 导入向导实际执行

系统 SHALL 实现导入向导的实际数据导入功能。

#### Scenario: 执行 CSV 导入

- **WHEN** 用户在导入向导中完成所有步骤并点击"开始导入"
- **THEN** 系统 MUST 解析已验证的 CSV 数据
- **AND** MUST 将每行数据转换为 `StoryboardShot` 对象
- **AND** MUST 添加到指定项目的 storyboard store
- **AND** MUST 显示导入结果（成功数量、错误、警告）

#### Scenario: 执行 JSON 导入

- **WHEN** 用户在导入向导中完成所有步骤并点击"开始导入"
- **THEN** 系统 MUST 解析已验证的 JSON 数据
- **AND** MUST 将每个镜头转换为 `StoryboardShot` 对象
- **AND** MUST 添加到指定项目的 storyboard store
- **AND** MUST 显示导入结果（成功数量、错误、警告）

#### Scenario: 追加导入模式

- **WHEN** 用户选择"追加"导入模式
- **THEN** 系统 MUST 保留项目中现有的分镜头数据
- **AND** 新导入的分镜头 MUST 从现有数据后继续编号
- **AND** 导入完成后 MUST 显示总数据量

#### Scenario: 替换导入模式

- **WHEN** 用户选择"替换"导入模式
- **THEN** 系统 MUST 先清除项目中现有的所有分镜头
- **AND** 再导入新的分镜头数据
- **AND** MUST 在确认对话框中说明此操作会清除现有数据

#### Scenario: 设置起始镜头编号

- **WHEN** 用户在导入选项中设置了起始镜头编号
- **THEN** 导入的分镜头 MUST 从指定编号开始
- **AND** 后续镜头 MUST 按顺序递增
- **AND** 起始编号 MUST 大于 0

#### Scenario: 导入错误处理

- **WHEN** 导入过程中发生错误
- **THEN** 系统 MUST 在结果页面显示错误详情
- **AND** MUST 显示成功导入的数据量
- **AND** MUST 提供"重试"或"返回"选项

#### Scenario: 导入成功反馈

- **WHEN** 导入成功完成
- **THEN** 系统 MUST 显示成功消息
- **AND** MUST 显示导入的分镜头数量
- **AND** MUST 提供"关闭"按钮返回列表页面
