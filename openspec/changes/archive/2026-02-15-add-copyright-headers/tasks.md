# Tasks

## Task 1: 创建版权头添加脚本

**Description**: 创建一个 Node.js 脚本，用于批量为源文件添加版权信息头。

**Files**:
- `scripts/add-copyright-headers.ts` (新建)

**Changes**:
- [x] 创建脚本，遍历目标目录的文件
- [x] 检测文件是否已有版权头
- [x] 为没有版权头的文件添加标准格式
- [x] 支持批量处理和单文件处理

**Verification**:
- [x] 脚本可以正确识别已有/无版权头的文件
- [x] 添加的版权头格式正确

---

## Task 2: 为前端核心模块添加版权头

**Description**: 为 `src/` 目录下的核心业务代码添加版权头。

**Files**:
- `src/features/**/*.tsx` - 功能模块组件
- `src/features/**/*.ts` - 功能模块逻辑
- `src/stores/*.ts` - 状态管理
- `src/hooks/*.ts` - 自定义 Hooks
- `src/lib/**/*.ts` - 工具函数
- `src/routes/**/*.tsx` - 路由组件

**Changes**:
- [x] 为 `src/features/` 下的文件添加版权头
- [x] 为 `src/stores/` 下的文件添加版权头
- [x] 为 `src/hooks/` 下的文件添加版权头
- [x] 为 `src/lib/` 下的文件添加版权头
- [x] 为 `src/routes/` 下的文件添加版权头
- [x] 为 `src/context/` 下的文件添加版权头
- [x] 为 `src/i18n/` 下的文件添加版权头

**Verification**:
- [x] 所有目标文件包含版权头
- [x] 代码功能不受影响
- [x] TypeScript 编译通过

---

## Task 3: 为后端代码添加版权头

**Description**: 为 `server/src/` 目录下的代码添加版权头。

**Files**:
- `server/src/api/**/*.ts` - API 路由
- `server/src/models/**/*.ts` - 数据模型
- `server/src/middleware/**/*.ts` - 中间件
- `server/src/config/**/*.ts` - 配置
- `server/src/utils/**/*.ts` - 工具函数

**Changes**:
- [x] 为 `server/src/api/` 下的文件添加版权头
- [x] 为 `server/src/models/` 下的文件添加版权头
- [x] 为 `server/src/middleware/` 下的文件添加版权头
- [x] 为 `server/src/config/` 下的文件添加版权头
- [x] 为 `server/src/utils/` 下的文件添加版权头

**Verification**:
- [x] 所有后端文件包含版权头
- [x] 服务器正常启动
- [x] API 功能正常

---

## Task 4: 更新版本管理文档

**Description**: 创建或更新版本管理规范文档。

**Files**:
- `docs/version-control.md` (新建)

**Changes**:
- [x] 定义版本号格式规范（V0.1.0）
- [x] 定义 Git 分支管理策略
- [x] 定义提交信息规范
- [x] 定义版本发布流程

**Verification**:
- [x] 文档清晰完整
- [x] 符合团队协作需求

---

## Task 5: 添加 pre-commit Hook（可选）

**Description**: 添加 Git pre-commit hook 检查新文件是否包含版权头。

**Files**:
- `.husky/pre-commit` (更新)
- `scripts/check-copyright.ts` (新建)

**Changes**:
- [ ] 创建版权头检查脚本
- [ ] 配置 pre-commit hook
- [ ] 仅检查新增/修改的文件

**Verification**:
- [ ] 新文件提交时自动检查版权头
- [ ] 不影响已有文件的提交

---

## Task 6: 验证和测试

**Description**: 验证所有更改正确无误。

**Changes**:
- [x] 运行 TypeScript 类型检查
- [x] 运行构建验证
- [x] 启动开发服务器验证

**Verification**:
- [x] TypeScript 编译通过
- [x] 构建成功
- [x] 应用正常运行
