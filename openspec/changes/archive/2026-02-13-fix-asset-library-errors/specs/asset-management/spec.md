# asset-management Specification Delta

## ADDED Requirements

### Requirement: 资产 Store 类型完整性
系统 SHALL 提供完整的资产 Store 类型定义。

#### Scenario: selectedCount getter
- **GIVEN** 用户选择了多个资产
- **WHEN** 组件需要获取选中数量
- **THEN** 系统 MUST 提供 `selectedAssets.size` 作为选中计数

#### Scenario: 资产刷新
- **GIVEN** 资产列表需要刷新
- **WHEN** 调用刷新方法
- **THEN** 系统 MUST 通过 `refetch` 函数重新获取资产数据

### Requirement: 资产组件类型兼容
资产组件 SHALL 与 Store 类型保持兼容。

#### Scenario: 批量操作结果处理
- **GIVEN** 批量操作返回结果
- **WHEN** 处理操作结果
- **THEN** 组件 MUST 使用正确的 `AssetBatchResult` 类型属性（`success`/`failed`）

#### Scenario: 资产编辑参数
- **GIVEN** 用户编辑资产
- **WHEN** 调用更新方法
- **THEN** 参数 MUST 符合 `{ id: string; data: Partial<Asset> }` 格式
