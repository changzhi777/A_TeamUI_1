# asset-management Specification Delta

## ADDED Requirements

### Requirement: 模拟数据生成配置
系统 SHALL 提供可配置的模拟数据生成功能。

#### Scenario: 配置生成数量
- **GIVEN** 开发者需要生成模拟数据
- **WHEN** 调用数据生成函数
- **THEN** 系统 MUST 支持指定生成资产数量

#### Scenario: 配置类型分布
- **GIVEN** 需要测试特定类型资产
- **WHEN** 配置数据生成参数
- **THEN** 系统 MUST 支持指定各类型资产的比例

#### Scenario: 配置时间范围
- **GIVEN** 需要测试时间相关功能
- **WHEN** 生成模拟数据
- **THEN** 系统 MUST 在指定时间范围内随机分配创建时间

### Requirement: 真实模拟数据
模拟数据 SHALL 足够真实以支持功能测试。

#### Scenario: 图片资产数据
- **GIVEN** 生成图片资产
- **WHEN** 创建模拟图片数据
- **THEN** 系统 MUST 生成合理的文件名（中文名称）
- **AND** 系统 MUST 设置合理的尺寸和文件大小

#### Scenario: 音频资产数据
- **GIVEN** 生成音频资产
- **WHEN** 创建模拟音频数据
- **THEN** 系统 MUST 设置合理的时长（30秒-10分钟）
- **AND** 系统 MUST 设置合理的文件大小

#### Scenario: 标签分类
- **GIVEN** 资产需要分类管理
- **WHEN** 生成模拟资产
- **THEN** 系统 MUST 为每个资产分配 1-5 个相关标签
- **AND** 标签 MUST 符合短剧制作场景
