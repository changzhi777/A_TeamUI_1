import { createWriteStream } from 'fs'
import { join } from 'path'

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: string
  data?: unknown
  error?: Error
}

class Logger {
  private readonly logsDir: string
  private streams: Map<string, ReturnType<typeof createWriteStream>> = new Map()
  private readonly isProduction: boolean

  constructor() {
    this.logsDir = join(process.cwd(), 'logs')
    this.isProduction = process.env.NODE_ENV === 'production'

    // Create log streams
    this.createStream('app.log')
    this.createStream('error.log')
  }

  private createStream(filename: string) {
    if (this.isProduction) {
      const stream = createWriteStream(join(this.logsDir, filename), { flags: 'a' })
      this.streams.set(filename, stream)
    }
  }

  private write(entry: LogEntry): void {
    const logLine = JSON.stringify(entry)

    // Console output with colors
    const colors = {
      [LogLevel.DEBUG]: '\x1b[36m', // Cyan
      [LogLevel.INFO]: '\x1b[32m', // Green
      [LogLevel.WARN]: '\x1b[33m', // Yellow
      [LogLevel.ERROR]: '\x1b[31m', // Red
    }
    const reset = '\x1b[0m'
    const color = colors[entry.level] || ''

    console.log(`${color}[${entry.level}]${reset} ${entry.message}`, entry.data || '', entry.error || '')

    // File output in production
    if (this.isProduction) {
      const stream = entry.level === LogLevel.ERROR ? this.streams.get('error.log') : this.streams.get('app.log')
      if (stream) {
        stream.write(logLine + '\n')
      }
    }
  }

  debug(message: string, context?: string, data?: unknown): void {
    this.write({
      timestamp: new Date().toISOString(),
      level: LogLevel.DEBUG,
      message,
      context,
      data,
    })
  }

  info(message: string, context?: string, data?: unknown): void {
    this.write({
      timestamp: new Date().toISOString(),
      level: LogLevel.INFO,
      message,
      context,
      data,
    })
  }

  warn(message: string, context?: string, data?: unknown): void {
    this.write({
      timestamp: new Date().toISOString(),
      level: LogLevel.WARN,
      message,
      context,
      data,
    })
  }

  error(message: string, error?: Error, context?: string): void {
    this.write({
      timestamp: new Date().toISOString(),
      level: LogLevel.ERROR,
      message,
      context,
      error,
      data: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : undefined,
    })
  }

  // Request logging middleware helper
  logRequest(method: string, path: string, statusCode: number, duration: number): void {
    this.info(`${method} ${path} ${statusCode}`, 'HTTP', {
      method,
      path,
      statusCode,
      duration: `${duration}ms`,
    })
  }

  // Close all streams
  close(): void {
    for (const stream of this.streams.values()) {
      stream.end()
    }
  }
}

// Export singleton instance
export const logger = new Logger()

// Close streams on exit
process.on('exit', () => logger.close())
process.on('SIGTERM', () => logger.close())
process.on('SIGINT', () => logger.close())
