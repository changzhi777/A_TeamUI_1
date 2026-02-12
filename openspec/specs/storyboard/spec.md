# storyboard Specification

## Purpose
TBD - created by archiving change refactor-ai-drama-platform. Update Purpose after archive.
## Requirements
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

### Requirement: 直接访问分镜头创作

系统 SHALL 允许用户直接访问分镜头创作页面，无需先选择项目。

#### Scenario: 从侧边栏访问

- **WHEN** 用户在侧边栏点击"分镜头创作"链接
- **THEN** 系统导航到 `/storyboard` 页面
- **AND** 显示全局分镜头列表

#### Scenario: 直接URL访问

- **WHEN** 用户直接在浏览器访问 `/storyboard` URL
- **THEN** 系统显示全局分镜头页面
- **AND** 无需项目上下文

#### Scenario: 全局分镜头管理

- **WHEN** 用户在全局分镜头页面进行操作
- **THEN** 系统支持浏览所有项目的分镜头
- **AND** 支持按项目筛选分镜头
- **AND** 支持添加、编辑、删除分镜头

### Requirement: 路由可访问性

分镜头创作页面 SHALL 作为独立路由可访问，不依赖于项目选择。

#### Scenario: 侧边栏无项目依赖

- **WHEN** 用户查看侧边栏导航
- **THEN** "分镜头创作"链接无需项目选择即可点击
- **AND** 不显示"需要选择项目"的禁用状态

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

### Requirement: 分镜头模拟数据自动生成

系统 SHALL 在应用启动时为演示项目自动生成分镜头模拟数据。

#### Scenario: 应用启动时自动生成

- **WHEN** 用户登录并首次访问分镜头相关页面
- **THEN** 系统 MUST 检查所有演示项目是否已存在分镜头数据
- **AND** 对于没有分镜头的项目，MUST 自动生成模拟数据
- **AND** 生成的分镜头数量 SHALL 与项目的 `totalShots` 字段一致

#### Scenario: 根据项目规模生成

- **WHEN** 为项目生成分镜头数据
- **THEN** 生成的分镜头数量 MUST 等于项目的 `totalShots` 值
- **AND** 当 `totalShots` 大于模板数量时，MUST 循环复用模板
- **AND** 循环复用的镜头 SHALL 使用不同的场次编号

#### Scenario: 根据项目类型选择模板

- **WHEN** 为项目生成分镜头数据
- **THEN** 系统 MUST 根据项目的 `type` 字段选择对应的镜头模板
- **AND** 支持 7 种项目类型：`shortDrama`、`realLifeDrama`、`aiPodcast`、`advertisement`、`mv`、`documentary`、`other`
- **AND** 每种类型 SHALL 使用不同风格的镜头描述

#### Scenario: 避免覆盖用户数据

- **WHEN** 应用启动时检查数据
- **THEN** 系统 SHALL 只为没有分镜头数据的项目生成
- **AND** MUST 不覆盖已存在的分镜头数据
- **AND** MUST 区分模拟数据和用户手动创建的数据

### Requirement: 手动重新生成分镜头数据

系统 SHALL 提供手动重新生成分镜头数据的功能。

#### Scenario: 重新生成数据按钮

- **WHEN** 用户在分镜头清单页面
- **THEN** 页面 MUST 显示"重新生成数据"按钮
- **AND** 按钮 SHALL 使用刷新/重置图标
- **AND** 点击按钮 MUST 显示确认对话框

#### Scenario: 强制重新生成

- **WHEN** 用户确认重新生成数据
- **THEN** 系统 MUST 清除所有现有的模拟分镜头数据
- **AND** MUST 根据当前项目重新生成分镜头
- **AND** MUST 显示生成进度和成功提示

#### Scenario: 取消重新生成

- **WHEN** 用户在确认对话框中选择取消
- **THEN** 系统 MUST 不执行任何数据变更
- **AND** MUST 关闭对话框
- **AND** 分镜头数据 SHALL 保持原状

### Requirement: 模拟数据清除功能

系统 SHALL 提供清除模拟分镜头数据的功能。

#### Scenario: 清除模拟数据

- **WHEN** 用户选择清除模拟数据
- **THEN** 系统 MUST 显示确认对话框
- **AND** 对话框 SHALL 说明将删除所有模拟生成的分镜头
- **AND** 确认后 MUST 删除所有标记为模拟数据的分镜头
- **AND** MUST 保留用户手动创建的分镜头（如有标记）

#### Scenario: 清除后的状态

- **WHEN** 模拟数据被清除后
- **THEN** 分镜头清单页面 MUST 显示空状态提示
- **AND** 页面 MUST 提供"生成演示数据"按钮
- **AND** 用户点击后 MUST 重新生成模拟数据

