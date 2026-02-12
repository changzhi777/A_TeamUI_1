# add-episode-range 设计

## 数据模型设计

### Project 接口扩展

在现有的 `Project` 接口中添加 `episodeRange` 字段：

```typescript
export interface Project {
  id: string
  name: string
  description: string
  type: ProjectType
  status: ProjectStatus
  episodeRange: string  // 新增：集数范围，如 "第1-30集"
  createdAt: string
  updatedAt: string
  createdBy: string
  members: ProjectMember[]
  // ... 其他字段
}
```

### 字段规范

| 属性 | 值 |
|------|-----|
| 字段名 | `episodeRange` |
| 类型 | `string` |
| 是否必填 | 否 |
| 默认值 | `""` |
| 格式建议 | "第X-Y集" |
| 示例 | "第1-30集"、"第1-5集"、"全50集" |

## UI/UX 设计

### 项目卡片显示

**位置**：项目卡片顶部，项目名称旁边

**设计要求**：
- 使用醒目的颜色和图标区别于其他信息
- 位置在项目名称和描述之间
- 仅在有集数信息时显示

**视觉设计**：
```
┌─────────────────────────────────────┐
│ [📌] [⭐]                            │ ← 置顶/收藏图标
│                                      │
│ 我的短剧项目            [策划中] [⚙️] │ ← 项目名称 + 状态 + 菜单
│ 🎬 第1-30集                         │ ← 集数标签（新增）
│                                      │
│ 这是一个关于...的短剧项目           │ ← 描述
│                                      │
│ 分镜头进度  ████████░░ 80%          │
│                                      │
│ 🎬 120/150  👥 5        🕒 2024-02-10│
└─────────────────────────────────────┘
```

**组件结构**：
```tsx
<div className="flex items-center gap-2 mb-1">
  <span className="text-sm text-muted-foreground">
    {project.episodeRange && (
      <Badge variant="secondary" className="gap-1">
        <Film className="h-3 w-3" />
        {project.episodeRange}
      </Badge>
    )}
  </span>
</div>
```

### 项目详情页显示

**位置**：项目详情页标题下方

**设计**：与项目卡片样式保持一致

### 表单输入设计

**创建/编辑项目表单**：
- 添加集数范围输入框
- 使用标准文本输入组件
- 占位符：如 "第1-30集"
- 非必填项，留空则不显示

**表单布局**：
```tsx
<FormField
  control={form.control}
  name="episodeRange"
  render={({ field }) => (
    <FormItem>
      <FormLabel>集数范围</FormLabel>
      <FormControl>
        <Input
          placeholder="如：第1-30集"
          {...field}
        />
      </FormControl>
      <FormDescription>
        可选，输入项目的集数范围
      </FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>
```

## 样式设计

### 集数标签样式

使用 `Badge` 组件，配置：
- `variant="secondary"` - 次要样式，不抢夺项目名称的注意力
- `className="gap-1"` - 图标和文字间距
- `Film` 图标 - 胶片图标表示集数

**Tailwind 类名**：
```tsx
className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-xs font-medium"
```

### 深色模式适配

确保在深色模式下集数标签仍然清晰可见：
- 使用 `bg-secondary` 自动适配深色模式
- 文字颜色使用 `text-foreground` 自动适配

## 数据流设计

### 创建项目

```
用户填写表单 → episodeRange 字段 → addProject() → 存储到 Zustand
```

### 编辑项目

```
用户点击编辑 → 表单回显当前值 → 用户修改 → updateProject() → 更新 Zustand
```

### 显示集数

```
ProjectCard 组件 → 从 project 对象读取 episodeRange → 条件渲染 Badge
```

## 兼容性设计

### 向后兼容

- 现有项目没有 `episodeRange` 字段：显示为空字符串
- 新创建项目：可以选择填写或不填写
- 迁移策略：无需数据迁移，新字段默认为空字符串

### 表单验证

- 不添加必填验证（非必填项）
- 可选：添加格式验证（如检查是否包含"集"字）
- 长度限制：最多50个字符

## 国际化设计

### 需要添加的翻译

```typescript
// zh-CN.ts
{
  project: {
    episodeRange: '集数范围',
    episodeRangePlaceholder: '如：第1-30集',
    episodeRangeDescription: '可选，输入项目的集数范围',
  }
}
```

## 测试策略

### 单元测试

- 测试 `addProject` 和 `updateProject` 正确处理 `episodeRange` 字段
- 测试表单验证逻辑

### 集成测试

- 测试创建项目时集数范围的保存
- 测试编辑项目时集数范围的更新
- 测试项目卡片正确显示集数

### 视觉回归测试

- 验证集数标签在不同项目状态下的显示
- 验证深色/浅色模式下的显示效果
- 验证响应式布局下的显示

## 技术决策

### 决策1：使用字符串而非数字范围

**选择**：使用 `string` 类型存储集数范围

**原因**：
- 灵活性高，支持各种格式（"第1-30集"、"全50集"、"1-5集"等）
- 无需解析和验证逻辑
- 用户输入友好

**替代方案**：使用对象 `{ start: number, end: number }`
- 被拒绝：过于复杂，不支持"全50集"等格式

### 决策2：非必填字段

**选择**：`episodeRange` 为非必填字段

**原因**：
- 短剧项目可能有其他类型（广告、MV等）不需要集数
- 降低用户创建项目的门槛
- 向后兼容现有项目

### 决策3：Badge 组件显示

**选择**：使用现有的 `Badge` 组件

**原因**：
- 与状态徽章风格一致
- 已有深色模式支持
- 代码复用，符合 DRY 原则
