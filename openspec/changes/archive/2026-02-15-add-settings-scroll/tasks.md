# Tasks

## Task 1: 修改设置页面内容区域滚动样式

**Description**: 修改 `src/features/settings/index.tsx` 中的内容区域容器样式，添加垂直滚动支持。

**Files**:
- `src/features/settings/index.tsx`

**Changes**:
- ✅ 将内容区域 div 的 `overflow-y-hidden` 改为 `overflow-y-auto`
- ✅ 添加 `flex-1` 确保内容区域填充剩余空间

**Verification**:
- [x] 在小窗口下访问 `/settings`，内容可滚动
- [x] 在小窗口下访问 `/settings/account`，内容可滚动
- [x] 在小窗口下访问 `/settings/notifications`，内容可滚动
- [x] 在大窗口下滚动条仅在内容溢出时显示

---

## Task 2: 验证所有设置子页面滚动功能

**Description**: 确认所有设置子页面在内容超出屏幕时都能正常滚动。

**Pages to verify**:
- `/settings` (个人资料)
- `/settings/account` (账户设置)
- `/settings/appearance` (外观设置)
- `/settings/notifications` (通知设置)
- `/settings/display` (显示设置)
- `/settings/api` (API 管理)
- `/settings/api-docs` (API 文档)

**Verification**:
- [x] 所有页面在小窗口下可正常滚动
- [x] 滚动条样式与系统其他区域一致
