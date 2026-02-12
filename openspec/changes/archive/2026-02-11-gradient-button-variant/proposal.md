# 渐变按钮变体

## 概述

为 Button 组件添加一个新的渐变（gradient）变体，使用 #7ED4A6 到 #40BE7A 的水平渐变色，为平台提供更具视觉吸引力的按钮样式选择。

## 背景

当前平台按钮使用纯色背景样式。为了提升 UI 的视觉层次和品牌识别度，需要添加渐变按钮样式，用于突出主要操作按钮（如"创建项目"、"保存"等重要操作）。

## 目标

1. 添加新的 `gradient` 按钮变体
2. 使用水平渐变（从左到右）
3. 渐变色从 #7ED4A6（青绿色）到 #40BE7A（翠绿色）
4. 保持与现有按钮组件的样式一致性
5. 支持所有尺寸变体（default、sm、lg、icon）

## 实施范围

### 修改文件

- `src/components/ui/button.tsx` - 添加 gradient 变体样式

### 不涉及

- 无需修改现有变体
- 无需创建新组件
- 无需修改主题配置

## 技术方案

使用 `class-variance-authority` (cva) 添加新的 `gradient` 变体：

```typescript
gradient:
  'bg-gradient-to-r from-[#7ED4A6] to-[#40BE7A] text-white shadow-xs hover:opacity-90'
```

## 用法示例

```tsx
// 渐变主要按钮
<Button variant="gradient">创建项目</Button>

// 不同尺寸
<Button variant="gradient" size="sm">小按钮</Button>
<Button variant="gradient" size="lg">大按钮</Button>
<Button variant="gradient" size="icon"><Icon /></Button>

// 与 asChild 配合
<Button variant="gradient" asChild>
  <Link href="/new">新建</Link>
</Button>
```

## 成功标准

- [ ] 新增 `gradient` 变体到 buttonVariants
- [ ] 渐变方向为水平（从左到右）
- [ ] 颜色正确：#7ED4A6 → #40BE7A
- [ ] 悬停状态有视觉反馈（降低透明度）
- [ ] 文字颜色为白色以确保对比度
- [ ] 支持 all size 变体
- [ ] TypeScript 类型正确推断

## 风险评估

- **低风险**：仅添加新变体，不影响现有功能
- **兼容性**：Tailwind CSS 渐变类在所有现代浏览器中支持
- **可访问性**：白色文字与渐变背景对比度符合 WCAG 标准

## 优先级

中等 - UI 优化，非阻塞功能
