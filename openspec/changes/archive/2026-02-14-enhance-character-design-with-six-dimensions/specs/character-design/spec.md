# character-design Specification Delta

## ADDED Requirements

### Requirement: 角色卡片项目名称显示
系统 SHALL 在角色卡片上显示角色所属的项目名称。

#### Scenario: 显示项目角色名称
- **GIVEN** 角色关联到项目
- **WHEN** 用户查看角色卡片
- **THEN** 系统 MUST 在卡片上显示项目名称
- **AND** 项目名称 MUST 显示为标签或文字形式
- **AND** 用户 MUST 能够识别角色所属项目

#### Scenario: 全局角色无项目名称
- **GIVEN** 角色为全局角色（无 projectId）
- **WHEN** 用户查看角色卡片
- **THEN** 系统 MUST NOT 显示项目名称
- **AND** 系统 MAY 显示"全局"标识

---

### Requirement: 角色属性中文化显示
系统 SHALL 使用中文标签显示角色属性信息。

#### Scenario: 显示中文属性标签
- **GIVEN** 用户查看角色属性
- **WHEN** 系统显示属性列表
- **THEN** 系统 MUST 使用中文标签
- **AND** 常用属性标签 MUST 为：年龄、性别、身高、职业、发色、瞳色、体型

#### Scenario: 属性表单中文显示
- **GIVEN** 用户编辑角色属性
- **WHEN** 显示属性表单
- **THEN** 表单标签 MUST 使用中文
- **AND** 占位符文本 SHOULD 使用中文

---

### Requirement: 角色文件夹导出
系统 SHALL 支持将角色数据按文件夹结构导出。

#### Scenario: 导出角色为文件夹
- **GIVEN** 用户查看角色详情
- **WHEN** 用户点击"导出为文件夹"按钮
- **THEN** 系统 MUST 创建以角色编号命名的根目录
- **AND** 系统 MUST 创建 views/ 子目录存放视角图片
- **AND** 系统 MUST 创建 costumes/ 子目录存放服装变体图片
- **AND** 系统 MUST 创建 voice/ 子目录存放语音文件
- **AND** 系统 MUST 生成 info.json 包含角色基础信息
- **AND** 系统 MUST 生成 prompt.json 包含提示词信息
- **AND** 系统 MUST 将所有文件打包为 ZIP 下载

#### Scenario: 导出文件命名规范
- **GIVEN** 用户导出角色文件夹
- **WHEN** 生成文件
- **THEN** 视角图片 MUST 按视角类型命名（front.png、side.png 等）
- **AND** 服装图片 MUST 按序号命名（costume-1.png、costume-2.png 等）
- **AND** 语音文件 MUST 命名为 sample.wav 或 sample.mp3

#### Scenario: 导出远程图片
- **GIVEN** 角色图片为远程 URL
- **WHEN** 导出文件夹
- **THEN** 系统 MUST 下载远程图片并转换为本地文件
- **AND** 系统 MUST 在下载失败时跳过该图片并记录警告

---

### Requirement: 多视角图片本地上传
系统 SHALL 支持直接上传本地图片作为角色视角。

#### Scenario: 上传视角图片
- **GIVEN** 用户查看角色视角卡片
- **WHEN** 用户点击上传按钮并选择本地图片
- **THEN** 系统 MUST 验证图片格式（支持 JPG、PNG、WEBP）
- **AND** 系统 MUST 上传图片并更新视角数据
- **AND** 系统 MUST 显示上传的图片预览

#### Scenario: 替换现有视角图片
- **GIVEN** 视角已有图片
- **WHEN** 用户上传新图片
- **THEN** 系统 MUST 替换现有图片
- **AND** 系统 MUST 更新角色的 updatedAt 时间戳

#### Scenario: 删除上传的图片
- **GIVEN** 视角有上传的图片
- **WHEN** 用户点击删除按钮
- **THEN** 系统 MUST 移除该视角图片
- **AND** 系统 MUST 显示空状态提示

---

### Requirement: 自定义字段管理
系统 SHALL 支持为角色添加自定义信息字段。

#### Scenario: 添加自定义字段
- **GIVEN** 用户编辑角色信息
- **WHEN** 用户点击"添加自定义字段"按钮
- **THEN** 系统 MUST 显示字段编辑表单
- **AND** 表单 MUST 包含字段名称和值输入
- **AND** 保存后字段 MUST 显示在角色信息中

#### Scenario: 编辑自定义字段
- **GIVEN** 角色有自定义字段
- **WHEN** 用户编辑字段值
- **THEN** 系统 MUST 更新字段值
- **AND** 更新 MUST 自动保存

#### Scenario: 删除自定义字段
- **GIVEN** 角色有自定义字段
- **WHEN** 用户删除某个字段
- **THEN** 系统 MUST 从角色数据中移除该字段
- **AND** 系统 MUST 显示确认提示

#### Scenario: 自定义字段持久化
- **GIVEN** 用户添加了自定义字段
- **WHEN** 页面刷新或重新打开
- **THEN** 自定义字段 MUST 保持不变
- **AND** 字段 MUST 存储在 attributes 的扩展字段中

---

### Requirement: 六维角色模板提示词优化
系统 SHALL 提供基于六维角色模板的提示词生成和优化功能。

#### Scenario: 显示六维模板表单
- **GIVEN** 用户创建或编辑角色
- **WHEN** 用户访问提示词优化功能
- **THEN** 系统 MUST 显示六维模板表单
- **AND** 表单 MUST 包含：外貌特征、性格特点、背景故事、行为习惯、语言风格、人际关系
- **AND** 每个维度 MUST 提供多行文本输入

#### Scenario: 生成优化提示词
- **GIVEN** 用户填写了六维模板
- **WHEN** 用户点击"生成提示词"按钮
- **THEN** 系统 MUST 调用 AI API 整合六维信息
- **AND** 系统 MUST 生成完整的角色描述提示词
- **AND** 系统 MUST 在生成过程中显示加载状态

#### Scenario: 预览和编辑提示词
- **GIVEN** 系统生成了优化提示词
- **WHEN** 显示生成结果
- **THEN** 系统 MUST 提供预览区域
- **AND** 用户 MUST 能够编辑生成的提示词
- **AND** 用户 MUST 能够保存到角色 basePrompt

#### Scenario: AI 生成失败处理
- **GIVEN** 用户请求生成提示词
- **WHEN** AI API 调用失败
- **THEN** 系统 MUST 显示错误信息
- **AND** 系统 MUST 提供手动输入选项
- **AND** 系统 MUST 提供重试按钮

---

## MODIFIED Requirements

### Requirement: 角色资产双向同步 (MODIFIED)
系统 SHALL 保持角色与资产库中对应资产的双向同步，并包含上传者信息。

#### Scenario: 同步时记录上传者 (NEW)
- **GIVEN** 角色同步到资产库
- **WHEN** 创建资产记录
- **THEN** 系统 MUST 记录当前用户为上传者
- **AND** 资产 MUST 包含上传者 ID 和名称
- **AND** 上传者信息 MUST 从当前登录用户获取

#### Scenario: 显示资产上传者 (NEW)
- **GIVEN** 资产库包含角色资产
- **WHEN** 用户查看资产卡片或列表
- **THEN** 系统 MUST 显示上传者名称
- **AND** 表格视图 MUST 包含上传者列
