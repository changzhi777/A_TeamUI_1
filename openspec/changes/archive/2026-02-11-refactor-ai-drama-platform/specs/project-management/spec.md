## ADDED Requirements

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
