# Design: Enhance Character-Asset Integration

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Character System                          │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐  │
│  │ Character   │───▶│ Asset Sync  │◀──▶│ Asset Library       │  │
│  │ Store       │    │ Service     │    │ (character type)    │  │
│  └─────────────┘    └─────────────┘    └─────────────────────┘  │
│         │                                        │               │
│         ▼                                        ▼               │
│  ┌─────────────┐                        ┌─────────────────────┐  │
│  │ Project     │                        │ Character Asset     │  │
│  │ Characters  │                        │ Viewer              │  │
│  └─────────────┘                        └─────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Data Model Changes

### 1. Character Type Extension

```typescript
interface Character {
  id: string
  code: string  // NEW: 角色编号，如 "PROJ-001-CHAR-001"
  name: string
  // ... existing fields
  assetId?: string  // NEW: 关联的资产ID，用于双向同步
  syncedToAsset: boolean  // NEW: 是否已同步到资产库
}
```

### 2. Asset Type Extension

```typescript
type AssetType = 'image' | 'audio' | 'video' | 'script' | 'aiGenerated' | 'character'  // NEW

interface CharacterAsset extends Asset {
  type: 'character'
  characterData: {
    code: string
    description: string
    personality: string
    attributes: CharacterAttributes
    tags: string[]
    basePrompt: string
    views: {
      front?: { url: string; prompt: string }
      side?: { url: string; prompt: string }
      back?: { url: string; prompt: string }
      threeQuarter?: { url: string; prompt: string }
    }
    costumes: CostumeVariant[]
    voice?: CharacterVoice
  }
  characterId: string  // 关联的原角色ID
}
```

### 3. Character Code Generation

```typescript
// 编号生成规则
function generateCharacterCode(projectId: string | undefined, sequence: number): string {
  if (projectId) {
    // 项目角色: PROJ-{项目序号}-CHAR-{角色序号}
    const projectSeq = getProjectSequence(projectId)
    return `PROJ-${String(projectSeq).padStart(3, '0')}-CHAR-${String(sequence).padStart(3, '0')}`
  } else {
    // 全局角色: GLOBAL-CHAR-{序号}
    return `GLOBAL-CHAR-${String(sequence).padStart(3, '0')}`
  }
}
```

## Sync Mechanism

### Bidirectional Sync Flow

```
Character Update Flow:
1. User edits character in Character Store
2. Character Store triggers sync event
3. Asset Sync Service checks if character has assetId
4. If yes: update corresponding asset
5. If no: optionally create new asset

Asset Update Flow:
1. User edits character asset in Asset Store
2. Asset Store checks if asset has characterId
3. If yes: update corresponding character
4. Changes reflect in Character components
```

### Sync Strategy

- **Immediate Sync**: 关键字段变更立即同步
- **Batched Sync**: 图片、语音等大文件批量同步
- **Conflict Resolution**: 以最后修改时间为准

## UI Components

### 1. Character Code Display
- 在角色卡片、详情页、列表中显示编号
- 编号作为角色的唯一标识

### 2. Save to Asset Library Button
- 位置：角色详情页顶部操作栏
- 状态：已同步/未同步
- 点击后触发同步流程

### 3. Character Asset Viewer
- 网格/卡片视图：显示角色缩略图、名称、编号
- 详情视图：完整角色信息 + 所有素材

### 4. Admin Character Copy Dialog
- 来源选择：项目角色/全局角色
- 目标选择：目标项目/全局
- 选项：是否同步到资产库

## Permission Model

| 操作 | 普通成员 | 项目管理员 | 超级管理员 |
|------|---------|-----------|-----------|
| 查看角色 | ✓ | ✓ | ✓ |
| 创建角色 | ✓ | ✓ | ✓ |
| 保存到资产库 | ✓ | ✓ | ✓ |
| 项目角色→全局角色 | ✗ | ✗ | ✓ |
| 全局角色→项目角色 | ✗ | ✓ | ✓ |
| 删除角色 | 自己创建 | 项目内 | 全部 |

## Migration Plan

1. **Phase 1**: 添加编号字段，现有角色自动生成编号
2. **Phase 2**: 扩展资产类型，添加角色资产支持
3. **Phase 3**: 实现双向同步服务
4. **Phase 4**: 添加复制转换功能

## Technical Considerations

### Performance
- 使用 debounce 优化频繁更新场景
- 图片同步使用懒加载
- 批量操作使用队列

### Data Integrity
- 同步操作使用事务
- 失败时提供重试机制
- 保留同步日志用于调试

### Storage
- 角色资产引用原图片 URL，不复制文件
- 避免重复存储相同素材
