# asset-management Specification

## Purpose
TBD - created by archiving change add-asset-management. Update Purpose after archive.
## Requirements
### Requirement: 资产类型定义
系统 SHALL 支持以下资产类型：
- **图片素材**：JPG、PNG、WEBP、GIF、SVG
- **音频素材**：MP3、WAV、AAC、OGG
- **视频素材**：MP4、WEBM、MOV
- **剧本文件**：TXT、MD、PDF
- **AI 生成内容**：AI 生成的图像、视频或文本

#### Scenario: 上传图片素材
- **WHEN** 用户上传图片文件
- **THEN** 系统 MUST 验证文件类型是否为支持的图片格式
- **AND** 系统 MUST 生成缩略图（除 SVG 外）
- **AND** 系统 MUST 提取图片尺寸信息

#### Scenario: 上传音频素材
- **WHEN** 用户上传音频文件
- **THEN** 系统 MUST 验证文件类型是否为支持的音频格式
- **AND** 系统 SHOULD 提取音频时长信息
- **AND** 系统 MAY 生成音频波形图（后续版本）

#### Scenario: 上传视频素材
- **WHEN** 用户上传视频文件
- **THEN** 系统 MUST 验证文件类型是否为支持的视频格式
- **AND** 系统 MUST 生成视频封面作为缩略图
- **AND** 系统 SHOULD 提取视频时长和分辨率信息

---

### Requirement: 资产来源管理
系统 SHALL 支持多种资产来源，并在资产元数据中记录来源信息。

#### Scenario: 本地上传资产
- **WHEN** 用户通过本地上传功能添加资产
- **THEN** 系统 MUST 将 source 字段设置为 'upload'
- **AND** 系统 MUST 存储文件到对象存储服务
- **AND** 系统 MUST 记录上传者信息

#### Scenario: 外部链接资产
- **WHEN** 用户添加外部链接作为资产
- **THEN** 系统 MUST 将 source 字段设置为 'link'
- **AND** 系统 MUST 存储原始 URL 到 externalUrl 字段
- **AND** 系统 MAY 尝试获取链接内容的基本元数据

#### Scenario: AI 生成资产
- **WHEN** 用户通过 AI 功能生成内容并保存为资产
- **THEN** 系统 MUST 将 source 字段设置为 'ai'
- **AND** 系统 MUST 记录使用的 AI 模型（aiModel）
- **AND** 系统 MUST 记录生成提示词（aiPrompt）
- **AND** 系统 MUST 将 aiGenerated 标志设置为 true

---

### Requirement: 资产权限管理
系统 SHALL 基于用户角色和资产归属控制访问权限。

#### Scenario: 管理员访问所有资产
- **WHEN** 管理员用户访问资产管理页面
- **THEN** 系统 MUST 显示所有用户上传的资产
- **AND** 管理员 MUST 能够删除任何资产
- **AND** 管理员 MUST 能够编辑任何资产的元数据

#### Scenario: 普通成员管理自己的资产
- **WHEN** 普通成员访问资产管理页面
- **THEN** 系统 MUST 仅显示自己上传的资产和项目共享资产
- **AND** 成员 MUST 能够删除自己上传的资产
- **AND** 成员 MUST 能够编辑自己上传的资产

#### Scenario: 项目成员访问项目资产
- **WHEN** 用户访问项目资产页面
- **THEN** 系统 MUST 显示属于该项目的所有资产
- **AND** 项目成员 MUST 能够查看和使用这些资产
- **AND** 仅项目管理员 MUST 能够删除项目资产

---

### Requirement: 资产上传功能
系统 SHALL 提供资产上传功能，支持单文件和多文件上传。

#### Scenario: 单文件上传
- **WHEN** 用户点击上传按钮并选择单个文件
- **THEN** 系统 MUST 显示上传进度条
- **AND** 上传完成后 MUST 显示成功提示
- **AND** 新上传的资产 MUST 出现在资产列表中

#### Scenario: 批量文件上传
- **WHEN** 用户选择多个文件进行上传
- **THEN** 系统 MUST 依次处理每个文件
- **AND** 系统 MUST 显示整体进度和单个文件进度
- **AND** 如果某个文件上传失败，MUST 显示错误但不影响其他文件
- **AND** 全部完成后 MUST 显示汇总结果

#### Scenario: 大文件上传
- **WHEN** 用户上传大于 100MB 的文件
- **THEN** 系统 MUST 使用分片上传
- **AND** 系统 MUST 支持断点续传
- **AND** 系统 MUST 显示上传百分比和预计剩余时间

---

