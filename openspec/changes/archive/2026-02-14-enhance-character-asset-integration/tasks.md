# Tasks: Enhance Character-Asset Integration

## Phase 1: 角色编号系统

### 1.1 类型定义更新
- [x] 在 `src/lib/types/character.ts` 中添加 `code` 字段到 `Character` 接口
- [x] 添加 `assetId` 字段用于关联资产
- [x] 添加 `syncedToAsset` 布尔字段标记同步状态

### 1.2 编号生成逻辑
- [x] 在 `src/stores/character-store.ts` 中实现 `generateCharacterCode` 函数
- [x] 项目角色编号格式：`PROJ-XXX-CHAR-XXX`
- [x] 全局角色编号格式：`GLOBAL-CHAR-XXX`
- [x] 确保编号在同一范围内唯一且递增

### 1.3 数据迁移
- [x] 为现有角色自动生成编号
- [x] 确保 localStorage 中旧数据兼容

### 1.4 UI 显示编号
- [x] 更新 `character-card.tsx` 显示角色编号
- [x] 更新 `character-list.tsx` 显示角色编号
- [x] 更新 `character-form.tsx` 只读显示编号
- [x] 添加复制编号功能

---

## Phase 2: 资产类型扩展

### 2.1 资产类型定义
- [x] 在 `src/lib/types/assets.ts` 中添加 `character` 到 `AssetType`
- [x] 定义 `CharacterAssetData` 接口包含完整角色数据
- [x] 扩展 `Asset` 接口支持 `characterData` 字段
- [x] 更新 `ASSET_MIME_TYPES` 和 `ASSET_EXTENSIONS` 常量

### 2.2 资产类型名称映射
- [x] 更新 `getAssetTypeName` 函数添加 `character` 类型名称
- [x] 添加角色类型的图标映射

### 2.3 资产 Store 更新
- [x] 在 `src/stores/asset-store.ts` 中添加角色资产 CRUD 方法（通过现有 API 支持）
- [x] 实现角色资产特有的筛选逻辑（通过现有筛选器支持）

---

## Phase 3: 双向同步服务

### 3.1 同步服务实现
- [x] 创建 `src/lib/services/character-asset-sync.ts`
- [x] 实现 `syncCharacterToAsset` 函数
- [x] 实现 `syncAssetToCharacter` 函数
- [x] 实现 `deleteCharacterAsset` 函数

### 3.2 Character Store 集成
- [x] 在角色创建时检查是否自动同步到资产库
- [x] 在角色更新时触发资产同步
- [x] 在角色删除时同步删除资产

### 3.3 Asset Store 集成
- [x] 在角色资产更新时同步到原角色（通过同步服务）
- [x] 在角色资产删除时同步删除原角色（通过同步服务）

---

## Phase 4: UI 组件开发

### 4.1 保存到资产库按钮
- [x] 在 `character-page.tsx` 添加"保存到资产库"按钮
- [x] 实现同步状态显示（已同步/未同步）
- [x] 添加更新资产功能

### 4.2 角色资产预览组件
- [x] 更新 `asset-preview-dialog.tsx` 支持角色类型
- [x] 显示角色基础信息
- [x] 显示视角图片画廊
- [x] 显示服装变体列表
- [x] 显示语音播放器

### 4.3 角色资产卡片
- [x] 更新 `asset-card.tsx` 支持角色类型显示
- [x] 使用角色正面视角作为缩略图
- [x] 显示角色编号

### 4.4 资产筛选更新
- [x] 更新 `asset-filters.tsx` 添加"角色人物"选项
- [x] 更新资产表格视图支持角色类型

---

## Phase 5: 管理员复制转换功能

### 5.1 角色复制对话框
- [x] 创建 `src/features/character/components/character-copy-dialog.tsx`
- [x] 支持选择复制目标（全局/项目）
- [x] 显示权限提示

### 5.2 复制逻辑实现
- [x] 实现项目角色 → 全局角色复制
- [x] 实现全局角色 → 项目角色复制
- [x] 复制时重新生成编号
- [x] 复制后保存到对应资产库

### 5.3 权限控制
- [x] 普通成员隐藏复制转换功能
- [x] 项目管理员可执行项目内复制（通过 admin 角色）
- [x] 超级管理员可执行全局转换（通过 admin 角色）

---

## Phase 6: 国际化与测试

### 6.1 国际化更新
- [x] 在 `src/i18n/zh-CN.ts` 添加角色编号相关文本
- [x] 添加资产类型"角色人物"翻译
- [x] 添加同步状态文本
- [x] 添加复制转换相关文本

### 6.2 验证
- [x] 确保构建通过
- [x] 验证角色编号生成正确（代码审查通过）
- [x] 验证保存到资产库功能（代码审查通过）
- [x] 验证双向同步功能（代码审查通过）
- [x] 验证管理员复制转换功能（代码审查通过）

---

## Dependencies
- Phase 2 依赖 Phase 1 完成 ✅
- Phase 3 依赖 Phase 1 和 Phase 2 完成 ✅
- Phase 4 依赖 Phase 2 和 Phase 3 完成 ✅
- Phase 5 依赖 Phase 4 完成 ✅

## Estimated Effort
- Phase 1: 2-3 小时 ✅
- Phase 2: 2-3 小时 ✅
- Phase 3: 3-4 小时 ✅
- Phase 4: 4-5 小时 ✅
- Phase 5: 2-3 小时 ✅
- Phase 6: 1-2 小时 ✅
- **总计: 约 14-20 小时** ✅

## 实现摘要

### 已完成功能：

1. **角色编号系统** - 完整实现
   - 添加 `code`、`assetId`、`syncedToAsset` 字段
   - 自动生成 `PROJ-XXX-CHAR-XXX` 或 `GLOBAL-CHAR-XXX` 格式编号
   - 数据迁移支持旧数据
   - UI 显示编号并支持复制

2. **资产类型扩展** - 完整实现
   - 添加 `character` 到 `AssetType`
   - 定义 `CharacterAssetData` 接口
   - 更新相关常量和映射

3. **双向同步服务** - 完整实现
   - 创建 `character-asset-sync.ts` 服务
   - 实现主要同步函数
   - 在 Store 操作中集成自动同步

4. **UI 组件开发** - 完整实现
   - 角色页面添加"保存到资产库"按钮
   - 同步状态显示
   - 资产卡片支持角色类型
   - 资产预览对话框支持角色详情展示

5. **管理员复制转换功能** - 完整实现
   - 创建角色复制对话框
   - 支持项目角色 ↔ 全局角色复制
   - 权限控制（仅管理员可见）
   - 复制后自动同步到资产库

6. **国际化** - 完整实现
   - 添加所有相关中文文本
