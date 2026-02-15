# character-design-testing Specification

## Purpose
角色设计模块的测试规范，定义测试场景和验收标准。

## ADDED Requirements

### Requirement: 角色设计页面加载测试
系统 SHALL 正确加载角色设计页面，无 JavaScript 错误。

#### Scenario: 访问角色列表页面
- **GIVEN** 后端和前端服务正常运行
- **WHEN** 用户访问 `/character` 路由
- **THEN** 页面 MUST 在 3 秒内加载完成
- **AND** 页面 MUST 显示角色列表组件
- **AND** 控制台 MUST 无 JavaScript 错误

#### Scenario: 空状态显示
- **GIVEN** 系统中没有角色数据
- **WHEN** 用户访问角色列表页面
- **THEN** 页面 MUST 显示"暂无角色"提示
- **AND** 页面 MUST 显示创建角色按钮

---

### Requirement: 角色卡片显示测试
系统 SHALL 正确显示角色卡片，包含所有必要信息。

#### Scenario: 角色卡片渲染
- **GIVEN** 系统中存在角色数据
- **WHEN** 用户访问角色列表页面
- **THEN** 每个角色 MUST 显示卡片
- **AND** 卡片 MUST 显示角色图片（如有）
- **AND** 卡片 MUST 显示角色名称
- **AND** 卡片 MUST 显示角色编号
- **AND** 卡片 MUST 显示视角数量
- **AND** 卡片 MUST 显示服装数量

#### Scenario: 语音播放按钮显示
- **GIVEN** 角色有语音样本
- **WHEN** 用户查看角色卡片
- **THEN** 卡片 MUST 显示语音播放按钮
- **AND** 点击播放按钮 MUST 播放音频
- **AND** 点击事件 MUST NOT 触发卡片 onClick

---

### Requirement: 角色创建功能测试
系统 SHALL 支持创建新角色，数据正确保存。

#### Scenario: 打开创建对话框
- **GIVEN** 用户在角色列表页面
- **WHEN** 用户点击"创建角色"按钮
- **THEN** 系统 MUST 显示创建角色对话框
- **AND** 表单 MUST 包含名称、描述、风格等字段

#### Scenario: 提交创建表单
- **GIVEN** 用户填写了角色信息
- **WHEN** 用户点击保存按钮
- **THEN** 系统 MUST 验证必填字段
- **AND** 系统 MUST 生成角色编号
- **AND** 系统 MUST 保存到 store
- **AND** 对话框 MUST 关闭
- **AND** 新角色 MUST 显示在列表中

---

### Requirement: AI 图片生成功能测试
系统 SHALL 支持通过任务队列或直接模式生成角色图片。

#### Scenario: 任务队列模式检测
- **GIVEN** 用户查看角色详情
- **WHEN** 页面加载完成
- **THEN** 系统 MUST 检测任务队列是否可用
- **AND** 可用时 MUST 启用任务队列模式
- **AND** 不可用时 MUST 使用直接模式

#### Scenario: 提交图片生成任务
- **GIVEN** 用户在角色详情页选择视角
- **WHEN** 用户点击"生成图片"按钮
- **THEN** 系统 MUST 创建 image_generation 任务
- **AND** 任务 MUST 包含正确的 payload
- **AND** UI MUST 显示任务提交提示

#### Scenario: 任务状态更新
- **GIVEN** 图片生成任务已提交
- **WHEN** 任务状态变化
- **THEN** UI MUST 实时更新状态显示
- **AND** 完成时 MUST 显示生成的图片
- **AND** 失败时 MUST 显示错误信息和重试选项

---

### Requirement: TTS 语音生成功能测试
系统 SHALL 支持生成角色语音。

#### Scenario: 配置语音参数
- **GIVEN** 用户在角色语音组件
- **WHEN** 用户选择语音风格和输入文本
- **THEN** 系统 MUST 保存配置
- **AND** 参数 MUST 正确传递给 API

#### Scenario: 提交语音生成任务
- **GIVEN** 用户配置了语音参数
- **WHEN** 用户点击"生成语音"按钮
- **THEN** 系统 MUST 创建 tts_generation 任务
- **AND** 任务 MUST 包含语音参数
- **AND** UI MUST 显示生成进度

#### Scenario: 语音生成完成
- **GIVEN** 语音生成任务完成
- **WHEN** 前端收到完成通知
- **THEN** 系统 MUST 更新角色语音配置
- **AND** 播放器 MUST 加载新音频
- **AND** 用户 MUST 能播放和下载音频

---

### Requirement: API 端点功能测试
系统 SHALL 提供正确的 API 响应。

#### Scenario: 获取任务列表
- **GIVEN** 后端服务运行正常
- **WHEN** 请求 `GET /api/tasks`
- **THEN** 响应 MUST 包含 success 字段
- **AND** 响应 MUST 包含 data 数组
- **AND** 响应 MUST 包含 meta 分页信息

#### Scenario: 创建任务
- **GIVEN** 后端服务运行正常
- **WHEN** 请求 `POST /api/tasks` 包含有效参数
- **THEN** 响应 MUST 包含创建的任务对象
- **AND** 任务状态 MUST 为 pending
- **AND** 任务 MUST 包含唯一 ID

#### Scenario: 任务不存在
- **GIVEN** 后端服务运行正常
- **WHEN** 请求 `GET /api/tasks/:id` 不存在的 ID
- **THEN** 响应 MUST 包含 success: false
- **AND** 响应 MUST 包含错误消息

---

### Requirement: 错误处理测试
系统 SHALL 正确处理各类错误。

#### Scenario: API 调用失败
- **GIVEN** 用户执行需要 API 调用的操作
- **WHEN** API 返回错误
- **THEN** 系统 MUST 显示用户友好的错误提示
- **AND** 系统 MUST 记录错误日志
- **AND** 系统 MUST 提供重试选项（如适用）

#### Scenario: 网络连接失败
- **GIVEN** 后端服务不可用
- **WHEN** 前端尝试 API 调用
- **THEN** 系统 MUST 显示网络错误提示
- **AND** 系统 MUST 自动重试（可配置）

#### Scenario: 任务处理失败
- **GIVEN** 任务正在执行
- **WHEN** 处理器抛出错误
- **THEN** 任务状态 MUST 变为 failed
- **AND** 错误信息 MUST 保存到任务
- **AND** 用户 MUST 收到通知
