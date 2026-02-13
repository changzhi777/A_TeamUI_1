# Design: fix-asset-upload-wizard

## 架构设计

### 组件结构

```
AssetUploader (主容器)
├── UploadWizard (横版向导)
│   ├── StepIndicator (步骤指示器)
│   ├── FileSelectionStep (步骤1: 选择文件)
│   ├── MetadataStep (步骤2: 填写元数据)
│   └── ConfirmationStep (步骤3: 确认上传)
└── UploadProgress (上传进度)
```

### 横版向导布局

```
┌────────────────────────────────────────────────────────────────┐
│  [1. 选择文件] ──→ [2. 填写信息] ──→ [3. 确认上传]            │
│     ●                ○                 ○                      │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  [当前步骤内容区域]                                            │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                                    [上一步]  [下一步/上传]     │
└────────────────────────────────────────────────────────────────┘
```

## API 调用修复

### 问题

Store 中 `uploadMutation` 错误地调用 API：

```typescript
// 错误的调用方式
mutationFn: ({ file, metadata, onProgress }) =>
  assetsApi.uploadAsset(file, metadata, onProgress)
```

### 修复

使用正确的对象参数格式：

```typescript
// 正确的调用方式
mutationFn: ({
  file,
  name,
  type,
  source,
  scope,
  projectId,
  tags,
  description,
}: UploadParams) =>
  assetsApi.uploadAsset({
    file,
    name,
    type,
    source,
    scope,
    projectId,
    tags,
    description,
  })
```

## 向导步骤设计

### 步骤 1：选择文件

- 文件选择器（支持多选）
- 拖拽上传区域
- 已选文件预览列表
- 文件大小/格式验证

### 步骤 2：填写元数据

- **资产名称**：自动从文件名提取，可编辑
- **资产类型**：下拉选择（图片/视频/音频/剧本/AI生成）
- **资产来源**：下拉选择（本地上传/外部链接/AI生成/云存储）
- **资产范围**：全局/项目级（根据上下文自动设置）
- **标签**：多选标签输入
- **描述**：文本域

批量上传时的选项：
- 统一设置所有文件
- 单独设置每个文件

### 步骤 3：确认上传

- 显示即将上传的文件列表
- 显示每个文件的元数据
- 开始上传按钮

## 状态管理

### 本地状态

```typescript
interface UploadWizardState {
  currentStep: 1 | 2 | 3
  files: File[]
  fileMetadata: Map<string, FileMetadata>
  useCommonMetadata: boolean
  commonMetadata: FileMetadata
  uploading: boolean
  uploadProgress: Map<string, number>
}
```

### 类型定义

```typescript
interface FileMetadata {
  name: string
  type: AssetType
  source: AssetSource
  scope: AssetScope
  tags: string[]
  description: string
}
```

## 错误处理

- 文件格式不支持：显示警告，禁止继续
- 文件大小超限：显示警告，禁止继续
- 上传失败：显示错误信息，允许重试
- 网络错误：自动重试机制（最多 3 次）

## 样式设计

- 步骤指示器使用圆点 + 连接线
- 当前步骤高亮
- 已完成步骤显示勾选
- 响应式布局适配移动端
