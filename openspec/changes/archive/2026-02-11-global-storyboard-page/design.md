# global-storyboard-page 设计文档

## Context

`GlobalStoryboardPage` 组件和 `/storyboard` 路由已经存在并支持全局分镜头视图，但侧边栏中的"分镜头创作"链接仍然标记为 `requiresProject: true`，阻止了用户直接访问。

**约束条件：**
- 必须复用现有的 `GlobalStoryboardPage` 组件
- 不能破坏现有的项目分镜头管理功能
- 必须保持路由结构的一致性

**利益相关者：**
- 内容创作者：需要快速访问分镜头创作功能
- 项目经理：需要在项目上下文外管理分镜头

## Goals / Non-Goals

**Goals:**
- 移除侧边栏中的 `requiresProject: true` 限制
- 允许用户直接访问全局分镜头页面
- 支持跨项目的分镜头浏览和编辑

**Non-Goals:**
- 修改 `GlobalStoryboardPage` 组件的核心逻辑
- 创建新的分镜头页面组件
- 修改项目内的分镜头功能

## Decisions

### 1. 侧边栏配置更新

**决策：** 仅移除 `requiresProject: true` 属性

**理由：**
- 路由和组件已经就绪
- 最小化变更，降低风险
- 与团队成员功能保持一致

### 2. 功能范围

**决策：** 保持全局分镜头功能与项目分镜头功能并行

**理由：**
- 用户可能需要在项目上下文内或外工作
- 两者服务于不同的使用场景
