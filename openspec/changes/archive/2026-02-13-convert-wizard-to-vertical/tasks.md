# Tasks: convert-wizard-to-vertical

## 阶段 1：扩展 Steps 组件

- [x] **T1.1** 添加 `orientation` 属性到 StepsProps
  - 支持 'horizontal' | 'vertical'
  - 默认为 'horizontal' 保持向后兼容

- [x] **T1.2** 创建 VerticalStep 组件
  - 竖向步骤编号和连接线
  - 标题和描述区域
  - 状态样式（completed/current/pending）

- [x] **T1.3** 更新 Steps 组件逻辑
  - 根据 orientation 选择 HorizontalStep 或 VerticalStep
  - 调整容器样式

## 阶段 2：调整导入向导

- [x] **T2.1** 更新 template-import-dialog.tsx
  - 使用 orientation="vertical"
  - 调整对话框尺寸：max-w-4xl, min-h-[600px]

- [x] **T2.2** 添加双栏布局
  - 左侧：步骤导航（w-48 lg:w-56）
  - 右侧：步骤内容

- [x] **T2.3** 调整 Progress 组件位置
  - 移除 Progress 组件
  - 添加移动端底部步骤指示器

## 阶段 3：调整导出向导

- [x] **T3.1** 更新 template-export-dialog.tsx
  - 使用 orientation="vertical"
  - 调整对话框尺寸：max-w-3xl, min-h-[500px]

- [x] **T3.2** 添加双栏布局
  - 左侧：步骤导航（w-44 lg:w-52）
  - 右侧：步骤内容
  - 添加移动端底部步骤指示器

## 阶段 4：验证

- [x] **T4.1** 验证导入向导竖版显示
  - TypeScript 编译通过
  - 组件正确集成

- [x] **T4.2** 验证导出向导竖版显示
  - TypeScript 编译通过
  - 组件正确集成

- [x] **T4.3** 验证响应式适配
  - 移动端隐藏竖版导航
  - 移动端显示底部步骤指示器

- [x] **T4.4** 验证步骤导航交互
  - 步骤状态正确传递
  - 双栏布局正确

## 完成条件

- [x] 导入向导使用竖版布局
- [x] 导出向导使用竖版布局
- [x] 对话框尺寸适配
- [x] 响应式正常