### Requirement: 资产浏览与筛选
系统 SHALL 提供多种浏览和筛选方式，帮助用户快速找到所需资产。

#### Scenario: 按类型筛选
- **WHEN** 用户在筛选面板中选择资产类型（如"图片"）
- **THEN** 资产列表 MUST 仅显示该类型的资产
- **AND** 筛选状态 MUST 反映在 URL 参数中
- **AND** 用户可以通过 URL 分享筛选结果

#### Scenario: 按标签筛选
- **WHEN** 用户点击某个标签
- **THEN** 资产列表 MUST 仅显示包含该标签的资产
- **AND** 系统 MUST 支持多标签组合筛选（AND 逻辑）

#### Scenario: 搜索资产
- **WHEN** 用户在搜索框中输入关键词
- **THEN** 系统 MUST 实时过滤匹配的资产名称和描述
- **AND** 搜索 MUST 不区分大小写
- **AND** 系统 MUST 提供清空搜索按钮

#### Scenario: 切换视图模式
- **WHEN** 用户在网格视图、卡片视图和表格视图之间切换
- **THEN** 系统 MUST 记住用户的视图偏好
- **AND** 下次访问时 MUST 恢复上次选择的视图模式
- **AND** 系统支持三种视图模式：'grid'（网格）、'card'（卡片）、'table'（表格）

---

### Requirement: 资产预览功能
系统 SHALL 提供资产预览功能，让用户无需下载即可查看资产内容。

#### Scenario: 预览图片资产
- **WHEN** 用户点击图片资产的预览按钮
- **THEN** 系统 MUST 在对话框中显示完整图片
- **AND** 系统 MUST 支持缩放操作（放大/缩小/适应屏幕）
- **AND** 系统 MUST 显示图片元数据（尺寸、大小、上传时间）

#### Scenario: 预览视频资产
- **WHEN** 用户点击视频资产的预览按钮
- **THEN** 系统 MUST 在对话框中显示视频播放器
- **AND** 播放器 MUST 支持播放/暂停、进度条、音量控制
- **AND** 系统 MUST 显示视频元数据（时长、分辨率、大小）

#### Scenario: 预览音频资产
- **WHEN** 用户点击音频资产的预览按钮
- **THEN** 系统 MUST 在对话框中显示音频播放器
- **AND** 播放器 MUST 支持播放/暂停、进度条、音量控制
- **AND** 系统 MUST 显示音频元数据（时长、大小、格式）

---

### Requirement: 资产元数据编辑
系统 SHALL 允许用户编辑资产的名称、描述和标签。

#### Scenario: 编辑资产名称和描述
- **WHEN** 用户点击资产的编辑按钮
- **THEN** 系统 MUST 显示编辑表单
- **AND** 表单 MUST 包含名称和描述字段
- **AND** 保存后资产信息 MUST 更新

#### Scenario: 添加标签
- **WHEN** 用户为资产添加标签
- **THEN** 系统 MUST 支持输入新标签或选择已有标签
- **AND** 标签 MUST 在所有用户间共享（全局标签库）
- **AND** 系统 MUST 显示标签使用频率（热门标签优先）

#### Scenario: 删除标签
- **WHEN** 用户从资产中移除某个标签
- **THEN** 该标签 MUST 立即从资产中移除
- **AND** 如果标签不再被任何资产使用，MAY 从全局标签库中移除

---

### Requirement: 资产删除功能
系统 SHALL 提供资产删除功能，并支持软删除和硬删除。

#### Scenario: 删除未使用的资产
- **WHEN** 用户删除未被任何项目使用的资产
- **THEN** 系统 MUST 显示确认对话框
- **AND** 确认后资产 MUST 被永久删除
- **AND** 关联的文件 MUST 从存储中删除

#### Scenario: 删除已使用的资产
- **WHEN** 用户尝试删除被项目或分镜头引用的资产
- **THEN** 系统 MUST 显示警告，列出引用该资产的位置
- **AND** 系统 MUST 提供"强制删除"选项（需要额外确认）
- **AND** 删除后引用 MUST 被清理或标记为无效

#### Scenario: 批量删除资产
- **WHEN** 用户选择多个资产并点击批量删除
- **THEN** 系统 MUST 显示选中资产的数量
- **AND** 系统 MUST 检查是否有资产被引用
- **AND** 确认后所有选中资产 MUST 被删除

---

### Requirement: 全局资产库
系统 SHALL 提供全局资产库，供所有项目共享使用。

