/**
 * auth
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import { api } from './client'
import type { LoginRequest, TokenResponse } from '../types/api'

// Auth API endpoints
export const authApi = {
  /**
   * User login
   */
  async login(credentials: LoginRequest): Promise<TokenResponse> {
    return api.post<TokenResponse>('/auth/login', credentials)
  },

  /**
   * User registration
   */
  async register(data: {
    name: string
    email: string
    password: string
  }): Promise<TokenResponse> {
    return api.post<TokenResponse>('/auth/register', data)
  },

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    return api.post<TokenResponse>('/auth/refresh', { refreshToken })
  },

  /**
   * User logout
   */
  async logout(): Promise<void> {
    return api.post<void>('/auth/logout')
  },

  /**
   * Request password reset
   */
  async forgotPassword(email: string): Promise<void> {
    return api.post<void>('/auth/forgot-password', { email })
  },

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    return api.post<void>('/auth/reset-password', { token, newPassword })
  },

  /**
   * Get active sessions
   */
  async getSessions(): Promise<
    Array<{
      id: string
      device: string
      browser: string
      location: string
      ip: string
      createdAt: string
      lastActive: string
      isCurrent: boolean
    }>
  > {
    return api.get('/auth/sessions')
  },

  /**
   * Revoke a session
   */
  async revokeSession(sessionId: string): Promise<void> {
    return api.delete<void>(`/auth/sessions/${sessionId}`)
  },

  /**
   * Get current user info
   */
  async getCurrentUser(): Promise<{
    id: string
    name: string
    email: string
    role: string
    avatar?: string
    phone?: string
    bio?: string
    isEmailVerified: boolean
    isOtpEnabled: boolean
    createdAt: string
  }> {
    return api.get('/users/me')
  },

  /**
   * Update current user info
   */
  async updateProfile(data: {
    name?: string
    email?: string
    phone?: string
    bio?: string
  }): Promise<void> {
    return api.put<void>('/users/me', data)
  },

  /**
   * Change password
   */
  async changePassword(data: {
    oldPassword: string
    newPassword: string
  }): Promise<void> {
    return api.put<void>('/users/me/password', data)
  },

  /**
   * Get login history
   */
  async getLoginHistory(): Promise<
    Array<{
      id: string
      timestamp: string
      device: string
      browser: string
      location: string
      ip: string
      isAnomalous: boolean
    }>
  > {
    return api.get('/users/me/history')
  },

  /**
   * Send OTP verification code
   */
  async sendOtp(): Promise<void> {
    return api.post<void>('/users/me/otp/send')
  },

  /**
   * Verify OTP code
   */
  async verifyOtp(code: string): Promise<void> {
    return api.post<void>('/users/me/otp/verify', { code })
  },

  /**
   * Enable OTP two-factor authentication
   */
  async enableOtp(code: string): Promise<{ recoveryCodes: string[] }> {
    return api.post<{ recoveryCodes: string[] }>('/users/me/otp/enable', { code })
  },

  /**
   * Disable OTP two-factor authentication
   */
  async disableOtp(): Promise<void> {
    return api.delete<void>('/users/me/otp/disable')
  },
}
