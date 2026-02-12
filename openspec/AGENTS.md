# OpenSpec 操作指南

供 AI 编码助手使用 OpenSpec 进行规范化开发的操作指南。

## 快速检查清单

- 查看现有工作: `openspec spec list --long`（使用 `rg` 进行全文搜索）
- 决定范围: 新功能 vs 修改现有功能
- 选择唯一变更 ID: kebab-case 格式，动词引导（`add-`、`update-`、`remove-`、`refactor-`）
- 脚手架: `proposal.md`、`tasks.md`、`design.md`（仅在需要时），以及每个功能的增量规范
- 编写增量: 使用 `## ADDED|MODIFIED|REMOVED|RENAMED Requirements`，每个需求至少包含一个 `#### Scenario:` 块
- 验证: `openspec validate [change-id] --strict` 并解决问题
- 审批: 在开始实施前必须获得批准

## 三阶段工作流程

### 第一阶段：创建变更

创建提案时你需要：
- 添加功能或行为变更
- 进行重大变更（API、架构）
- 优化性能（变更行为）
- 更新安全模式
- 触发器示例：
  - "帮我创建一个变更提案"
  - "帮我计划一个变更"
  - "我想创建一个规范"

跳过提案的场景：
- Bug 修复（恢复预期行为）
- 拼写错误、格式化、注释
- 依赖更新（非破坏性）
- 配置变更
- 针对现有行为的测试

### 第二阶段：实施变更

1. **阅读 proposal.md** - 了解要构建的内容
2. **阅读 design.md**（如存在）- 审查技术决策
3. **阅读 tasks.md** - 获取实施检查清单
4. **按顺序实施任务** - 按顺序完成
5. **确认完成** - 确保 tasks.md 中每一项在更新状态前已完成
6. **更新检查清单** - 所有工作完成后，将每项设为 `- [x]` 使清单反映实际情况

### 第三阶段：归档变更

部署后，创建独立 PR 来：
- 将 `changes/[name]/` 移至 `changes/archive/YYYY-MM-DD-[name]/`
- 如能力变更，更新 `specs/`
- 使用 `openspec archive <change-id> --skip-specs --yes` 仅归档工具类变更（始终传递变更 ID）
- 运行 `openspec validate --strict` 确认归档的变更通过检查

## 开始任何任务前

**上下文检查清单：**
- [ ] 阅读 `openspec/project.md`、`openspec list`、`openspec list --specs` 了解当前上下文
- [ ] 检查 `changes/` 中的待处理变更是否有冲突
- [ ] 阅读 `openspec/project.md` 了解项目约定
- [ ] 如请求模糊，在脚手架前先问 1-2 个澄清问题

## 创建规范前

**始终检查功能是否已存在：**
- 运行 `openspec list --specs` 或 `openspec list --long` 列出现有功能
- 优先修改现有规范而非创建重复

**避免重复工作：**
- 使用 `openspec show [spec]` 审查现有规范内容
- 如需修改，在现有规范上添加增量而非替换整个文件

## CLI 命令

```bash
# 基本命令
openspec list                  # 列出活跃变更
openspec list --specs          # 列出规范
openspec show [change]           # 显示变更或规范
openspec validate [change]       # 验证变更或规范
openspec archive <change-id> [--yes|-y]   # 归档变更（--yes 跳过确认）

# 项目管理
openspec init [path]           # 初始化 OpenSpec
openspec update [path]         # 更新指令文件
```

## 命令标志

- `--json` - 机器可读输出
- `--type change|spec` - 区分变更和规范类型
- `--strict` - 全面验证模式
- `--no-interactive` - 禁用提示（非交互式归档）
- `--skip-specs` - 跳过规范更新（归档时）
- `--yes` / `-y` - 跳过确认提示

## 规范搜索指南

```bash
# 列出规范
openspec spec list --long

# 搜索特定内容
openspec spec list --long | grep "关键词"

# 或使用 ripgrep 全文搜索
rg -n "Requirement:|Scenario:" openspec/specs
```

## 快速开始

### 创建新规范

对于新功能，创建功能级目录：

```
openspec/changes/add-new-feature/
├── proposal.md
├── tasks.md
└── specs/
    └── [feature-name]/
        └── spec.md
```

在 `spec.md` 中使用：

```markdown
## ADDED Requirements

### Requirement: 功能名称

#### Scenario: 用户执行某操作

**Given** 描述前置条件
**When** 触发条件
**Then** 预期结果
**Why** 这样做的原因
```

## 验证提示

- [ ] 是否存在同名规范
- [ ] 增量格式是否正确（使用 `## ADDED/MODIFIED/REMOVED`）
- [ ] 每个需求是否有 `#### Scenario:` 块
- [ ] 是否包含技术决策部分
