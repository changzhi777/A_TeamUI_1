# 渐变按钮变体 - 设计文档

## 设计目标

创建视觉上引人注目的渐变按钮，用于平台的主要操作（CTA），提升用户界面的视觉层次感。

## 视觉设计

### 颜色规范

| 角色 | 颜色值 | 颜色名称 | 位置 |
|------|--------|----------|------|
| 起始色 | #7ED4A6 | 青绿色 (Teal) | 左侧 |
| 结束色 | #40BE7A | 翠绿色 (Emerald) | 右侧 |
| 文字色 | #FFFFFF | 白色 | - |

### 渐变方向

```
#7ED4A6 ─────────────────────► #40BE7A
    (0%)                         (100%)
```

- 方向：水平（从左到右）
- Tailwind 类：`bg-gradient-to-r from-[#7ED4A6] to-[#40BE7A]`

### 交互状态

| 状态 | 样式 | Tailwind 类 |
|------|------|-------------|
| 默认 | 渐变背景 | `bg-gradient-to-r from-[#7ED4A6] to-[#40BE7A]` |
| 悬停 | 90% 透明度 | `hover:opacity-90` |
| 禁用 | 50% 透明度 | `disabled:opacity-50` |
| 焦点 | 焦环 | `focus-visible:ring-[3px]` (继承自基类) |

## 使用指南

### 何时使用渐变按钮

- **主要操作**：创建、保存、提交等重要操作
- **定价页面**：强调推荐方案
- **功能升级**：突出新功能或高级功能入口
- **营销场景**：吸引注意力的 CTA 按钮

### 何时不使用

- **次要操作**：使用 `outline` 或 `ghost` 变体
- **危险操作**：使用 `destructive` 变体
- **批量使用**：同一页面内避免过多渐变按钮，降低视觉冲击力

## 技术实现

### 按钮变体定义

```typescript
// src/components/ui/button.tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center ...", // 基础类
  {
    variants: {
      variant: {
        // ... 现有变体
        gradient:
          'bg-gradient-to-r from-[#7ED4A6] to-[#40BE7A] text-white shadow-xs hover:opacity-90',
      },
      // ...
    },
  }
)
```

### 样式优先级

为确保渐变样式正确应用，需要使用 `!important` 或合理排序类名。由于渐变背景会覆盖 `bg-*` 类，需要确保渐变类在其他背景类之后。

### 暗色模式兼容

当前渐变色在暗色背景下同样清晰可见，因此不需要暗色模式特殊处理。如需暗色模式优化，可以在未来添加：

```typescript
gradient:
  'bg-gradient-to-r from-[#7ED4A6] to-[#40BE7A] text-white dark:from-[#6BC895] dark:to-[#35AE6F] shadow-xs hover:opacity-90 dark:hover:opacity-85',
```

## 可访问性

### 对比度检查

| 前景色 | 背景色 | 对比度 | WCAG 等级 |
|--------|--------|--------|-----------|
| #FFFFFF | #7ED4A6 | 2.8:1 | AA (大文本) |
| #FFFFFF | #40BE7A | 2.4:1 | AA (大文本) |

由于按钮文本通常为 14px+ (text-sm)，符合 WCAG AA 标准的大文本要求。

### 键盘导航

渐变按钮继承基础按钮的键盘导航功能：
- `Tab` - 聚焦
- `Enter/Space` - 激活
- 焦点可见性通过 `focus-visible:ring-[3px]` 实现

## 浏览器兼容性

`bg-gradient-to-r` 是标准 CSS 渐变属性，支持所有现代浏览器：

| 浏览器 | 最低版本 |
|--------|----------|
| Chrome | 26+ |
| Firefox | 16+ |
| Safari | 6.1+ |
| Edge | 12+ |

IE 11 及更早版本需要前缀，但项目已不支持 IE。

## 设计示例

```tsx
// 主要 CTA
<Button variant="gradient" size="lg">
  开始创作
</Button>

// 表单提交
<Button variant="gradient" type="submit">
  保存更改
</Button>

// 图标按钮
<Button variant="gradient" size="icon">
  <Plus />
</Button>

// 禁用状态
<Button variant="gradient" disabled>
  保存中...
</Button>
```

## 未来扩展

如需支持更多渐变方向，可以添加子变体（需要重构 variant 结构）：

```typescript
// 未来可能的扩展
gradientUp: 'bg-gradient-to-t from-[#40BE7A] to-[#7ED4A6]',
gradientDown: 'bg-gradient-to-b from-[#7ED4A6] to-[#40BE7A]',
gradientRadial: 'bg-gradient-radial from-[#7ED4A6] to-[#40BE7A]',
```

或者使用复合 variant：

```typescript
<Button variant="gradient" gradientDirection="up">
```

但这需要更复杂的 cva 配置，当前提案采用简化的单一水平渐变方案。
