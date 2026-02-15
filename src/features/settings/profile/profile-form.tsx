/**
 * profile-form
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import { z } from 'zod'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from '@tanstack/react-router'
import { showSubmittedData } from '@/lib/show-submitted-data'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useI18n } from '@/i18n'
import { useAuthStore } from '@/stores/auth-store'
import { useEffect } from 'react'

const profileFormSchema = z
  .object({
    username: z
      .string('请输入用户名')
      .min(2, '用户名至少需要 2 个字符')
      .max(30, '用户名不能超过 30 个字符'),
    email: z.email({
      error: () => '请选择要显示的已验证邮箱',
    }),
    bio: z.string().max(160).min(4),
    urls: z
      .array(
        z.object({
          value: z.url('请输入有效的网址'),
        })
      )
      .optional(),
  })
  .refine((data) => data.email !== undefined, {
    message: '请选择要显示的邮箱',
    path: ['email'],
  })

type ProfileFormValues = z.infer<typeof profileFormSchema>

export function ProfileForm() {
  const { t } = useI18n()
  const user = useAuthStore((state) => state.user)
  const updateProfile = useAuthStore((state) => state.updateProfile)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    mode: 'onChange',
  })

  const { fields, append } = useFieldArray({
    name: 'urls',
    control: form.control,
  })

  useEffect(() => {
    if (user) {
      form.reset({
        username: user.name,
        email: user.email,
        bio: user.bio || '',
        urls: [],
      })
    }
  }, [user, form])

  const handleSubmit = (data: ProfileFormValues) => {
    updateProfile({
      name: data.username,
      email: data.email,
      bio: data.bio,
    })
    showSubmittedData(data)
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className='space-y-8'
      >
        <FormField
          control={form.control}
          name='username'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.settings.profile.username}</FormLabel>
              <FormControl>
                <Input placeholder={t.settings.profile.usernamePlaceholder} {...field} />
              </FormControl>
              <FormDescription>
                {t.settings.profile.usernameDescription}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.settings.profile.email}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t.settings.profile.emailPlaceholder} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={user?.email || ''}>{user?.email || 'user@example.com'}</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                {t.settings.profile.emailDescription}{' '}
                <Link to='/settings'>{t.settings.profile.email}</Link>.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='bio'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.settings.profile.bio}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t.settings.profile.bioPlaceholder}
                  className='resize-none'
                  {...field}
                />
              </FormControl>
              <FormDescription>
                {t.settings.profile.bioDescription}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div>
          {fields.map((field, index) => (
            <FormField
              control={form.control}
              key={field.id}
              name={`urls.${index}.value`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={cn(index !== 0 && 'sr-only')}>
                    {t.settings.profile.urls}
                  </FormLabel>
                  <FormDescription className={cn(index !== 0 && 'sr-only')}>
                    {t.settings.profile.urlsDescription}
                  </FormDescription>
                  <FormControl className={cn(index !== 0 && 'mt-1.5')}>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
          <Button
            type='button'
            variant='outline'
            size='sm'
            className='mt-2'
            onClick={() => append({ value: '' })}
          >
            {t.settings.profile.addUrl}
          </Button>
        </div>
        <Button type='submit'>{t.settings.profile.updateProfile}</Button>
      </form>
    </Form>
  )
}
