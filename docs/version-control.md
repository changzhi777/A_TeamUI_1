# 版本管理规范

## 版本号格式

本项目采用语义化版本规范，格式为 `V{MAJOR}.{MINOR}.{PATCH}`。

### 版本号规则

| 类型 | 格式 | 说明 | 示例 |
|------|------|------|------|
| 主版本号 | MAJOR | 不兼容的 API 变更 | V1.0.0 → V2.0.0 |
| 次版本号 | MINOR | 向后兼容的功能新增 | V0.1.0 → V0.2.0 |
| 修订号 | PATCH | 向后兼容的问题修复 | V0.1.0 → V0.1.1 |

### 初始版本

- 项目初始版本：**V0.1.0**
- 所有新创建的文件初始版本号均为 **V0.1.0**

## 版权信息头

所有源代码文件应包含统一的版权信息头：

```typescript
/**
 * [文件描述]
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */
```

## Git 分支管理

### 分支命名规范

| 分支类型 | 命名格式 | 说明 |
|----------|----------|------|
| 主分支 | `main` | 生产环境代码 |
| 开发分支 | `develop` | 开发环境代码 |
| 功能分支 | `feat/{feature-name}` | 新功能开发 |
| 修复分支 | `fix/{bug-name}` | Bug 修复 |
| 发布分支 | `release/{version}` | 版本发布准备 |
| 热修复分支 | `hotfix/{version}` | 生产环境紧急修复 |

### 分支命名示例

```bash
feat/user-authentication    # 用户认证功能
fix/login-redirect          # 登录重定向问题修复
release/v0.2.0              # 0.2.0 版本发布
hotfix/v0.1.1               # 0.1.1 紧急修复
```

## 提交信息规范

### 提交信息格式

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### 提交类型

| 类型 | 说明 | 示例 |
|------|------|------|
| `feat` | 新功能 | `feat(auth): 添加用户登录功能` |
| `fix` | Bug 修复 | `fix(router): 修复登录重定向问题` |
| `docs` | 文档更新 | `docs(readme): 更新安装说明` |
| `style` | 代码格式（不影响功能） | `style(app): 格式化代码缩进` |
| `refactor` | 代码重构 | `refactor(api): 重构用户服务` |
| `perf` | 性能优化 | `perf(query): 优化数据库查询` |
| `test` | 测试相关 | `test(auth): 添加登录单元测试` |
| `chore` | 构建/工具相关 | `chore(deps): 更新依赖版本` |
| `ci` | CI/CD 相关 | `ci(github): 添加自动化测试` |

### 提交信息示例

```bash
# 好的提交信息
feat(storyboard): 添加分镜头导出功能

- 支持 PDF 导出
- 支持 Word 导出
- 支持自定义模板

Closes #123

# 不好的提交信息
fix bug
update code
WIP
```

## 版本发布流程

### 1. 准备发布

```bash
# 从 develop 分支创建发布分支
git checkout develop
git pull origin develop
git checkout -b release/v0.2.0
```

### 2. 更新版本号

- 更新 `package.json` 中的版本号
- 更新 `CHANGELOG.md`（如有）
- 确保所有更改已提交

### 3. 合并到主分支

```bash
# 合并到 main
git checkout main
git merge --no-ff release/v0.2.0

# 打标签
git tag -a v0.2.0 -m "Release version 0.2.0"

# 推送到远程
git push origin main --tags
```

### 4. 合并回开发分支

```bash
git checkout develop
git merge --no-ff release/v0.2.0
git push origin develop
```

### 5. 清理发布分支

```bash
git branch -d release/v0.2.0
git push origin --delete release/v0.2.0
```

## 版权声明

```
Copyright © 2026 IoTchange (外星动物/常智)

All rights reserved. This software and associated documentation files
(the "Software") are the proprietary information of IoTchange.

The Software is provided "as is", without warranty of any kind, express or
implied, including but not limited to the warranties of merchantability,
fitness for a particular purpose and noninfringement.
```

## 联系方式

- **作者**: 外星动物（常智）IoTchange
- **邮箱**: 14455975@qq.com
- **版本**: V0.1.0
