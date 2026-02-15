# Proposal: Enhance Character-Asset Integration

## Why

当前角色设计功能与资产管理系统相互独立，存在以下问题：
1. 角色缺乏统一编号，难以在项目管理中追踪和引用
2. 角色素材无法集中存储到资产库，不便于跨项目复用
3. 资产库缺少"角色人物"类别，无法管理角色相关的所有素材
4. 角色与资产数据不同步，导致信息维护困难

## What Changes

### 1. 角色编号系统
- 为每个角色分配唯一编号，格式：`PROJ-001-CHAR-001`（项目编号 + 角色序号）
- 全局角色使用 `GLOBAL-CHAR-001` 格式
- 编号自动生成，用户不可修改

### 2. 角色保存到资产库
- 在角色详情页添加"保存到资产库"按钮
- 保存时包含角色完整信息：基础信息、视角图片、服装变体、语音样本
- 资产库中创建对应的"角色人物"资产项

### 3. 资产库新增"角色人物"类别
- 扩展 `AssetType` 添加 `character` 类型
- 角色资产包含角色完整数据结构和素材引用
- 支持卡片/网格视图和专门的角色详情视图

### 4. 双向同步机制
- 角色与资产库中的对应资产保持双向同步
- 修改角色时自动更新资产库
- 删除角色时同步删除资产库中的对应项

### 5. 角色复制转换（管理员功能）
- 管理员/超级管理员可将项目角色复制为全局角色
- 可将全局角色复制到指定项目
- 复制后各自独立，同时保存到资产库

## Scope

- `src/lib/types/character.ts` - 添加编号字段
- `src/lib/types/assets.ts` - 添加 character 资产类型
- `src/stores/character-store.ts` - 编号生成逻辑
- `src/stores/asset-store.ts` - 角色资产管理
- `src/features/character/components/*` - 保存到资产库 UI
- `src/features/character/pages/*` - 角色编号显示
- `src/features/assets/components/*` - 角色资产展示

## Risks

- 双向同步可能导致性能问题，需要优化更新机制
- 角色数据结构变更需要迁移现有数据
- 复制转换功能需要权限控制，避免数据混乱

## Related

- character-design spec
- asset-management spec
- project-management spec
