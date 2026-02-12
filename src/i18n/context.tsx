import { createContext, useContext, type ReactNode } from 'react'
import zhCN, { type Translations } from './zh-CN'

interface I18nContextValue {
  t: Translations
  locale: string
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined)

export interface I18nProviderProps {
  children: ReactNode
  locale?: string
  translations?: Translations
}

export function I18nProvider({
  children,
  locale = 'zh-CN',
  translations = zhCN,
}: I18nProviderProps) {
  const value: I18nContextValue = {
    t: translations,
    locale,
  }

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}

// 便捷函数，用于在组件外部获取翻译
export function getTranslations(): Translations {
  return zhCN
}
