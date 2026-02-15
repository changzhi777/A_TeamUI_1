/**
 * index
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AuthLayout } from '../auth-layout'
import { SignUpForm } from './components/sign-up-form'

export function SignUp(): React.JSX.Element {
  return (
    <AuthLayout>
      <Card className='gap-4'>
        <CardHeader>
          <CardTitle className='text-lg tracking-tight'>注册账户</CardTitle>
          <CardDescription>
            输入您的信息创建一个新账户
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignUpForm />
        </CardContent>
        <CardFooter>
          <p className='px-8 text-center text-sm text-muted-foreground'>
            注册即表示您同意我们的{' '}
            <a
              href='/terms'
              className='underline underline-offset-4 hover:text-primary'
            >
              服务条款
            </a>{' '}
            和{' '}
            <a
              href='/privacy'
              className='underline underline-offset-4 hover:text-primary'
            >
              隐私政策
            </a>
            。
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  )
}
