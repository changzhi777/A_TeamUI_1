# Design: convert-wizard-to-vertical

## 竖版向导布局设计

### 布局结构

```
┌─────────────────────────────────────────────────────────────┐
│  导入分镜头向导                                     [×]      │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌──────────────────────────────────────────┐  │
│  │  1 ○────┼──│  上传文件                                │  │
│  │  2 ○────┼──│                                          │  │
│  │  3 ●────┼──│  [步骤内容区域]                          │  │
│  │  4 ○────┼──│                                          │  │
│  │  5 ○────┼──│                                          │  │
│  │  6 ○────┼──│                                          │  │
│  └─────────┘  └──────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                              [上一步]  [下一步]             │
└─────────────────────────────────────────────────────────────┘
```

### 对话框尺寸调整

| 向导类型 | 当前尺寸 | 调整后尺寸 |
|---------|---------|-----------|
| 导入向导 | max-w-5xl | max-w-4xl, min-h-[600px] |
| 导出向导 | max-w-2xl | max-w-3xl, min-h-[500px] |

## Steps 组件扩展

### 新增属性

```typescript
interface StepsProps {
  children: React.ReactNode
  currentStep: number
  maxStep?: number
  orientation?: 'horizontal' | 'vertical'  // 新增
  className?: string
}
```

### 竖版步骤项设计

```tsx
function VerticalStep({ step, title, description, status }) {
  return (
    <div className="flex items-start gap-3">
      {/* 左侧：步骤编号和连接线 */}
      <div className="flex flex-col items-center">
        <div className={/* 圆圈样式 */}>
          {status === 'completed' ? <Check /> : step}
        </div>
        {step < maxStep && (
          <div className={/* 连接线样式 */} />
        )}
      </div>

      {/* 右侧：标题和描述 */}
      <div className="flex-1 pb-6">
        <p className={/* 标题样式 */}>{title}</p>
        {description && (
          <p className={/* 描述样式 */}>{description}</p>
        )}
      </div>
    </div>
  )
}
```

## 对话框布局

### 双栏布局

- **左侧**：竖版步骤导航（约 180px 宽度）
- **右侧**：步骤内容区域（剩余空间）

### 响应式适配

- `md` 以下：步骤导航简化为小圆点
- `md` 及以上：完整竖版步骤导航

## 修改文件

1. **`steps.tsx`**：添加 `VerticalStep` 组件和 `orientation` 属性
2. **`template-import-dialog.tsx`**：使用 `orientation="vertical"`，调整布局
3. **`template-export-dialog.tsx`**：使用 `orientation="vertical"`，调整布局
