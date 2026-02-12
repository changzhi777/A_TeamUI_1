# Implementation Tasks

## Preparation Phase

- [ ] Backup current file structure
- [ ] Create archive directory structure

## Execution Phase

### Step 1: Archive Documentation

- [ ] Create archive/docs/ directory
- [ ] Move documentation files:
  - [ ] BACKEND_ENHANCEMENTS_SUMMARY.md
  - [ ] CHANGELOG.md
  - [ ] CLAUDE.md
  - [ ] DATA_MIGRATION_GUIDE.md
  - [ ] FINAL_PROJECT_REPORT.md
  - [ ] PROJECT_COMPLETE.md
  - [ ] PROJECT_STATUS.md
  - [ ] PROJECT_SUMMARY.md

### Step 2: Archive Reports

- [ ] Create archive/reports/ directory
- [ ] Move or confirm:
  - [ ] test-results.json (if exists)
  - [ ] playwright-report/ directory

### Step 3: Archive Scripts

- [ ] Create archive/scripts/ directory
- [ ] Move script files:
  - [ ] create-db.js
  - [ ] fix-dialog.js
  - [ ] test-db.js

### Step 4: Consolidate Configuration

- [ ] Create .config/ directory
- [ ] Move config files:
  - [ ] eslint.config.js -> .config/
  - [ ] knip.config.ts -> .config/
  - [ ] netlify.toml -> .config/
  - [ ] cz.yaml -> .config/

### Step 5: Cleanup

- [ ] Delete server/ directory (deprecated)

## Validation

- [ ] pnpm run build success
- [ ] pnpm run dev normal startup
- [ ] git status shows clean root directory
