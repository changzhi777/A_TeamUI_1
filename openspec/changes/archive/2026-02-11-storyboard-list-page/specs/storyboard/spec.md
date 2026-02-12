# storyboard Specification

## Purpose
定义分镜头创作和管理功能规范，包括分镜头编辑器、视图模式、配图、导出和独立的分镜头清单页面。

## ADDED Requirements

### Requirement: 分镜头清单页面

系统 SHALL 提供独立的分镜头清单页面，以表格形式展示项目的所有分镜头信息。

#### Scenario: 访问分镜头清单页面

- **WHEN** 用户在侧边栏点击"分镜头清单"链接
- **THEN** 系统 SHALL 导航到 `/storyboard-list` 页面
- **AND** 显示所有项目的分镜头表格

#### Scenario: 直接URL访问

- **WHEN** 用户直接访问 `/storyboard-list` URL
- **THEN** 系统 SHALL 显示分镜头清单页面
- **AND** 无需项目上下文

### Requirement: 分镜头表格数据展示

分镜头表格 SHALL 显示完整的分镜头信息。

#### Scenario: 表格列显示

- **WHEN** 分镜头表格渲染时
- **THEN** MUST 显示以下列：
  - 选择框（复选框）
  - 镜头编号
  - 场次
  - 景别（远景/全景/中景/近景/特写）
  - 运镜方式（推/拉/摇/移/跟/固定）
  - 时长
  - 画面描述
  - 对白/旁白
  - 音效/配乐说明
  - 配图（缩略图）
  - 操作（编辑/删除按钮）

#### Scenario: 项目筛选

- **WHEN** 用户在项目筛选器中选择特定项目
- **THEN** 表格 SHALL 只显示该项目的分镜头
- **AND** 筛选器 SHALL 支持"全部项目"选项

### Requirement: 表格排序功能

系统 SHALL 支持对表格列进行排序。

#### Scenario: 列排序

- **WHEN** 用户点击列头（镜头编号、场次、时长等）
- **THEN** 表格 SHALL 按该列升序排列
- **AND** 再次点击 SHALL 切换为降序排列
- **AND** 第三次点击 SHALL 恢复默认顺序

### Requirement: 表格筛选功能

系统 SHALL 支持对表格数据进行筛选。

#### Scenario: 列筛选

- **WHEN** 用户使用景别或运镜方式筛选器
- **THEN** 表格 SHALL 只显示匹配的分镜头
- **AND** 筛选器 SHALL 支持多选

#### Scenario: 全局搜索

- **WHEN** 用户在搜索框中输入关键词
- **THEN** 表格 SHALL 搜索所有可编辑列（场次、画面描述、对白、音效）
- **AND** 实时过滤显示结果

### Requirement: 行选择和批量操作

系统 SHALL 支持行选择和批量操作功能。

#### Scenario: 单行选择

- **WHEN** 用户点击行复选框
- **THEN** 该行 SHALL 进入选中状态
- **AND** 批量操作栏 SHALL 显示选中数量

#### Scenario: 全选当前页

- **WHEN** 用户点击表头复选框
- **THEN** 当前页所有行 SHALL 进入选中状态

#### Scenario: 批量删除

- **WHEN** 用户选中多个分镜头并点击"批量删除"
- **THEN** 系统 SHALL 显示确认对话框
- **AND** 确认后 MUST 删除所有选中的分镜头
- **AND** 后续镜头编号 SHALL 自动重新排序

### Requirement: 行内编辑

系统 SHALL 支持在表格中直接编辑分镜头信息。

#### Scenario: 进入编辑模式

- **WHEN** 用户双击可编辑单元格（画面描述、对白、音效）
- **THEN** 单元格 SHALL 变为输入状态
- **AND** 显示文本输入框或下拉选择器

#### Scenario: 保存编辑

- **WHEN** 用户按 Enter 键或点击单元格外部
- **THEN** 系统 SHALL 保存修改到 store
- **AND** 显示成功提示
- **AND** 单元格 SHALL 恢复显示状态

#### Scenario: 取消编辑

- **WHEN** 用户按 Esc 键
- **THEN** 系统 SHALL 取消编辑
- **AND** 单元格 SHALL 恢复原始值

### Requirement: 拖拽排序

系统 SHALL 支持通过拖拽行来重新排序分镜头。

#### Scenario: 拖拽行

- **WHEN** 用户拖动行到新位置
- **THEN** 系统 SHALL 显示放置指示器
- **AND** 释放后 MUST 更新分镜头顺序
- **AND** 所有镜头编号 SHALL 自动重新计算

### Requirement: 表格数据导出

系统 SHALL 支持将表格数据导出为不同格式。

#### Scenario: 导出表格数据

- **WHEN** 用户点击"导出"按钮
- **THEN** 系统 SHALL 下载包含当前表格数据的 CSV 文件
- **AND** 数据 SHALL 包含当前筛选和排序结果

#### Scenario: 导出 PDF

- **WHEN** 用户点击"导出 PDF"按钮
- **THEN** 系统 SHALL 生成包含表格数据的 PDF 文档
- **AND** 格式 SHALL 适合打印
