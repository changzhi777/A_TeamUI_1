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
