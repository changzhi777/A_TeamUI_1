/**
 * otp
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import crypto from 'node:crypto'

/**
 * Generate a random base32 secret for OTP
 */
export function generateOtpSecret(): string {
  const buffer = crypto.randomBytes(20)
  const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  let secret = ''

  for (let i = 0; i < buffer.length; i += 5) {
    const quintet = buffer.slice(i, i + 5)
    // Pad last quintet if needed
    const paddedQuintet = Buffer.concat([quintet, Buffer.alloc(5 - quintet.length)])

    // Convert to base32
    const value = (paddedQuintet[0] << 24) |
                 (paddedQuintet[1] << 16) |
                 (paddedQuintet[2] << 8) |
                 paddedQuintet[3]

    for (let j = 0; j < 8; j++) {
      const shift = 28 - (j * 4)
      secret += base32Chars[(value >> shift) & 0x0F]
    }
  }

  return secret
}

/**
 * Generate a time-based OTP code
 * @param secret - Base32 encoded secret
 * @param time - Time in seconds (default: current time / 30)
 * @returns 6-digit OTP code
 */
export function generateOtpCode(secret: string, time?: number): string {
  const epoch = Math.floor(Date.now() / 1000)
  const timeStep = time || Math.floor(epoch / 30)

  // Decode base32 secret
  const secretBytes = base32Decode(secret)

  // Create HMAC
  const hmac = crypto.createHmac('sha1', secretBytes)
  const timeBuffer = Buffer.alloc(8)
  timeBuffer.writeBigInt64BE(BigInt(timeStep))

  hmac.update(timeBuffer)
  const hmacResult = hmac.digest()

  // Dynamic truncation
  const offset = hmacResult[hmacResult.length - 1] & 0x0F
  const code = (
    ((hmacResult[offset] & 0x7F) << 24) |
    ((hmacResult[offset + 1] & 0xFF) << 16) |
    ((hmacResult[offset + 2] & 0xFF) << 8) |
    (hmacResult[offset + 3] & 0xFF)
  ) % 1000000

  return code.toString().padStart(6, '0')
}

/**
 * Verify an OTP code
 * @param secret - Base32 encoded secret
 * @param code - 6-digit code to verify
 * @param window - Number of time steps to check (default: 1, i.e., ±30 seconds)
 * @returns true if code is valid
 */
export function verifyOtpCode(secret: string, code: string, window: number = 1): boolean {
  const epoch = Math.floor(Date.now() / 1000)
  const timeStep = Math.floor(epoch / 30)

  for (let i = -window; i <= window; i++) {
    const generatedCode = generateOtpCode(secret, timeStep + i)
    if (generatedCode === code) {
      return true
    }
  }

  return false
}

/**
 * Decode base32 string to bytes
 */
function base32Decode(str: string): Buffer {
  const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  const cleanStr = str.replace(/[^A-Z2-7]/g, '')

  const bits: string[] = []
  for (const char of cleanStr) {
    const val = base32Chars.indexOf(char)
    if (val === -1) continue

    bits.push(val.toString(2).padStart(5, '0'))
  }

  const bitString = bits.join('')
  const bytes: number[] = []

  for (let i = 0; i + 8 <= bitString.length; i += 8) {
    bytes.push(parseInt(bitString.substring(i, i + 8), 2))
  }

  return Buffer.from(bytes)
}

/**
 * Generate recovery codes for OTP backup
 * @param count - Number of recovery codes to generate (default: 10)
 * @returns Array of recovery codes
 */
export function generateRecoveryCodes(count: number = 10): string[] {
  const codes: string[] = []

  for (let i = 0; i < count; i++) {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase()
    codes.push(`${code.substring(0, 4)}-${code.substring(4, 8)}`)
  }

  return codes
}
