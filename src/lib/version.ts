/**
 * 版本信息模块
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

/**
 * 从 package.json 获取版本号并格式化
 */
import { version } from '../../package.json'

/**
 * 版权信息
 */
export const COPYRIGHT = '©2026 IoTchange'

/**
 * 作者信息
 */
export const AUTHOR = '外星动物（常智）IoTchange'

/**
 * 联系邮箱
 */
export const EMAIL = '14455975@qq.com'

/**
 * 获取格式化的版本字符串
 * @returns 格式化的版本号，如 "V0.1.0"
 */
export function getVersionString(): string {
  return `V${version}`
}

/**
 * 获取完整版本信息
 * @returns 包含版本号、作者、版权的完整信息
 */
export function getVersionInfo(): {
  version: string
  author: string
  email: string
  copyright: string
} {
  return {
    version: getVersionString(),
    author: AUTHOR,
    email: EMAIL,
    copyright: COPYRIGHT,
  }
}

/**
 * 获取版权声明文本
 * @returns 完整的版权声明
 */
export function getCopyrightNotice(): string {
  return `${COPYRIGHT} | ${AUTHOR}`
}