#### Scenario: 访问全局资产库
- **WHEN** 用户访问全局资产库页面
- **THEN** 系统 MUST 显示所有 scope 为 'global' 的资产
- **AND** 用户 MUST 能够查看和使用这些资产
- **AND** 用户 MUST 能够将资产复制到自己的项目中

#### Scenario: 上传到全局资产库
- **WHEN** 用户在上传时选择"全局资产"
- **THEN** 资产的 scope MUST 被设置为 'global'
- **AND** projectId MUST 为空
- **AND** 所有用户 MUST 能够看到该资产

---

### Requirement: 项目资产
系统 SHALL 支持项目专属资产，仅该项目成员可见和使用。

#### Scenario: 访问项目资产
- **WHEN** 用户访问项目资产页面
- **THEN** 系统 MUST 仅显示 scope 为 'project' 且 projectId 匹配的资产
- **AND** 仅项目成员 MUST 能够访问

#### Scenario: 上传到项目资产
- **WHEN** 用户在项目上下文中上传资产
- **THEN** 资产的 scope MUST 被设置为 'project'
- **AND** projectId MUST 被设置为当前项目 ID
- **AND** 仅项目成员 MUST 能够看到该资产

#### Scenario: 资产在项目间移动
- **WHEN** 管理员将资产从全局移动到项目
- **THEN** 资产的 scope MUST 变更为 'project'
- **AND** projectId MUST 被设置为目标项目
- **AND** 原有引用 MUST 保持有效

---

### Requirement: 资产选择器
系统 SHALL 提供资产选择器组件，用于在其他功能中选择资产。

#### Scenario: 在分镜头中选择图片
- **WHEN** 用户在分镜头表单中点击"从资产库选择"
- **THEN** 系统 MUST 显示资产选择器对话框
- **AND** 选择器 MUST 仅显示图片类型资产
- **AND** 用户选择后，资产 URL MUST 填充到表单中

#### Scenario: 多选资产
- **WHEN** 资产选择器支持多选模式
- **THEN** 用户 MUST 能够选择多个资产
- **AND** 系统 MUST 显示已选数量
- **AND** 确认后 MUST 返回所有选中资产的 ID

---

### Requirement: 资产导入/导出
系统 SHALL 支持资产元数据的导入和导出。

#### Scenario: 导出资产清单
- **WHEN** 用户点击导出资产清单
- **THEN** 系统 MUST 生成包含所有资产元数据的 CSV 文件
- **AND** 文件 MUST 包含名称、类型、URL、标签、创建时间等信息
- **AND** 浏览器 MUST 下载该文件

#### Scenario: 导入资产元数据
- **WHEN** 用户上传包含资产 URL 的 CSV 文件
- **THEN** 系统 MUST 解析文件并验证 URL
- **AND** 系统 MUST 将有效的 URL 创建为 link 类型的资产
- **AND** 系统 MUST 显示导入结果摘要

---

### Requirement: 资产统计与分析
系统 SHALL 提供资产使用统计和分析功能。

#### Scenario: 显示资产统计
- **WHEN** 用户访问资产管理页面
- **THEN** 系统 MUST 显示资产总数、总大小、各类型数量分布
- **AND** 系统 MUST 显示存储空间使用情况

#### Scenario: 显示资产使用情况
- **WHEN** 用户查看单个资产详情
- **THEN** 系统 MUST 显示该资产被引用的次数
- **AND** 系统 MUST 列出所有引用该资产的项目和分镜头

### Requirement: 模拟数据服务
系统 SHALL 提供模拟数据服务，支持前端功能演示和测试。

#### Scenario: 加载模拟数据
- **WHEN** 系统启动时无本地数据
- **THEN** 系统 MUST 生成默认的模拟资产数据
- **AND** 数据 MUST 包含各种类型和来源的资产

#### Scenario: 数据持久化
- **WHEN** 用户创建、更新或删除资产
- **THEN** 系统 MUST 将变更持久化到 localStorage
- **AND** 刷新页面后数据 MUST 保持

### Requirement: 资产 Store 类型完整性
系统 SHALL 提供完整的资产 Store 类型定义。

#### Scenario: selectedCount getter
- **GIVEN** 用户选择了多个资产
- **WHEN** 组件需要获取选中数量
- **THEN** 系统 MUST 提供 `selectedAssets.size` 作为选中计数

#### Scenario: 资产刷新
- **GIVEN** 资产列表需要刷新
- **WHEN** 调用刷新方法
- **THEN** 系统 MUST 通过 `refetch` 函数重新获取资产数据

### Requirement: 资产组件类型兼容
资产组件 SHALL 与 Store 类型保持兼容。

