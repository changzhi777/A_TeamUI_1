# project-list Specification

## Purpose

项目列表功能提供用户查看、搜索、排序、筛选和管理短剧项目的能力。系统 SHALL 支持多种视图模式、实时搜索、多字段排序和状态筛选功能。

## Requirements

### Requirement: 项目列表显示

系统 SHALL 提供项目列表功能，MUST 以卡片形式展示所有项目。

#### Scenario: 查看项目列表
- **WHEN** 用户访问项目列表页面
- **THEN** 系统 MUST 显示所有项目卡片
- **AND** 每个项目卡片 SHALL 包含项目名称、状态、最后更新时间
- **AND** SHALL 支持按状态筛选（策划中/拍摄中/后期制作/已完成）

### Requirement: 项目搜索功能

系统 SHALL 支持项目搜索功能，允许用户按项目名称或描述搜索项目。

#### Scenario: 搜索项目
- **WHEN** 用户在搜索框中输入关键词
- **THEN** 系统 MUST 实时过滤显示匹配的项目
- **AND** 搜索不区分大小写
- **AND** MUST 提供清空搜索按钮

### Requirement: 项目排序功能

系统 SHALL 支持项目排序功能，允许用户按不同字段排序项目。

#### Scenario: 按创建时间排序
- **WHEN** 用户选择"最新创建"排序
- **THEN** 项目 MUST 按创建时间降序显示

#### Scenario: 按更新时间排序
- **WHEN** 用户选择"最近更新"排序
- **THEN** 项目 MUST 按更新时间降序显示

#### Scenario: 按名称排序
- **WHEN** 用户选择"名称 A-Z"排序
- **THEN** 项目 MUST 按名称字母顺序显示

#### Scenario: 置顶和收藏优先
- **WHEN** 项目设置了置顶或收藏
- **THEN** 置顶项目 MUST 显示在最前面
- **AND** 收藏项目 SHALL 优先显示

### Requirement: 项目分组视图

系统 SHALL 支持分组视图模式，按项目状态分组显示项目。

#### Scenario: 切换到分组视图
- **WHEN** 用户选择分组视图模式
- **THEN** 项目 MUST 按状态分组显示
- **AND** 每个分组 MUST 显示状态名称和项目数量
- **AND** 分组 MUST 支持折叠/展开
- **AND** 空分组 MUST 不显示

### Requirement: 项目收藏功能

系统 SHALL 支持项目收藏功能，允许用户标记重要项目。

#### Scenario: 收藏项目
- **WHEN** 用户点击收藏按钮
- **THEN** 项目 MUST 被标记为收藏状态
- **AND** 收藏状态 MUST 持久化存储
- **AND** 收藏的项目在排序中 MUST 优先显示

### Requirement: 项目置顶功能

系统 SHALL 支持项目置顶功能，允许用户将重要项目置顶。

#### Scenario: 置顶项目
- **WHEN** 用户点击置顶按钮
- **THEN** 项目 MUST 被标记为置顶状态
- **AND** 置顶状态 MUST 持久化存储
- **AND** 置顶的项目 MUST 显示在最前面

### Requirement: 项目卡片信息

每个项目卡片 SHALL 显示完整的项目信息和操作选项。

#### Scenario: 显示项目信息
- **WHEN** 用户查看项目卡片
- **THEN** 卡片 MUST 显示以下信息：
  - 项目名称（可点击进入详情页）
  - 项目描述
  - 项目状态徽章
  - 分镜头进度（百分比和具体数量）
  - 团队成员数量
  - 最后更新时间

#### Scenario: 显示项目操作
- **WHEN** 用户打开项目卡片菜单
- **THEN** MUST 显示操作菜单，包含：
  - 收藏/取消收藏
  - 置顶/取消置顶
  - 编辑项目
  - 管理成员
  - 分镜头创作
  - 删除项目

### Requirement: 集数范围显示

系统 SHALL 在项目卡片上显示集数范围标签。

#### Scenario: 显示集数标签
- **WHEN** 项目设置了集数范围
- **THEN** 项目卡片 MUST 在项目名称下方显示集数标签
- **AND** 集数标签 SHALL 使用 Badge 组件和 Film 图标
- **AND** 集数标签格式 MUST 与用户输入一致

#### Scenario: 不显示空集数
- **WHEN** 项目未设置集数范围（空字符串）
- **THEN** 项目卡片 SHALL 不显示集数标签

---

## Delta: enhance-project-list

