# Tasks: revert-wizard-to-horizontal

## 阶段 1：恢复导入向导

- [x] **T1.1** 恢复 template-import-dialog.tsx 横版布局
  - 移除双栏布局
  - 恢复横向 Steps 组件
  - 调整对话框尺寸为 max-w-5xl
  - 恢复 Progress 组件

## 阶段 2：恢复导出向导

- [x] **T2.1** 恢复 template-export-dialog.tsx 横版布局
  - 移除双栏布局
  - 恢复横向 Steps 组件
  - 调整对话框尺寸为 max-w-2xl
  - 恢复 Progress 组件

## 阶段 3：验证

- [x] **T3.1** 验证导入向导横版显示
  - TypeScript 编译通过
  - 组件正确集成

- [x] **T3.2** 验证导出向导横版显示
  - TypeScript 编译通过
  - 组件正确集成

## 完成条件

- [x] 导入向导使用横版布局
- [x] 导出向导使用横版布局
- [x] 对话框尺寸适配
