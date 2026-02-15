# task-queue Specification

## Purpose
TBD - created by archiving change implement-task-queue. Update Purpose after archive.
## Requirements
### Requirement: Task Queue Backend Service

系统 MUST 提供基于 Redis 实现的任务队列后端服务，支持任务存储和调度。服务 SHALL 支持优先级队列、任务重试和超时处理。

#### Scenario: Create task with priority

**Given** 用户需要执行一个耗时操作（如批量导出）
**When** 用户通过 API 创建任务并指定优先级为 "high"
**Then** 任务被添加到高优先级队列
**And** 任务初始状态为 "pending"
**And** 返回任务 ID 和创建时间

#### Scenario: Process task by worker

**Given** 任务队列中有待处理的任务
**When** Worker 从队列中获取任务
**Then** 任务状态变为 "running"
**And** 开始执行任务对应的处理器
**And** 通过 WebSocket 广播任务开始事件

#### Scenario: Task completion notification

**Given** 任务正在执行中
**When** 任务处理器执行成功
**Then** 任务状态变为 "completed"
**And** 保存任务结果
**And** 通过 WebSocket 通知任务创建者

#### Scenario: Task failure with retry

**Given** 任务执行失败且未达到最大重试次数
**When** 任务处理器抛出错误
**Then** 任务状态变为 "pending"
**And** 重试计数增加
**And** 任务被重新加入队列

#### Scenario: Task failure without retry

**Given** 任务执行失败且已达到最大重试次数
**When** 任务处理器抛出错误
**Then** 任务状态变为 "failed"
**And** 保存错误信息
**And** 通过 WebSocket 通知任务创建者

---

### Requirement: Task Management API

系统 MUST 提供任务管理 REST API，支持任务的创建、查询、取消和重试操作。API SHALL 返回 JSON 格式响应并支持分页。

#### Scenario: List tasks with pagination

**Given** 系统中存在多个任务
**When** 用户请求任务列表并指定分页参数
**Then** 返回指定页的任务列表
**And** 包含分页元数据（总数、页码、每页数量）
**And** 任务按创建时间倒序排列

#### Scenario: Filter tasks by status

**Given** 系统中存在不同状态的任务
**When** 用户请求任务列表并指定状态筛选条件
**Then** 只返回符合状态条件的任务

#### Scenario: Get task details

**Given** 存在一个任务
**When** 用户请求该任务的详情
**Then** 返回任务的完整信息
**And** 包含任务进度、结果或错误信息

#### Scenario: Cancel pending task

**Given** 存在一个状态为 "pending" 的任务
**When** 用户请求取消该任务
**Then** 任务状态变为 "cancelled"
**And** 任务从队列中移除
**And** 通过 WebSocket 通知任务状态变更

#### Scenario: Cancel running task

**Given** 存在一个状态为 "running" 的任务
**When** 用户请求取消该任务
**Then** 返回错误提示"无法取消正在执行的任务"

#### Scenario: Retry failed task

**Given** 存在一个状态为 "failed" 的任务
**When** 用户请求重试该任务
**Then** 任务状态变为 "pending"
**And** 重置重试计数
**And** 任务被重新加入队列

---

### Requirement: WebSocket Task Notifications

系统 MUST 通过 WebSocket 实时推送任务状态变更通知。用户 SHALL 能够订阅自己创建的任务更新。

#### Scenario: Subscribe to task updates

**Given** 用户已通过 WebSocket 连接
**When** 用户订阅任务更新
**Then** 用户开始接收其创建的任务的状态变更通知

#### Scenario: Receive task progress update

**Given** 任务正在执行并报告进度
**When** 任务进度更新（如 50%）
**Then** 通过 WebSocket 向订阅者推送进度事件
**And** 事件包含任务 ID 和当前进度

#### Scenario: Receive task completion notification

**Given** 用户订阅了任务更新
**When** 任务完成
**Then** 用户收到任务完成通知
**And** 通知包含任务结果摘要

---

### Requirement: Task Queue Frontend UI

系统 MUST 提供任务队列前端管理界面，位于"系统状态"菜单下。界面 SHALL 支持任务列表展示、筛选、详情查看和操作。

#### Scenario: View task queue page

**Given** 用户已登录
**When** 用户导航到"系统状态" > "任务队列"
**Then** 显示任务队列管理页面
**And** 显示任务列表
**And** 显示筛选和搜索功能

#### Scenario: View task list with status icons

**Given** 任务列表中有多个任务
**When** 页面加载完成
**Then** 每个任务显示状态图标
**And** "pending" 显示等待图标
**And** "running" 显示进度条和执行图标
**And** "completed" 显示成功图标
**And** "failed" 显示错误图标

#### Scenario: Filter tasks by type

**Given** 任务列表中有不同类型的任务
**When** 用户选择任务类型筛选
**Then** 只显示选中类型的任务

#### Scenario: View task detail dialog

**Given** 任务列表中存在任务
**When** 用户点击任务行
**Then** 显示任务详情对话框
**And** 显示任务参数、结果或错误信息

#### Scenario: Cancel task from UI

**Given** 任务列表中存在 "pending" 状态的任务
**When** 用户点击取消按钮
**Then** 显示确认对话框
**And** 确认后取消任务
**And** 刷新任务列表

#### Scenario: Retry failed task from UI

**Given** 任务列表中存在 "failed" 状态的任务
**When** 用户点击重试按钮
**Then** 任务被重新加入队列
**And** 状态变为 "pending"

---

### Requirement: Browser Notifications

系统 SHALL 在任务完成或失败时发送浏览器通知提醒用户。通知功能 MUST 遵循浏览器通知权限规范。

#### Scenario: Request notification permission

**Given** 用户首次访问任务队列页面
**When** 页面加载
**Then** 请求浏览器通知权限

#### Scenario: Notify on task completion

**Given** 用户已授予通知权限
**When** 用户创建的任务完成
**Then** 显示浏览器通知
**And** 通知标题为"任务完成"
**And** 点击通知跳转到任务详情

#### Scenario: Notify on task failure

**Given** 用户已授予通知权限
**When** 用户创建的任务失败
**Then** 显示浏览器通知
**And** 通知标题为"任务失败"
**And** 通知内容包含错误摘要

---

