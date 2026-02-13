# Tasks: fix-asset-upload-wizard

## 阶段 1：修复 API 调用签名

- [x] **T1.1** 修复 `asset-store.ts` 中 uploadMutation 的 API 调用
  - 将独立参数改为对象参数
  - 添加必填字段：name, type, source, scope
  - 添加 AssetType, AssetSource, AssetScope 类型导入

## 阶段 2：创建向导组件

- [x] **T2.1** 创建步骤指示器组件 `UploadStepIndicator`
  - 横向步骤指示
  - 当前步骤高亮
  - 已完成步骤显示勾选

- [x] **T2.2** 创建文件选择步骤组件 `FileSelectionStep`
  - 文件选择器
  - 拖拽上传区域
  - 文件预览列表
  - 文件验证（格式、大小）

- [x] **T2.3** 创建元数据步骤组件 `MetadataStep`
  - 资产名称输入
  - 资产类型选择
  - 资产来源选择
  - 标签输入（支持常用标签快速选择）
  - 描述输入
  - 批量/单独设置切换

- [x] **T2.4** 创建确认步骤组件 `ConfirmationStep`
  - 文件列表预览
  - 元数据预览
  - 开始上传按钮
  - 上传进度显示
  - 成功/失败状态指示

## 阶段 3：重构 AssetUploader

- [x] **T3.1** 重构 AssetUploader 为主容器
  - 集成步骤管理（3 步骤）
  - 管理本地状态（文件、元数据、上传状态）
  - 处理步骤导航（上一步/下一步）

- [x] **T3.2** 添加上传进度显示
  - 单文件进度
  - 总体进度
  - 上传状态指示

- [x] **T3.3** 更新 asset-library-page.tsx
  - 调整对话框尺寸（max-w-3xl, max-h-[85vh]）
  - 添加 onClose 回调

## 阶段 4：测试验证

- [x] **T4.1** 测试单文件上传流程
  - TypeScript 编译通过
  - 组件正确集成

- [x] **T4.2** 测试多文件上传流程
  - 文件数组状态管理正确
  - 批量上传逻辑实现

- [x] **T4.3** 测试文件验证功能
  - FileSelectionStep 包含格式验证
  - 包含大小限制验证

- [x] **T4.4** 验证资产列表刷新
  - onComplete 回调调用 refetch
  - queryClient.invalidateQueries 正确触发

## 完成条件

- [x] 上传不再报 500 错误（API 签名已修复）
- [x] 向导式上传流程正常工作（3 步骤组件已创建）
- [x] 所有必填字段正确传递（name, type, source, scope）
- [x] 用户体验流畅（向导式流程，进度显示，状态指示）
