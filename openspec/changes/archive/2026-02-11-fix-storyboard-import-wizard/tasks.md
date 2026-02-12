# 任务清单：修复分镜头导入向导

## 任务顺序

### 第一阶段：核心修复（必须完成）

#### 1. 添加批量导入方法到 store
**文件**：`src/stores/storyboard-store.ts`

- [x] 添加 `addShots` 方法到 `StoryboardState` 接口
- [x] 实现批量添加逻辑，保留传入的 `shotNumber`
- [x] 使用单次状态更新提升性能

**验证**：可以批量添加多个分镜头，镜头编号保持不变

---

#### 2. 修改导入对话框使用批量方法
**文件**：`src/features/storyboard/components/template-import-dialog.tsx`

- [x] 从 store 获取新的 `addShots` 方法
- [x] 修改 `handleImport` 函数，收集所有待导入的分镜头
- [x] 使用 `addShots` 替代循环调用 `addShot`

**验证**：JSON 导入不再出现 500 错误

---

#### 3. 简化格式说明界面
**文件**：`src/features/storyboard/components/import/steps/step1-file-upload.tsx`

- [x] 移除两个详细的 Card 组件
- [x] 替换为单行图标提示
- [x] 保持响应式布局（移动端堆叠）

**验证**：界面更简洁，无需滚动即可看到上传按钮

---

### 第二阶段：增强验证（高优先级）

#### 4. 添加文件大小验证
**文件**：`src/features/storyboard/components/import/steps/step1-file-upload.tsx`

- [x] 定义 `MAX_FILE_SIZE` 常量（10MB）
- [x] 在 `handleFileSelect` 中添加大小检查
- [x] 显示友好的错误提示

**验证**：上传大文件时显示正确提示

---

#### 5. 改进 JSON 解析错误处理
**文件**：`src/lib/import/template.ts`

- [x] 增强 `parseJSONTemplate` 的错误捕获
- [x] 添加 JSON 语法错误位置信息
- [x] 验证必需字段并提供详细提示

**验证**：格式错误的 JSON 文件显示有用的错误信息

---

### 第三阶段：UX 优化（中优先级）

#### 6. 改进拖放视觉反馈
**文件**：`src/features/storyboard/components/import/steps/step1-file-upload.tsx`

- [x] 增强拖放状态样式（更明显的边框和背景）
- [x] 添加拖放悬停动画效果
- [x] 改进移动端触摸体验

**验证**：拖放体验更流畅

---

#### 7. 添加导入进度指示
**文件**：`src/features/storyboard/components/import/steps/step6-import-result.tsx`

- [x] 在导入进行中显示进度条
- [x] 显示已处理/总数量
- [x] 完成后显示成功/失败统计

**验证**：用户可以看到导入进度

---

#### 8. 优化错误提示
**文件**：`src/features/storyboard/components/template-import-dialog.tsx`

- [x] 改进 toast 错误消息的友好性
- [x] 添加重试建议
- [x] 提供更具体的错误上下文

**验证**：错误信息更易于理解

---

### 第四阶段：类型安全（低优先级）

#### 9. 移除不安全的类型断言
**文件**：`src/lib/import/template.ts`

- [x] 添加 `validateShotSize` 函数
- [x] 添加 `validateCameraMovement` 函数
- [x] 替换 `as any` 断言

**验证**：类型检查通过，无运行时错误

---

## 依赖关系

```
任务 1 (addShots) → 任务 2 (使用 addShots) → 验证修复
                    ↓
任务 3 (简化界面) ← 独立 → 任务 4 (文件大小验证)
                    ↓
任务 5 (错误处理) ← 独立 → 任务 6-8 (UX 优化)
                    ↓
任务 9 (类型安全) ← 可延后
```

## 测试计划

### 手动测试场景

1. **JSON 导入成功**：上传有效的 JSON 模板文件，验证所有分镜头正确导入
2. **CSV 导入成功**：上传有效的 CSV 文件，验证数据解析正确
3. **大文件拒绝**：上传超过 10MB 的文件，验证显示错误提示
4. **格式错误处理**：上传损坏的 JSON 文件，验证显示有用错误信息
5. **移动端显示**：在小屏幕设备上验证界面正确显示

### 回归测试

- 确保现有分镜头的添加、编辑、删除功能不受影响
- 确保导出功能正常工作
- 确保其他使用 `addShot` 的地方不受影响
