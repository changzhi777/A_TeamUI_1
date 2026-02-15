/**
 * api-docs-page
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

/**
 * API Docs Page
 * API 文档页面 - 嵌入后端 Swagger UI
 */

import { useAuthStore } from '@/stores/auth-store'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ExternalLink, FileJson, Book, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

// 后端 API 基础 URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export function ApiDocsPage() {
  const { user } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)
  const [iframeError, setIframeError] = useState(false)

  // API 文档 URLs
  const swaggerUrl = `${API_BASE_URL}/api/docs`
  const openApiJsonUrl = `${API_BASE_URL}/api/docs/openapi.json`

  useEffect(() => {
    // 检查 API 文档服务是否可用
    const checkDocsAvailable = async () => {
      try {
        const response = await fetch(openApiJsonUrl)
        if (!response.ok) {
          setIframeError(true)
        }
      } catch {
        setIframeError(true)
        toast.error('无法连接到 API 文档服务')
      } finally {
        setIsLoading(false)
      }
    }

    checkDocsAvailable()
  }, [openApiJsonUrl])

  // 在新窗口打开 Swagger UI
  const openSwaggerInNewTab = () => {
    window.open(swaggerUrl, '_blank')
  }

  // 下载 OpenAPI JSON
  const downloadOpenApiJson = async () => {
    try {
      const response = await fetch(openApiJsonUrl)
      if (!response.ok) throw new Error('下载失败')

      const data = await response.json()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'openapi.json'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('OpenAPI 规范文件已下载')
    } catch {
      toast.error('下载 OpenAPI 规范文件失败')
    }
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h3 className="text-lg font-medium">API 文档</h3>
        <p className="text-sm text-muted-foreground">
          查看和测试后端 API 接口，下载 OpenAPI 规范文件
        </p>
      </div>

      {/* API 信息卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Book className="h-4 w-4" />
              Swagger UI
            </CardTitle>
            <CardDescription>交互式 API 文档</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={openSwaggerInNewTab} className="w-full">
              <ExternalLink className="h-4 w-4 mr-2" />
              在新窗口打开
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileJson className="h-4 w-4" />
              OpenAPI 规范
            </CardTitle>
            <CardDescription>下载 JSON 格式规范</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={downloadOpenApiJson} className="w-full">
              下载 openapi.json
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">当前用户</CardTitle>
            <CardDescription>认证信息</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              <p>
                <span className="text-muted-foreground">邮箱：</span>
                {user?.email || '未登录'}
              </p>
              <p>
                <span className="text-muted-foreground">角色：</span>
                {user?.role || '-'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 内嵌 Swagger UI */}
      <Card>
        <CardHeader>
          <CardTitle>API 文档预览</CardTitle>
          <CardDescription>
            在此处直接查看和测试 API，或点击上方按钮在新窗口打开
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex h-[600px] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : iframeError ? (
            <div className="flex h-[600px] flex-col items-center justify-center gap-4 text-muted-foreground">
              <p>无法加载嵌入式文档</p>
              <p className="text-sm">请点击"在新窗口打开"按钮访问 API 文档</p>
              <Button onClick={openSwaggerInNewTab}>
                <ExternalLink className="h-4 w-4 mr-2" />
                在新窗口打开 Swagger UI
              </Button>
            </div>
          ) : (
            <iframe
              src={swaggerUrl}
              className="h-[600px] w-full rounded-b-lg border-0"
              title="API Documentation"
            />
          )}
        </CardContent>
      </Card>

      {/* 使用说明 */}
      <Card>
        <CardHeader>
          <CardTitle>使用说明</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">认证方式</h4>
            <p className="text-sm text-muted-foreground">
              大部分 API 需要认证。在 Swagger UI 中点击右上角的 🔒 Authorize 按钮，输入 Bearer Token
              进行认证。
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">测试 API</h4>
            <p className="text-sm text-muted-foreground">
              选择要测试的 API 端点，点击 "Try it out" 按钮，填写参数后点击 "Execute" 执行请求。
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">导出规范</h4>
            <p className="text-sm text-muted-foreground">
              可下载 OpenAPI JSON 规范文件，用于生成客户端 SDK 或导入到其他工具（如 Postman）。
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ApiDocsPage
