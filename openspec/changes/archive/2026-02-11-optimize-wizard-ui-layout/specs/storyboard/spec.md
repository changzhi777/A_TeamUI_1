# storyboard Specification Deltas

## MODIFIED Requirements

### Requirement: 分镜头导入向导

系统 SHALL 提供多步骤导入向导，引导用户完成分镜头数据导入。

#### Scenario: 横版步骤指示器
- **WHEN** 用户打开导入分镜头向导对话框
- **THEN** 步骤指示器 MUST 横向排列（从左到右）
- **AND** MUST 显示6个步骤：上传文件 → 格式验证 → 字段映射 → 数据预览 → 导入选项 → 导入结果
- **AND** 当前步骤 MUST 高亮显示
- **AND** 已完成步骤 MUST 显示勾选图标
- **AND** 步骤之间 MUST 有连接线

#### Scenario: 横版布局响应式
- **WHEN** 对话框在不同屏幕尺寸下渲染
- **THEN** 大屏幕（>=1024px）MUST 显示完整步骤标题和描述
- **AND** 中等屏幕（768-1023px）MUST 显示步骤标题，隐藏描述
- **AND** 小屏幕（<768px）MUST 使用紧凑横版布局

#### Scenario: 步骤导航
- **WHEN** 用户点击"下一步"或"上一步"按钮
- **THEN** 步骤指示器 MUST 更新当前步骤状态
- **AND** 步骤内容区域 MUST 显示对应步骤的内容
- **AND** MUST 平滑过渡到新步骤

### Requirement: 分镜头导出向导

系统 SHALL 提供多步骤导出向导，引导用户完成分镜头数据导出。

#### Scenario: 横版步骤指示器
- **WHEN** 用户打开导出分镜头向导对话框
- **THEN** 步骤指示器 MUST 横向排列（从左到右）
- **AND** MUST 显示5个步骤：选择类型 → 选择格式 → 选择列 → 预览设置 → 确认导出
- **AND** 当前步骤 MUST 高亮显示
- **AND** 已完成步骤 MUST 显示勾选图标
- **AND** 步骤之间 MUST 有连接线

#### Scenario: 横版布局响应式
- **WHEN** 对话框在不同屏幕尺寸下渲染
- **THEN** 大屏幕（>=1024px）MUST 显示完整步骤标题和描述
- **AND** 中等屏幕（768-1023px）MUST 显示步骤标题，隐藏描述
- **AND** 小屏幕（<768px）MUST 使用紧凑横版布局

#### Scenario: 步骤导航
- **WHEN** 用户点击"下一步"或"上一步"按钮
- **THEN** 步骤指示器 MUST 更新当前步骤状态
- **AND** 步骤内容区域 MUST 显示对应步骤的内容
- **AND** MUST 平滑过渡到新步骤
