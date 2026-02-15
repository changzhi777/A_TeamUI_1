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
  - 季数（可选）
  - 集数（可选）
  - 场次
  - 景别（远景/全景/中景/近景/特写）
  - 运镜方式（推/拉/摇/移/跟/固定）
  - 时长
  - 画面描述
  - 对白/旁白
  - 音效/配乐说明
  - 自定义字段（根据配置动态显示）

#### Scenario: 编辑分镜头
- **WHEN** 用户点击分镜头编辑按钮
- **THEN** MUST 显示编辑表单，预填充当前数据
- **AND** 保存后 MUST 更新分镜头信息
- **AND** 自定义字段值 MUST 正确保存

#### Scenario: 删除分镜头
- **WHEN** 用户点击删除按钮并确认
- **THEN** 分镜头 MUST 从列表中移除
- **AND** 后续镜头编号 SHALL 自动重新排序
- **AND** 关联的自定义字段值 MUST 一并删除

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
  - 季数（默认隐藏）
  - 集数（默认隐藏）
  - 场次
  - 景别（远景/全景/中景/近景/特写）
  - 运镜方式（推/拉/摇/移/跟/固定）
  - 时长
  - 画面描述
  - 对白/旁白
  - 音效/配乐说明
  - 配图（缩略图）
  - 自定义字段（根据配置动态添加）
  - 操作（编辑/删除按钮）

#### Scenario: 项目筛选

- **WHEN** 用户在项目筛选器中选择特定项目
- **THEN** 表格 SHALL 只显示该项目的分镜头
- **AND** 筛选器 SHALL 支持"全部项目"选项
- **AND** 自定义字段列 MUST 根据所选项目的配置更新

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
- **THEN** 表格 SHALL 搜索所有可编辑列（季数、集数、场次、画面描述、对白、音效）
- **AND** 实时过滤显示结果
- **AND** MUST 同时搜索可见的自定义字段

#### Scenario: 自定义字段筛选

- **WHEN** 用户使用自定义字段筛选器
- **THEN** 表格 SHALL 根据自定义字段值过滤
- **AND** 仅下拉选择和多选类型字段提供筛选器

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

### Requirement: 季数和集数字段

系统 SHALL 为分镜头提供季数和集数字段，用于支持"季-集-场-镜头"的层级结构。

#### Scenario: 创建分镜头时填写季数集数

- **WHEN** 用户创建新分镜头
- **THEN** 表单 MUST 显示可选的季数（seasonNumber）字段
- **AND** 表单 MUST 显示可选的集数（episodeNumber）字段
- **AND** 这两个字段 MUST 为数字类型
- **AND** 用户 MAY 留空这些字段

#### Scenario: 编辑分镜头的季数集数

- **WHEN** 用户编辑现有分镜头
- **THEN** 表单 MUST 预填充已存在的季数和集数值
- **AND** 用户 MUST 能够修改或清空这些字段

#### Scenario: 表格中显示季数集数

- **WHEN** 用户查看分镜头列表表格
- **THEN** 季数和集数列 MUST 存在但默认隐藏
- **AND** 用户 MUST 能够通过列配置显示这些列
- **AND** 这两列 MUST 支持排序功能

#### Scenario: 按季数集数筛选

- **WHEN** 用户使用筛选器
- **THEN** 系统 MUST 支持按季数筛选分镜头
- **AND** 系统 MUST 支持按集数筛选分镜头
- **AND** 筛选器 MUST 支持多选

#### Scenario: 季数集数在导出中的处理

- **WHEN** 用户导出分镜头数据
- **THEN** 导出文件 MUST 包含季数和集数字段
- **AND** CSV 导出 MUST 将这些字段作为独立列

### Requirement: 自定义字段数据存储

系统 SHALL 为分镜头提供灵活的自定义字段存储能力。

#### Scenario: 存储自定义字段值

- **WHEN** 用户保存包含自定义字段值的分镜头
- **THEN** 系统 MUST 将自定义字段值存储在 `customFields` 属性中
- **AND** `customFields` MUST 使用键值对结构（字段ID -> 值）
- **AND** 值类型 MUST 支持：字符串、数字、布尔值、字符串数组、null

#### Scenario: 读取自定义字段值

