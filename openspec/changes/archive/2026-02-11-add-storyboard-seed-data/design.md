# Design: 分镜头模拟数据生成

## Context

系统已有项目模拟数据 (`seed-data.ts`) 和分镜头模板数据 (`mock-shots.ts`)，但缺少将两者关联的逻辑。分镜头清单页面在无数据时显示空状态，影响用户体验。

## Goals / Non-Goals

**Goals:**
- 为所有演示项目自动生成分镜头数据
- 根据项目规模动态生成合适数量的分镜头
- 根据项目类型使用对应的镜头风格模板
- 提供手动重新生成数据的功能

**Non-Goals:**
- 不修改现有的 `mock-shots.ts` 模板结构
- 不改变分镜头数据模型
- 不影响用户手动创建的分镜头数据

## Decisions

### 1. 数据生成时机

**Decision:** 采用混合方式 - 应用启动时自动生成 + 手动重新生成按钮

**Reasoning:**
- 自动生成确保首次访问时有数据展示
- 手动按钮允许用户重置演示数据
- 避免重复生成已存在的数据

**Alternatives considered:**
- 仅自动生成：用户无法重置数据
- 仅手动生成：首次体验需要额外操作

### 2. 分镜头数量计算

**Decision:** 根据项目的 `totalShots` 字段动态生成，循环使用模板

**Reasoning:**
- 保持与项目数据的一致性
- 模板数量有限时循环复用是合理方案
- 确保每个项目的分镜头数量与预期一致

### 3. 模板选择策略

**Decision:** 使用现有的 `generateMockShots()` 函数，按项目类型选择模板

**Reasoning:**
- 代码复用，避免重复
- 已有的模板按项目类型分类，设计合理
- 支持 7 种项目类型：`shortDrama`, `realLifeDrama`, `aiPodcast`, `advertisement`, `mv`, `documentary`, `other`

### 4. 数据持久化策略

**Decision:** 生成的数据通过 Zustand store 的 persist 中间件自动持久化到 localStorage

**Reasoning:**
- 与现有数据存储方式一致
- 无需额外开发存储逻辑
- 用户刷新页面后数据保留

## Technical Implementation

### 文件结构

```
src/lib/
├── seed-data.ts              # 项目模拟数据（已有）
├── seed-storyboard-data.ts   # 分镜头模拟数据（新增）
└── mock-shots.ts             # 镜头模板（已有）
```

### 新增函数签名

```typescript
// src/lib/seed-storyboard-data.ts

/**
 * 为指定项目生成分镜头模拟数据
 * @param projectId 项目 ID
 * @param projectType 项目类型
 * @param count 需要生成的分镜头数量
 * @returns 生成的分镜头数量
 */
export function seedShotsForProject(
  projectId: string,
  projectType: ProjectType,
  count: number
): number

/**
 * 为所有演示项目生成分镜头数据
 * @param force 是否强制重新生成（覆盖现有数据）
 * @returns 生成的分镜头总数
 */
export function seedAllStoryboardData(force: boolean = false): number

/**
 * 清除所有分镜头模拟数据
 */
export function clearStoryboardSeedData(): void
```

### 集成点

1. **应用初始化** - 在 `App.tsx` 或 `index.tsx` 中调用 `seedAllStoryboardData()`
2. **分镜头清单页面** - 添加"重新生成数据"按钮，调用 `seedAllStoryboardData(true)`

## Risks / Trade-offs

### Risk: 数据重复生成

**Description:** 应用启动时可能重复生成已存在的分镜头

**Mitigation:**
- 检查项目是否已有分镜头数据
- 只有当项目的分镜头数量为 0 时才生成
- 提供参数控制是否强制重新生成

### Risk: 模板循环复用的重复性

**Description:** 当需要的分镜头数量超过模板数量时，会出现重复内容

**Mitigation:**
- 为复用的模板添加序号或场次标记
- 在描述中加入变化元素（如"场景1"、"场景2"）

### Trade-off: 数据量 vs localStorage 容量

**Description:** 所有项目都生成完整数据可能导致 localStorage 容量压力

**Mitigation:**
- 默认只为演示项目生成数据
- 提供清除数据的函数
- 监控存储使用情况（未来可考虑添加存储限制警告）

## Migration Plan

**步骤:**

1. 创建 `src/lib/seed-storyboard-data.ts` 文件
2. 实现数据生成函数
3. 在应用入口添加自动生成调用
4. 在分镜头清单页面添加重新生成按钮
5. 测试各项目类型的分镜头生成

**回滚:**
- 移除应用入口的生成调用
- 删除 `seed-storyboard-data.ts` 文件
- 清理 localStorage 中的相关数据

## Open Questions

无。需求明确，实现方案清晰。
