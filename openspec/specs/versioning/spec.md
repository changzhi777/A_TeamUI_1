# versioning Specification

## Purpose
TBD - created by archiving change add-enterprise-governance-system. Update Purpose after archive.
## Requirements
### Requirement: 版本号格式
系统 SHALL 使用语义化版本号格式。

#### Scenario: 版本号结构
- **WHEN** 定义软件版本
- **THEN** 版本号 MUST 使用 `V主版本.次版本.修订号` 格式
- **AND** 初始版本 MUST 为 `V0.1.0`
- **AND** 版本号 MUST 存储在 `package.json` 的 `version` 字段

#### Scenario: 版本号显示
- **WHEN** 用户查看系统信息
- **THEN** 系统 MUST 显示完整版本号（如 `V0.1.0`）
- **AND** 版本号 MUST 在系统设置页面可见
- **AND** 版本号 MUST 在登录页面底部可见

### Requirement: 版本号递增规则
系统 SHALL 遵循语义化版本递增规则。

#### Scenario: 小修改递增
- **WHEN** 进行bug修复或小改动
- **THEN** 版本号 MUST 递增修订号
- **AND** 示例：`V0.1.0` → `V0.1.1`

#### Scenario: 功能迭代递增
- **WHEN** 添加新功能或进行功能改进
- **THEN** 版本号 MUST 递增次版本号
- **AND** 修订号 MUST 重置为0
- **AND** 示例：`V0.1.X` → `V0.2.0`

#### Scenario: 重大更新递增
- **WHEN** 进行架构变更或不兼容更新
- **THEN** 版本号 MUST 递增主版本号
- **AND** 次版本号和修订号 MUST 重置为0
- **AND** 示例：`V0.X.X` → `V1.0.0`

### Requirement: 版权信息
系统 SHALL 在所有源代码文件中包含版权信息。

#### Scenario: 文件版权头格式
- **WHEN** 创建新的源代码文件
- **THEN** 文件头部 MUST 包含以下信息：
  - `@author 外星动物（常智）IoTchange`
  - `@email 14455975@qq.com`
  - `@copyright ©2026 IoTchange`
  - `@version V0.1.0`（当前版本号）

#### Scenario: 版权信息更新
- **WHEN** 修改现有文件
- **THEN** 版权头 MUST 保持完整
- **AND** 版本号 MUST 更新为当前版本

### Requirement: 版本信息访问
系统 SHALL 提供运行时版本信息访问接口。

#### Scenario: 版本信息模块
- **WHEN** 代码需要访问版本信息
- **THEN** 系统 MUST 提供 `src/lib/version.ts` 模块
- **AND** 模块 MUST 导出版本号字符串
- **AND** 模块 MUST 导出版权信息
- **AND** 模块 MUST 导出作者信息

#### Scenario: 版本信息显示
- **WHEN** UI组件需要显示版本
- **THEN** 系统 MUST 提供 `getVersionString()` 函数
- **AND** 函数 MUST 返回格式化的版本字符串

### Requirement: Git版本标签
系统 SHALL 使用Git标签管理版本发布。

#### Scenario: 版本标签格式
- **WHEN** 发布新版本
- **THEN** MUST 创建 `vX.Y.Z` 格式的Git标签
- **AND** 标签 MUST 与 `package.json` 版本号对应

#### Scenario: 版本标签命名
- **WHEN** 创建版本标签
- **THEN** 标签名 MUST 使用小写 `v` 前缀
- **AND** 示例：`v0.1.0`, `v0.2.0`, `v1.0.0`

