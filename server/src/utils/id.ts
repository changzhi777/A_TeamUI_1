/**
 * id
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import { nanoid } from 'nanoid'

// Generate a unique ID
export function generateId(prefix = ''): string {
  const id = nanoid()
  return prefix ? `${prefix}_${id}` : id
}

// Generate a user ID
export function generateUserId(): string {
  return generateId('user')
}

// Generate a project ID
export function generateProjectId(): string {
  return generateId('proj')
}

// Generate a shot ID
export function generateShotId(): string {
  return generateId('shot')
}

// Generate a session ID
export function generateSessionId(): string {
  return generateId('session')
}
