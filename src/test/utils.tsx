/**
 * React 测试工具函数
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import React, { type ReactElement } from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'

/**
 * 测试包装器 Props
 */
interface WrapperProps {
  children: React.ReactNode
}

/**
 * 创建测试包装器
 */
function createWrapper(): React.FC<WrapperProps> {
  return function Wrapper({ children }: WrapperProps) {
    return <BrowserRouter>{children}</BrowserRouter>
  }
}

/**
 * 自定义 render 函数，包含常用 Provider
 */
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: createWrapper(), ...options })
}

/**
 * 等待指定毫秒数
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * 创建 mock 函数
 */
export { vi } from 'vitest'

// 重新导出 testing-library 的所有内容
export * from '@testing-library/react'
export { customRender as render }
