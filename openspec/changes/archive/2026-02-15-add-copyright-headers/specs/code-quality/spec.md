# Code Quality Specification - Copyright Headers

## ADDED Requirements

### Requirement: Standard Copyright Header Format

所有源代码文件 SHALL 包含标准格式的版权信息头注释。

#### Scenario: TypeScript file with copyright header

- **Given** 一个 TypeScript 源文件
- **When** 开发者创建或修改该文件
- **Then** 文件顶部 SHALL 包含以下格式的注释块：
  ```
  /**
   * [文件描述]
   *
   * @author 外星动物（常智）IoTchange
   * @email 14455975@qq.com
   * @copyright ©2026 IoTchange
   * @version V0.1.0
   */
  ```

#### Scenario: Existing file without copyright header

- **Given** 一个已存在但没有版权头的源文件
- **When** 进行代码审查或批量更新时
- **Then** 系统 SHALL 为该文件添加标准版权头

---

### Requirement: Version Number Format

版本号 SHALL 遵循语义化版本规范，格式为 `V{MAJOR}.{MINOR}.{PATCH}`。

#### Scenario: Initial version number

- **Given** 一个新创建的文件
- **When** 添加版权头时
- **Then** 初始版本号 SHALL 为 `V0.1.0`

#### Scenario: Version number increment

- **Given** 一个已有版权头的文件
- **When** 进行重大功能更新时
- **Then** 版本号 SHALL 根据变更类型递增：
  - MAJOR: 不兼容的 API 变更
  - MINOR: 向后兼容的功能新增
  - PATCH: 向后兼容的问题修复

---

### Requirement: Excluded Files

某些文件类型和目录 SHALL 被排除在版权头要求之外。

#### Scenario: Third-party library files

- **Given** 位于 `src/components/ui/` 目录下的文件
- **When** 执行版权头检查时
- **Then** 这些文件 SHALL 被跳过

#### Scenario: Auto-generated files

- **Given** 自动生成的文件（如 `*.gen.ts`）
- **When** 执行版权头检查时
- **Then** 这些文件 SHALL 被跳过

#### Scenario: Configuration files

- **Given** 配置文件（如 `vite.config.ts`、`tsconfig.json`）
- **When** 执行版权头检查时
- **Then** 这些文件 SHALL 被跳过

---

### Requirement: Git Version Control

项目 SHALL 使用 Git 进行版本控制，并遵循规范的工作流程。

#### Scenario: Branch naming convention

- **Given** 创建新的功能分支
- **When** 开发者命名分支时
- **Then** 分支名称 SHALL 遵循格式：`{type}/{description}`
  - type: feat, fix, docs, style, refactor, test, chore
  - description: 简短的英文描述，使用 kebab-case

#### Scenario: Commit message format

- **Given** 提交代码变更
- **When** 编写提交信息时
- **Then** 提交信息 SHALL 遵循格式：
  ```
  {type}({scope}): {description}

  [optional body]

  [optional footer]
  ```
