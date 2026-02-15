# asset-management Spec Delta

## MODIFIED Requirements

### Requirement: 资产浏览与筛选
系统 SHALL 提供多种浏览和筛选方式，帮助用户快速找到所需资产。

#### Scenario: 按类型筛选
- **WHEN** 用户在筛选面板中选择资产类型（如"图片"）
- **THEN** 资产列表 MUST 仅显示该类型的资产
- **AND** 筛选状态 MUST 反映在 URL 参数中
- **AND** 用户可以通过 URL 分享筛选结果

#### Scenario: 按标签筛选
- **WHEN** 用户点击某个标签
- **THEN** 资产列表 MUST 仅显示包含该标签的资产
- **AND** 系统 MUST 支持多标签组合筛选（AND 逻辑）

#### Scenario: 搜索资产
- **WHEN** 用户在搜索框中输入关键词
- **THEN** 系统 MUST 实时过滤匹配的资产名称和描述
- **AND** 搜索 MUST 不区分大小写
- **AND** 系统 MUST 提供清空搜索按钮

#### Scenario: 切换视图模式
- **WHEN** 用户在网格视图、卡片视图和表格视图之间切换
- **THEN** 系统 MUST 记住用户的视图偏好
- **AND** 下次访问时 MUST 恢复上次选择的视图模式
- **AND** 系统支持三种视图模式：'grid'（网格）、'card'（卡片）、'table'（表格）

---

## ADDED Requirements

### Requirement: 资产表格视图
系统 SHALL 提供表格视图，以数据表形式展示资产列表，便于快速浏览和批量操作。

#### Scenario: 查看表格视图
- **WHEN** 用户切换到表格视图模式
- **THEN** 系统 MUST 以表格形式显示资产列表
- **AND** 表格 MUST 包含以下列：缩略图、名称、类型、来源、文件大小、标签、上传者、创建时间、操作
- **AND** 用户 MUST 能够按名称、类型、大小、创建时间等列进行排序

#### Scenario: 表格列排序
- **WHEN** 用户点击表格列标题
- **THEN** 系统 MUST 按该列进行升序或降序排序
- **AND** 系统 MUST 显示当前排序方向指示器
- **AND** 再次点击 MUST 切换排序方向

#### Scenario: 表格列显示/隐藏
- **WHEN** 用户点击"显示列"按钮
- **THEN** 系统 MUST 显示所有可选列的下拉菜单
- **AND** 用户 MUST 能够勾选或取消勾选列来控制显示
- **AND** 必须显示的列（名称、操作）MUST 不能被隐藏

#### Scenario: 表格批量选择
- **WHEN** 用户在表格视图中勾选资产
- **THEN** 系统 MUST 高亮显示已选中的行
- **AND** 系统 MUST 显示已选资产数量
- **AND** 用户 MUST 能够使用表头复选框进行全选/取消全选
- **AND** 批量操作工具栏 MUST 显示在表格上方

#### Scenario: 表格行操作
- **WHEN** 用户点击表格行的操作按钮
- **THEN** 系统 MUST 显示操作菜单（预览、编辑、删除）
- **AND** 预览操作 MUST 打开资产预览对话框
- **AND** 编辑操作 MUST 打开资产编辑对话框
- **AND** 删除操作 MUST 显示确认对话框

#### Scenario: 表格视图与筛选兼容
- **WHEN** 用户在表格视图下应用筛选条件
- **THEN** 表格 MUST 仅显示符合条件的资产
- **AND** 筛选结果 MUST 与其他视图模式保持一致
