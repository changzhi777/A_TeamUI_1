# Change: 添加测试数据文件和导入导出功能

## Why

当前导入导出向导的界面已完成，但缺少：
1. 测试用的模拟数据文件（CSV/JSON），用户无法方便地测试导入功能
2. 导入向导中的实际导入逻辑（目前只是模拟延迟）
3. 用户需要手动创建测试数据才能验证导入导向功能

## What Changes

- 新增测试数据文件生成模块 (`test-data-files.ts`)
- 在分镜头清单页面添加"下载测试数据"按钮
- 完善导入向导的实际导入逻辑，将数据正确添加到 store
- 生成包含示例分镜头的 CSV 和 JSON 测试文件

## Impact

- Affected specs:
  - `specs/storyboard/spec.md` - 新增测试数据文件相关需求
- Affected code:
  - `src/lib/test-data-files.ts` (新建) - 测试数据文件生成逻辑
  - `src/features/storyboard/components/storyboard-list-page.tsx` - 添加下载测试数据按钮
  - `src/features/storyboard/components/template-import-dialog.tsx` - 实现实际导入逻辑
