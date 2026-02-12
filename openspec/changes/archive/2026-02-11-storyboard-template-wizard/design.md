# 分镜头清单模版导出导入 - 设计文档

## 设计目标

创建直观易用的向导式模版导出导入功能，提升用户的工作效率和协作体验。

## 用户场景

### 场景1: 导演准备拍摄计划

**用户**: 导演需要为摄影团队准备拍摄计划表

**流程**:
1. 访问分镜头清单页面
2. 点击"导出模版"按钮
3. 选择"空白模版"
4. 选择 Word 格式（便于打印）
5. 选择全部列
6. 输入文件名"拍摄计划_第1集"
7. 导出并分发给团队

### 场景2: 复用成功项目的分镜头结构

**用户**: 制作人想复用之前成功剧集的分镜头结构

**流程**:
1. 在原项目页面访问分镜头清单
2. 点击"导出模版"
3. 选择"数据模版"（包含当前项目数据）
4. 选择 JSON 格式（保留完整结构）
5. 导出为模版文件

### 场景3: 导入团队填写的分镜头表

**用户**: 编剧团队在线下填写了分镜头表格，需要导入系统

**流程**:
1. 访问分镜头清单页面
2. 点击"导入模版"
3. 上传填写好的 CSV 文件
4. 预览解析的数据（10行预览）
5. 选择目标项目
6. 选择"追加模式"（保留现有分镜头）
7. 确认导入

## UI 设计

### 导出向导对话框

```
┌─────────────────────────────────────────────────────────┐
│ 导出分镜头模版                              [X]         │
├─────────────────────────────────────────────────────────┤
│ 步骤 1/5: 选择模版类型                                  │
│ ●○○○○                                                  │
│                                                          │
│ ◉ 空白模版    ○ 数据模版                               │
│                                                          │
│ 空白模版：包含标准空白结构的模版，适合线下填写           │
│ 数据模版：基于当前项目数据生成可复用模版                 │
│                                                          │
│           [上一步]    [下一步]    [取消]                │
└─────────────────────────────────────────────────────────┘
```

### 导出向导 - 步骤2: 选择格式

```
┌─────────────────────────────────────────────────────────┐
│ 导出分镜头模版                              [X]         │
├─────────────────────────────────────────────────────────┤
│ 步骤 2/5: 选择导出格式                                  │
│ ○●○○○                                                  │
│                                                          │
│ 请选择导出格式：                                        │
│                                                          │
│ ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│ │   CSV    │  │   JSON   │  │   Word   │             │
│ │ Excel兼容│  │ 完整数据 │  │ 可打印   │             │
│ └──────────┘  └──────────┘  └──────────┘             │
│                                                          │
│ 格式说明：                                               │
│ • CSV: 适合在 Excel 中编辑，兼容性最强                  │
│ • JSON: 保留完整数据结构，适合系统间传输                │
│ • Word: 专业排版，适合打印和分享                        │
│                                                          │
│           [上一步]    [下一步]    [取消]                │
└─────────────────────────────────────────────────────────┘
```

### 导出向导 - 步骤3: 选择列

```
┌─────────────────────────────────────────────────────────┐
│ 导出分镜头模版                              [X]         │
├─────────────────────────────────────────────────────────┤
│ 步骤 3/5: 选择包含的列                                  │
│ ○○●○○                                                  │
│                                                          │
│ 请选择要包含在模版中的列：                              │
│                                                          │
│ ☑ 镜头编号    ☑ 场次      ☑ 景别                        │
│ ☑ 运镜方式    ☑ 时长      ☑ 画面描述                    │
│ ☑ 对白/旁白   ☑ 音效说明   ☐ 配图缩略图                 │
│                                                          │
│ [全选]  [取消全选]  [推荐选择]                          │
│                                                          │
│ 已选择: 9 列                                            │
│                                                          │
│           [上一步]    [下一步]    [取消]                │
└─────────────────────────────────────────────────────────┘
```

### 导出向导 - 步骤4: 预览和设置

