# Tasks: Add Custom View Slot and Fix Gallery Errors

## Phase 1: 错误修复 (Critical)
- [x] 1.1 修复 `character-gallery.tsx` 中 `VIEW_TYPE_LABELS_CONST` 未定义错误
  - 第 97 行：替换为 `VIEW_TYPE_LABELS`
  - 第 355 行：替换为 `VIEW_TYPE_LABELS`
- [x] 1.2 验证修复后"重新生成"按钮正常工作

## Phase 2: 自定义视角类型扩展
- [x] 2.1 扩展 `ViewType` 类型，支持动态视角名称
- [x] 2.2 修改 `Character.views` 类型，添加 `customViews` 字段
- [x] 2.3 更新 `VIEW_TYPE_LABELS` 支持动态获取标签（添加 `getViewTypeLabel` 函数）

## Phase 3: 自定义视角卡片功能
- [x] 3.1 在 `CharacterGallery` 组件添加"添加自定义视角"卡片
- [x] 3.2 创建自定义视角命名对话框
- [x] 3.3 实现自定义视角的添加、编辑、删除功能
- [x] 3.4 自定义视角卡片显示自定义名称

## Phase 4: Store 更新
- [x] 4.1 更新 `character-store.ts` 支持自定义视角操作
- [x] 4.2 添加 `addCustomView` 方法
- [x] 4.3 添加 `removeCustomView` 方法
- [x] 4.4 添加 `renameCustomView` 方法

## Phase 5: 测试和验证
- [x] 5.1 运行构建验证无错误
- [x] 5.2 验证固定视角功能正常
- [x] 5.3 验证自定义视角 CRUD 操作
- [x] 5.4 验证数据持久化

## Acceptance Criteria
1. ✅ "重新生成"按钮点击不再报错
2. ✅ 用户可以添加自定义命名的视角卡片
3. ✅ 自定义视角卡片显示自定义名称
4. ✅ 自定义视角支持图片上传和 AI 生成
5. ✅ 自定义视角可以重命名和删除
6. ✅ 现有 4 个固定视角功能不受影响
