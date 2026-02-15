/**
 * client
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import type { WebSocketMessage, WebSocketEventType } from '../types/api'

export type WebSocketEventHandler = (message: WebSocketMessage) => void

export interface WebSocketClientOptions {
  url: string
  token?: string
  projectId?: string
  reconnectInterval?: number
  pingInterval?: number
}

export class WebSocketClient {
  private ws: WebSocket | null = null
  private url: string
  private token: string | undefined
  private projectId: string | undefined
  private reconnectInterval: number
  private pingInterval: number
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private pingTimer: ReturnType<typeof setInterval> | null = null
  private isManualClose = false
  private isIntentionalClose = false

  // Event handlers
  private eventHandlers: Map<WebSocketEventType, Set<WebSocketEventHandler>> = new Map()
  private messageHandlers: Set<WebSocketEventHandler> = new Set()
  private openHandlers: Set<() => void> = new Set()
  private closeHandlers: Set<() => void> = new Set()
  private errorHandlers: Set<(error: Event) => void> = new Set()

  constructor(options: WebSocketClientOptions) {
    this.url = options.url
    this.token = options.token
    this.projectId = options.projectId
    this.reconnectInterval = options.reconnectInterval || 5000
    this.pingInterval = options.pingInterval || 30000
  }

  /**
   * Connect to WebSocket server
   */
  connect(): void {
    this.isManualClose = false
    this.isIntentionalClose = false

    try {
      // Build URL with token as query param (as per user's choice)
      let wsUrl = this.url
      if (this.token) {
        const separator = wsUrl.includes('?') ? '&' : '?'
        wsUrl = `${wsUrl}${separator}token=${encodeURIComponent(this.token)}`
      }

      if (this.projectId) {
        const separator = wsUrl.includes('?') ? '&' : '?'
        wsUrl = `${wsUrl}${separator}projectId=${encodeURIComponent(this.projectId)}`
      }

      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = this.handleOpen.bind(this)
      this.ws.onmessage = this.handleMessage.bind(this)
      this.ws.onclose = this.handleClose.bind(this)
      this.ws.onerror = this.handleError.bind(this)

      console.log('🔌 WebSocket connecting to:', wsUrl)
    } catch (error) {
      console.error('WebSocket connection error:', error)
      this.scheduleReconnect()
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    this.isIntentionalClose = true
    this.clearReconnectTimer()
    this.clearPingTimer()

    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  /**
   * Send a message through WebSocket
   */
  send(type: WebSocketEventType, data: unknown): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        type,
        data,
        userId: this.getCurrentUserId(),
        timestamp: new Date().toISOString(),
      }
      this.ws.send(JSON.stringify(message))
    } else {
      console.warn('WebSocket is not connected, cannot send message')
    }
  }

  /**
   * Subscribe to a project channel
   */
  subscribe(projectId: string): void {
    this.projectId = projectId
    this.send('subscribe', { projectId })
  }

  /**
   * Unsubscribe from a project channel
   */
  unsubscribe(projectId: string): void {
    this.send('unsubscribe', { projectId })
  }

  /**
   * Add event handler for specific event type
   */
  on(eventType: WebSocketEventType, handler: WebSocketEventHandler): () => void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, new Set())
    }
    this.eventHandlers.get(eventType)!.add(handler)

    // Return unsubscribe function
    return () => this.off(eventType, handler)
  }

  /**
   * Add message handler for all messages
   */
  onMessage(handler: WebSocketEventHandler): () => void {
    this.messageHandlers.add(handler)
    return () => this.offMessage(handler)
  }

  /**
   * Add open event handler
   */
  onOpen(handler: () => void): () => void {
    this.openHandlers.add(handler)
    return () => this.offOpen(handler)
  }

  /**
   * Add close event handler
   */
  onClose(handler: () => void): () => void {
    this.closeHandlers.add(handler)
    return () => this.offClose(handler)
  }

  /**
   * Add error event handler
   */
  onError(handler: (error: Event) => void): () => void {
    this.errorHandlers.add(handler)
    return () => this.offError(handler)
  }

  /**
   * Remove event handler
   */
  off(eventType: WebSocketEventType, handler: WebSocketEventHandler): void {
    this.eventHandlers.get(eventType)?.delete(handler)
  }

  /**
   * Remove message handler
   */
  offMessage(handler: WebSocketEventHandler): void {
    this.messageHandlers.delete(handler)
  }

  /**
   * Remove open handler
   */
  offOpen(handler: () => void): void {
    this.openHandlers.delete(handler)
  }

  /**
   * Remove close handler
   */
  offClose(handler: () => void): void {
    this.closeHandlers.delete(handler)
  }

  /**
   * Remove error handler
   */
  offError(handler: (error: Event) => void): void {
    this.errorHandlers.delete(handler)
  }

  /**
   * Get connection state
   */
  getReadyState(): number {
    return this.ws?.readyState ?? WebSocket.CLOSED
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }

  // Private methods

  private handleOpen(): void {
    console.log('🔗 WebSocket connected')
    this.clearReconnectTimer()
    this.startPing()

    // Trigger open handlers
    this.openHandlers.forEach((handler) => handler())
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data)

      // Trigger all message handlers
      this.messageHandlers.forEach((handler) => handler(message))

      // Trigger specific event handlers
      const handlers = this.eventHandlers.get(message.type)
      if (handlers) {
        handlers.forEach((handler) => handler(message))
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error)
    }
  }

  private handleClose(event: CloseEvent): void {
    console.log('🔌 WebSocket disconnected:', event.code, event.reason)

    // Stop ping interval
    this.clearPingTimer()

    // Trigger close handlers
    this.closeHandlers.forEach((handler) => handler())

    // Schedule reconnect if not intentional
    if (!this.isIntentionalClose) {
      this.scheduleReconnect()
    }
  }

  private handleError(error: Event): void {
    console.error('WebSocket error:', error)

    // Trigger error handlers
    this.errorHandlers.forEach((handler) => handler(error))
  }

  private scheduleReconnect(): void {
    this.clearReconnectTimer()

    this.reconnectTimer = setTimeout(() => {
      console.log('🔄 Attempting to reconnect WebSocket...')
      this.connect()
    }, this.reconnectInterval)
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }

  private startPing(): void {
    this.clearPingTimer()

    this.pingTimer = setInterval(() => {
      if (this.isConnected()) {
        this.ws?.send(JSON.stringify({ type: 'ping', data: null }))
      }
    }, this.pingInterval)
  }

  private clearPingTimer(): void {
    if (this.pingTimer) {
      clearInterval(this.pingTimer)
      this.pingTimer = null
    }
  }

  private getCurrentUserId(): string {
    // Try to get user ID from localStorage
    try {
      const authStorage = localStorage.getItem('auth-storage')
      if (authStorage) {
        const auth = JSON.parse(authStorage)
        return auth?.state?.user?.id || 'unknown'
      }
    } catch {}
    return 'unknown'
  }
}

// Singleton instance
let wsClient: WebSocketClient | null = null

/**
 * Get or create WebSocket client singleton
 */
export function getWebSocketClient(): WebSocketClient {
  return wsClient!
}

/**
 * Initialize WebSocket client
 */
export function initWebSocketClient(options: WebSocketClientOptions): WebSocketClient {
  if (!wsClient) {
    wsClient = new WebSocketClient(options)
  }
  return wsClient
}

/**
 * Disconnect and cleanup WebSocket client
 */
export function destroyWebSocketClient(): void {
  if (wsClient) {
    wsClient.disconnect()
    wsClient = null
  }
}
