import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import type {
  ApiResponse,
  LoginRequest,
  RefreshTokenRequest,
  TokenResponse,
} from '../types/api'
import { createAxiosRetryInterceptor } from '../utils/retry'

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      try {
        const parsedToken = JSON.parse(token)
        config.headers.Authorization = `Bearer ${parsedToken}`
      } catch {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: number }

    // Token expired, try to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem('refresh_token')

      if (refreshToken) {
        try {
          // Parse refresh token
          let parsedRefreshToken = refreshToken
          try {
            parsedRefreshToken = JSON.parse(refreshToken)
          } catch {}

          // Attempt to refresh
          const refreshData: RefreshTokenRequest = {
            refreshToken: parsedRefreshToken,
          }

          const response = await axios.post<TokenResponse>(
            `${API_BASE_URL}/auth/refresh`,
            refreshData
          )

          const { accessToken, refreshToken: newRefreshToken, expiresAt } = response.data

          // Store new tokens
          localStorage.setItem('access_token', JSON.stringify(accessToken))
          localStorage.setItem('refresh_token', JSON.stringify(newRefreshToken))
          localStorage.setItem('token_expires_at', expiresAt.toString())

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          originalRequest._retry = true
          return apiClient(originalRequest)
        } catch (refreshError) {
          // Refresh failed, logout user
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          localStorage.removeItem('token_expires_at')
          localStorage.removeItem('auth-storage') // Clear zustand persist

          // Redirect to login
          window.location.href = '/login'
          return Promise.reject(refreshError)
        }
      }
    }

    // Try retry with exponential backoff for other errors
    const retryInterceptor = createAxiosRetryInterceptor({
      maxRetries: 3,
      retryDelay: 1000, // 1 second base delay
      onRetry: (retryCount, err) => {
        console.warn(`API request failed (attempt ${retryCount}):`, err.message)
      },
    })

    return retryInterceptor.onReject(error)
  }
)

// Helper function to get token from storage
function getStoredToken(key: 'access_token' | 'refresh_token'): string | null {
  const token = localStorage.getItem(key)
  if (!token) return null

  try {
    return JSON.parse(token)
  } catch {
    return token
  }
}

// Helper function to set token
function setStoredToken(key: 'access_token' | 'refresh_token', value: string): void {
  localStorage.setItem(key, JSON.stringify(value))
}

// API Client class
export class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = apiClient
  }

  // Generic request method
  private async request<T>(
    method: 'get' | 'post' | 'put' | 'delete',
    url: string,
    data?: unknown,
    config?: InternalAxiosRequestConfig
  ): Promise<T> {
    try {
      const response = await this.client.request<ApiResponse<T>>({
        method,
        url,
        data,
        ...config,
      })

      if (!response.data.success) {
        throw new Error(response.data.error || 'Request failed')
      }

      return response.data.data as T
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiResponse>
        const message =
          axiosError.response?.data?.error ||
          axiosError.message ||
          'An error occurred'

        throw new Error(message)
      }
      throw error
    }
  }

  // GET request
  async get<T>(url: string, config?: InternalAxiosRequestConfig): Promise<T> {
    return this.request<T>('get', url, undefined, config)
  }

  // POST request
  async post<T>(url: string, data?: unknown): Promise<T> {
    return this.request<T>('post', url, data)
  }

  // PUT request
  async put<T>(url: string, data?: unknown): Promise<T> {
    return this.request<T>('put', url, data)
  }

  // DELETE request
  async delete<T>(url: string): Promise<T> {
    return this.request<T>('delete', url)
  }

  // Set auth token
  setAuthToken(token: string): void {
    setStoredToken('access_token', token)
  }

  // Set refresh token
  setRefreshToken(token: string): void {
    setStoredToken('refresh_token', token)
  }

  // Clear auth tokens
  clearTokens(): void {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('token_expires_at')
  }

  // Get current access token
  getAccessToken(): string | null {
    return getStoredToken('access_token')
  }
}

// Export singleton instance
export const api = new ApiClient()

// Export API base URL for WebSocket connection
export function getWsUrl(): string {
  const wsProtocol = API_BASE_URL.startsWith('https') ? 'wss://' : 'ws://'
  const apiUrl = API_BASE_URL.replace(/^https?:\/\//, '').replace(/^http?:\/\//, '')
  return `${wsProtocol}${apiUrl.replace('/api', '')}/ws`
}

export function getApiUrl(): string {
  return API_BASE_URL
}
