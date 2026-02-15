## ADDED Requirements

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

## MODIFIED Requirements

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
