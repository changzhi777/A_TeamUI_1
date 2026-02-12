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
import { ForgotPasswordForm } from './components/forgot-password-form'

export function ForgotPassword() {
  return (
    <AuthLayout>
      <Card className='gap-4'>
        <CardHeader>
          <CardTitle className='text-lg tracking-tight'>忘记密码</CardTitle>
          <CardDescription>
            输入您的注册邮箱，我们将发送重置密码的链接给您
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ForgotPasswordForm />
        </CardContent>
        <CardFooter>
          <p className='mx-auto px-8 text-center text-sm text-balance text-muted-foreground'>
            还没有账户？{' '}
            <a
              href='/sign-up'
              className='underline underline-offset-4 hover:text-primary'
            >
              立即注册
            </a>
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  )
}
