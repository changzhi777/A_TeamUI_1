# 设计文档：优化分镜头向导界面布局

## 当前实现分析

### Steps 组件结构
当前 `Steps` 组件使用 `flex-col` 竖向排列步骤：

```tsx
// 当前布局（竖版）
<div className="flex items-center justify-between mb-8">
  {/* 步骤垂直排列 */}
</div>
```

### Step 组件布局
每个步骤包含：
- 圆形指示器（显示步骤编号或勾选图标）
- 步骤标题
- 步骤描述（可选）
- 连接线（除最后一步外）

### 问题点
1. 竖版布局在对话框中占用过多垂直空间
2. 5-6 个步骤导致对话框高度过大
3. 用户需要频繁滚动才能看到完整内容

## 目标设计

### 横版布局方案

#### 整体结构
```
┌─────────────────────────────────────────────────────────────┐
│  导入分镜头向导                                    [X]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌────┐    ┌────┐    ┌────┐    ┌────┐    ┌────┐    │
│  │ 1  │────│ 2  │────│ 3  │────│ 4  │────│ 5  │    │
│  └────┘    └────┘    └────┘    └────┘    └────┘    │
│  上传      格式      字段      数据      导入         │
│  文件      验证      映射      预览      结果         │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │           步骤内容区域                               │   │
│  │                                                     │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌────────────────┐  ┌──────────────────────────────┐    │
│  │   上一步      │  │         下一步    →         │    │
│  └────────────────┘  └──────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### 组件实现方案

#### 1. Steps 组件改造

```tsx
export function Steps({ children, currentStep, className, layout = 'horizontal' }: StepsProps) {
  return (
    <div className={cn('w-full', className)}>
      <div className={cn(
        'flex gap-4 mb-8',
        layout === 'horizontal' ? 'flex-row items-center' : 'flex-col'
      )}>
        {childrenArray.map((child, index) => (
          // ... 渲染步骤
        ))}
      </div>
    </div>
  )
}
```

#### 2. Step 组件调整

```tsx
export function Step({ step, title, description, status, className }: StepProps) {
  return (
    <div className={cn('flex items-center', className)}>
      {/* 圆形指示器 */}
      <div className="flex items-center justify-center w-10 h-10 rounded-full border-2">
        {/* ... */}
      </div>

      {/* 标题和描述（可折叠以节省空间） */}
      {description && (
        <div className="ml-2">
          <p className="text-sm font-medium">{title}</p>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
      )}

      {/* 连接线 */}
      {step < totalSteps && (
        <div className="w-16 h-px bg-border mx-2" />
      )}
    </div>
  )
}
```

### 响应式设计

#### 大屏幕（>= 1024px）
- 完整横版布局
- 显示步骤标题和描述

#### 中等屏幕（768px - 1023px）
- 横版布局
- 仅显示步骤标题，隐藏描述
- 连接线变短

#### 小屏幕（< 768px）
- 切换为紧凑横版布局
- 步骤指示器缩小
- 标题文字换行或截断

### 视觉规范

#### 颜色状态
- **已完成**: `bg-primary border-primary text-primary-foreground`
- **当前**: `border-primary text-primary`
- **待完成**: `border-muted-foreground/30 text-muted-foreground`

#### 连接线
- 已完成部分: `bg-primary`
- 未完成部分: `bg-muted`

#### 间距
- 步骤之间: `gap-4` (16px)
- 指示器到标题: `ml-2` (8px)
- 整体底部边距: `mb-8` (32px)

## 实现细节

### 向后兼容
保留 `layout` 属性，允许选择横版或竖版：
```tsx
<Steps layout="horizontal" currentStep={1}>
  <Step title="步骤1" />
  <Step title="步骤2" />
</Steps>
```

### 默认行为
- 默认使用横版布局
- 现有对话框无需修改即可获得新布局

### 过渡动画
- 添加平滑的状态转换动画
- 步骤切换时有视觉反馈

## 测试计划

### 单元测试
- [ ] 测试不同布局模式渲染正确
- [ ] 测试状态正确传递
- [ ] 测试响应式断点切换

### 视觉回归测试
- [ ] 对比横版和竖版布局截图
- [ ] 验证颜色和间距符合设计

### 集成测试
- [ ] 完整导入向导流程
- [ ] 完整导出向导流程
- [ ] 验证所有功能正常工作
