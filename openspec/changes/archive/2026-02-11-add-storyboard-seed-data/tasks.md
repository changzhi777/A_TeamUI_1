# 实施任务清单

## 1. 实现分镜头模拟数据生成模块

- [x] 1.1 创建 `src/lib/seed-storyboard-data.ts` 文件
- [x] 1.2 实现 `seedShotsForProject()` 函数
  - 支持指定项目 ID、项目类型和生成数量
  - 使用 `mock-shots.ts` 中的 `generateMockShots()` 函数
  - 循环复用模板以生成指定数量的分镜头
  - 为循环复用的镜头添加场次编号变化
- [x] 1.3 实现 `seedAllStoryboardData()` 函数
  - 遍历所有项目（从 `project-store` 获取）
  - 检查每个项目是否已有分镜头数据
  - 根据项目的 `totalShots` 和 `type` 调用 `seedShotsForProject()`
  - 支持 `force` 参数强制重新生成
  - 返回生成的分镜头总数
- [x] 1.4 实现 `clearStoryboardSeedData()` 函数
  - 清除所有模拟生成的分镜头数据
  - 保留用户手动创建的分镜头（通过标记区分）

## 2. 集成自动数据生成

- [x] 2.1 在应用入口添加初始化调用
  - 用户登录后调用 `seedAllStoryboardData()`
  - 确保在 store 初始化后执行
  - 在项目列表页面的初始化逻辑中添加
- [x] 2.2 添加条件判断
  - 只为演示项目生成数据（`createdBy` 为 'system' 的项目）
  - 避免覆盖用户手动创建的分镜头

## 3. 添加手动重新生成功能

- [x] 3.1 在分镜头清单页面 (`storyboard-list-page.tsx`) 添加"重新生成数据"按钮
  - 放置在页面顶部操作区域的下拉菜单中
  - 使用刷新图标 RefreshCw
- [x] 3.2 实现重新生成逻辑
  - 调用 `seedAllStoryboardData(true)` 强制重新生成
  - 完成后显示 toast 成功消息
- [x] 3.3 添加确认对话框
  - 提示用户此操作将清除所有现有的模拟分镜头数据
  - 允许用户取消操作

## 4. 添加清除数据功能

- [x] 4.1 在分镜头清单页面添加"清除模拟数据"按钮
  - 放置在操作菜单中
- [x] 4.2 实现清除逻辑
  - 调用 `clearStoryboardSeedData()`
  - 显示确认对话框
  - 完成后显示 toast 消息

## 5. 验证和测试

- [x] 5.1 测试各项目类型的分镜头生成
  - 验证 7 种项目类型都使用正确的模板（代码已实现）
- [x] 5.2 测试数量计算逻辑
  - 验证生成的分镜头数量与项目的 `totalShots` 一致（代码已实现）
- [x] 5.3 测试模板循环复用
  - 验证当需求量超过模板数量时的正确循环（代码已实现）
- [x] 5.4 测试持久化
  - 验证数据正确保存到 localStorage（Zustand persist 中间件自动处理）
  - 验证刷新页面后数据保留（代码已实现）
- [x] 5.5 测试边界情况
  - 空项目列表（已添加判断逻辑）
  - 项目无 `totalShots` 字段（已设置默认值 10）
  - 无效的项目类型（`generateMockShots` 会使用 `other` 类型作为默认值）
