# Tasks: Enhance Character Design with Six-Dimensional Template

## Phase 1: 基础增强 (8 tasks)

### 1.1 角色卡片项目名称显示
- [x] 修改 CharacterCard 接口，添加 projectName 属性
- [x] 在卡片信息区域显示项目名称（使用 Badge 或文字标签）
- [x] 处理全局角色（无项目）的显示情况

### 1.2 属性信息中文化
- [x] 在 character.ts 中添加 ATTRIBUTE_LABELS_ZH 常量
- [x] 创建 AttributeDisplay 组件用于中文显示属性
- [x] 更新角色表单使用中文属性标签
- [x] 更新角色详情页使用中文属性显示

## Phase 2: 文件夹导出 (6 tasks)

### 2.1 文件夹导出功能
- [x] 安装 JSZip 依赖（如未安装）
- [x] 创建 character-export.ts 服务文件
- [x] 实现创建文件夹结构函数
- [x] 实现图片下载并保存到对应目录
- [x] 实现 JSON 文件生成（info.json, prompt.json）
- [x] 在角色详情页添加"导出为文件夹"按钮

## Phase 3: 资产库上传者 (4 tasks)

### 3.1 资产库同步上传者
- [x] 修改 character-asset-sync.ts，添加上传者参数
- [x] 从 auth-store 获取当前用户信息
- [x] 同步时将上传者信息写入资产元数据
- [x] 在资产库卡片上显示上传者名称

## Phase 4: 多视角上传 (4 tasks)

### 4 预览设置页面改进

在多视角图片区域添加本地上传功能，允许用户直接上传本地图片作为角色视角。

## Tasks

### Phase 1: 角色卡片增强和属性中文化
- [x] 1.1 添加属性中文标签常量 `ATTRIBUTE_LABELS_ZH`
- [x] 1.2 修改 `CharacterCard` 组件添加项目名称显示
- [x] 1.3 修改 `CharacterForm` 组件使用中文属性标签
- [x] 1.4 更新角色详情页使用中文显示属性

### Phase 2: 文件夹导出功能
- [x] 2.1 安装 JSZip 依赖包
- [x] 2.2 创建 `character-export.ts` 服务
- [x] 2.3 实现图片下载为 Blob 函数
- [x] 2.4 实现文件夹结构生成函数
- [x] 2.5 实现 ZIP 打包和下载
- [x] 2.6 在角色详情页添加"文件夹导出"按钮

### Phase 3: 资产库上传者显示
- [x] 3.1 修改 `character-asset-sync.ts` 添加上传者信息
- [x] 3.2 修改 Asset 类型添加 `uploader` 字段（已存在）
- [x] 3.3 修改资产卡片组件显示上传者
- [x] 3.4 修改资产表格组件添加上传者列（已存在）

### Phase 4: 多视角图片上传功能
- [x] 4.1 修改 `CharacterGallery` 组件添加上传按钮
- [x] 4.2 实现本地图片上传处理函数
- [x] 4.3 更新角色视角 Store 方法支持上传图片
- [x] 4.4 添加上传图片的预览和删除功能

### Phase 5: 自定义卡片功能
- [x] 5.1 创建 `CustomFieldManager` 组件
- [x] 5.2 实现自定义字段的添加、编辑、删除
- [x] 5.3 创建 `CustomFieldRenderer` 组件显示自定义字段
- [x] 5.4 修改 `CharacterForm` 集成自定义字段管理（已有基本功能）
- [x] 5.5 确保自定义字段数据持久化

### Phase 6: 提示词优化功能
- [x] 6.1 定义六维角色模板类型
- [x] 6.2 创建 `PromptOptimizer` 组件
- [x] 6.3 实现六维表单界面
- [x] 6.4 实现提示词生成和优化逻辑
- [x] 6.5 集成 AI API 进行提示词优化
- [x] 6.6 添加优化后的提示词预览和编辑
- [x] 6.7 在角色创建/编辑流程中集成

### Phase 7: 测试和文档
- [x] 7.1 运行构建验证无错误
- [x] 7.2 手动测试所有新功能
- [x] 7.3 更新相关组件文档
- [x] 7.4 验证向后兼容性

## Acceptance Criteria

1. ✅ 角色卡片正确显示所属项目名称
2. ✅ 角色属性标签全部为中文
3. ✅ 文件夹导出生成正确的目录结构和文件
4. ✅ 资产库显示上传者信息
5. ✅ 多视角图片支持本地上传
6. ✅ 自定义字段可正常添加、编辑、删除和显示
7. ✅ 提示词优化功能可生成完整的角色描述
8. ✅ 所有现有功能正常工作，无回归问题
