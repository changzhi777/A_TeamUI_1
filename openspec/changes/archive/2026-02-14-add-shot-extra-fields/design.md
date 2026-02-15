# Design: 分镜头扩展字段技术设计

## Context

分镜头系统需要支持更丰富的层级结构（季/集）和灵活的自定义字段能力。这是一个跨越数据模型、UI组件、API层的综合性变更。

### 技术约束
- 使用 Zustand 进行状态管理
- 使用 TanStack Table 进行表格渲染
- 使用 React Hook Form + Zod 进行表单验证
- 数据需要支持 localStorage 持久化和 API 同步

## Goals / Non-Goals

### Goals
- 支持季数、集数两个新的固定字段
- 建立灵活的自定义字段系统
- 保持现有数据完全兼容
- 保持 UI 性能不受影响

### Non-Goals
- 不实现字段级权限控制（哪些用户可见哪些字段）
- 不实现字段版本历史
- 不实现字段间的条件逻辑（如：A字段选择X时显示B字段）

## Decisions

### D1: 数据模型设计

**决定**：采用扁平化 + JSON 扩展的混合方案

```typescript
interface StoryboardShot {
  // ... 现有字段

  // 新增固定字段
  seasonNumber?: number;
  episodeNumber?: number;

  // 自定义字段值（键值对）
  customFields?: Record<string, CustomFieldValue>;
}

type CustomFieldValue = string | number | boolean | string[] | null;
```

**原因**：
- 固定字段使用独立属性，便于类型检查和索引
- 自定义字段使用 Record 类型，灵活且易于扩展
- 避免为每个自定义字段创建独立的列

### D2: 自定义字段配置存储

**决定**：独立 store 管理字段配置

```typescript
interface CustomFieldConfig {
  id: string;
  name: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'multiselect' | 'date' | 'checkbox';
  required: boolean;
  defaultValue?: CustomFieldValue;
  options?: string[]; // 用于 select/multiselect
  projectId?: string; // undefined 表示全局字段
  order: number;
  visible: boolean;
}

interface CustomFieldState {
  fields: CustomFieldConfig[];
  // CRUD 操作
}
```

**原因**：
- 分离配置与数据，便于独立管理
- 支持全局和项目级别的字段配置
- 便于实现字段排序、显示/隐藏

### D3: 表格列动态生成

**决定**：基于配置动态生成 TanStack Table 列定义

**实现**：
1. 基础列（镜头编号、场次等）保持固定
2. 季数、集数列默认隐藏，可通过列配置显示
3. 自定义字段列根据配置动态添加
4. 使用 `columnVisibility` 状态控制列显示

**原因**：
- TanStack Table 原生支持动态列
- 用户可自由配置可见列
- 性能优化：仅渲染可见列

### D4: 表单字段动态渲染

**决定**：使用工厂模式根据字段类型渲染表单控件

```typescript
function renderFieldByType(field: CustomFieldConfig, form: UseFormReturn) {
  switch (field.type) {
    case 'text': return <Input {...} />
    case 'textarea': return <Textarea {...} />
    case 'number': return <Input type="number" {...} />
    case 'select': return <Select {...} />
    case 'multiselect': return <MultiSelect {...} />
    case 'date': return <DatePicker {...} />
    case 'checkbox': return <Checkbox {...} />
  }
}
```

**原因**：
- 统一的渲染逻辑，便于维护
- 易于扩展新的字段类型
- 配置驱动，减少硬编码

## Risks / Trade-offs

### R1: 性能风险
**风险**：大量自定义字段可能导致表单渲染变慢
**缓解**：
- 使用 React.memo 优化字段组件
- 虚拟化长表单（如字段数 > 20）
- 懒加载非必要字段

### R2: 数据一致性
**风险**：字段配置变更后，已有数据可能不一致
**缓解**：
- 删除字段时保留数据但不显示
- 字段重命名时显示旧数据
- 提供数据清理工具

### R3: 导入/导出兼容性
**风险**：自定义字段数据导入导出可能丢失
**缓解**：
- 导出时包含字段配置
- 导入时智能匹配字段
- 提供字段映射界面

## Migration Plan

### Phase 1: 数据模型更新
1. 扩展 `StoryboardShot` 类型
2. 更新 API 类型定义
3. 现有数据自动兼容（新字段为可选）

### Phase 2: 固定字段实现
1. 实现季数、集数 UI
2. 更新表格列配置
3. 更新表单字段
4. 更新导入/导出逻辑

### Phase 3: 自定义字段系统
1. 创建字段配置 Store
2. 实现字段管理 UI
3. 实现动态表单渲染
4. 实现动态表格列

### Rollback
- 新字段均为可选，可安全回滚
- 自定义字段数据存储在 JSON 中，不影响核心数据结构

## Open Questions

1. **字段配置 UI 位置**：放在项目设置页面还是独立的"字段管理"页面？
2. **自定义字段数量限制**：是否需要限制每个项目的自定义字段数量？
3. **字段验证规则**：是否需要支持更复杂的验证（如正则、范围）？
