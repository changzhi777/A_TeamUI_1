# auth Specification

## Purpose
TBD - created by archiving change enhance-auth-permissions. Update Purpose after archive.
## Requirements
### Requirement: 用户认证
系统 SHALL 提供完整的用户认证功能，包括注册、登录、登出和 Token 管理。

#### Scenario: 用户注册
- **WHEN** 用户填写注册表单并提交
- **THEN** 系统 MUST 验证邮箱格式和密码强度
- **AND** 密码长度 SHALL 至少为 8 个字符
- **AND** 注册成功后 MUST 自动登录用户
- **AND** MUST 跳转到项目列表页面

#### Scenario: 用户登录
- **WHEN** 用户输入邮箱和密码登录
- **THEN** 系统 MUST 验证用户凭据
- **AND** 登录成功后 MUST 生成 access_token 和 refresh_token
- **AND** Token MUST 被存储到 localStorage 和 Cookie
- **AND** 用户状态 MUST 被持久化

#### Scenario: Token 刷新
- **WHEN** access_token 即将过期（剩余 5 分钟）
- **THEN** 系统 MUST 自动使用 refresh_token 刷新
- **AND** 刷新成功后 MUST 更新本地存储的 Token
- **AND** 刷新失败时 MUST 提示用户重新登录

#### Scenario: 记住我功能
- **WHEN** 用户勾选"记住我"选项登录
- **THEN** refresh_token 有效期 SHALL 延长至 90 天
- **AND** 用户下次访问时 MUST 保持登录状态

### Requirement: 密码重置
系统 SHALL 支持用户通过邮箱重置密码。

#### Scenario: 请求密码重置
- **WHEN** 用户在登录页点击"忘记密码"
- **THEN** 系统 MUST 显示密码重置表单
- **AND** 用户输入邮箱后 MUST 发送重置邮件（模拟）
- **AND** MUST 显示确认消息

#### Scenario: 设置新密码
- **WHEN** 用户通过邮件链接进入重置页面
- **THEN** 系统 MUST 显示新密码表单
- **AND** 新密码 MUST 符合密码强度要求
- **AND** 确认密码 MUST 与新密码一致
- **AND** 重置成功后用户 MUST 能使用新密码登录

### Requirement: OTP 双因素认证
系统 SHALL 支持 OTP 双因素认证功能（可选）。

#### Scenario: 启用 OTP
- **WHEN** 用户在设置中启用双因素认证
- **THEN** 系统 MUST 发送验证码到用户邮箱
- **AND** 用户输入正确验证码后 OTP MUST 被启用
- **AND** MUST 生成恢复码供用户保存

#### Scenario: OTP 验证
- **WHEN** 启用了 OTP 的用户登录
- **THEN** 系统 MUST 要求输入 OTP 验证码
- **AND** 验证码有效期 SHALL 为 5 分钟
- **AND** 验证失败 3 次后 MUST 锁定账户 15 分钟

#### Scenario: 重新发送验证码
- **WHEN** 用户未收到验证码
- **THEN** 系统 MUST 提供"重新发送"按钮
- **AND** 两次发送间隔 SHALL 至少为 60 秒

### Requirement: 用户资料管理
系统 SHALL 允许用户管理个人资料信息。

#### Scenario: 编辑个人信息
- **WHEN** 用户访问资料设置页面
- **THEN** 系统 MUST 显示用户当前信息
- **AND** 用户 MUST 能够编辑姓名、邮箱、头像
- **AND** 修改后 MUST 保存到本地状态

#### Scenario: 修改密码
- **WHEN** 用户修改密码
- **THEN** 系统 MUST 要求输入旧密码验证
- **AND** 新密码 MUST 符合强度要求
- **AND** 修改成功后 Token MUST 被刷新

#### Scenario: 头像上传
- **WHEN** 用户上传新头像
- **THEN** 系统 MUST 支持常见图片格式（JPG、PNG）
- **AND** 文件大小 SHALL 不超过 2MB
- **AND** 图片 MUST 被裁剪为正方形

### Requirement: 会话管理
系统 SHALL 提供会话管理功能。

#### Scenario: 查看活跃会话
- **WHEN** 用户访问安全设置页面
- **THEN** 系统 MUST 显示所有活跃会话
- **AND** 每个会话 SHALL 显示设备、位置、最后活跃时间
- **AND** 当前会话 SHALL 被标记

#### Scenario: 撤销会话
- **WHEN** 用户点击"撤销"按钮
- **THEN** 对应会话 MUST 被立即终止
- **AND** 该会话的用户 MUST 被强制登出

### Requirement: 登录历史
系统 SHALL 记录用户登录历史。

#### Scenario: 查看登录历史
- **WHEN** 用户访问安全设置页面
- **THEN** 系统 MUST 显示最近 30 天的登录记录
- **AND** 每条记录 SHALL 显示时间、设备、位置、IP 地址
- **AND** 异常登录 MUST 被标记

### Requirement: 账户安全
系统 SHALL 提供账户安全功能。

#### Scenario: 安全检查
- **WHEN** 用户登录
- **THEN** 系统 MUST 检查是否有异常登录
- **AND** 如果检测到异常 MUST 发送安全提醒邮件

#### Scenario: 恢复码
- **WHEN** 用户启用 OTP
- **THEN** 系统 MUST 生成 10 个恢复码
- **AND** 用户 MUST 能够查看和保存恢复码
- **AND** 恢复码 MUST 能够用于绕过 OTP 验证

