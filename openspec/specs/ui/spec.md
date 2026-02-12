# ui Specification

## Purpose
TBD - created by archiving change gradient-button-variant. Update Purpose after archive.
## Requirements
### Requirement: 渐变按钮变体

系统 SHALL 提供渐变按钮变体，用于突出主要操作按钮。

#### Scenario: 使用渐变按钮

- **WHEN** 用户使用 `<Button variant="gradient">` 组件
- **THEN** 按钮背景 SHALL 显示从 #7ED4A6 到 #40BE7A 的水平渐变
- **AND** 文字颜色 SHALL 为白色

#### Scenario: 渐变方向

- **WHEN** 渐变按钮渲染时
- **THEN** 渐变方向 SHALL 从左到右
- **AND** 起始颜色 SHALL 为 #7ED4A6（左侧）
- **AND** 结束颜色 SHALL 为 #40BE7A（右侧）

#### Scenario: 悬停状态

- **WHEN** 用户鼠标悬停在渐变按钮上
- **THEN** 按钮透明度 SHALL 变为 90%

#### Scenario: 禁用状态

- **WHEN** 渐变按钮处于禁用状态
- **THEN** 按钮透明度 SHALL 变为 50%

#### Scenario: 尺寸支持

- **WHEN** 用户指定不同尺寸的渐变按钮
- **THEN** 按钮 SHALL 支持 default、sm、lg、icon 四种尺寸
- **AND** 渐变效果 SHALL 在所有尺寸下保持一致

### Requirement: 按钮变体类型安全

渐变按钮变体 SHALL 与 TypeScript 类型系统完全集成。

#### Scenario: 类型推断

- **WHEN** 开发者使用 Button 组件
- **THEN** variant 属性 SHALL 包含 "gradient" 选项
- **AND** TypeScript SHALL 提供 "gradient" 的自动补全

### Requirement: 渐变按钮视觉效果

渐变按钮 SHALL 提供良好的视觉对比度和可访问性。

#### Scenario: 文字对比度

- **WHEN** 渐变按钮显示白色文字
- **THEN** 对比度 SHALL 符合 WCAG AA 标准（大文本）

#### Scenario: 阴影效果

- **WHEN** 渐变按钮渲染时
- **THEN** 按钮 SHALL 显示 subtle shadow 效果
- **AND** shadow SHALL 与 default 变体保持一致

