# project-management Specification

## Purpose
TBD - created by archiving change refactor-ai-drama-platform. Update Purpose after archive.
## Requirements
### Requirement: 短剧项目管理
系统 SHALL 提供完整的短剧项目 CRUD 功能，MUST 支持创建、查看、编辑和删除项目。

#### Scenario: 创建新项目
- **WHEN** 用户点击"新建项目"按钮
- **THEN** MUST 显示项目创建表单，包含项目名称、类型、描述等必填字段
- **AND** 提交后 MUST 跳转到项目详情页面

#### Scenario: 查看项目列表
- **WHEN** 用户访问项目列表页面
- **THEN** MUST 显示所有项目卡片，包含项目名称、状态、最后更新时间
- **AND** SHALL 支持按状态筛选（策划中/拍摄中/后期制作/已完成）

#### Scenario: 编辑项目信息
- **WHEN** 用户点击项目编辑按钮
- **THEN** MUST 显示编辑表单，预填充当前项目信息
- **AND** 保存后 MUST 更新项目数据

#### Scenario: 删除项目
- **WHEN** 用户点击删除按钮并确认
- **THEN** 项目及其关联的分镜头数据 MUST 被永久删除

### Requirement: 团队成员协作
系统 SHALL 支持团队成员管理，MUST 包括添加成员、移除成员和角色分配。

#### Scenario: 添加团队成员
- **WHEN** 项目管理员点击"添加成员"按钮
- **THEN** MUST 显示成员添加表单，输入邮箱和角色
- **AND** 新成员 MUST 可访问该项目

#### Scenario: 角色权限控制
- **WHEN** 用户以普通成员身份访问项目
- **THEN** MAY 编辑分镜头但不能删除项目或管理成员
- **AND** 管理员 SHALL 拥有完整权限

#### Scenario: 移除团队成员
- **WHEN** 管理员点击成员移除按钮
- **THEN** 成员 MUST 失去项目访问权限

### Requirement: 项目进度跟踪
系统 SHALL 支持项目状态管理和进度跟踪。

#### Scenario: 更新项目状态
- **WHEN** 用户在项目详情页更改状态
- **THEN** 状态 MUST 更新为选定的值（策划中/拍摄中/后期制作/已完成）
- **AND** 状态变更时间 MUST 被记录

#### Scenario: 进度统计显示
- **WHEN** 用户查看项目详情
- **THEN** MUST 显示分镜头完成进度（已完成/总数）
- **AND** MUST 显示项目最后更新时间

### Requirement: 剧本管理
系统 SHALL 提供剧本编辑和版本管理功能。

#### Scenario: 编辑剧本
- **WHEN** 用户访问剧本编辑页面
- **THEN** MUST 显示富文本编辑器或 Markdown 编辑器
- **AND** 内容 SHALL 自动保存到 localStorage

#### Scenario: 剧本版本历史
- **WHEN** 用户查看剧本历史
- **THEN** MUST 显示所有保存版本的列表及时间戳
- **AND** SHALL 支持回滚到历史版本

---

## Delta: add-episode-range

### ADD: 集数范围字段
系统 SHALL 在项目数据模型中添加集数范围字段，允许用户为项目设置集数信息。

#### 字段规范
- 字段名：`episodeRange`
- 类型：`string`
- 是否必填：否
- 默认值：`""`（空字符串）
- 格式建议：如 "第1-30集"、"第1-5集"、"全50集"

### MODIFY: 创建新项目
- **WHEN** 用户点击"新建项目"按钮
- **THEN** MUST 显示项目创建表单，包含项目名称、类型、描述等必填字段
- **AND** 表单 SHALL 包含集数范围输入字段（非必填）
- **AND** 提交后 MUST 跳转到项目详情页面

### MODIFY: 编辑项目信息
- **WHEN** 用户点击项目编辑按钮
- **THEN** MUST 显示编辑表单，预填充当前项目信息
- **AND** 表单 SHALL 显示当前集数范围值
- **AND** 用户可以修改集数范围
- **AND** 保存后 MUST 更新项目数据

### ADD: 项目卡片集数显示
系统 SHALL 在项目卡片上显示集数范围标签。

#### Scenario: 显示集数标签
- **WHEN** 项目设置了集数范围
- **THEN** 项目卡片 MUST 在项目名称下方显示集数标签
- **AND** 集数标签 SHALL 使用醒目的样式和图标
- **AND** 集数标签格式 MUST 与用户输入一致

#### Scenario: 不显示空集数
- **WHEN** 项目未设置集数范围（空字符串）
- **THEN** 项目卡片 SHALL 不显示集数标签

### ADD: 项目详情页集数显示
系统 SHALL 在项目详情页显示集数范围信息。

#### Scenario: 显示集数信息
- **WHEN** 用户访问设置了集数范围的项目详情页
- **THEN** 详情页 MUST 显示集数范围标签
- **AND** 显示样式 SHALL 与项目卡片保持一致

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

### MODIFY: 查看项目列表
- **WHEN** 用户访问项目列表页面
- **THEN** MUST 显示所有项目卡片
- **AND** SHALL 支持按状态筛选（策划中/拍摄中/后期制作/已完成）
- **AND** SHALL 支持项目搜索功能
- **AND** SHALL 支持项目排序功能
- **AND** SHALL 支持列表和分组两种视图模式
- **AND** 项目卡片 MUST 显示收藏/置顶状态指示

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

