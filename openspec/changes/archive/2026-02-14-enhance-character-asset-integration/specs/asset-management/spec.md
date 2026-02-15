# asset-management Spec Delta

## ADDED Requirements

### Requirement: 角色人物资产类型
系统 SHALL 支持角色人物作为资产类型。

#### Scenario: 定义角色资产类型
- **GIVEN** 系统定义资产类型
- **WHEN** 获取可用资产类型列表
- **THEN** 系统 MUST 包含 `character` 类型
- **AND** 角色类型 MUST 与 image、audio、video、script、aiGenerated 并列

#### Scenario: 角色资产数据结构
- **GIVEN** 创建角色类型资产
- **WHEN** 保存角色资产
- **THEN** 资产 MUST 包含 `characterData` 字段
- **AND** `characterData` MUST 包含角色编号、描述、个性、属性
- **AND** `characterData` MUST 包含视角图片引用（front、side、back、threeQuarter）
- **AND** `characterData` MUST 包含服装变体数组
- **AND** `characterData` MUST 包含语音配置
- **AND** 资产 MUST 包含 `characterId` 字段关联原角色

#### Scenario: 角色资产缩略图
- **GIVEN** 角色资产需要展示
- **WHEN** 生成角色资产缩略图
- **THEN** 系统 MUST 使用角色的正面视角图片作为缩略图
- **AND** 如果没有正面视角，MUST 使用其他可用视角
- **AND** 如果没有任何视角图片，MUST 使用默认角色图标

---

### Requirement: 角色资产浏览与筛选
系统 SHALL 在资产库中支持角色资产的浏览和筛选。

#### Scenario: 按角色类型筛选
- **GIVEN** 用户在资产库筛选面板
- **WHEN** 用户选择"角色人物"类型
- **THEN** 资产列表 MUST 仅显示类型为 `character` 的资产
- **AND** 筛选状态 MUST 反映在 URL 参数中

#### Scenario: 角色资产卡片视图
- **GIVEN** 用户在网格或卡片视图查看角色资产
- **WHEN** 资产类型为 `character`
- **THEN** 卡片 MUST 显示角色缩略图
- **AND** 卡片 MUST 显示角色名称和编号
- **AND** 卡片 MUST 显示角色标签
- **AND** 卡片 MUST 显示"角色"类型标识

#### Scenario: 角色资产表格视图
- **GIVEN** 用户在表格视图查看资产
- **WHEN** 资产类型为 `character`
- **THEN** 表格行 MUST 显示角色缩略图、名称、编号、标签、创建时间
- **AND** 表格 MUST 支持按角色名称和编号排序

---

### Requirement: 角色资产详情视图
系统 SHALL 提供专门的角色资产详情视图，展示完整角色信息。

#### Scenario: 查看角色资产详情
- **GIVEN** 用户点击角色资产
- **WHEN** 打开资产详情
- **THEN** 系统 MUST 显示角色详情视图
- **AND** 视图 MUST 包含角色基础信息区域（名称、编号、描述、个性）
- **AND** 视图 MUST 包含角色属性区域（年龄、性别、身高等）
- **AND** 视图 MUST 包含视角图片画廊
- **AND** 视图 MUST 包含服装变体列表
- **AND** 视图 MUST 包含语音播放器（如有）

#### Scenario: 角色视角图片浏览
- **GIVEN** 角色资产有多个视角图片
- **WHEN** 用户查看视角图片区域
- **THEN** 系统 MUST 以缩略图形式显示所有视角
- **AND** 用户 MUST 能够点击放大查看
- **AND** 系统 MUST 标注视角类型（正面、侧面、背面、3/4视角）

#### Scenario: 从角色资产跳转到角色设计
- **GIVEN** 用户查看角色资产详情
- **WHEN** 用户点击"编辑角色"按钮
- **THEN** 系统 MUST 跳转到对应的角色设计页面
- **AND** 用户 MUST 能够在角色设计页面修改角色

---

### Requirement: 角色资产元数据编辑
系统 SHALL 支持编辑角色资产的元数据，并同步到原角色。

#### Scenario: 编辑角色资产标签
- **GIVEN** 用户编辑角色资产
- **WHEN** 用户添加或删除标签
- **THEN** 系统 MUST 更新资产标签
- **AND** 系统 MUST 同步更新对应角色的标签

#### Scenario: 编辑角色资产名称
- **GIVEN** 用户编辑角色资产名称
- **WHEN** 保存修改
- **THEN** 系统 MUST 更新资产名称
- **AND** 系统 MUST 同步更新对应角色的名称
- **AND** 角色编号 MUST 保持不变

#### Scenario: 删除角色资产
- **GIVEN** 用户删除角色资产
- **WHEN** 确认删除
- **THEN** 系统 MUST 显示警告，提示关联的角色也将被删除
- **AND** 确认后资产和关联角色 MUST 同时删除

---

### Requirement: 角色资产统计
系统 SHALL 在资产统计中包含角色资产信息。

#### Scenario: 角色资产统计显示
- **GIVEN** 用户查看资产统计
- **WHEN** 资产库包含角色资产
- **THEN** 统计面板 MUST 显示角色资产数量
- **AND** 类型分布图表 MUST 包含"角色人物"分类
- **AND** 角色 MUST 作为独立分类显示
