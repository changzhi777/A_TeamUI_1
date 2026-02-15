# Design: Enhance Character Design with Six-Dimensional Template

## Architecture Overview

本变更涉及以下模块的修改和新增：

```
src/
├── features/
│   └── character/
│       ├── components/
│       │   ├── character-card.tsx        # 增加项目名称显示
│       │   ├── character-gallery.tsx     # 增加上传功能
│       │   ├── custom-field-manager.tsx  # 新增：自定义字段管理
│       │   ├── prompt-optimizer.tsx      # 新增：提示词优化
│       │   └── attribute-display.tsx     # 新增：属性中文显示
│       └── pages/
│           └── character-page.tsx        # 整合所有功能
├── lib/
│   ├── types/
│   │   └── character.ts                  # 扩展类型定义
│   └── services/
│       └── character-asset-sync.ts       # 增加上传者信息
└── stores/
    └── character-store.ts                # 新增方法支持
```

## Component Design

### 1. Character Card Enhancement

**变更文件**: `character-card.tsx`

```tsx
interface CharacterCardProps {
  character: Character
  projectName?: string  // 新增：项目名称
  onClick?: () => void
  onEdit?: () => void
}
```

在卡片信息区域添加项目名称显示，使用 Badge 或文字标签形式。

### 2. Attribute Labels (Chinese)

**新增常量**: `src/lib/types/character.ts`

```typescript
export const ATTRIBUTE_LABELS_ZH: Record<string, string> = {
  age: '年龄',
  gender: '性别',
  height: '身高',
  occupation: '职业',
  hairColor: '发色',
  eyeColor: '瞳色',
  bodyType: '体型',
  // 支持扩展
}
```

### 3. File Export Structure

**新增服务**: `src/lib/services/character-export.ts`

导出结构：
```
CHARACTER-CODE/
├── info.json           # 角色基础信息和属性
├── prompt.json         # 基础提示词和优化建议
├── views/
│   ├── front.png
│   ├── side.png
│   ├── back.png
│   └── three-quarter.png
├── costumes/
│   ├── costume-1.png
│   └── costume-2.png
└── voice/
    └── sample.wav
```

### 4. Multi-View Image Upload

**变更文件**: `character-gallery.tsx`

为每个视角卡片添加上传按钮，使用 `<input type="file">` 实现本地图片选择。

```tsx
interface ViewCardProps {
  viewType: ViewType
  image?: CharacterImage
  onGenerate: () => void
  onUpload: (file: File) => void  // 新增
  onDelete: () => void
}
```

### 5. Custom Field Manager

**新增组件**: `custom-field-manager.tsx`

支持添加、编辑、删除自定义字段，字段存储在 `Character.attributes` 的扩展字段中。

```tsx
interface CustomField {
  key: string
  label: string
  value: string
  type: 'text' | 'number' | 'select'
}
```

### 6. Prompt Optimizer

**新增组件**: `prompt-optimizer.tsx`

基于六维角色模板：
1. 外貌特征 (Appearance)
2. 性格特点 (Personality)
3. 背景故事 (Background)
4. 行为习惯 (Behavior)
5. 语言风格 (Speech Style)
6. 人际关系 (Relationships)

```tsx
interface SixDimensionTemplate {
  appearance: string
  personality: string
  background: string
  behavior: string
  speechStyle: string
  relationships: string
}

function generateOptimizedPrompt(template: SixDimensionTemplate): string
```

### 7. Asset Sync - Uploader Info

**变更文件**: `character-asset-sync.ts`

在同步资产时记录当前用户信息：

```typescript
interface SyncCharacterToAssetOptions {
  character: Character
  uploader?: {
    id: string
    name: string
  }
}
```

## Data Flow

### 文件夹导出流程
1. 用户点击"导出角色"
2. 选择"文件夹格式"
3. 系统创建目录结构
4. 下载所有图片资源（Blob -> File）
5. 生成 JSON 文件
6. 打包为 ZIP 下载

### 提示词优化流程
1. 用户填写六维模板表单
2. 点击"生成提示词"
3. 调用 AI API 优化整合
4. 返回完整角色描述
5. 用户可编辑确认
6. 保存到角色 basePrompt

## Technical Considerations

### ZIP 打包
使用 `JSZip` 库实现文件夹打包：
```typescript
import JSZip from 'jszip'

async function exportCharacterAsZip(character: Character): Promise<void>
```

### 图片下载
由于图片 URL 可能是远程链接，需要先 fetch 获取 Blob：
```typescript
async function downloadImageAsBlob(url: string): Promise<Blob>
```

### 自定义字段存储
利用 `CharacterAttributes` 的索引签名特性：
```typescript
interface CharacterAttributes {
  // 预定义字段
  age?: string
  // ...
  // 支持扩展
  [key: string]: string | undefined
}
```

## Migration Notes

1. 现有角色数据兼容，新增字段使用默认值
2. 自定义字段存储在 attributes 的扩展字段中
3. 导出格式向后兼容，旧版 JSON 导出仍可用

## Testing Strategy

1. 单元测试：属性中文化、提示词生成
2. 集成测试：文件夹导出、资产同步
3. E2E 测试：完整创建-编辑-导出流程
