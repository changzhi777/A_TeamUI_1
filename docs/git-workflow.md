# Git 工作流规范

本文档定义了项目的 Git 版本控制规范，包括分支策略、Commit 信息格式和版本标签管理。

## 分支策略

### 主分支

项目维护以下长期分支：

| 分支 | 用途 | 保护级别 |
|------|------|----------|
| `main` | 生产分支，只接受 release 合并 | 高 - 需要 PR 审查 |
| `develop` | 开发分支，接受 feature 合并 | 中 - 需要 PR 审查 |

### 临时分支

开发功能或修复时，必须创建临时分支：

| 分支前缀 | 用途 | 合并目标 |
|----------|------|----------|
| `feature/*` | 新功能开发 | `develop` |
| `bugfix/*` | Bug 修复 | `develop` |
| `refactor/*` | 代码重构 | `develop` |
| `release/*` | 版本发布 | `main` 和 `develop` |
| `hotfix/*` | 紧急修复 | `main` 和 `develop` |

**命名规范**：
- 使用小写字母和连字符
- 包含 Issue 编号（如有）
- 示例：`feature/character-design`、`bugfix/login-error-123`

### 分支生命周期

1. **创建**：从目标分支创建新分支
2. **开发**：进行多次 commit
3. **审查**：创建 Pull Request
4. **合并**：审查通过后合并
5. **删除**：合并后删除临时分支

## Commit 信息规范

### 格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type 类型

| Type | 说明 | 示例 |
|------|------|------|
| `feat` | 新功能 | feat(character): 添加角色设计功能 |
| `fix` | Bug 修复 | fix(auth): 修复登录验证错误 |
| `docs` | 文档更新 | docs: 更新 README |
| `style` | 代码格式（不影响功能） | style: 格式化代码 |
| `refactor` | 代码重构 | refactor(storyboard): 重构分镜头状态管理 |
| `perf` | 性能优化 | perf: 优化图片加载性能 |
| `test` | 测试相关 | test: 添加权限检查单元测试 |
| `chore` | 构建/工具 | chore: 更新依赖版本 |
| `ci` | CI 配置 | ci: 添加 GitHub Actions 配置 |

### Scope 范围

常用的 scope 包括：

- `auth` - 认证相关
- `character` - 角色设计
- `storyboard` - 分镜头
- `assets` - 资产管理
- `settings` - 系统设置
- `ui` - UI 组件
- `api` - API 相关
- `i18n` - 国际化

### Subject 主题

- 使用中文或英文（保持一致）
- 不超过 50 个字符
- 不以句号结尾
- 使用祈使句（"添加"而非"添加了"）

### 示例

```bash
# 好的 commit
feat(character): 添加角色多视角图片生成功能
fix(auth): 修复 token 过期后未自动刷新的问题
refactor(storyboard): 重构分镜头状态管理，提取公共逻辑

# 不好的 commit
update code
fix bug
WIP
```

## 版本标签规范

### 标签格式

```
vX.Y.Z
```

- `X` - 主版本号（不兼容的 API 变更）
- `Y` - 次版本号（向后兼容的功能新增）
- `Z` - 修订号（向后兼容的问题修复）

### 版本递增规则

| 变更类型 | 版本递增 | 示例 |
|----------|----------|------|
| Bug 修复 | 修订号 | v0.1.0 → v0.1.1 |
| 功能新增 | 次版本号 | v0.1.0 → v0.2.0 |
| 重大变更 | 主版本号 | v0.1.0 → v1.0.0 |

### 创建标签

```bash
# 创建带注释的标签
git tag -a v0.1.0 -m "版本 0.1.0 - 初始版本"

# 推送标签到远程
git push origin v0.1.0

# 推送所有标签
git push origin --tags
```

## Pull Request 规范

### PR 标题

使用与 Commit 相同的格式：`<type>(<scope>): <subject>`

### PR 描述模板

```markdown
## 变更说明
<!-- 描述此 PR 的变更内容 -->

## 变更类型
- [ ] 新功能
- [ ] Bug 修复
- [ ] 重构
- [ ] 文档更新
- [ ] 其他：

## 测试
<!-- 描述如何测试这些变更 -->

## 截图
<!-- 如有 UI 变更，添加截图 -->

## 相关 Issue
<!-- 关联的 Issue 编号 -->
```

### 审查要求

1. 至少获得 1 人审查批准
2. CI 检查全部通过
3. 代码冲突已解决
4. 测试覆盖率满足要求

### 合并方式

- 使用 **Squash Merge** 保持历史清晰
- 合并后删除源分支

## 常用命令

```bash
# 创建并切换到新分支
git checkout -b feature/new-feature

# 查看当前状态
git status

# 添加变更
git add .
git add src/lib/version.ts

# 提交变更
git commit -m "feat(version): 添加版本信息模块"

# 推送分支
git push origin feature/new-feature

# 拉取最新代码
git pull origin develop

# 查看提交历史
git log --oneline -10

# 撤销未暂存的变更
git checkout -- .

# 撤销最后一次 commit（保留变更）
git reset --soft HEAD~1
```

## 版权信息

```
@author 外星动物（常智）IoTchange
@email 14455975@qq.com
@copyright ©2026 IoTchange
```