#### Scenario: 批量操作结果处理
- **GIVEN** 批量操作返回结果
- **WHEN** 处理操作结果
- **THEN** 组件 MUST 使用正确的 `AssetBatchResult` 类型属性（`success`/`failed`）

#### Scenario: 资产编辑参数
- **GIVEN** 用户编辑资产
- **WHEN** 调用更新方法
- **THEN** 参数 MUST 符合 `{ id: string; data: Partial<Asset> }` 格式

### Requirement: 模拟数据生成配置
系统 SHALL 提供可配置的模拟数据生成功能。

#### Scenario: 配置生成数量
- **GIVEN** 开发者需要生成模拟数据
- **WHEN** 调用数据生成函数
- **THEN** 系统 MUST 支持指定生成资产数量

#### Scenario: 配置类型分布
- **GIVEN** 需要测试特定类型资产
- **WHEN** 配置数据生成参数
- **THEN** 系统 MUST 支持指定各类型资产的比例

#### Scenario: 配置时间范围
- **GIVEN** 需要测试时间相关功能
- **WHEN** 生成模拟数据
- **THEN** 系统 MUST 在指定时间范围内随机分配创建时间

### Requirement: 真实模拟数据
模拟数据 SHALL 足够真实以支持功能测试。

#### Scenario: 图片资产数据
- **GIVEN** 生成图片资产
- **WHEN** 创建模拟图片数据
- **THEN** 系统 MUST 生成合理的文件名（中文名称）
- **AND** 系统 MUST 设置合理的尺寸和文件大小

#### Scenario: 音频资产数据
- **GIVEN** 生成音频资产
- **WHEN** 创建模拟音频数据
- **THEN** 系统 MUST 设置合理的时长（30秒-10分钟）
- **AND** 系统 MUST 设置合理的文件大小

#### Scenario: 标签分类
- **GIVEN** 资产需要分类管理
- **WHEN** 生成模拟资产
- **THEN** 系统 MUST 为每个资产分配 1-5 个相关标签
- **AND** 标签 MUST 符合短剧制作场景

### Requirement: 资产表格视图
系统 SHALL 提供表格视图，以数据表形式展示资产列表，便于快速浏览和批量操作。

#### Scenario: 查看表格视图
- **WHEN** 用户切换到表格视图模式
- **THEN** 系统 MUST 以表格形式显示资产列表
- **AND** 表格 MUST 包含以下列：缩略图、名称、类型、来源、文件大小、标签、上传者、创建时间、操作
- **AND** 用户 MUST 能够按名称、类型、大小、创建时间等列进行排序

#### Scenario: 表格列排序
- **WHEN** 用户点击表格列标题
- **THEN** 系统 MUST 按该列进行升序或降序排序
- **AND** 系统 MUST 显示当前排序方向指示器
- **AND** 再次点击 MUST 切换排序方向

#### Scenario: 表格列显示/隐藏
- **WHEN** 用户点击"显示列"按钮
- **THEN** 系统 MUST 显示所有可选列的下拉菜单
- **AND** 用户 MUST 能够勾选或取消勾选列来控制显示
- **AND** 必须显示的列（名称、操作）MUST 不能被隐藏

#### Scenario: 表格批量选择
- **WHEN** 用户在表格视图中勾选资产
- **THEN** 系统 MUST 高亮显示已选中的行
- **AND** 系统 MUST 显示已选资产数量
- **AND** 用户 MUST 能够使用表头复选框进行全选/取消全选
- **AND** 批量操作工具栏 MUST 显示在表格上方

#### Scenario: 表格行操作
- **WHEN** 用户点击表格行的操作按钮
- **THEN** 系统 MUST 显示操作菜单（预览、编辑、删除）
- **AND** 预览操作 MUST 打开资产预览对话框
- **AND** 编辑操作 MUST 打开资产编辑对话框
- **AND** 删除操作 MUST 显示确认对话框

#### Scenario: 表格视图与筛选兼容
- **WHEN** 用户在表格视图下应用筛选条件
- **THEN** 表格 MUST 仅显示符合条件的资产
- **AND** 筛选结果 MUST 与其他视图模式保持一致

### Requirement: 角色人物资产类型
系统 SHALL 支持角色人物作为资产类型。

#### Scenario: 定义角色资产类型
- **GIVEN** 系统定义资产类型
- **WHEN** 获取可用资产类型列表
- **THEN** 系统 MUST 包含 `character` 类型
- **AND** 角色类型 MUST 与 image、audio、video、script、aiGenerated 并列

