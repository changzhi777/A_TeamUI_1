# settings Specification

## Purpose
TBD - created by archiving change localize-settings. Update Purpose after archive.
## Requirements
### Requirement: 设置页面中文化

系统 SHALL 将设置页面的所有界面元素翻译为中文。

#### Scenario: 设置页面标题和描述
- **WHEN** 用户访问设置页面
- **THEN** 页面标题 MUST 显示"设置"而非"Settings"
- **AND** 页面描述 MUST 显示中文描述

#### Scenario: 设置导航菜单
- **WHEN** 用户查看设置页面导航
- **THEN** "Profile" MUST 显示为"个人资料"
- **AND** "Account" MUST 显示为"账户"
- **AND** "Appearance" MUST 显示为"外观"
- **AND** "Notifications" MUST 显示为"通知"
- **AND** "Display" MUST 显示为"显示"

### Requirement: 个人资料表单中文化

系统 SHALL 将个人资料表单的所有界面元素翻译为中文。

#### Scenario: 个人资料表单元素
- **WHEN** 用户查看或编辑个人资料
- **THEN** "Username" MUST 显示为"用户名"
- **AND** "Email" MUST 显示为"邮箱"
- **AND** "Bio" MUST 显示为"个人简介"
- **AND** "URLs" MUST 显示为"网址"
- **AND** "Update profile" MUST 显示为"更新个人资料"
- **AND** 所有验证错误消息 MUST 显示为中文

### Requirement: 账户设置表单中文化

系统 SHALL 将账户设置表单的所有界面元素翻译为中文。

#### Scenario: 账户设置表单元素
- **WHEN** 用户查看或编辑账户设置
- **THEN** "Name" MUST 显示为"姓名"
- **AND** "Date of birth" MUST 显示为"出生日期"
- **AND** "Language" MUST 显示为"语言"
- **AND** "Update account" MUST 显示为"更新账户"
- **AND** 所有语言选项 MUST 显示为中文
- **AND** 所有验证错误消息 MUST 显示为中文

### Requirement: 外观设置表单中文化

系统 SHALL 将外观设置表单的所有界面元素翻译为中文。

#### Scenario: 外观设置表单元素
- **WHEN** 用户查看或编辑外观设置
- **THEN** "Font" MUST 显示为"字体"
- **AND** "Theme" MUST 显示为"主题"
- **AND** "Light" MUST 显示为"浅色"
- **AND** "Dark" MUST 显示为"深色"
- **AND** "Update preferences" MUST 显示为"更新首选项"
- **AND** 所有验证错误消息 MUST 显示为中文

### Requirement: 通知设置表单中文化

系统 SHALL 将通知设置表单的所有界面元素翻译为中文。

#### Scenario: 通知设置表单元素
- **WHEN** 用户查看或编辑通知设置
- **THEN** "Notify me about..." MUST 显示为"通知我关于..."
- **AND** "Email Notifications" MUST 显示为"邮件通知"
- **AND** "Communication emails" MUST 显示为"通信邮件"
- **AND** "Marketing emails" MUST 显示为"营销邮件"
- **AND** "Social emails" MUST 显示为"社交邮件"
- **AND** "Security emails" MUST 显示为"安全邮件"
- **AND** "Update notifications" MUST 显示为"更新通知"
- **AND** 所有验证错误消息 MUST 显示为中文

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

### Requirement: API Management Page with Tabs
The system SHALL provide an API Management page with separate tabs for Text API, Image API, and Voice API configuration.

#### Scenario: User accesses API management
- Given the user is on the settings page
- When the user navigates to API Management
- Then the page displays three tabs: Text API, Image API, Voice API
- And each tab contains independent configuration options

### Requirement: Multiple API Provider Support
Each API type SHALL support multiple service providers with independent configuration.

#### Scenario: User selects API provider
- Given the user is on an API configuration tab
- When the user selects a provider from the dropdown
- Then the configuration form updates to show provider-specific options
- And the selected provider becomes the active provider for that API type

### Requirement: GLM-Image Resolution Configuration
The Image API configuration SHALL support GLM-Image specific resolution options.

#### Scenario: User configures GLM-Image resolution
- Given the user has selected GLM-Image as the image provider
- When the user accesses resolution settings
- Then the system displays preset resolutions: 1280x1280, 1568x1056, 1056x1568, 1472x1088, 1088x1472, 1728x960, 960x1728
- And the system allows custom resolution input (512-2048px, multiples of 32)

### Requirement: Independent API Configuration Storage
Each API type configuration SHALL be stored independently without affecting others.

#### Scenario: User saves API configuration
- Given the user has modified configuration for one API type
- When the user saves the configuration
- Then only that API type's configuration is updated
- And other API type configurations remain unchanged

### Requirement: Character Image Generation Uses API Config
Character image generation SHALL use the configured Image API settings including resolution.

#### Scenario: User generates character image with custom resolution
- Given the user has configured GLM-Image with resolution 1568x1056
- When the user generates a character view image
- Then the API call includes the configured resolution
- And the generated image matches the specified dimensions

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

### Requirement: 设置页面内容区域滚动

系统 SHALL 为设置页面的内容区域提供垂直滚动支持，确保当内容超出可视区域时用户可以滚动查看。

#### Scenario: 内容超出屏幕时显示滚动条

- **WHEN** 设置页面内容高度超过可视区域
- **THEN** 系统 MUST 显示垂直滚动条
- **AND** 用户 MUST 能够通过滚动或拖拽滚动条查看完整内容

#### Scenario: 内容未超出屏幕时隐藏滚动条

- **WHEN** 设置页面内容高度未超过可视区域
- **THEN** 滚动条 MUST 自动隐藏或不可见
- **AND** 页面布局 MUST 保持正常

#### Scenario: 所有设置子页面支持滚动

- **WHEN** 用户访问任意设置子页面
- **THEN** 系统 MUST 为以下页面提供滚动支持：
  - 个人资料 (`/settings`)
  - 账户设置 (`/settings/account`)
  - 外观设置 (`/settings/appearance`)
  - 通知设置 (`/settings/notifications`)
  - 显示设置 (`/settings/display`)
  - API 管理 (`/settings/api`)
  - API 文档 (`/settings/api-docs`)

#### Scenario: 响应式滚动

- **WHEN** 用户调整浏览器窗口大小
- **THEN** 滚动条 MUST 根据内容与窗口高度的关系自动显示或隐藏
- **AND** 滚动行为 MUST 平滑无卡顿

