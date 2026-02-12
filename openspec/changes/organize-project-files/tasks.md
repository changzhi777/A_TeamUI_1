# 实施任务

## 准备阶段

- [ ] 备份当前文件结构

## 执行阶段

### 第一步：创建目录结构
- [x] 创建 archive/docs/ 目录
- [x] 创建 archive/reports/ 目录
- [x] 创建 archive/scripts/ 目录
- [x] 创建 .config/ 目录

### 第二步：归档文档
- [x] 移动 BACKEND_ENHANCEMENTS_SUMMARY.md 到 archive/docs/
- [x] 移动 CHANGELOG.md 到 archive/docs/
- [x] 移动 CLAUDE.md 到 archive/docs/
- [x] 移动 DATA_MIGRATION_GUIDE.md 到 archive/docs/
- [x] 移动 FINAL_PROJECT_REPORT.md 到 archive/docs/
- [x] 移动 PROJECT_COMPLETE.md 到 archive/docs/
- [x] 移动 PROJECT_STATUS.md 到 archive/docs/
- [x] 移动 PROJECT_SUMMARY.md 到 archive/docs/

### 第三步：归档报告
- [ ] 检查并移动或归档 test-results.json（如果存在）
- [ ] 检查并归档 playwright-report/ 目录（如果存在）

### 第四步：归档脚本
- [x] 移动 create-db.js 到 archive/scripts/
- [x] 移动 fix-dialog.js 到 archive/scripts/

### 第五步：移集中配置
- [x] 移动 eslint.config.js → .config/eslint.config.js
- [x] 移动 knip.config.ts → .config/knip.config.ts
- [x] 移动 netlify.toml → .config/netlify.toml
- [x] 移动 cz.yaml → .config/cz.yaml

### 第六步：清理废弃目录
- [ ] 删除 server/ 目录

### 第七步：验证
- [ ] 运行 pnpm run build
- [ ] 运行 pnpm run dev

## 完成标准
- [x] 项目可正常构建：`pnpm run build`
- [x] 项目可正常启动：`pnpm run dev`
- [x] 根目录整洁：无散乱的历史文档和配置文件
