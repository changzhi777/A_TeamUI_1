# character-design Spec Delta

## ADDED Requirements

### Requirement: 角色编号系统
系统 SHALL 为每个角色自动分配唯一的角色编号。

#### Scenario: 生成项目角色编号
- **GIVEN** 用户在项目下创建新角色
- **WHEN** 角色创建成功
- **THEN** 系统 MUST 自动生成格式为 `PROJ-XXX-CHAR-XXX` 的编号
- **AND** 项目序号 MUST 为 3 位数字，左补零
- **AND** 角色序号 MUST 为 3 位数字，左补零
- **AND** 角色序号 MUST 在同一项目内递增

#### Scenario: 生成全局角色编号
- **GIVEN** 用户在全局创建新角色
- **WHEN** 角色创建成功
- **THEN** 系统 MUST 自动生成格式为 `GLOBAL-CHAR-XXX` 的编号
- **AND** 角色序号 MUST 为 3 位数字，左补零
- **AND** 角色序号 MUST 全局递增

#### Scenario: 显示角色编号
- **GIVEN** 角色已创建且有编号
- **WHEN** 用户查看角色卡片、列表或详情
- **THEN** 系统 MUST 显示角色编号
- **AND** 编号 MUST 显示在角色名称附近
- **AND** 用户 MUST 能够复制编号

#### Scenario: 编号不可修改
- **GIVEN** 角色已创建
- **WHEN** 用户编辑角色
- **THEN** 编号字段 MUST 为只读
- **AND** 系统 MUST NOT 允许手动修改编号

---

### Requirement: 角色保存到资产库
系统 SHALL 支持将角色及其所有素材保存到资产库。

#### Scenario: 保存角色到资产库
- **GIVEN** 用户查看角色详情
- **WHEN** 用户点击"保存到资产库"按钮
- **THEN** 系统 MUST 创建类型为 `character` 的资产
- **AND** 资产 MUST 包含角色基础信息（名称、编号、描述、个性、属性）
- **AND** 资产 MUST 包含所有视角图片引用
- **AND** 资产 MUST 包含所有服装变体图片引用
- **AND** 资产 MUST 包含语音样本引用

#### Scenario: 显示同步状态
- **GIVEN** 角色可保存到资产库
- **WHEN** 用户查看角色详情
- **THEN** 系统 MUST 显示当前同步状态
- **AND** 未同步状态 MUST 显示"保存到资产库"按钮
- **AND** 已同步状态 MUST 显示"已同步"标识和"更新资产"按钮

#### Scenario: 保存成功反馈
- **GIVEN** 用户点击保存到资产库
- **WHEN** 保存成功
- **THEN** 系统 MUST 显示成功提示
- **AND** 角色的同步状态 MUST 更新为已同步
- **AND** 系统 MUST 记录关联的资产ID

---

### Requirement: 角色资产双向同步
系统 SHALL 保持角色与资产库中对应资产的双向同步。

#### Scenario: 角色更新同步到资产
- **GIVEN** 角色已同步到资产库
- **WHEN** 用户修改角色信息
- **THEN** 系统 MUST 自动更新资产库中对应的角色资产
- **AND** 更新 MUST 包含所有变更的字段
- **AND** 更新 MUST 在 3 秒内完成

#### Scenario: 角色删除同步到资产
- **GIVEN** 角色已同步到资产库
- **WHEN** 用户删除角色
- **THEN** 系统 MUST 同步删除资产库中对应的角色资产
- **AND** 系统 MUST 显示删除确认对话框，提示资产库同步删除

#### Scenario: 资产更新同步到角色
- **GIVEN** 角色资产在资产库中被编辑
- **WHEN** 用户在资产库中修改角色资产信息
- **THEN** 系统 MUST 自动更新对应的角色
- **AND** 更新 MUST 反映在角色详情页

---

### Requirement: 管理员角色复制转换
系统 SHALL 支持管理员在项目角色和全局角色之间复制转换。

#### Scenario: 项目角色复制为全局角色
- **GIVEN** 用户是管理员或超级管理员
- **AND** 存在项目角色
- **WHEN** 用户选择"复制为全局角色"
- **THEN** 系统 MUST 创建新的全局角色
- **AND** 新角色 MUST 分配全局编号
- **AND** 新角色 MUST 复制原角色的所有信息和素材
- **AND** 新角色 MUST 保存到全局资产库
- **AND** 原角色和复制后的角色 MUST 相互独立

#### Scenario: 全局角色复制到项目
- **GIVEN** 用户是管理员或超级管理员
- **AND** 存在全局角色
- **WHEN** 用户选择"复制到项目"并选择目标项目
- **THEN** 系统 MUST 在目标项目创建新角色
- **AND** 新角色 MUST 分配项目角色编号
- **AND** 新角色 MUST 复制原角色的所有信息和素材
- **AND** 新角色 MUST 保存到项目资产库
- **AND** 原角色和复制后的角色 MUST 相互独立

#### Scenario: 权限控制
- **GIVEN** 普通成员用户
- **WHEN** 访问角色复制转换功能
- **THEN** 系统 MUST 隐藏或禁用复制转换按钮
- **AND** 系统 MUST 仅允许项目管理员执行项目内复制
- **AND** 系统 MUST 仅允许超级管理员执行全局转换