- **WHEN** 系统加载分镜头数据
- **THEN** 系统 MUST 正确解析 `customFields` 中的值
- **AND** 如果字段不存在值，MUST 返回 null 或字段默认值

#### Scenario: 自定义字段数据兼容性

- **WHEN** 系统加载不包含 `customFields` 的旧分镜头数据
- **THEN** 系统 MUST 正常处理，不产生错误
- **AND** 该分镜头的 `customFields` MUST 被视为空对象

### Requirement: 全局自定义字段配置

系统 SHALL 支持配置全局自定义字段，适用于所有项目。

#### Scenario: 创建全局自定义字段

- **WHEN** 管理员创建新的全局自定义字段
- **THEN** 系统 MUST 保存字段配置，包括：
  - 字段ID（唯一标识）
  - 字段名称
  - 字段类型
  - 是否必填
  - 默认值（可选）
  - 下拉选项（仅 select/multiselect 类型）
  - 显示顺序
- **AND** 该字段 MUST 自动对所有项目可用

#### Scenario: 编辑全局自定义字段

- **WHEN** 管理员编辑全局自定义字段
- **THEN** 系统 MUST 更新字段配置
- **AND** 已存在的分镜头数据 MUST 保持不变
- **AND** 新的表单 MUST 使用更新后的配置

#### Scenario: 删除全局自定义字段

- **WHEN** 管理员删除全局自定义字段
- **THEN** 字段配置 MUST 从系统中移除
- **AND** 已存在的分镜头数据 MUST 保留（但不显示）
- **AND** 系统必须提示用户确认删除操作

### Requirement: 项目级自定义字段配置

系统 SHALL 支持为单个项目配置独立的自定义字段。

#### Scenario: 创建项目级自定义字段

- **WHEN** 项目管理员为项目创建自定义字段
- **THEN** 系统 MUST 保存字段配置并关联到该项目
- **AND** 该字段 MUST 仅对该项目可见
- **AND** 该字段 MUST 与全局字段合并显示

#### Scenario: 项目字段与全局字段合并

- **WHEN** 用户查看项目的分镜头表单
- **THEN** 系统 MUST 同时显示全局字段和项目级字段
- **AND** 项目级字段 MAY 覆盖同ID的全局字段配置
- **AND** 字段 MUST 按配置的顺序排列

#### Scenario: 项目级字段不影响其他项目

- **WHEN** 项目A创建了自定义字段
- **THEN** 项目B MUST 不显示项目A的自定义字段
- **AND** 只有全局字段和项目B的专属字段对项目B可见

### Requirement: 自定义字段类型支持

系统 SHALL 支持多种自定义字段类型。

#### Scenario: 文本类型字段

- **WHEN** 字段类型为 `text`
- **THEN** 表单 MUST 渲染为单行文本输入框
- **AND** 表格 MUST 显示为纯文本

#### Scenario: 多行文本类型字段

- **WHEN** 字段类型为 `textarea`
- **THEN** 表单 MUST 渲染为多行文本输入框
- **AND** 表格 MUST 显示截断的文本（可展开查看完整内容）

#### Scenario: 数字类型字段

- **WHEN** 字段类型为 `number`
- **THEN** 表单 MUST 渲染为数字输入框
- **AND** 表格 MUST 支持数值排序

#### Scenario: 下拉选择类型字段

- **WHEN** 字段类型为 `select`
- **THEN** 表单 MUST 渲染为单选下拉框
- **AND** 选项 MUST 从字段配置的 `options` 中读取
- **AND** 表格 MUST 显示选项标签而非值

#### Scenario: 多选类型字段

- **WHEN** 字段类型为 `multiselect`
- **THEN** 表单 MUST 渲染为多选下拉框
- **AND** 数据 MUST 以字符串数组形式存储
- **AND** 表格 MUST 显示为标签列表

#### Scenario: 日期类型字段

- **WHEN** 字段类型为 `date`
- **THEN** 表单 MUST 渲染为日期选择器
- **AND** 数据 MUST 以 ISO 日期字符串形式存储
- **AND** 表格 MUST 支持日期排序

#### Scenario: 复选框类型字段

- **WHEN** 字段类型为 `checkbox`
- **THEN** 表单 MUST 渲染为复选框
- **AND** 数据 MUST 以布尔值形式存储
- **AND** 表格 MUST 显示为是/否或图标

