# 导入向导界面优化规范

## MODIFIED Requirements

### Requirement: 分镜头导入向导文件上传步骤

导入向导的第一步 SHALL 提供简洁的文件上传界面，支持 CSV 和 JSON 格式。

#### Scenario: 查看文件上传界面

- **WHEN** 用户打开导入向导
- **THEN** MUST 显示文件拖放区域
- **AND** MUST 显示支持的文件格式列表
- **AND** 格式说明 SHALL 为单行简洁提示，不包含详细列表

#### Scenario: 拖放文件上传

- **WHEN** 用户拖动文件到上传区域
- **THEN** 拖放区域 MUST 高亮显示（边框颜色和背景变化）
- **AND** 释放后 MUST 自动验证文件
- **AND** 验证通过后 MUST 自动进入下一步

#### Scenario: 文件大小验证

- **WHEN** 用户上传超过 10MB 的文件
- **THEN** 系统 MUST 显示错误提示："文件大小超过限制，最大支持 10MB"
- **AND** MUST 阻止进入下一步
- **AND** MUST 允许重新选择文件

## ADDED Requirements

### Requirement: JSON 导入错误处理

系统 MUST 正确处理 JSON 文件导入过程中的各种错误情况。

#### Scenario: JSON 格式错误

- **WHEN** 用户上传格式错误的 JSON 文件
- **THEN** 系统 MUST 在步骤 2（格式验证）显示具体错误信息
- **AND** 错误信息 MUST 包含语法错误位置
- **AND** MUST 允许用户返回步骤 1 重新选择文件

#### Scenario: JSON 数据结构错误

- **WHEN** JSON 文件缺少必需字段（`type`、`shots`）
- **THEN** 系统 MUST 显示明确的错误提示
- **AND** MUST 指出缺少的具体字段

### Requirement: 批量导入功能

系统 SHALL 支持批量导入分镜头，保持镜头编号不变。

#### Scenario: 批量导入 JSON 文件

- **WHEN** 用户导入包含多个分镜头的 JSON 文件
- **THEN** 系统 MUST 保留原始文件中的镜头编号
- **AND** MUST 一次性添加所有分镜头到 store
- **AND** 导入完成后 MUST 显示成功数量

#### Scenario: 追加模式下的镜头编号

- **WHEN** 用户选择追加模式导入
- **THEN** 系统 SHALL 根据现有镜头数量调整起始编号
- **AND** 后续镜头编号 MUST 依次递增

### Requirement: 导入进度反馈

系统 SHALL 在导入过程中提供实时进度反馈。

#### Scenario: 显示导入进度

- **WHEN** 导入操作正在执行
- **THEN** 步骤 6（导入结果）MUST 显示进度指示器
- **AND** MUST 显示已处理数量/总数量

#### Scenario: 导入完成反馈

- **WHEN** 导入完成
- **THEN** 系统 MUST 显示 toast 通知："成功导入 X 个分镜头"
- **AND** 如果有错误，MUST 显示："导入完成但有 X 个错误"

### Requirement: 移动端优化

导入向导界面 MUST 在移动设备上正确显示。

#### Scenario: 移动端文件上传

- **WHEN** 用户在移动设备上访问导入向导
- **THEN** 格式说明卡片 MUST 堆叠显示而非并排
- **AND** 拖放区域 MUST 支持点击选择文件
- **AND** 所有按钮 MUST 足够大，易于点击（最小 44px）
