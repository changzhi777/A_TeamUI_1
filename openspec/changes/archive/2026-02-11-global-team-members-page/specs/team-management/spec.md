## MODIFIED Requirements

### Requirement: 直接访问团队成员

系统 SHALL 允许用户直接访问团队成员页面，无需先选择项目。

#### Scenario: 从侧边栏访问

- **WHEN** 用户在侧边栏点击"团队成员"链接
- **THEN** 系统导航到 `/team` 页面
- **AND** 显示所有团队成员列表

#### Scenario: 直接URL访问

- **WHEN** 用户直接在浏览器访问 `/team` URL
- **THEN** 系统显示全局团队成员页面
- **AND** 无需项目上下文

#### Scenario: 全局成员管理

- **WHEN** 用户在全局成员页面进行操作
- **THEN** 系统支持搜索、筛选、排序所有成员
- **AND** 支持添加、编辑、删除全局成员

### Requirement: 路由独立性

团队成员页面 SHALL 作为独立路由存在，不依赖于项目路由。

#### Scenario: 独立路由配置

- **WHEN** 系统配置路由
- **THEN** `/team` 路由独立于 `/projects` 路由存在
- **AND** 可以直接访问

#### Scenario: 导航菜单无项目依赖

- **WHEN** 用户查看侧边栏导航
- **THEN** "团队成员"链接无需项目选择即可点击
- **AND** 不显示"需要选择项目"的禁用状态
