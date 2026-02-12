import { SignJWT, jwtVerify } from 'jose'
import { env } from '../config'
import type { JwtPayload } from '../types'

// Create JWT access token
export async function createAccessToken(payload: JwtPayload): Promise<string> {
  const secret = new TextEncoder().encode(env.jwt.secret)
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(env.jwt.accessExpiry)
    .sign(secret)

  return token
}

// Create JWT refresh token
export async function createRefreshToken(payload: JwtPayload): Promise<string> {
  const secret = new TextEncoder().encode(env.jwt.secret)
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(env.jwt.refreshExpiry)
    .sign(secret)

  return token
}

// Verify JWT token
export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const secret = new TextEncoder().encode(env.jwt.secret)
    const { payload } = await jwtVerify(token, secret)

    return payload as JwtPayload
  } catch (error) {
    console.error('JWT verification failed:', error)
    return null
  }
}

// Extract token from Authorization header
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  return authHeader.substring(7)
}

// Calculate token expiration time
export function getTokenExpirationTime(expiry: string): number {
  const now = Math.floor(Date.now() / 1000)
  let expirySeconds: number

  // Parse expiry string (e.g., "1h", "30d")
  const match = expiry.match(/^(\d+)([hdm])$/)
  if (match) {
    const value = parseInt(match[1])
    const unit = match[2]

    switch (unit) {
      case 'h':
        expirySeconds = value * 60 * 60
        break
      case 'd':
        expirySeconds = value * 24 * 60 * 60
        break
      case 'm':
        expirySeconds = value * 60
        break
      default:
        expirySeconds = value
    }
  } else {
    expirySeconds = 60 * 60 // Default 1 hour
  }

  return (now + expirySeconds) * 1000 // Convert to milliseconds
}

// Check if token is expired
export function isTokenExpired(expiresAt: number): boolean {
  return Date.now() >= expiresAt
}

// Check if token will expire soon (within 5 minutes)
export function isTokenExpiringSoon(expiresAt: number): boolean {
  const fiveMinutes = 5 * 60 * 1000
  return Date.now() >= expiresAt - fiveMinutes
}
