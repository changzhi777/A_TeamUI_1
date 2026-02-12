## MODIFIED Requirements

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
