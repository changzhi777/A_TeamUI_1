# Change: 为分镜头清单生成模拟数据

## Why

当前分镜头清单页面在没有数据时显示空状态，用户无法直观体验分镜头管理功能。为演示项目自动生成模拟分镜头数据可以让用户快速理解系统的功能，提升演示和测试体验。

## What Changes

- 新增分镜头模拟数据生成函数 (`seed-storyboard-data.ts`)
- 应用启动时自动为演示项目生成缺失的分镜头数据
- 在分镜头清单页面添加"重新生成数据"按钮，允许用户手动触发
- 根据项目的 `totalShots` 字段动态生成对应数量的分镜头
- 根据项目类型 (`shortDrama`, `realLifeDrama`, `advertisement` 等) 使用对应的镜头模板
- 使用现有的 `mock-shots.ts` 中的镜头模板数据

## Impact

- Affected specs:
  - `specs/storyboard/spec.md` - 新增模拟数据生成相关需求
- Affected code:
  - `src/lib/seed-storyboard-data.ts` (新建) - 分镜头模拟数据生成逻辑
  - `src/features/storyboard/components/storyboard-list-page.tsx` - 添加重新生成按钮
  - 应用初始化逻辑（如 `App.tsx` 或相关入口文件）
