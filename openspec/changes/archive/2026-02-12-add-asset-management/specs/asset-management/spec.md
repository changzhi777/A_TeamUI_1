# asset-management Specification

## Purpose
提供统一的数字资产管理功能，支持短剧创作过程中的各种素材管理，包括图片、音频、视频、剧本和 AI 生成内容。

## ADDED Requirements

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
- **WHEN** 用户在网格视图和列表视图之间切换
- **THEN** 系统 MUST 记住用户的视图偏好
- **AND** 下次访问时 MUST 恢复上次选择的视图模式

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
