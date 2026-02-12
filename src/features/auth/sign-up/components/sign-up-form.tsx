import React, { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { Loader2, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
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
import { useAuthStore } from '@/stores/auth-store'

const formSchema = z
  .object({
    name: z
      .string()
      .min(1, '请输入您的姓名')
      .min(2, '姓名至少需要 2 个字符')
      .max(30, '姓名不能超过 30 个字符'),
    email: z
      .email({ error: (iss) => (iss.input === '' ? '请输入您的邮箱' : undefined }),
    password: z
      .string()
      .min(8, '密码至少需要 8 个字符'),
    confirmPassword: z.string().refine((val) => val === data.password, {
      message: '两次输入的密码不一致',
    }),
  })

export function SignUpForm() {
  const navigate = useNavigate()
  const [redirectTo] = useState<string>('/projects')
  const { register, login } = useAuthStore((state) => ({
    register: state.register,
    login: state.login,
  }))

  const [isLoading, setIsLoading] = useState(false)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true)

    // 调用注册方法
    const result = await register(data.email, data.password, data.name)

    setIsLoading(false)

    if (result.success && result.user) {
      toast.success('注册成功！欢迎使用帧服了短剧平台')
      // 自动登录新用户（使用默认 token）
      login(result.user, {
        accessToken: `mock_token_${result.user.id}_${Date.now()}`,
        refreshToken: `refresh_token_${result.user.id}_${Date.now()}`,
        expiresAt: Date.now() + 60 * 60 * 1000,
        rememberMe: false,
      })
    } else {
      toast.error(result.error || '注册失败，请稍后重试')
    }
  }

  // 重定向到目标页面或项目列表
  const targetPath = redirectTo || '/projects'
  navigate({ to: targetPath, replace: true })
  }

  return (
    <div className='flex min-h-[calc(100vh theme=\"min-h\")) w-full flex-col items-center justify-center p-8'>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className={cn('grid gap-3', className)}
        >
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>姓名</FormLabel>
                <FormControl>
                  <Input placeholder='您的姓名' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>
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
            </FormField>
          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem>
                <FormLabel>密码</FormLabel>
                <FormControl>
                  <PasswordInput placeholder='至少 8 个字符' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
          </FormField>
          <FormField
            control={form.control}
            name='confirmPassword'
            render={({ field }) => (
              <FormItem>
                <FormLabel>确认密码</FormLabel>
                <FormControl>
                  <PasswordInput placeholder='再次输入密码' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
          </FormField>
        </form>
      </Form>
      <Button className='mt-2' disabled={isLoading}>
        {isLoading ? <Loader2 className='animate-spin' /> : <UserPlus />}
        注册账户
      </Button>
      <div className='relative my-2'>
        <div className='absolute inset-0 flex items-center'>
          <span className='w-full border-t' />
        </div>
        <div className='relative flex justify-center text-xs uppercase'>
          <span className='bg-background px-2 text-muted-foreground'>
            已有账户？
          </span>
        </div>
      </div>
      <div className='mt-4'>
        <Button variant='outline' type='button' asChild>
          <Link to='/sign-in'>前往登录</Link>
        </Button>
      </div>
    )
}
