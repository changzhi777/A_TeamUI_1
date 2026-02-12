# 整理项目根目录

## 概述

清理项目根目录，保持整洁并归档非必要文件到对应文件夹。

## 动机

- **整洁性**：根目录包含大量过时文档和临时文件
- **可维护性**：配置文件分散，难以统一管理
- **清晰性**：server/ 目录已废弃但未删除

## 设计方案

### 目录结构

```
/
├── .config/              # 新建：整合的配置文件
├── archive/              # 扩展现有：归档目录
│   ├── docs/          # 文档归档
│   ├── reports/       # 报告归档
│   └── scripts/      # 脚本归档
├── docs/                 # 项目文档（保留）
└── [标准项目文件保持不变]
```

### 归档计划

#### archive/docs/
- BACKEND_ENHANCEMENTS_SUMMARY.md
- CHANGELOG.md
- CLAUDE.md（如果不需要在根目录）
- DATA_MIGRATION_GUIDE.md
- FINAL_PROJECT_REPORT.md
- PROJECT_COMPLETE.md
- PROJECT_STATUS.md
- PROJECT_SUMMARY.md

#### archive/reports/
- test-results.json（如果有）
- playwright-report/ 整个目录

#### archive/scripts/
- create-db.js
- fix-dialog.js
- test-db.js

#### .config/（新建）
- eslint.config.js
- knip.config.ts
- netlify.toml
- cz.yaml

### 删除计划
- server/ 目录（已迁移到本地 MySQL）

## 影响范围

- 项目根目录
- 配置文件结构
- 不影响 src/、public/、openspec/ 等核心目录
