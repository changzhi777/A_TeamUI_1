# Change: 分镜头新增季数、集数及自定义字段

## Why

当前分镜头系统仅支持基础的场次层级，无法满足现代短剧制作中常见的"季-集-场-镜头"四级结构需求。同时，不同制作团队往往需要记录特定的业务信息（如拍摄地点、道具清单、特效要求等），固定字段无法满足这些个性化需求。

## What Changes

### 新增固定字段
- **季数（seasonNumber）**：可选字段，数字类型，用于标识分镜头所属季度
- **集数（episodeNumber）**：可选字段，数字类型，用于标识分镜头所属剧集

### 新增自定义字段系统
- **全局自定义字段**：管理员可定义适用于所有项目的默认自定义字段
- **项目级自定义字段**：每个项目可独立配置自定义字段，覆盖或扩展全局配置
- **支持字段类型**：
  - 文本（单行）
  - 多行文本
  - 数字
  - 下拉选择（单选/多选）
  - 日期
  - 复选框（是/否）

### 影响的功能模块
- 分镜头数据模型（StoryboardShot）
- 分镜头表单（创建/编辑）
- 分镜头列表表格（列展示、筛选、排序）
- 分镜头导入/导出功能
- 分镜头模拟数据生成

## Impact

- **Affected specs**: `storyboard`
- **Affected code**:
  - `src/stores/storyboard-store.ts` - 数据模型和状态管理
  - `src/features/storyboard/components/shot-list-table.tsx` - 表格列定义
  - `src/features/storyboard/components/shot-form-dialog.tsx` - 表单字段
  - `src/lib/api/storyboard.ts` - API 接口
  - `src/lib/seed-storyboard-data.ts` - 模拟数据生成
  - 导入/导出相关组件

## Considerations

### 数据迁移
- 现有分镜头数据需要兼容，季数和集数字段默认为空
- 自定义字段采用增量存储，不影响现有数据结构

### UI/UX
- 新字段在表格中默认隐藏，用户可通过列配置显示
- 表单中新字段分组显示，避免表单过长
- 自定义字段配置入口放在项目设置或独立的"字段管理"页面

### 权限控制
- 全局字段配置仅管理员可修改
- 项目级字段配置项目管理员可修改
