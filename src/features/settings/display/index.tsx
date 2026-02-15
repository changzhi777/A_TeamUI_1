/**
 * index
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import { ContentSection } from '../components/content-section'
import { DisplayForm } from './display-form'
import { useI18n } from '@/i18n'

export function SettingsDisplay() {
  const { t } = useI18n()
  return (
    <ContentSection
      title={t.settings.display.title}
      desc={t.settings.display.sidebarDescription}
    >
      <DisplayForm />
    </ContentSection>
  )
}
