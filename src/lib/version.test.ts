/**
 * 版本信息模块测试
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import { describe, it, expect } from 'vitest'
import {
  COPYRIGHT,
  AUTHOR,
  EMAIL,
  getVersionString,
  getVersionInfo,
  getCopyrightNotice,
} from './version'

describe('version.ts', () => {
  describe('常量导出', () => {
    it('应该导出正确的版权信息', () => {
      expect(COPYRIGHT).toBe('©2026 IoTchange')
    })

    it('应该导出正确的作者信息', () => {
      expect(AUTHOR).toBe('外星动物（常智）IoTchange')
    })

    it('应该导出正确的邮箱信息', () => {
      expect(EMAIL).toBe('14455975@qq.com')
    })
  })

  describe('getVersionString', () => {
    it('应该返回带 V 前缀的版本字符串', () => {
      const version = getVersionString()
      expect(version).toMatch(/^V\d+\.\d+\.\d+$/)
    })
  })

  describe('getVersionInfo', () => {
    it('应该返回完整的版本信息对象', () => {
      const info = getVersionInfo()
      expect(info).toHaveProperty('version')
      expect(info).toHaveProperty('author')
      expect(info).toHaveProperty('email')
      expect(info).toHaveProperty('copyright')
    })

    it('返回的版本号应该带 V 前缀', () => {
      const info = getVersionInfo()
      expect(info.version).toMatch(/^V\d+\.\d+\.\d+$/)
    })

    it('返回的信息应该与常量一致', () => {
      const info = getVersionInfo()
      expect(info.author).toBe(AUTHOR)
      expect(info.email).toBe(EMAIL)
      expect(info.copyright).toBe(COPYRIGHT)
    })
  })

  describe('getCopyrightNotice', () => {
    it('应该返回格式化的版权声明', () => {
      const notice = getCopyrightNotice()
      expect(notice).toContain(COPYRIGHT)
      expect(notice).toContain(AUTHOR)
    })
  })
})
