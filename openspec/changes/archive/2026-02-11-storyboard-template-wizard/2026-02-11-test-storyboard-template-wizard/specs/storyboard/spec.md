## ADDED Requirements

### Requirement: 导入向导功能测试

系统 SHALL 提供完整的测试覆盖，确保分镜头导入向导功能正常工作。

#### Scenario: 标准 JSON 文件导入测试

- **GIVEN** 开发服务器已启动
- **AND** 准备了包含有效分镜头数据的 JSON 测试文件
- **WHEN** 测试者通过导入向导上传该 JSON 文件
- **THEN** 系统 MUST 成功解析文件并显示格式验证通过
- **AND** 数据预览 MUST 正确显示所有分镜头
- **AND** 导入完成后 MUST 显示成功状态
- **AND** 分镜头 MUST 正确添加到项目列表
- **AND** MUST 不出现 500 错误或其他运行时错误

#### Scenario: 空文件处理测试

- **GIVEN** 准备了空的 JSON 文件（包含空 shots 数组）
- **WHEN** 测试者通过导入向导上传该文件
- **THEN** 系统 MUST 在格式验证步骤显示警告
- **AND** 警告信息 MUST 说明文件中无数据
- **AND** MUST 不崩溃或出现 500 错误
- **AND** 用户 MUST 能够取消或继续（但无数据导入）

#### Scenario: 格式错误处理测试

- **GIVEN** 准备了格式错误的 JSON 文件（缺少必需字段）
- **WHEN** 测试者通过导入向导上传该文件
- **THEN** 系统 MUST 在格式验证步骤显示错误
- **AND** 错误信息 MUST 明确指出缺失的字段或格式问题
- **AND** MUST 不崩溃或出现 500 错误
- **AND** 用户 MUST 能够返回上一步重新选择文件

#### Scenario: 文件大小限制测试

- **GIVEN** 准备了超过 10MB 的 JSON 文件
- **WHEN** 测试者通过导入向导上传该文件
- **THEN** 系统 MUST 在文件上传步骤拒绝文件
- **AND** MUST 显示"文件大小超过限制，最大支持 10MB"提示
- **AND** MUST 不进入解析流程
- **AND** MUST 不出现 500 错误

### Requirement: 导入流程完整性验证

系统 SHALL 确保 6 步骤导入流程完整可用。

#### Scenario: 步骤导航测试

- **GIVEN** 导入向导已打开
- **WHEN** 测试者依次通过所有 6 个步骤
- **THEN** 每个步骤 MUST 正确渲染
- **AND** "上一步"和"下一步"按钮 MUST 正常工作
- **AND** 进度条 MUST 正确反映当前步骤
- **AND** 步骤指示器 MUST 准确高亮当前步骤

#### Scenario: 拖放上传测试

- **GIVEN** 导入向导处于步骤 1（文件上传）
- **WHEN** 测试者拖动文件到拖放区域
- **THEN** 拖放区域 MUST 显示视觉反馈（边框和背景变化）
- **AND** 释放文件后 MUST 正确接受文件
- **AND** MUST 自动进入下一步骤
- **AND** MUST 不出现 500 错误

#### Scenario: 导入进度显示测试

- **GIVEN** 数据已通过验证并准备导入
- **WHEN** 测试者执行导入操作
- **THEN** 步骤 6 MUST 显示导入进度条
- **AND** MUST 显示"已处理 X / Y 个分镜头"计数
- **AND** 完成后 MUST 显示成功/失败统计
- **AND** MUST 不出现 500 错误

### Requirement: 错误检测与修复

系统 SHALL 提供机制检测和处理 500 错误及其他异常。

#### Scenario: 网络请求监控

- **GIVEN** 测试工具已配置监控网络请求
- **WHEN** 执行导入流程
- **THEN** 所有网络请求 MUST 返回 2xx 或 3xx 状态码
- **AND** MUST 不出现 500 内部服务器错误
- **AND** 如有请求失败，MUST 记录详细的请求信息（URL、方法、载荷）

#### Scenario: 控制台错误检测

- **GIVEN** 测试工具已配置监控浏览器控制台
- **WHEN** 执行导入流程
- **THEN** MUST 不出现 JavaScript 运行时错误
- **AND** MUST 不出现 React 警告
- **AND** MUST 不出现未处理的 Promise 拒绝
- **AND** 如有错误，MUST 记录完整的错误堆栈

#### Scenario: 问题修复验证

- **GIVEN** 测试过程中发现 500 错误或其他问题
- **WHEN** 测试者定位并修复问题根源
- **THEN** 修复后的代码 MUST 通过回归测试
- **AND** 原问题 MUST 不再复现
- **AND** MUST 不引入新的问题

### Requirement: 数据准确性验证

系统 SHALL 确保导入数据的准确性。

#### Scenario: 镜头编号保持测试

- **GIVEN** JSON 文件中的分镜头具有指定的镜头编号
- **WHEN** 文件被导入到系统
- **THEN** 导入后的镜头编号 MUST 与文件中保持一致
- **AND** MUST 不被自动计算值覆盖

#### Scenario: 字段映射正确性测试

- **GIVEN** JSON 文件包含所有标准字段（场次、景别、运镜方式、时长等）
- **WHEN** 文件被导入到系统
- **THEN** 所有字段 MUST 正确映射到分镜头对象
- **AND** 枚举值（景别、运镜方式）MUST 正确转换
- **AND** 可选字段（描述、对白、音效）MUST 正确保留

### Requirement: 测试报告生成

系统 SHALL 生成简化的测试报告记录测试结果。

#### Scenario: 测试结果汇总

- **GIVEN** 所有测试用例已执行
- **WHEN** 生成测试报告
- **THEN** 报告 MUST 包含测试摘要（总用例数、通过数、失败数）
- **AND** MUST 包含每个测试用例的详细结果
- **AND** MUST 列出所有发现的问题
- **AND** MUST 记录已修复问题的解决方案

#### Scenario: 截图和证据收集

- **GIVEN** 测试执行过程中使用了 MCP 工具
- **WHEN** 生成测试报告
- **THEN** 报告 MUST 包含关键步骤的界面截图
- **AND** MUST 包含错误状态的截图（如有）
- **AND** 截图 MUST 清晰显示界面状态
