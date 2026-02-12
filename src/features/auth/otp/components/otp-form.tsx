import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from '@/components/ui/input-otp'
import { useAuthStore } from '@/stores/auth-store'

const formSchema = z.object({
  otp: z
    .string()
    .min(6, '请输入 6 位验证码')
    .max(6, '请输入 6 位验证码'),
})

type OtpFormProps = React.HTMLAttributes<HTMLFormElement> & {
  type?: 'verify' | 'enable'
}

export function OtpForm({ className, type = 'verify', ...props }: OtpFormProps) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const [canResend, setCanResend] = useState(false)

  const { sendOtp, verifyOtp, enableOtp, login, user } = useAuthStore()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { otp: '' },
  })

  const otp = form.watch('otp')

  // 倒计时效果
  useState(() => {
    if (countdown > 0 && !canResend) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  })

  const handleResend = () => {
    const result = sendOtp()
    if (result.success) {
      setCountdown(60)
      setCanResend(false)
      toast.success('验证码已发送')
    } else {
      toast.error(result.error || '发送失败')
    }
  }

  function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)

    if (type === 'enable') {
      // 启用 OTP
      const result = enableOtp(data.otp)

      setTimeout(() => {
        setIsLoading(false)

        if (result.success) {
          toast.success('双因素认证已启用')
          if (result.recoveryCodes) {
            toast.info('请保存您的恢复码：' + result.recoveryCodes.join(', '))
          }
          form.reset()
        } else {
          toast.error(result.error || '验证失败')
        }
      }, 500)
    } else {
      // 验证 OTP
      const result = verifyOtp(data.otp)

      setTimeout(() => {
        setIsLoading(false)

        if (result.success) {
          toast.success('验证成功')
          // 登录成功，跳转到首页
          if (user) {
            login(user, {
              accessToken: `mock_token_${user.id}_${Date.now()}`,
              refreshToken: `refresh_token_${user.id}_${Date.now()}`,
              expiresAt: Date.now() + 60 * 60 * 1000,
              rememberMe: false,
            })
          }
          navigate({ to: '/projects' })
        } else {
          toast.error(result.error || '验证码错误')
        }
      }, 500)
    }
  }

  return (
    <div className={cn('grid gap-4', className)}>
      <div className='flex flex-col space-y-2 text-center'>
        <h3 className='text-2xl font-bold tracking-tight'>
          {type === 'enable' ? '启用双因素认证' : '验证您的身份'}
        </h3>
        <p className='text-sm text-muted-foreground'>
          {type === 'enable'
            ? '输入验证码以启用双因素认证'
            : '我们已向您的邮箱发送了 6 位验证码'}
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className={cn('grid gap-4', className)}
          {...props}
        >
          <FormField
            control={form.control}
            name='otp'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='sr-only'>验证码</FormLabel>
                <FormControl>
                  <InputOTP
                    maxLength={6}
                    {...field}
                    containerClassName='justify-between sm:[&>[data-slot="input-otp-group"]>div]:w-12'
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className='flex items-center justify-between text-sm'>
            <span className='text-muted-foreground'>
              {canResend ? (
                <button
                  type='button'
                  onClick={handleResend}
                  className='text-primary hover:underline'
                >
                  重新发送验证码
                </button>
              ) : (
                <span>重新发送 ({countdown}s)</span>
              )}
            </span>
          </div>

          <Button type='submit' disabled={otp.length < 6 || isLoading}>
            {isLoading ? <Loader2 className='animate-spin' /> : '验证'}
          </Button>
        </form>
      </Form>

      {type !== 'enable' && (
        <div className='text-center'>
          <Link
            to='/sign-in'
            className='text-sm text-muted-foreground hover:text-primary'
          >
            返回登录
          </Link>
        </div>
      )}
    </div>
  )
}
