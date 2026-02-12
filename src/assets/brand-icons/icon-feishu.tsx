import React from 'react'
import { type SVGProps } from 'react'
import { cn } from '@/lib/utils'

export function IconFeishu({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      role='img'
      viewBox='0 0 24 24'
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      className={cn('[&>path]:stroke-current', className)}
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      {...props}
    >
      <title>飞书</title>
      <path strokeWidth='0' d='M0 0h24v24H0z' fill='none' />
      <path d='M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 7v10l10 5V12M12 12v10l10-5V7' />
    </svg>
  )
}
