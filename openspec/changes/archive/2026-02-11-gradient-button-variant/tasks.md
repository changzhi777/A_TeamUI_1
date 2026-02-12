# 渐变按钮变体 - 实施任务

## 任务列表

### 1. 修改 Button 组件

**文件**: `src/components/ui/button.tsx`

**操作**: 在 `buttonVariants` 的 `variant` 对象中添加新的 `gradient` 变体

**变更详情**:
```typescript
// 在 variants.variant 对象中添加：
gradient:
  'bg-gradient-to-r from-[#7ED4A6] to-[#40BE7A] text-white shadow-xs hover:opacity-90',
```

**验证**:
- [x] TypeScript 编译无错误
- [x] 新变体可以正确使用
- [x] 支持 all size 变体

### 2. 验证功能

**操作**: 测试渐变按钮在各种场景下的表现

**测试用例**:
- [x] 默认尺寸渐变按钮
- [x] 小尺寸 (sm) 渐变按钮
- [x] 大尺寸 (lg) 渐变按钮
- [x] 图标按钮 (icon)
- [x] 悬停状态效果
- [x] 禁用状态效果
- [x] 与 `asChild` 配合使用

### 3. 更新文档（可选）

**文件**: `CLAUDE.md`

**操作**: 在项目文档中记录新的渐变按钮变体及其用法

## 实施顺序

1. [x] 修改 `button.tsx` 添加 gradient 变体
2. [x] 验证 TypeScript 编译
3. [x] 运行开发服务器测试视觉效果
4. （可选）更新项目文档

## 预计工作量

- 代码修改: 5 分钟
- 测试验证: 5 分钟
- 总计: 10 分钟

## 验证标准

- [x] 创建提案目录结构
- [x] 添加 gradient 变体到 buttonVariants
- [x] TypeScript 类型推断正确
- [x] 视觉效果符合设计要求
- [x] 悬停状态正常工作
- [x] 与现有变体无冲突
