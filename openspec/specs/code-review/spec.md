# code-review Specification

## Purpose
TBD - created by archiving change add-enterprise-governance-system. Update Purpose after archive.
## Requirements
### Requirement: 审查流程
系统 SHALL 遵循标准的Pull Request审查流程。

#### Scenario: PR创建
- **WHEN** 开发者完成功能开发
- **THEN** MUST 创建Feature分支
- **AND** MUST 确保本地测试通过
- **AND** MUST 提交PR到develop分支
- **AND** PR描述 MUST 包含变更说明

#### Scenario: 审查要求
- **WHEN** PR提交后
- **THEN** MUST 至少获得1人审查批准
- **AND** CI检查 MUST 全部通过
- **AND** 代码冲突 MUST 已解决

#### Scenario: 合并条件
- **WHEN** 满足审查要求
- **THEN** 方可合并到目标分支
- **AND** MUST 使用Squash Merge保持历史清晰
- **AND** MUST 删除Feature分支

### Requirement: 审查清单
审查者 SHALL 按照标准清单进行代码审查。

#### Scenario: 代码规范检查
- **WHEN** 审查代码
- **THEN** MUST 检查代码是否符合项目规范
- **AND** MUST 检查命名是否清晰
- **AND** MUST 检查代码是否简洁

#### Scenario: 版权信息检查
- **WHEN** 审查新文件
- **THEN** MUST 检查是否包含版权头
- **AND** 版权信息 MUST 正确完整
- **AND** 版本号 MUST 为当前版本

#### Scenario: 测试覆盖检查
- **WHEN** 审查功能代码
- **THEN** MUST 检查是否有对应测试
- **AND** 新功能 MUST 有单元测试或E2E测试
- **AND** bug修复 MUST 有回归测试

#### Scenario: 安全检查
- **WHEN** 审查代码
- **THEN** MUST 检查是否有安全漏洞
- **AND** MUST 检查敏感信息是否暴露
- **AND** MUST 检查权限验证是否完整

### Requirement: Commit信息规范
系统 SHALL 遵循标准Commit信息格式。

#### Scenario: Commit格式
- **WHEN** 提交代码
- **THEN** Commit信息 MUST 使用格式：`<type>(<scope>): <subject>`
- **AND** type MUST 为以下之一：`feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
- **AND** subject MUST 简洁描述变更内容

#### Scenario: Commit类型
- **WHEN** 选择Commit类型
- **THEN** MUST 使用正确类型：
  - `feat`: 新功能
  - `fix`: Bug修复
  - `docs`: 文档更新
  - `style`: 代码格式
  - `refactor`: 代码重构
  - `test`: 测试相关
  - `chore`: 构建/工具

### Requirement: 分支策略
系统 SHALL 遵循标准分支策略。

#### Scenario: 主分支
- **WHEN** 管理分支
- **THEN** MUST 维护以下主分支：
  - `main`: 生产分支，只接受release合并
  - `develop`: 开发分支，接受feature合并

#### Scenario: 临时分支
- **WHEN** 开发功能或修复
- **THEN** 必须创建临时分支：
  - `feature/*`: 功能开发
  - `bugfix/*`: Bug修复
  - `refactor/*`: 代码重构
- **AND** 合并后 MUST 删除临时分支

### Requirement: CI检查
系统 SHALL 在PR合并前执行CI检查。

#### Scenario: 代码检查
- **WHEN** PR提交
- **THEN** MUST 执行ESLint检查
- **AND** MUST 执行TypeScript类型检查
- **AND** 所有检查 MUST 通过

#### Scenario: 构建检查
- **WHEN** PR提交
- **THEN** MUST 执行构建命令
- **AND** 构建 MUST 成功完成
- **AND** 无TypeScript错误

#### Scenario: 测试检查
- **WHEN** PR提交
- **THEN** MUST 执行测试命令
- **AND** 所有测试 MUST 通过
- **AND** 测试覆盖率 MUST 满足要求