```
┌─────────────────────────────────────────────────────────┐
│ 导出分镜头模版                              [X]         │
├─────────────────────────────────────────────────────────┤
│ 步骤 4/5: 预览和设置                                    │
│ ○○○●○                                                  │
│                                                          │
│ 文件名: [分镜头模版_2026-02-11____________]  .csv ▼     │
│                                                          │
│ 预览（数据模版 - 前3行）：                              │
│ ┌─────────────────────────────────────────────────┐   │
│ │ 镜头编号 | 场次 | 景别 | ...                       │   │
│ │─────────|─────|──────|────                       │   │
│ │    1    │ 1-1 │ 全景 │ ...                       │   │
│ │    2    │ 1-2 │ 中景 │ ...                       │   │
│ └─────────────────────────────────────────────────┘   │
│                                                          │
│ 选项：                                                   │
│ ☑ 包含模版说明（第一行为列标题）                       │
│ ☐ 包含示例数据（数据模版）                             │
│ ☐ 包含配图URL（如适用）                                │
│                                                          │
│           [上一步]    [下一步]    [取消]                │
└─────────────────────────────────────────────────────────┘
```

### 导入向导对话框

```
┌─────────────────────────────────────────────────────────┐
│ 导入分镜头数据                              [X]         │
├─────────────────────────────────────────────────────────┤
│ 步骤 2/5: 预览数据                                      │
│ ○●○○○                                                  │
│                                                          │
│ 文件已解析成功！                                        │
│                                                          │
│ 文件信息：                                               │
│ • 源文件: 分镜头表_第1集.csv                            │
│ • 数据行数: 25 行                                       │
│ • 检测到的列: 8 列                                      │
│ • 文件编码: UTF-8                                       │
│                                                          │
│ 数据预览（前10行）：                                    │
│ ┌─────────────────────────────────────────────────┐   │
│ │ 镜头编号 | 场次 | 景别 | 运镜 | 时长 | 描述 | ... │   │
│ │─────────|─────|──────|──────|──────|──────|──────│   │
│ │    1    │ 1-1 │ 全景 │ 固定 │  5   │ ...  │ ... │   │
│ │    2    │ 1-2 │ 中景 │ 摇   │  3   │ ...  │ ... │   │
│ │ ... 更多数据                                        │   │
│ └─────────────────────────────────────────────────┘   │
│                                                          │
│ 字段映射状态：✓ 所有字段已正确映射                      │
│                                                          │
│           [上一步]    [下一步]    [取消]                │
└─────────────────────────────────────────────────────────┘
```

### 导入向导 - 选择模式

```
┌─────────────────────────────────────────────────────────┐
│ 导入分镜头数据                              [X]         │
├─────────────────────────────────────────────────────────┤
│ 步骤 4/5: 选择导入模式                                  │
│ ○○○●○                                                  │
│                                                          │
│ 请选择数据导入方式：                                    │
│                                                          │
│ ┌─────────────────────────────────────────────────┐   │
│ │ ○ 覆盖模式                                       │   │
│ │   清空目标项目的现有分镜头后导入数据              │   │
│ │   ⚠️ 警告：此操作不可撤销                          │   │
│ ├─────────────────────────────────────────────────┤   │
│ │ ◉ 追加模式（推荐）                               │   │
│ │   将导入的数据追加到现有分镜头后，自动重新编号    │   │
│ │   ✓ 保留现有数据                                  │   │
│ ├─────────────────────────────────────────────────┤   │
│ │ ○ 选择性合并                                     │   │
│ │   手动选择要导入的列，灵活控制数据合并            │   │
│ └─────────────────────────────────────────────────┘   │
│                                                          │
│ 目标项目: React测试项目                                 │
│ 现有分镜头: 0 个                                        │
│ 导入数据: 25 个                                         │
│                                                          │
│ 导入后将总计: 25 个分镜头                               │
│                                                          │
│           [上一步]    [下一步]    [取消]                │
└─────────────────────────────────────────────────────────┘
```

## 技术实现

### 导出逻辑

```typescript
// CSV 空白模版
function exportBlankTemplate(columns: string[], filename: string) {
  const headers = columns.join(',')
  const sampleRow = columns.map(() => '').join(',')
  const csv = `${headers}\n${sampleRow}`
  downloadCSV(csv, filename)
}

// CSV 数据模版
function exportDataTemplate(shots: StoryboardShot[], columns: string[], filename: string) {
  const headers = columns.join(',')
  const rows = shots.map(shot =>
    columns.map(col => getShotValue(shot, col)).join(',')
  )
  const csv = [headers, ...rows].join('\n')
  downloadCSV(csv, filename)
}

// JSON 模版
function exportJSONTemplate(shots: StoryboardShot[], templateName: string) {
  const template = {
    type: 'storyboard-template',
    version: '1.0',
    templateName,
    exportDate: new Date().toISOString(),
    shots: shots.map(shot => omit(shot, ['id', 'projectId', 'createdAt', 'updatedAt']))
  }
  downloadJSON(template, filename)
}
```

