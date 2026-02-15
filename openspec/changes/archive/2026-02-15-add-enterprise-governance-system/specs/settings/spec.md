# settings Specification Delta

## Purpose
完善系统设置的中文化，特别是显示设置页面的中文化，以及版本信息的显示。

## MODIFIED Requirements

### Requirement: 显示设置表单中文化
系统 SHALL 将显示设置表单的所有界面元素翻译为中文，并确保菜单与功能模块对应。

#### Scenario: 显示设置表单元素
- **WHEN** 用户查看或编辑显示设置
- **THEN** 界面元素 MUST 显示为中文：
  - "Sidebar" → "侧边栏"
  - "Recents" → "最近"
  - "Home" → "主页"
  - "Applications" → "应用程序"
  - "Desktop" → "桌面"
  - "Downloads" → "下载"
  - "Documents" → "文档"
  - "Update display" → "更新显示"
- **AND** 所有验证错误消息 MUST 显示为中文

## ADDED Requirements

### Requirement: 版本信息显示
系统 SHALL 在系统设置中显示软件版本信息。

#### Scenario: 设置页面版本显示
- **WHEN** 用户访问系统设置页面
- **THEN** 页面 MUST 显示当前软件版本号
- **AND** 必须显示格式化的版本号（如 `V0.1.0`）
- **AND** 必须显示版权信息

#### Scenario: 版本信息内容
- **WHEN** 用户查看版本信息
- **THEN** 必须显示以下信息：
  - 软件版本号
  - 版权所有者：`©2026 IoTchange`
  - 作者：`外星动物（常智）IoTchange`
  - 联系邮箱：`14455975@qq.com`

### Requirement: 侧边栏菜单功能对应
系统 SHALL 确保侧边栏菜单项与实际功能模块正确对应。

#### Scenario: 一级菜单审核
- **WHEN** 系统渲染侧边栏
- **THEN** 一级菜单 MUST 对应功能分组：
  - "项目管理"：项目列表、团队成员
  - "创作工具"：分镜头创作、分镜头清单、剧本编辑、角色设计
  - "资产管理"：资产库
  - "设置"：系统设置、帮助中心

#### Scenario: 二级菜单审核
- **WHEN** 用户展开一级菜单
- **THEN** 二级菜单 MUST 正确链接到对应页面
- **AND** 菜单项 MUST 与页面标题一致
- **AND** 无效链接 MUST 被移除或修复

### Requirement: 登录页面版权信息
系统 SHALL 在登录页面显示版权信息。

#### Scenario: 登录页底部信息
- **WHEN** 用户访问登录页面
- **THEN** 页面底部 MUST 显示：
  - 版权信息：`©2026 IoTchange`
  - 软件版本：`V0.1.0`（当前版本）
- **AND** 样式 MUST 简洁不干扰登录操作
