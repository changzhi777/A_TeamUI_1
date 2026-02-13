# 项目文件整理规划

## 概述

整理归纳项目根目录下的非必要文件，将历史文档和临时脚本归档到对应文件夹，保持项目根目录整洁。

## 整理范围

### 需要处理的文件

**历史文档（应归档到 `archive/docs/`）：**
- BACKEND_ENHANCEMENTS_SUMMARY.md - 后端功能增强总结
- CHANGELOG.md - 项目变更日志
- CLAUDE.md - 项目文档（如有）
- DATA_MIGRATION_GUIDE.md - 数据迁移指南
- FINAL_PROJECT_REPORT.md - 最终项目报告
- PROJECT_COMPLETE.md - 项目完成报告
- PROJECT_STATUS.md - 项目状态
- PROJECT_SUMMARY.md - 项目摘要

**配置文件（应移到 `.config/`）：**
- eslint.config.js
- knip.config.ts
- netlify.toml
- cz.yaml

**临时脚本（应归档到 `archive/scripts/`）：**
- create-db.js
- fix-dialog.js
- test-db.js

**需要删除的目录/文件：**
- server/ - 已废弃的服务端代码目录

## 设计方案

### 目录结构

```
项目根目录/
├── .config/              # 集中的配置文件
├── archive/              # 归档目录
│   ├── docs/          # 历史文档
│   ├── reports/       # 历史报告
│   └── scripts/      # 历史脚本
├── docs/                 # 活跃项目文档（保留）
├── src/                  # 源代码（保留）
└── [其他标准项目文件]
```

### 实施步骤

1. **创建目录结构**
   - 创建 `archive/docs/`、`archive/reports/`、`archive/scripts/`、`.config/` 目录

2. **归档历史文档**
   - 移动以下文件到 `archive/docs/`：
     - BACKEND_ENHANCEMENTS_SUMMARY.md
     - CHANGELOG.md
     - DATA_MIGRATION_GUIDE.md
     - FINAL_PROJECT_REPORT.md
     - PROJECT_COMPLETE.md
     - PROJECT_STATUS.md
     - PROJECT_SUMMARY.md

3. **归档测试报告**
   - 移动或确认 `test-results.json` 到 `archive/reports/`（如果存在）
   - 移动或归档 `playwright-report/` 目录

4. **归档临时脚本**
   - 移动以下文件到 `archive/scripts/`：
     - create-db.js
     - fix-dialog.js
     - test-db.js

5. **移集中配置文件**
   - 移动以下文件到 `.config/` 目录：
     - eslint.config.js → `.config/eslint.config.js`
     - knip.config.ts → `.config/knip.config.ts`
     - netlify.toml → `.config/netlify.toml`
     - cz.yaml → `.config/cz.yaml`

6. **删除废弃目录**
   - 删除 `server/` 目录及其所有内容

7. **清理根目录**
   - 验证根目录只包含必要文件和文件夹
   - 确保项目可正常构建和运行

## 影响范围

- 项目根目录结构
- 配置文件管理方式
- 不影响 src/、openspec/ 等核心目录

## 验证标准

- 项目可正常构建：`pnpm run build`
- 项目可正常启动：`pnpm run dev`
- 根目录整洁：无散乱的历史文档和配置文件
