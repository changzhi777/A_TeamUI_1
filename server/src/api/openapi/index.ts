/**
 * OpenAPI Hono 实例配置
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import { OpenAPIHono, createRoute } from '@hono/zod-openapi'
import { apiReference } from '@scalar/hono-api-reference'
import { z } from 'zod'
import { env } from '../../config'
import { openApiDocument } from './document'

// 导出 OpenAPI 文档
export { openApiDocument }

// 创建带有默认配置的 OpenAPI Hono 实例
export const openApiApp = new OpenAPIHono({
  defaultHook: (result, c) => {
    if (!result.success) {
      return c.json({ success: false, error: 'Validation Error', details: result.error }, 400)
    }
  },
})

// 挂载 Scalar API Reference UI
export function setupSwaggerUI(app: OpenAPIHono) {
  // Scalar API Reference UI
  app.get(
    '/docs',
    apiReference({
      spec: {
        url: '/api/docs/openapi.json',
      },
      theme: 'purple',
      title: '帧服了短剧平台 API 文档',
      // 自定义配置
      configuration: {
        // 隐藏模型选择器
        hideModels: false,
        // 显示侧边栏
        hideSidebar: false,
        // 深色模式
        darkMode: true,
      },
    })
  )

  // OpenAPI JSON 导出
  app.get('/docs/openapi.json', (c) => {
    return c.json(openApiDocument)
  })
}

// 导出工具函数
export { createRoute, z }
export type { OpenAPIHono }