### ADD: 项目搜索功能
系统 SHALL 支持项目搜索功能，允许用户按项目名称或描述搜索项目。

#### Scenario: 搜索项目
- **WHEN** 用户在搜索框中输入关键词
- **THEN** 系统 MUST 实时过滤显示匹配的项目
- **AND** 搜索不区分大小写
- **AND** MUST 提供清空搜索按钮

### ADD: 项目排序功能
系统 SHALL 支持项目排序功能，允许用户按不同字段排序项目。

#### Scenario: 按创建时间排序
- **WHEN** 用户选择"最新创建"排序
- **THEN** 项目 MUST 按创建时间降序显示

#### Scenario: 按更新时间排序
- **WHEN** 用户选择"最近更新"排序
- **THEN** 项目 MUST 按更新时间降序显示

#### Scenario: 按名称排序
- **WHEN** 用户选择"名称 A-Z"排序
- **THEN** 项目 MUST 按名称字母顺序显示

### ADD: 项目分组视图
系统 SHALL 支持分组视图模式，按项目状态分组显示项目。

#### Scenario: 切换到分组视图
- **WHEN** 用户选择分组视图模式
- **THEN** 项目 MUST 按状态分组显示
- **AND** 每个分组 MUST 显示状态名称和项目数量
- **AND** 分组 MUST 支持折叠/展开
- **AND** 空分组 MUST 不显示

### ADD: 项目收藏功能
系统 SHALL 支持项目收藏功能，允许用户标记重要项目。

#### Scenario: 收藏项目
- **WHEN** 用户点击收藏按钮
- **THEN** 项目 MUST 被标记为收藏状态
- **AND** 收藏状态 MUST 持久化存储
- **AND** 收藏的项目在排序中 MUST 优先显示

### ADD: 项目置顶功能
系统 SHALL 支持项目置顶功能，允许用户将重要项目置顶。

#### Scenario: 置顶项目
- **WHEN** 用户点击置顶按钮
- **THEN** 项目 MUST 被标记为置顶状态
- **AND** 置顶状态 MUST 持久化存储
- **AND** 置顶的项目 MUST 显示在最前面

### ADD: 项目卡片操作菜单
系统 SHALL 在每个项目卡片上提供操作菜单。

#### Scenario: 打开项目菜单
- **WHEN** 用户点击项目卡片上的菜单按钮
- **THEN** MUST 显示操作菜单，包含：
  - 收藏/取消收藏
  - 置顶/取消置顶
  - 编辑项目
  - 管理成员
  - 分镜头创作
  - 删除项目

### MODIFY: 查看项目列表
- **WHEN** 用户访问项目列表页面
- **THEN** MUST 显示所有项目卡片
- **AND** SHALL 支持按状态筛选（策划中/拍摄中/后期制作/已完成）
- **AND** SHALL 支持项目搜索功能
- **AND** SHALL 支持项目排序功能
- **AND** SHALL 支持列表和分组两种视图模式
- **AND** 项目卡片 MUST 显示收藏/置顶状态指示

---

## Delta: add-episode-range

### MODIFY: 项目卡片信息显示
- **WHEN** 用户查看项目卡片
- **THEN** 卡片 MUST 显示以下信息：
  - 项目名称（可点击进入详情页）
  - 集数范围标签（如果已设置）
  - 项目描述
  - 项目状态徽章
  - 分镜头进度（百分比和具体数量）
  - 团队成员数量
  - 最后更新时间

### ADD: 集数范围显示
系统 SHALL 在项目卡片上显示集数范围标签。

#### Scenario: 显示集数标签
- **WHEN** 项目设置了集数范围
- **THEN** 项目卡片 MUST 在项目名称下方显示集数标签
- **AND** 集数标签 SHALL 使用 Badge 组件和 Film 图标
- **AND** 集数标签格式 MUST 与用户输入一致

#### Scenario: 不显示空集数
- **WHEN** 项目未设置集数范围（空字符串）
- **THEN** 项目卡片 SHALL 不显示集数标签

### ADD: 集数范围编辑
项目创建和编辑表单 SHALL 支持设置集数范围。

#### Scenario: 设置集数范围
- **WHEN** 用户创建或编辑项目
- **THEN** 表单 SHALL 包含集数范围输入字段
- **AND** 该字段 SHALL 为非必填
- **AND** SHALL 提供占位符提示输入格式
- **AND** SHALL 提供描述文本说明用途
