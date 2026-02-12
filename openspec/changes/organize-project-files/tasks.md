# 实施任务

## 准备阶段

- [ ] 备份当前文件结构

## 执行阶段

### 第一步：创建目录结构

- [ ] 创建 archive/docs/ 目录
- [ ] 创建 archive/reports/ 目录
- [ ] 创建 archive/scripts/ 目录
- [ ] 创建 .config/ 目录

### 第二步：归档文档

- [ ] 移动 BACKEND_ENHANCEMENTS_SUMMARY.md
- [ ] 移动 CHANGELOG.md
- [ ] 移动 CLAUDE.md
- [ ] 移动 DATA_MIGRATION_GUIDE.md
- [ ] 移动 FINAL_PROJECT_REPORT.md
- [ ] 移动 PROJECT_COMPLETE.md
- [ ] 移动 PROJECT_STATUS.md
- [ ] 移动 PROJECT_SUMMARY.md

### 第三步：归档报告

- [ ] 确认并移动 test-results.json
- [ ] 确认并归档 playwright-report/ 目录

### 第四步：归档脚本

- [ ] 移动 create-db.js
- [ ] 移动 fix-dialog.js
- [ ] 移动 test-db.js

### 第五步：移集中配置

- [ ] 移动 eslint.config.js → .config/
- [ ] 移动 knip.config.ts → .config/
- [ ] 移动 netlify.toml → .config/
- [ ] 移动 cz.yaml → .config/

### 第六步：清理废弃目录

- [ ] 删除 server/ 目录

### 第七步：验证

- [ ] 运行 pnpm run build
- [ ] 运行 pnpm run dev
- [ ] 验证根目录整洁
