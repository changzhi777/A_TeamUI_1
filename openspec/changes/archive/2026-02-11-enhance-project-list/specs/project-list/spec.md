# project-list Specification (Delta)

## ADDED Requirements

### Requirement: 项目搜索功能
系统 SHALL 提供项目搜索功能，允许用户按项目名称实时搜索项目。

#### Scenario: 搜索项目
- **WHEN** 用户在搜索框中输入关键词
- **THEN** MUST 实时过滤显示匹配的项目列表
- **AND** 搜索 MUST 不区分大小写
- **AND** 搜索 MUST 匹配项目名称中的任意位置

#### Scenario: 清空搜索
- **WHEN** 用户清空搜索框内容
- **THEN** MUST 显示所有项目
- **AND** 其他筛选条件（如状态筛选）MUST 保持不变

### Requirement: 项目排序功能
系统 SHALL 支持多种排序方式，帮助用户按需组织项目列表。

#### Scenario: 按创建时间排序
- **WHEN** 用户选择"最新创建"排序方式
- **THEN** 项目 MUST 按创建时间降序排列
- **AND** 最新创建的项目 MUST 显示在最前面

#### Scenario: 按更新时间排序
- **WHEN** 用户选择"最近更新"排序方式
- **THEN** 项目 MUST 按更新时间降序排列
- **AND** 最近更新的项目 MUST 显示在最前面

#### Scenario: 按名称排序
- **WHEN** 用户选择"名称 A-Z"排序方式
- **THEN** 项目 MUST 按项目名称升序排列
- **AND** 排序 MUST 不区分大小写

### Requirement: 项目分组视图
系统 SHALL 支持按状态分组显示项目，便于用户分类管理。

#### Scenario: 切换到分组视图
- **WHEN** 用户点击"分组视图"按钮
- **THEN** 页面 MUST 按项目状态分组显示
- **AND** 每个分组 MUST 显示分组名称和项目数量
- **AND** 分组 MUST 按以下顺序排列：策划中 > 拍摄中 > 后期制作 > 已完成

#### Scenario: 折叠/展开分组
- **WHEN** 用户点击分组标题
- **THEN** 该分组 MUST 切换折叠/展开状态
- **AND** 其他分组的状态 MUST 保持不变

#### Scenario: 空分组处理
- **WHEN** 某个状态分组下没有项目
- **THEN** 该分组 MUST 不显示
- **OR** MUST 显示"暂无项目"提示

### Requirement: 项目收藏和置顶
系统 SHALL 支持收藏和置顶项目，帮助用户快速访问重要项目。

#### Scenario: 收藏项目
- **WHEN** 用户点击项目详情页的收藏按钮
- **THEN** 项目 MUST 被标记为收藏
- **AND** 收藏图标 MUST 高亮显示
- **AND** 收藏的项目 MUST 在列表中优先显示

#### Scenario: 取消收藏
- **WHEN** 用户再次点击已收藏项目的收藏按钮
- **THEN** 项目收藏状态 MUST 被取消
- **AND** 收藏图标 MUST 恢复普通状态

#### Scenario: 置顶项目
- **WHEN** 用户点击项目详情页的置顶按钮
- **THEN** 项目 MUST 被标记为置顶
- **AND** 置顶项目 MUST 显示在所有项目最前面
- **AND** 置顶项目 MUST 按置顶时间排序

#### Scenario: 取消置顶
- **WHEN** 用户再次点击已置顶项目的置顶按钮
- **THEN** 项目置顶状态 MUST 被取消
- **AND** 项目 MUST 恢复正常排序位置

#### Scenario: 收藏和置顶优先级
- **WHEN** 项目列表中同时存在收藏和置顶项目
- **THEN** 显示顺序 MUST 为：置顶项目 > 收藏项目 > 普通项目
- **AND** 同类项目之间 MUST 按当前选择的排序方式排列

### Requirement: 状态筛选功能
系统 MUST 实现状态筛选按钮的实际功能，允许用户按项目状态过滤。

#### Scenario: 按状态筛选
- **WHEN** 用户点击某个状态筛选按钮（如"策划中"）
- **THEN** 列表 MUST 只显示该状态的项目
- **AND** 被选中的按钮 MUST 高亮显示
- **AND** 其他按钮 MUST 恢复为普通状态

#### Scenario: 显示全部项目
- **WHEN** 用户点击"全部"按钮
- **THEN** 列表 MUST 显示所有项目
- **AND** "全部"按钮 MUST 高亮显示
- **AND** 其他状态按钮 MUST 恢复为普通状态

#### Scenario: 搜索和筛选联动
- **WHEN** 用户在有搜索关键词的情况下切换筛选状态
- **THEN** 列表 MUST 在搜索结果中应用状态筛选
- **AND** 搜索框 MUST 保持当前输入内容

## MODIFIED Requirements

### Requirement: 短剧项目管理
系统 SHALL 提供完整的短剧项目 CRUD 功能，MUST 支持创建、查看、编辑和删除项目。

#### Scenario: 查看项目列表 (MODIFIED)
- **WHEN** 用户访问项目列表页面
- **THEN** MUST 显示所有项目卡片
- **AND** 项目卡片 MUST 包含：项目名称、描述、状态、更新时间
- **AND** MUST 支持搜索、排序、分组、筛选功能
- **AND** 收藏/置顶的项目 MUST 有视觉标识

#### Scenario: 编辑项目 (MODIFIED)
- **WHEN** 用户点击项目卡片上的编辑按钮
- **THEN** MUST 显示编辑表单，预填充当前项目信息
- **OR** MUST 支持从项目详情页编辑
- **AND** 保存后 MUST 更新项目数据并返回列表

#### Scenario: 删除项目 (MODIFIED)
- **WHEN** 用户点击删除按钮
- **THEN** MUST 显示删除确认对话框
- **AND** 对话框 MUST 说明删除后的影响（将删除所有关联数据）
- **AND** 确认后项目及其关联的分镜头数据 MUST 被永久删除
- **AND** 删除 MUST 需要管理员权限

#### Scenario: 管理项目成员 (MODIFIED)
- **WHEN** 用户点击"管理成员"按钮
- **THEN** MUST 跳转到项目成员管理页面
- **OR** MUST 显示成员管理对话框
- **AND** MUST 支持添加、移除成员和分配角色

## REMOVED Requirements

无删除的需求。

## Design Decisions

### 项目卡片简化

**决策**: 移除项目卡片上的分镜头进度条和成员数量显示

**理由**:
1. 减少视觉噪音，让用户专注于项目本身
2. 进度和成员信息可以在项目详情页查看
3. 简化卡片设计，提升美观度

**替代方案**: 在项目详情页保留完整的项目统计信息

### 操作方式变更

**决策**: 移除项目卡片上的操作菜单，改为点击卡片进入详情页操作

**理由**:
1. 简化卡片设计
2. 避免误操作
3. 详情页有更多空间展示操作选项

**替代方案**: 保留详情页的所有操作功能
