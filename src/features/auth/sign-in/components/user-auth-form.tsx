import React, { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { Loader2, LogIn } from 'lucide-react'
import { toast } from 'sonner'
import { IconFeishu } from '@/assets/brand-icons'
import { useAuthStore, mockLogin } from '@/stores/auth-store'
import { sleep, cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'

const formSchema = z.object({
  email: z.email({
    error: (iss) => (iss.input === '' ? '请输入您的邮箱' : undefined),
  }),
  password: z
    .string()
    .min(1, '请输入您的密码')
    .min(6, '密码至少需要 6 个字符'),
})

interface UserAuthFormProps extends React.HTMLAttributes<HTMLFormElement> {
  redirectTo?: string
}

export function UserAuthForm({
  className,
  redirectTo,
  ...props
}: UserAuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuthStore()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)

    // 使用模拟登录函数
    const result = mockLogin(data.email, data.password, rememberMe)

    sleep(500).then(() => {
      setIsLoading(false)

      if (result.success && result.user && result.tokenInfo) {
        // 登录成功
        login(result.user, result.tokenInfo)

        toast.success(`欢迎回来，${result.user.name}！`)

        // 重定向到存储的位置或默认到项目列表
        const targetPath = redirectTo || '/projects'
        navigate({ to: targetPath, replace: true })
      } else {
        // 登录失败
        toast.error(result.error || '登录失败，请检查您的凭据')
      }
    })
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-3', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>邮箱</FormLabel>
              <FormControl>
                <Input placeholder='name@example.com' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem className='relative'>
              <FormLabel>密码</FormLabel>
              <FormControl>
                <PasswordInput placeholder='********' {...field} />
              </FormControl>
              <FormMessage />
              <Link
                to='/forgot-password'
                className='absolute end-0 -top-0.5 text-sm font-medium text-muted-foreground hover:opacity-75'
              >
                忘记密码？
              </Link>
            </FormItem>
          )}
        />
        <div className='flex items-center space-x-2'>
          <input
            type='checkbox'
            id='remember'
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className='h-4 w-4 rounded border-gray-300'
          />
          <label htmlFor='remember' className='text-sm text-muted-foreground'>
            记住我
          </label>
        </div>
        <Button className='mt-2' disabled={isLoading}>
          {isLoading ? <Loader2 className='animate-spin' /> : <LogIn />}
          登录
        </Button>

        <div className='relative my-2'>
          <div className='absolute inset-0 flex items-center'>
            <span className='w-full border-t' />
          </div>
          <div className='relative flex justify-center text-xs uppercase'>
            <span className='bg-background px-2 text-muted-foreground'>
              或使用以下方式登录
            </span>
          </div>
        </div>

        <div className='grid grid-cols-2 gap-2'>
          <Button variant='outline' type='button' disabled={isLoading}>
            <IconFeishu className='h-4 w-4 mr-2' /> 飞书
          </Button>
          <Button variant='outline' type='button' disabled={isLoading}>
            <IconFeishu className='h-4 w-4 mr-2' /> 飞书
          </Button>
        </div>

        {/* 演示账号提示 */}
        <div className='mt-4 p-3 bg-muted rounded-lg text-xs text-muted-foreground space-y-1'>
          <div className='font-medium'>演示账号：</div>
          <div>超级管理员: root@aizfl.cn / Q1w2e3r4+</div>
          <div>管理员: admin@aizfl.cn / 12345678</div>
          <div>审核: auditor@aizfl.cn / password</div>
          <div>A导演: dy@aizfl.cn / password</div>
          <div>B编剧: bj@aizfl.cn / password</div>
          <div>C剪辑师: jj@aizfl.cn / password</div>
          <div>普通成员: user@aizfl.cn / password</div>
        </div>
      </form>
    </Form>
  )
}