### 导入逻辑

```typescript
// CSV 解析
async function parseCSV(file: File): Promise<ParsedShot[]> {
  const text = await file.text()
  const lines = text.split('\n').filter(line => line.trim())
  const headers = parseHeaders(lines[0])
  const data = lines.slice(1).map(line => parseCSVRow(line, headers))
  return data
}

// 字段映射验证
function validateFieldMapping(headers: string[]): FieldMapping {
  const requiredFields = ['镜头编号', '场次', '景别']
  const detectedFields = headers.map(h => mapToSchema(h))
  return {
    matched: detectedFields.filter(f => f),
    missing: requiredFields.filter(f => !detectedFields.includes(f))
  }
}

// 数据合并
async function mergeData(
  targetProjectId: string,
  importedShots: StoryboardShot[],
  mode: 'overwrite' | 'append' | 'selective'
) {
  switch (mode) {
    case 'overwrite':
      await clearProjectShots(targetProjectId)
      await importShots(targetProjectId, importedShots)
      break
    case 'append':
      const existingCount = getShotCount(targetProjectId)
      const renumberedShots = importedShots.map((shot, i) => ({
        ...shot,
        shotNumber: existingCount + i + 1
      }))
      await importShots(targetProjectId, renumberedShots)
      break
    case 'selective':
      await selectiveImport(targetProjectId, importedShots, selectedFields)
      break
  }
}
```

### 组件结构

```
template-export-dialog.tsx
├── TemplateExportDialog (主容器)
├── Step1_TypeSelection (模版类型选择)
├── Step2_FormatSelection (格式选择)
├── Step3_ColumnSelection (列选择)
├── Step4_PreviewSettings (预览设置)
└── Step5_ConfirmExport (确认导出)

template-import-dialog.tsx
├── TemplateImportDialog (主容器)
├── Step1_FileUpload (文件上传)
├── Step2_DataPreview (数据预览)
├── Step3_ProjectSelection (项目选择)
├── Step4_ModeSelection (模式选择)
└── Step5_ConfirmImport (确认导入)
```

## 错误处理

### 导出错误

| 错误类型 | 处理方式 |
|---------|---------|
| 数据为空 | 提示"没有可导出的数据" |
| 文件生成失败 | 显示具体错误信息，提供重试按钮 |
| 浏览器不支持下载 | 提示使用现代浏览器 |

### 导入错误

| 错误类型 | 处理方式 |
|---------|---------|
| 文件格式不正确 | 显示支持的格式列表，提示重新选择 |
| 编码解析失败 | 尝试多种编码，提供编码选择 |
| 字段映射失败 | 显示字段映射配置界面 |
| 数据验证失败 | 高亮错误行，显示具体错误信息 |
| 导入中断 | 提供回滚功能，恢复导入前状态 |

## 国际化

```typescript
// zh-CN.ts
templateWizard: {
  export: {
    title: '导出分镜头模版',
    blank: '空白模版',
    data: '数据模版',
    format: '导出格式',
    csv: 'CSV',
    json: 'JSON',
    word: 'Word',
    columns: '包含的列',
    preview: '预览',
    filename: '文件名',
    includeDescription: '包含模版说明',
    includeSampleData: '包含示例数据',
  },
  import: {
    title: '导入分镜头数据',
    selectFile: '选择文件',
    dragDrop: '拖拽文件到此处',
    dataPreview: '数据预览',
    fieldMapping: '字段映射',
    targetProject: '目标项目',
    mode: '导入模式',
    overwrite: '覆盖模式',
    append: '追加模式',
    selective: '选择性合并',
    summary: '导入摘要',
  }
}
```

## 性能优化

- 大文件导入使用流式解析
- 预览只显示前 N 行数据
- 导入进度使用进度条实时反馈
- 导入过程使用 Web Worker 避免阻塞 UI
