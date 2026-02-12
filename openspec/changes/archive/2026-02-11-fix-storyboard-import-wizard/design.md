# 设计文档：修复分镜头导入向导

## 架构分析

### 当前导入流程

```
步骤 1: 文件上传
  ↓
步骤 2: 格式验证 (parseCSVFile / parseJSONTemplate)
  ↓
步骤 3: 字段映射
  ↓
步骤 4: 数据预览
  ↓
步骤 5: 导入选项
  ↓
步骤 6: 导入结果 (调用 addShot)
```

### 问题根源定位

#### 500 错误的根本原因

**文件**：`src/stores/storyboard-store.ts:84-102`

```typescript
addShot: (shotData) => {
  // 问题：总是自动计算镜头编号，覆盖了导入时的指定值
  const maxShotNumber = projectShots.length > 0
    ? Math.max(...projectShots.map((s) => s.shotNumber))
    : 0

  const newShot: StoryboardShot = {
    ...shotData,
    id: generateId(),
    shotNumber: maxShotNumber + 1,  // ← 这里覆盖了 shotNumber
    createdAt: now,
    updatedAt: now,
  }
}
```

**影响**：
- 导入时指定的 `shotNumber` 被忽略
- 导致步骤6中的数据不一致，可能触发存储错误

#### 导入逻辑冲突

**文件**：`src/features/storyboard/components/template-import-dialog.tsx:114-126`

```typescript
for (let i = 0; i < data.length; i++) {
  try {
    const parsedShot: ParsedShot = data[i]
    const shotNumber = currentShotNumber + i
    const storyboardShot = convertToStoryboardShot(parsedShot, projectId, shotNumber)
    // 这里计算了 shotNumber，但 addShot 会再次覆盖
    addShot(shotDataWithoutIdAndDates)
  }
}
```

## 解决方案设计

### 1. 修复镜头编号覆盖问题

**方案 A**：修改 `addShot` 方法，添加选项保留传入的 `shotNumber`

```typescript
interface AddShotOptions {
  preserveShotNumber?: boolean
}

addShot: (shotData: Omit<StoryboardShot, 'id' | 'createdAt' | 'updatedAt'>, options?: AddShotOptions) => {
  const now = new Date().toISOString()

  // 如果指定保留镜头编号且已提供，则使用传入值
  if (options?.preserveShotNumber && shotData.shotNumber) {
    const newShot: StoryboardShot = {
      ...shotData,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    }
    // ...
  }

  // 否则自动计算
  // ...
}
```

**方案 B（推荐）**：添加专用的 `addShots` 批量导入方法

```typescript
addShots: (shots: Omit<StoryboardShot, 'id' | 'createdAt' | 'updatedAt'>[]) => {
  const now = new Date().toISOString()
  const newShots = shots.map(shotData => ({
    ...shotData,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  }))

  set((state) => ({
    shots: [...state.shots, ...newShots],
  }))
}
```

**选择理由**：
- 批量导入是独立场景，不应受单条添加逻辑影响
- 性能更好（单次状态更新）
- 保持 `addShot` 行为不变，避免影响其他功能

### 2. 简化格式说明界面

**当前**：两个卡片，每个包含 3-4 行列表项

**优化后**：单行提示 + 图标

```tsx
<div className="flex items-center gap-4 text-sm text-muted-foreground">
  <div className="flex items-center gap-2">
    <FileSpreadsheet className="h-4 w-4" />
    <span>CSV 格式</span>
  </div>
  <div className="flex items-center gap-2">
    <FileCode className="h-4 w-4" />
    <span>JSON 格式</span>
  </div>
</div>
```

### 3. 文件大小验证

**限制**：最大 10MB（与提示文案一致）

```typescript
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

const handleFileSelect = (file: File) => {
  if (file.size > MAX_FILE_SIZE) {
    toast.error('文件大小超过限制，最大支持 10MB')
    return
  }
  // ...
}
```

### 4. 类型安全改进

**替换 `as any` 断言**：

```typescript
// 当前（不安全）
shotSize: parsed.shotSize as any,

// 改进后
shotSize: validateShotSize(parsed.shotSize),
```

```typescript
function validateShotSize(value: string): ShotSize {
  const validSizes: ShotSize[] = ['extremeLong', 'long', 'medium', 'closeUp', 'extremeCloseUp']
  if (validSizes.includes(value as ShotSize)) {
    return value as ShotSize
  }
  // 默认值
  return 'medium'
}
```

## 实施顺序

1. **高优先级**：修复 `addShot` / 添加 `addShots`
2. **中优先级**：简化界面、添加文件大小验证
3. **低优先级**：UX 改进（拖放反馈、错误提示优化）

## 测试计划

### 单元测试
- `addShots` 批量导入功能
- 文件大小验证
- JSON 解析错误处理

### 集成测试
- 完整导入流程（CSV 和 JSON）
- 大文件处理
- 错误场景

### 手动测试
- 移动端显示
- 拖放体验
- 错误提示友好性
