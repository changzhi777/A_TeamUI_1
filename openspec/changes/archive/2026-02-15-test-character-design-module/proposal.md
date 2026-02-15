# Proposal: test-character-design-module

## Summary
制定并执行角色设计功能模块的全面测试计划，使用浏览器 MCP 工具进行实际页面截图分析，验证 API 调用和任务队列执行的正确性，发现并修复潜在错误。

## Motivation
角色设计模块是系统的核心功能之一，涉及多个子系统：
- 前端组件（CharacterPage, CharacterGallery, CostumeGenerator, CharacterVoice 等）
- 后端 API（任务队列、任务处理）
- 外部 AI 服务（智谱 GLM-Image, GLM-TTS）

需要确保整个功能链路的稳定性和正确性。

## Scope

### In Scope
1. **角色列表页面测试**
   - 页面加载和渲染
   - 角色卡片显示
   - 视图切换（网格/卡片/表格）

2. **角色创建/编辑测试**
   - 表单验证
   - 数据持久化
   - 人物风格选择

3. **多视角图片生成测试**
   - 直接模式 AI 生成
   - 任务队列模式
   - 自定义视角管理

4. **服装变体生成测试**
   - 服装描述输入
   - AI 生成流程
   - 变体管理

5. **TTS 语音生成测试**
   - 语音风格选择
   - 文本输入和生成
   - 音频播放

6. **API 调用验证**
   - 任务创建 API
   - 任务查询 API
   - 任务取消/重试 API

7. **任务队列执行测试**
   - 任务入队
   - 任务处理
   - 结果回调

### Out of Scope
- 资产库同步功能（已有独立测试）
- 用户权限系统（已有独立测试）
- 性能压力测试

## Approach
使用浏览器 MCP 工具（如 `mcp__zai-mcp-server__analyze_image`）进行实际页面截图分析：

1. 启动前端和后端服务
2. 使用 Playwright 或手动截图获取页面状态
3. 使用 MCP 图像分析工具检查页面元素和错误
4. 验证 API 调用日志
5. 记录问题并修复

## Dependencies
- 后端服务运行正常（localhost:3001）
- 前端服务运行正常（localhost:5173）
- Redis 和 MySQL 数据库连接正常
- 智谱 AI API 可用

## Risks
- 外部 AI API 可能不稳定或有限额限制
- 截图分析可能无法捕获所有 JavaScript 错误

## Success Criteria
- 所有测试场景通过
- 发现的问题已修复
- 无控制台错误
- API 调用响应正确
- 任务队列执行正常
