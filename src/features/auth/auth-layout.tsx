/**
 * auth-layout
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import React from 'react'
import { Logo } from '@/assets/logo'
import { getVersionString, COPYRIGHT } from '@/lib/version'

type AuthLayoutProps = {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className='container grid h-svh max-w-none items-center justify-center'>
      <div className='mx-auto flex w-full flex-col justify-center space-y-2 py-8 sm:w-[480px] sm:p-8'>
        <div className='mb-4 flex items-center justify-center'>
          <Logo className='me-2' />
          <h1 className='text-xl font-medium'>帧服了短剧平台</h1>
        </div>
        {children}
        <div className='mt-6 text-center text-xs text-muted-foreground'>
          <p>{COPYRIGHT} | {getVersionString()}</p>
        </div>
      </div>
    </div>
  )
}
