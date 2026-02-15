/**
 * 版本信息显示组件
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import { getVersionInfo, getCopyrightNotice } from '@/lib/version'

export function VersionInfo() {
  const versionInfo = getVersionInfo()

  return (
    <div className='mt-8 space-y-2 rounded-lg border p-4 text-sm text-muted-foreground'>
      <div className='flex items-center justify-between'>
        <span className='font-medium'>软件版本</span>
        <span className='font-mono'>{versionInfo.version}</span>
      </div>
      <div className='flex items-center justify-between'>
        <span className='font-medium'>版权所有</span>
        <span>{versionInfo.copyright}</span>
      </div>
      <div className='flex items-center justify-between'>
        <span className='font-medium'>作者</span>
        <span>{versionInfo.author}</span>
      </div>
      <div className='flex items-center justify-between'>
        <span className='font-medium'>联系邮箱</span>
        <a
          href={`mailto:${versionInfo.email}`}
          className='text-primary hover:underline'
        >
          {versionInfo.email}
        </a>
      </div>
    </div>
  )
}

/**
 * 简洁版版权信息（用于页面底部）
 */
export function CopyrightFooter() {
  return (
    <div className='mt-auto border-t pt-4 text-center text-xs text-muted-foreground'>
      <p>{getCopyrightNotice()}</p>
    </div>
  )
}
