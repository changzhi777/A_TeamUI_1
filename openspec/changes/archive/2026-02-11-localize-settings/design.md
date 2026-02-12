# localize-settings 设计

## 翻译范围设计

### 设置页面主页面

**文件**: `src/features/settings/index.tsx`

需要翻译的内容：
- 页面标题: "Settings" → "设置"
- 页面描述: "Manage your account settings and set e-mail preferences." → "管理您的账户设置和电子邮件首选项。"

### 导航菜单

**文件**: `src/features/settings/index.tsx` 中的 `sidebarNavItems`

需要翻译的导航项：
- "Profile" → "个人资料"
- "Account" → "账户"
- "Appearance" → "外观"
- "Notifications" → "通知"
- "Display" → "显示"

### 个人资料表单

**文件**: `src/features/settings/profile/profile-form.tsx`

需要翻译的内容：
- 表单标签: Username, Email, Bio, URLs
- 表单描述: 各种字段的描述文本
- 占位符文本: 输入框的占位符
- 验证消息: Zod schema 的错误消息
- 按钮文本: "Update profile" → "更新个人资料"

### 账户设置表单

**文件**: `src/features/settings/account/account-form.tsx`

需要翻译的内容：
- 表单标签: Name, Date of birth, Language
- 表单描述: 各种字段的描述文本
- 占位符文本: 输入框的占位符
- 语言选项: English, French, German, Spanish, Portuguese, Russian, Japanese, Korean, Chinese
- 验证消息: Zod schema 的错误消息
- 按钮文本: "Update account" → "更新账户"

### 外观设置表单

**文件**: `src/features/settings/appearance/appearance-form.tsx`

需要翻译的内容：
- 表单标签: Font, Theme
- 表单描述: 各种字段的描述文本
- 主题选项: Light → "浅色", Dark → "深色"
- 验证消息: Zod schema 的错误消息
- 按钮文本: "Update preferences" → "更新首选项"

### 通知设置表单

**文件**: `src/features/settings/notifications/notifications-form.tsx`

需要翻译的内容：
- 表单标签: Notify me about..., Email Notifications
- 表单描述: 各种字段的描述文本
- 通知类型选项: All new messages, Direct messages and mentions, Nothing
- 邮件通知类型: Communication emails, Marketing emails, Social emails, Security emails
- 验证消息: Zod schema 的错误消息
- 按钮文本: "Update notifications" → "更新通知"

### 显示设置表单

**文件**: `src/features/settings/display/display-form.tsx`

需要翻译的内容：
- 表单标签: Sidebar
- 表单描述: 各种字段的描述文本
- 侧边栏项目: Recents, Home, Applications, Desktop, Downloads, Documents
- 验证消息: Zod schema 的错误消息
- 按钮文本: "Update display" → "更新显示"

## 国际化设计

### 翻译键命名规范

使用嵌套结构组织设置相关的翻译：

```typescript
settings: {
  title: '设置',
  description: '管理您的账户设置和电子邮件首选项。',

  // 导航菜单
  nav: {
    profile: '个人资料',
    account: '账户',
    appearance: '外观',
    notifications: '通知',
    display: '显示',
  },

  // 个人资料
  profile: {
    username: '用户名',
    email: '邮箱',
    bio: '个人简介',
    urls: '网址',
    // ...
  },

  // 账户
  account: {
    name: '姓名',
    dob: '出生日期',
    language: '语言',
    // ...
  },

  // 外观
  appearance: {
    font: '字体',
    theme: '主题',
    themeLight: '浅色',
    themeDark: '深色',
    // ...
  },

  // 通知
  notifications: {
    emailNotifications: '邮件通知',
    communicationEmails: '通信邮件',
    marketingEmails: '营销邮件',
    socialEmails: '社交邮件',
    securityEmails: '安全邮件',
    // ...
  },

  // 显示
  display: {
    sidebar: '侧边栏',
    recents: '最近',
    home: '主页',
    applications: '应用程序',
    desktop: '桌面',
    downloads: '下载',
    documents: '文档',
    // ...
  },
}
```

## 表单验证消息设计

### Zod 验证消息翻译

所有 Zod schema 的验证消息需要使用中文。对于动态消息，需要使用自定义错误函数：

```typescript
// 之前（英文）
const profileFormSchema = z.object({
  username: z
    .string('Please enter your username.')
    .min(2, 'Username must be at least 2 characters.')
    .max(30, 'Username must not be longer than 30 characters.'),
})

// 之后（中文）
const profileFormSchema = z.object({
  username: z
    .string('请输入用户名。')
    .min(2, '用户名至少需要 2 个字符。')
    .max(30, '用户名不能超过 30 个字符。'),
})
```

### 使用国际化验证消息

对于需要使用 i18n 的验证消息，可以通过表单组件的 `t` 函数获取翻译：

```typescript
const { t } = useI18n()

const profileFormSchema = z.object({
  username: z
    .string()
    .min(2, t.settings.profile.usernameTooShort)
    .max(30, t.settings.profile.usernameTooLong),
})
```

## 技术决策

### 决策1: 翻译存储位置

**选择**: 将所有设置相关翻译存储在 `src/i18n/zh-CN.ts` 的 `settings` 命名空间下

**原因**:
- 与现有的国际化结构保持一致
- 便于维护和查找
- 支持未来扩展其他语言

### 决策2: 表单验证消息翻译方式

**选择**: 直接在 Zod schema 中使用中文字符串

**原因**:
- 简单直接，不需要额外的国际化逻辑
- 验证消息通常是固定的，不需要动态切换语言
- 减少运行时的国际化查找开销

**替代方案**: 使用 i18n 函数获取验证消息
- 被拒绝：增加了复杂性，而当前项目主要针对中文用户

### 决策3: 组件更新策略

**选择**: 逐个组件更新，每个组件独立测试

**原因**:
- 降低风险，便于定位问题
- 可以逐步验证翻译质量
- 支持分阶段发布

## 兼容性设计

### 向后兼容

- 现有的英文文本不会立即删除，作为后备
- 如果翻译键不存在，可以显示原始英文文本
- 确保表单功能不受翻译影响

### 渐进式增强

- 优先翻译用户可见的文本（标题、标签、按钮）
- 其次翻译描述性文本
- 最后翻译占位符和辅助文本

## 测试策略

### 单元测试

- 测试每个翻译键是否正确定义
- 测试表单验证消息是否正确显示

### 集成测试

- 测试设置页面是否正确加载中文文本
- 测试表单提交是否正常工作
- 测试表单验证是否正确显示中文错误消息

### 视觉回归测试

- 验证翻译后的文本是否超出布局边界
- 验证文本换行是否合理
- 验证移动端显示效果