#### Scenario: 角色资产数据结构
- **GIVEN** 创建角色类型资产
- **WHEN** 保存角色资产
- **THEN** 资产 MUST 包含 `characterData` 字段
- **AND** `characterData` MUST 包含角色编号、描述、个性、属性
- **AND** `characterData` MUST 包含视角图片引用（front、side、back、threeQuarter）
- **AND** `characterData` MUST 包含服装变体数组
- **AND** `characterData` MUST 包含语音配置
- **AND** 资产 MUST 包含 `characterId` 字段关联原角色

#### Scenario: 角色资产缩略图
- **GIVEN** 角色资产需要展示
- **WHEN** 生成角色资产缩略图
- **THEN** 系统 MUST 使用角色的正面视角图片作为缩略图
- **AND** 如果没有正面视角，MUST 使用其他可用视角
- **AND** 如果没有任何视角图片，MUST 使用默认角色图标

---

### Requirement: 角色资产浏览与筛选
系统 SHALL 在资产库中支持角色资产的浏览和筛选。

#### Scenario: 按角色类型筛选
- **GIVEN** 用户在资产库筛选面板
- **WHEN** 用户选择"角色人物"类型
- **THEN** 资产列表 MUST 仅显示类型为 `character` 的资产
- **AND** 筛选状态 MUST 反映在 URL 参数中

#### Scenario: 角色资产卡片视图
- **GIVEN** 用户在网格或卡片视图查看角色资产
- **WHEN** 资产类型为 `character`
- **THEN** 卡片 MUST 显示角色缩略图
- **AND** 卡片 MUST 显示角色名称和编号
- **AND** 卡片 MUST 显示角色标签
- **AND** 卡片 MUST 显示"角色"类型标识

#### Scenario: 角色资产表格视图
- **GIVEN** 用户在表格视图查看资产
- **WHEN** 资产类型为 `character`
- **THEN** 表格行 MUST 显示角色缩略图、名称、编号、标签、创建时间
- **AND** 表格 MUST 支持按角色名称和编号排序

---

### Requirement: 角色资产详情视图
系统 SHALL 提供专门的角色资产详情视图，展示完整角色信息。

#### Scenario: 查看角色资产详情
- **GIVEN** 用户点击角色资产
- **WHEN** 打开资产详情
- **THEN** 系统 MUST 显示角色详情视图
- **AND** 视图 MUST 包含角色基础信息区域（名称、编号、描述、个性）
- **AND** 视图 MUST 包含角色属性区域（年龄、性别、身高等）
- **AND** 视图 MUST 包含视角图片画廊
- **AND** 视图 MUST 包含服装变体列表
- **AND** 视图 MUST 包含语音播放器（如有）

#### Scenario: 角色视角图片浏览
- **GIVEN** 角色资产有多个视角图片
- **WHEN** 用户查看视角图片区域
- **THEN** 系统 MUST 以缩略图形式显示所有视角
- **AND** 用户 MUST 能够点击放大查看
- **AND** 系统 MUST 标注视角类型（正面、侧面、背面、3/4视角）

#### Scenario: 从角色资产跳转到角色设计
- **GIVEN** 用户查看角色资产详情
- **WHEN** 用户点击"编辑角色"按钮
- **THEN** 系统 MUST 跳转到对应的角色设计页面
- **AND** 用户 MUST 能够在角色设计页面修改角色

---

### Requirement: 角色资产元数据编辑
系统 SHALL 支持编辑角色资产的元数据，并同步到原角色。

#### Scenario: 编辑角色资产标签
- **GIVEN** 用户编辑角色资产
- **WHEN** 用户添加或删除标签
- **THEN** 系统 MUST 更新资产标签
- **AND** 系统 MUST 同步更新对应角色的标签

#### Scenario: 编辑角色资产名称
- **GIVEN** 用户编辑角色资产名称
- **WHEN** 保存修改
- **THEN** 系统 MUST 更新资产名称
- **AND** 系统 MUST 同步更新对应角色的名称
- **AND** 角色编号 MUST 保持不变

#### Scenario: 删除角色资产
- **GIVEN** 用户删除角色资产
- **WHEN** 确认删除
- **THEN** 系统 MUST 显示警告，提示关联的角色也将被删除
- **AND** 确认后资产和关联角色 MUST 同时删除

---

### Requirement: 角色资产统计
系统 SHALL 在资产统计中包含角色资产信息。

#### Scenario: 角色资产统计显示
- **GIVEN** 用户查看资产统计
- **WHEN** 资产库包含角色资产
- **THEN** 统计面板 MUST 显示角色资产数量
- **AND** 类型分布图表 MUST 包含"角色人物"分类
- **AND** 角色 MUST 作为独立分类显示

