/**
 * API Test Client
 * Helper for making HTTP requests to the API during tests
 */

import { type Hono } from 'hono'

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

interface TestRequestOptions {
  headers?: Record<string, string>
  body?: any
  query?: Record<string, string | number>
}

interface TestResponse<T = any> {
  status: number
  data: T
  headers: Headers
}

export class ApiClient {
  private app: Hono
  private baseUrl: string
  private defaultHeaders: Record<string, string>

  constructor(app: Hono, baseUrl = '/api') {
    this.app = app
    this.baseUrl = baseUrl
    this.defaultHeaders = {
      'content-type': 'application/json',
    }
  }

  /**
   * Make a request to the API
   */
  async request<T = any>(
    method: RequestMethod,
    path: string,
    options: TestRequestOptions = {}
  ): Promise<TestResponse<T>> {
    const { headers = {}, body, query } = options

    // Build URL with query params
    let url = `${this.baseUrl}${path}`
    if (query && Object.keys(query).length > 0) {
      const searchParams = new URLSearchParams()
      for (const [key, value] of Object.entries(query)) {
        searchParams.set(key, String(value))
      }
      url += `?${searchParams.toString()}`
    }

    // Merge headers
    const mergedHeaders = {
      ...this.defaultHeaders,
      ...headers,
    }

    // Build request
    const request = new Request(url, {
      method,
      headers: mergedHeaders,
      body: body ? JSON.stringify(body) : undefined,
    })

    // Execute request
    const response = await this.app.request(request)

    // Parse response
    let data: T
    const contentType = response.headers.get('content-type')
    if (contentType?.includes('application/json')) {
      data = await response.json()
    } else {
      data = (await response.text()) as T
    }

    return {
      status: response.status,
      data,
      headers: response.headers,
    }
  }

  /**
   * GET request
   */
  async get<T = any>(path: string, options?: Omit<TestRequestOptions, 'body'>) {
    return this.request<T>('GET', path, options)
  }

  /**
   * POST request
   */
  async post<T = any>(path: string, body?: any, options?: TestRequestOptions) {
    return this.request<T>('POST', path, { ...options, body })
  }

  /**
   * PUT request
   */
  async put<T = any>(path: string, body?: any, options?: TestRequestOptions) {
    return this.request<T>('PUT', path, { ...options, body })
  }

  /**
   * DELETE request
   */
  async delete<T = any>(path: string, options?: TestRequestOptions) {
    return this.request<T>('DELETE', path, options)
  }

  /**
   * PATCH request
   */
  async patch<T = any>(path: string, body?: any, options?: TestRequestOptions) {
    return this.request<T>('PATCH', path, { ...options, body })
  }

  /**
   * Set authentication token for requests
   */
  withAuth(token: string): ApiClient {
    const client = new ApiClient(this.app, this.baseUrl)
    client.defaultHeaders = {
      ...this.defaultHeaders,
      authorization: `Bearer ${token}`,
    }
    return client
  }
}

/**
 * Create API client for testing
 */
export function createTestClient(app: Hono): ApiClient {
  return new ApiClient(app, '')
}
