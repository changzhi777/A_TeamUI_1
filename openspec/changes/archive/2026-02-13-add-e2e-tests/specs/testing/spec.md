# testing Specification

## Purpose
定义 E2E 测试规范，确保新开发功能的自动化测试覆盖。

## ADDED Requirements

### Requirement: E2E 测试基础设施
系统 SHALL 提供 Playwright E2E 测试基础设施。

#### Scenario: 测试环境配置
- **GIVEN** 项目使用 Playwright 测试框架
- **WHEN** 运行 E2E 测试
- **THEN** 测试 MUST 在配置的浏览器中执行
- **AND** 测试 MUST 能够访问开发服务器
- **AND** 测试 MUST 能够重置测试数据

#### Scenario: 测试辅助函数
- **GIVEN** 需要执行重复的测试操作
- **WHEN** 编写 E2E 测试
- **THEN** 系统 MUST 提供登录辅助函数
- **AND** 系统 MUST 提供资产操作辅助函数
- **AND** 系统 MUST 提供通用断言函数

### Requirement: 资产管理 E2E 测试
系统 SHALL 为资产管理功能提供完整的 E2E 测试覆盖。

#### Scenario: 资产库页面测试
- **GIVEN** 用户已登录
- **WHEN** 访问资产库页面
- **THEN** 测试 MUST 验证页面正常加载
- **AND** 测试 MUST 验证模拟数据显示正确
- **AND** 测试 MUST 验证筛选功能工作正常

#### Scenario: 资产编辑测试
- **GIVEN** 资产库中存在资产
- **WHEN** 用户编辑资产元数据
- **THEN** 测试 MUST 验证编辑对话框正常打开
- **AND** 测试 MUST 验证名称和描述可以修改
- **AND** 测试 MUST 验证标签可以添加和删除

#### Scenario: 批量操作测试
- **GIVEN** 资产库中存在多个资产
- **WHEN** 用户选择多个资产执行操作
- **THEN** 测试 MUST 验证多选功能工作正常
- **AND** 测试 MUST 验证批量删除功能
- **AND** 测试 MUST 验证批量移动功能

#### Scenario: 导入导出测试
- **GIVEN** 用户需要导入或导出资产
- **WHEN** 执行导入导出操作
- **THEN** 测试 MUST 验证 CSV 导出生成正确文件
- **AND** 测试 MUST 验证 CSV 导入创建新资产
- **AND** 测试 MUST 验证导入错误处理

### Requirement: 分镜头 E2E 测试
系统 SHALL 为分镜头功能提供 E2E 测试覆盖。

#### Scenario: 分镜头基础操作测试
- **GIVEN** 项目已创建
- **WHEN** 用户操作分镜头
- **THEN** 测试 MUST 验证分镜头创建
- **AND** 测试 MUST 验证分镜头编辑
- **AND** 测试 MUST 验证分镜头删除

#### Scenario: 分镜头资产集成测试
- **GIVEN** 资产库中存在图片资产
- **WHEN** 用户在分镜头中选择图片
- **THEN** 测试 MUST 验证资产选择器打开
- **AND** 测试 MUST 验证图片选择成功
- **AND** 测试 MUST 验证图片在分镜头中显示

### Requirement: 认证权限 E2E 测试
系统 SHALL 为认证和权限功能提供 E2E 测试覆盖。

#### Scenario: 登录流程测试
- **GIVEN** 用户有有效账号
- **WHEN** 用户登录系统
- **THEN** 测试 MUST 验证登录成功后跳转
- **AND** 测试 MUST 验证用户信息显示正确
- **AND** 测试 MUST 验证登出功能

#### Scenario: 权限控制测试
- **GIVEN** 不同角色用户
- **WHEN** 访问需要权限的功能
- **THEN** 测试 MUST 验证管理员可以访问所有功能
- **AND** 测试 MUST 验证普通成员只能访问授权功能
- **AND** 测试 MUST 验证无权限时显示正确提示

### Requirement: 集成 E2E 测试
系统 SHALL 提供跨功能的集成测试。

#### Scenario: 核心用户流程测试
- **GIVEN** 用户需要完成核心工作流程
- **WHEN** 执行创建项目、上传资产、创建分镜头的流程
- **THEN** 测试 MUST 验证整个流程可以顺利完成
- **AND** 测试 MUST 验证各步骤之间的数据传递
- **AND** 测试 MUST 验证最终结果正确
