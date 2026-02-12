import type { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios'

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxRetries?: number
  retryDelay?: number
  retryCondition?: (error: unknown) => boolean
  onRetry?: (retryCount: number, error: unknown) => void
}

/**
 * Default retry configuration
 */
const defaultRetryConfig: Required<RetryConfig> = {
  maxRetries: 3,
  retryDelay: 1000, // 1 second base delay
  retryCondition: (error) => {
    // Retry on network errors or 5xx server errors
    if (error instanceof Error) {
      const axiosError = error as AxiosError

      // Network error (no response)
      if (!axiosError.response) {
        return true
      }

      // 5xx server errors
      const status = axiosError.response.status
      return status >= 500 && status < 600
    }

    return false
  },
  onRetry: (retryCount, error) => {
    console.log(`Retrying request (attempt ${retryCount}):`, error)
  },
}

/**
 * Calculate exponential backoff delay
 */
function calculateBackoff(retryCount: number, baseDelay: number): number {
  // Exponential backoff with jitter
  const exponentialDelay = baseDelay * Math.pow(2, retryCount - 1)
  const jitter = Math.random() * 0.3 * exponentialDelay // Add 30% jitter
  return Math.min(exponentialDelay + jitter, 30000) // Max 30 seconds
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const mergedConfig = { ...defaultRetryConfig, ...config }

  let lastError: unknown

  for (let attempt = 0; attempt <= mergedConfig.maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      // Check if we should retry
      if (!mergedConfig.retryCondition(error)) {
        throw error
      }

      // Don't retry after max attempts
      if (attempt >= mergedConfig.maxRetries) {
        throw error
      }

      // Call onRetry callback
      mergedConfig.onRetry(attempt + 1, error)

      // Calculate delay and wait
      const delay = calculateBackoff(attempt + 1, mergedConfig.retryDelay)
      await sleep(delay)
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError
}

/**
 * Create a retried fetch function
 */
export function createRetriedFetch<T>(
  fetchFn: () => Promise<T>,
  config?: RetryConfig
): () => Promise<T> {
  return () => retryWithBackoff(fetchFn, config)
}

/**
 * Axios interceptor for automatic retry
 */
export function createAxiosRetryInterceptor(config: RetryConfig = {}) {
  const mergedConfig = { ...defaultRetryConfig, ...config }

  return {
    onReject: async (error: AxiosError) => {
      const config = error.config as InternalAxiosRequestConfig & { _retry?: number }

      // Don't retry if explicitly disabled
      if (config?._retry === -1) {
        return Promise.reject(error)
      }

      // Check if we should retry
      if (!mergedConfig.retryCondition(error)) {
        return Promise.reject(error)
      }

      // Initialize retry count
      config._retry = config._retry ?? 0

      // Check max retries
      if (config._retry >= mergedConfig.maxRetries) {
        return Promise.reject(error)
      }

      // Increment retry count
      config._retry++

      // Call onRetry callback
      mergedConfig.onRetry(config._retry, error)

      // Calculate delay and retry
      const delay = calculateBackoff(config._retry, mergedConfig.retryDelay)
      await sleep(delay)

      return new Promise((resolve) => {
        // Retry with same config
        resolve(globalThis.axios?.(config) ?? Promise.reject(error))
      })
    },
  }
}

/**
 * Helper to disable retry for specific requests
 */
export function disableRetry(requestConfig: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
  return {
    ...requestConfig,
    _retry: -1,
  }
}
