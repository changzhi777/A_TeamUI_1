# file-storage Specification

## Purpose
TBD - created by archiving change implement-file-storage-service. Update Purpose after archive.
## Requirements
### Requirement: 文件存储服务
系统 SHALL 提供统一的文件存储服务，用于管理 AI 生成的图片、语音等文件。

#### Scenario: AI 生成图片自动存储
- **GIVEN** 用户通过 AI 生成角色图片
- **WHEN** 生成成功返回图片 URL
- **THEN** 系统 MUST 自动将图片下载到后端服务器
- **AND** 系统 MUST 在 IndexedDB 中缓存文件副本
- **AND** 系统 MUST 记录文件元数据到数据库

#### Scenario: 获取存储的文件
- **GIVEN** 文件已存储到服务中
- **WHEN** 用户或系统需要访问文件
- **THEN** 系统 MUST 优先返回 IndexedDB 缓存
- **AND** 如果缓存不存在，MUST 从后端服务器获取
- **AND** 获取后 MUST 更新缓存

#### Scenario: 清理文件缓存
- **GIVEN** 系统存在过期的文件缓存
- **WHEN** 触发缓存清理
- **THEN** 系统 MUST 删除指定时间之前的缓存
- **AND** 系统 MUST 保留后端服务器上的文件
- **AND** 系统 MUST 保留文件元数据记录

---

### Requirement: 文件记录管理
系统 SHALL 维护完整的文件记录，包括元数据和关联关系。

#### Scenario: 创建文件记录
- **GIVEN** 新文件需要存储
- **WHEN** 执行文件存储操作
- **THEN** 系统 MUST 生成唯一文件 ID
- **AND** 系统 MUST 记录原始 URL 和本地 URL
- **AND** 系统 MUST 记录文件类型、大小、MD5 哈希
- **AND** 系统 MUST 记录关联的实体（角色/资产）

#### Scenario: 文件状态追踪
- **GIVEN** 文件存储任务执行中
- **WHEN** 查询文件状态
- **THEN** 系统 MUST 返回当前状态（pending/downloading/completed/failed）
- **AND** 系统 MUST 记录失败原因（如有）
- **AND** 系统 MUST 支持重试失败的下载

#### Scenario: 删除文件记录
- **GIVEN** 文件不再需要
- **WHEN** 执行删除操作
- **THEN** 系统 MUST 删除前端缓存
- **AND** 系统 MUST 请求后端删除文件
- **AND** 系统 MUST 删除数据库记录

---

### Requirement: 批量预下载功能
系统 SHALL 支持批量预下载文件，优化导出和离线体验。

#### Scenario: 角色导出前预下载
- **GIVEN** 用户准备导出角色
- **WHEN** 角色有未缓存的远程图片
- **THEN** 系统 MUST 显示预下载进度
- **AND** 系统 MUST 批量下载所有缺失文件
- **AND** 下载完成后 MUST 启用导出按钮

#### Scenario: 后台静默预下载
- **GIVEN** 系统空闲
- **WHEN** 检测到有未缓存的常用文件
- **THEN** 系统 MAY 在后台静默预下载
- **AND** 系统 MUST 不影响用户正常操作
- **AND** 系统 MUST 限制并发下载数量

---

### Requirement: 离线访问支持
系统 SHALL 支持在离线状态下访问已缓存的文件。

#### Scenario: 离线查看角色
- **GIVEN** 角色图片已缓存
- **WHEN** 用户在离线状态访问角色
- **THEN** 系统 MUST 从 IndexedDB 读取图片
- **AND** 系统 MUST 正常显示图片
- **AND** 系统 MUST 显示离线标识

#### Scenario: 离线导出
- **GIVEN** 所有文件已缓存
- **WHEN** 用户在离线状态导出角色
- **THEN** 系统 MUST 使用缓存文件打包
- **AND** 导出 MUST 正常完成
- **AND** 系统 MUST 显示离线导出提示

