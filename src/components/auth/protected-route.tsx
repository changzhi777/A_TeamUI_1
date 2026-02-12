import { Navigate } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import { useEffect } from 'react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
  fallback?: React.ReactNode
}

/**
 * 受保护的路由组件
 * 用于保护需要特定权限才能访问的页面
 */
export function ProtectedRoute({
  children,
  requireAdmin = false,
  fallback,
}: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin } = useAuthStore()

  useEffect(() => {
    // 未登录用户重定向到登录页
    if (!isAuthenticated) {
      return <Navigate to="/sign-in" />
    }

    // 需要管理员权限但用户不是管理员
    if (requireAdmin && !isAdmin()) {
      return <Navigate to="/errors/forbidden" />
    }
  }, [isAuthenticated, isAdmin, requireAdmin])

  // 未登录时显示加载状态或 fallback
  if (!isAuthenticated) {
    return <>{fallback || <div className="flex items-center justify-center min-h-screen">加载中...</div>}</>
  }

  // 需要管理员权限但用户不是管理员
  if (requireAdmin && !isAdmin()) {
    return <>{fallback || <div className="flex items-center justify-center min-h-screen">权限不足</div>}</>
  }

  return <>{children}</>
}