### Requirement: 自定义字段表单渲染

系统 SHALL 在分镜头表单中动态渲染自定义字段。

#### Scenario: 根据配置渲染字段

- **WHEN** 用户打开分镜头创建或编辑表单
- **THEN** 系统 MUST 根据字段配置动态渲染自定义字段
- **AND** 字段 MUST 按配置的顺序排列
- **AND** 必填字段 MUST 显示必填标识

#### Scenario: 字段默认值

- **WHEN** 用户创建新分镜头
- **THEN** 自定义字段 MUST 显示配置的默认值（如有）
- **AND** 如果没有默认值，字段 MUST 为空

#### Scenario: 字段验证

- **WHEN** 用户提交表单
- **THEN** 系统必须验证必填自定义字段是否有值
- **AND** 如果验证失败，MUST 显示错误提示
- **AND** 系统 MAY 根据字段类型进行格式验证

### Requirement: 自定义字段表格展示

系统 SHALL 在分镜头表格中动态展示自定义字段列。

#### Scenario: 动态列生成

- **WHEN** 分镜头表格渲染
- **THEN** 系统 MUST 根据自定义字段配置生成额外的表格列
- **AND** 自定义字段列 MUST 位于固定字段列之后
- **AND** 用户 MUST 能够通过列配置控制自定义字段的显示

#### Scenario: 自定义字段排序

- **WHEN** 用户点击自定义字段列头
- **THEN** 表格 MUST 支持按该字段排序
- **AND** 排序逻辑 MUST 根据字段类型确定（文本按字母，数字按数值，日期按时间）

#### Scenario: 自定义字段筛选

- **WHEN** 用户使用筛选功能
- **THEN** 系统 MUST 为下拉选择和多选类型的自定义字段提供筛选器
- **AND** 筛选器 MUST 支持多选

### Requirement: 自定义字段导入导出

系统 SHALL 在导入导出功能中支持自定义字段。

#### Scenario: 导出包含自定义字段

- **WHEN** 用户导出分镜头数据为 CSV
- **THEN** 导出文件 MUST 包含自定义字段列
- **AND** 列名 MUST 使用字段名称

#### Scenario: 导出包含字段配置

- **WHEN** 用户导出分镜头数据为 JSON
- **THEN** 导出文件 MUST 包含自定义字段配置
- **AND** 导入时 MUST 能够恢复字段配置

#### Scenario: 导入映射自定义字段

- **WHEN** 用户导入包含自定义字段的数据
- **THEN** 导入向导 MUST 显示字段映射界面
- **AND** 系统 MUST 尝试智能匹配字段名称
- **AND** 用户 MUST 能够手动调整映射关系

### Requirement: Compact List Layout
The shot list table SHALL display in a compact layout with reduced cell padding and row height to maximize information density.

#### Scenario: User views shot list with compact layout
- Given the user is on the shot list page
- When the table renders
- Then the table displays with reduced padding and tighter spacing
- And more rows are visible in the same screen space

### Requirement: Description Column Truncation
The "画面描述" (description) column SHALL truncate long text to a maximum of 8 Chinese characters with ellipsis for overflow.

#### Scenario: User views truncated description
- Given a shot with a description longer than 8 characters
- When the user views the shot list table
- Then the description column displays only the first 8 characters followed by "..."
- And hovering over the cell shows the full description in a tooltip

### Requirement: Sound Column Truncation
The "音效说明" (sound) column SHALL truncate long text to a maximum of 5 Chinese characters with ellipsis for overflow.

#### Scenario: User views truncated sound description
- Given a shot with a sound description longer than 5 characters
- When the user views the shot list table
- Then the sound column displays only the first 5 characters followed by "..."
- And hovering over the cell shows the full sound description in a tooltip

### Requirement: Project Column Hidden by Default
The "项目" (project) column SHALL be hidden by default in the shot list table.

#### Scenario: User views shot list without project column
- Given the user is on the shot list page
- When the table renders initially
- Then the project column is not visible

#### Scenario: User enables project column visibility
- Given the user is on the shot list page
- When the user opens the "显示列" dropdown and enables "项目"
- Then the project column becomes visible

