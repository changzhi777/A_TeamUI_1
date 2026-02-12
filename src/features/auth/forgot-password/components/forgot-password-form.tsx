import React, { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from '@tanstack/react-router'
import { ArrowRight, Loader2 } from 'lucide-react'
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
import { useAuthStore } from '@/stores/auth-store'

const formSchema = z.object({
  email: z.email({
    error: (iss) => (iss.input === '' ? '请输入您的邮箱' : undefined),
  }),
})

export function ForgotPasswordForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLFormElement>) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)
  const { resetPassword } = useAuthStore()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '' },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)

    // 调用密码重置方法
    const result = await resetPassword(data.email)

    setTimeout(() => {
      setIsLoading(false)

      if (result.success) {
        setIsSent(true)
        toast.success(`重置邮件已发送到 ${data.email}`)
      } else {
        toast.error(result.error || '发送失败，请稍后重试')
      }
    }, 1000)
  }

  if (isSent) {
    return (
      <div className='grid gap-4'>
        <div className='flex flex-col items-center justify-center space-y-2'>
          <div className='text-center space-y-2'>
            <p className='text-sm text-muted-foreground'>
              我们已向您的邮箱发送了密码重置链接，请查收邮件并按照提示重置密码。
            </p>
            <p className='text-sm text-muted-foreground'>
              如果您没有收到邮件，请检查垃圾邮件文件夹。
            </p>
          </div>
          <Button
            variant='link'
            onClick={() => setIsSent(false)}
            className='text-sm'
          >
            返回重新发送
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-2', className)}
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
        <Button className='mt-2' disabled={isLoading}>
          发送重置邮件
          {isLoading ? <Loader2 className='animate-spin' /> : <ArrowRight />}
        </Button>
        <div className='text-center'>
          <Link
            to='/sign-in'
            className='text-sm text-muted-foreground hover:text-primary'
          >
            返回登录
          </Link>
        </div>
      </form>
    </Form>
  )
}
