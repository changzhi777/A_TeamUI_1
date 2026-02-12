import { WebSocketServer, WebSocket } from 'ws'
import { env } from '../config'
import type { WebSocketAuth, WebSocketMessage } from '../types'
import type { JwtPayload } from '../types'
import { verifyToken } from '../services/jwt'
import {
  redisKeys,
  cacheTTL,
  acquireLock,
  releaseLock,
  getLockOwner,
} from '../config/redis'
import {
  queueMessageForUser,
  drainQueuedMessages,
  queueMessageForProject,
  drainProjectQueuedMessages,
} from '../services/message-queue'

interface WebSocketContext {
  ws: WebSocket
  userId?: string
  user?: JwtPayload
  projectId?: string
  isAlive: boolean
}

// Store active connections
const connections = new Map<WebSocket, WebSocketContext>()
const projectChannels = new Map<string, Set<WebSocket>>()

// Create WebSocket server
export function createWebSocketServer(server?: any): WebSocketServer {
  const wss = new WebSocketServer({ server })

  wss.on('connection', handleConnection)

  // Heartbeat to detect stale connections
  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      const ctx = connections.get(ws)

      if (!ctx?.isAlive) {
        // Terminate stale connection
        ws.terminate()
        connections.delete(ws)
      } else {
        // Reset alive flag
        ctx.isAlive = false
        // Send ping
        ws.ping()
      }
    })
  }, 30000)

  wss.on('close', () => {
    clearInterval(interval)
  })

  return wss
}

// Handle new WebSocket connection
async function handleConnection(ws: WebSocket, req: any) {
  // Parse connection URL for token and projectId
  const url = new URL(req.url!, `ws://${req.headers.host}`)
  const token = url.searchParams.get('token')
  const projectId = url.searchParams.get('projectId')

  // Verify token
  let user: JwtPayload | undefined
  if (token) {
    try {
      user = await verifyToken(token)
    } catch (error) {
      console.error('WebSocket auth failed:', error)
      ws.send(
        JSON.stringify({
          type: 'error',
          data: { message: 'Authentication failed' },
          userId: 'system',
          timestamp: new Date().toISOString(),
        })
      )
      ws.close()
      return
    }
  }

  // Store connection context
  const ctx: WebSocketContext = {
    ws,
    userId: user?.userId,
    user,
    projectId: projectId || undefined,
    isAlive: true,
  }
  connections.set(ws, ctx)

  // Add to project channel if projectId specified
  if (projectId) {
    if (!projectChannels.has(projectId)) {
      projectChannels.set(projectId, new Set())
    }
    projectChannels.get(projectId)!.add(ws)

    // Add to online users in Redis
    const key = redisKeys.onlineUsers(projectId)
    await redis.sadd(key, user?.userId || 'anonymous')
    await redis.expire(key, cacheTTL.USER)

    // Drain and send any queued messages for this user
    if (user?.userId) {
      const queuedMessages = await drainProjectQueuedMessages(projectId, user.userId)

      // Send queued messages
      for (const message of queuedMessages) {
        ws.send(
          JSON.stringify({
            ...message,
            queued: true, // Mark as queued message
          })
        )
      }

      if (queuedMessages.length > 0) {
        console.log(`Delivered ${queuedMessages.length} queued messages to user ${user.userId}`)
      }
    }

    // Notify others in the project
    broadcastToProject(projectId, {
      type: 'user_joined',
      data: { userId: user?.userId, projectId },
      userId: user?.userId || 'system',
      timestamp: new Date().toISOString(),
    })
  }

  // Setup message handler
  ws.on('error', (error) => {
    console.error('WebSocket error:', error)
  })

  ws.on('pong', () => {
    const ctx = connections.get(ws)
    if (ctx) {
      ctx.isAlive = true
    }
  })

  ws.on('message', async (data: Buffer) => {
    await handleMessage(ws, ctx, data)
  })

  ws.on('close', async () => {
    await handleDisconnection(ctx)
  })

  console.log(
    `WebSocket connected: ${user?.userId || 'anonymous'}${projectId ? ` to project ${projectId}` : ''}`
  )
}

// Handle incoming WebSocket message
async function handleMessage(
  ws: WebSocket,
  ctx: WebSocketContext,
  data: Buffer
) {
  try {
    const message: WebSocketMessage = JSON.parse(data.toString())

    // Handle different message types
    switch (message.type) {
      case 'ping':
        // Respond to ping
        ws.send(
          JSON.stringify({
            type: 'pong',
            data: null,
            userId: 'system',
            timestamp: new Date().toISOString(),
          })
        )
        break

      case 'subscribe':
        // Subscribe to project channel
        if (message.data && typeof message.data === 'object' && 'projectId' in message.data) {
          const projectId = (message.data as any).projectId as string

          // Remove from old channel if any
          if (ctx.projectId && ctx.projectId !== projectId) {
            projectChannels.get(ctx.projectId)?.delete(ws)
          }

          // Add to new channel
          if (!projectChannels.has(projectId)) {
            projectChannels.set(projectId, new Set())
          }
          projectChannels.get(projectId)!.add(ws)
          ctx.projectId = projectId

          // Add to online users
          const key = redisKeys.onlineUsers(projectId)
          await redis.sadd(key, ctx.userId || 'anonymous')
          await redis.expire(key, cacheTTL.USER)

          // Notify project members
          broadcastToProject(projectId, {
            type: 'user_joined',
            data: { userId: ctx.userId, projectId },
            userId: ctx.userId || 'system',
            timestamp: new Date().toISOString(),
          })
        }
        break

      case 'unsubscribe':
        // Unsubscribe from project channel
        if (ctx.projectId) {
          projectChannels.get(ctx.projectId)?.delete(ws)

          // Remove from online users
          const key = redisKeys.onlineUsers(ctx.projectId)
          await redis.srem(key, ctx.userId || 'anonymous')

          // Notify project members
          broadcastToProject(ctx.projectId, {
            type: 'user_left',
            data: { userId: ctx.userId, projectId: ctx.projectId },
            userId: ctx.userId || 'system',
            timestamp: new Date().toISOString(),
          })

          ctx.projectId = undefined
        }
        break

      case 'lock:acquire':
        // Handle lock acquisition
        if (ctx.projectId && message.data) {
          const lockData = message.data as any
          const resourceId = lockData.resourceId as string

          const acquired = await acquireLock(
            resourceId,
            ctx.userId || 'anonymous',
            cacheTTL.LOCK
          )

          if (acquired) {
            // Broadcast lock acquired
            broadcastToProject(ctx.projectId, {
              type: 'lock_acquired',
              data: { resourceId, userId: ctx.userId },
              userId: ctx.userId || 'system',
              timestamp: new Date().toISOString(),
            })
          }

          // Send response to requester
          ws.send(
            JSON.stringify({
              type: 'lock:acquire_response',
              data: { resourceId, acquired, userId: ctx.userId },
              userId: ctx.userId || 'system',
              timestamp: new Date().toISOString(),
            })
          )
        }
        break

      case 'lock:release':
        // Handle lock release
        if (ctx.projectId && message.data) {
          const lockData = message.data as any
          const resourceId = lockData.resourceId as string

          const released = await releaseLock(resourceId, ctx.userId || 'anonymous')

          if (released) {
            // Broadcast lock released
            broadcastToProject(ctx.projectId, {
              type: 'lock_released',
              data: { resourceId, userId: ctx.userId },
              userId: ctx.userId || 'system',
              timestamp: new Date().toISOString(),
            })
          }
        }
        break

      default:
        // Broadcast other messages to project channel
        if (ctx.projectId) {
          broadcastToProject(ctx.projectId, {
            ...message,
            userId: ctx.userId || 'system',
            timestamp: new Date().toISOString(),
          })
        }
        break
    }
  } catch (error) {
    console.error('Failed to handle WebSocket message:', error)
  }
}

// Handle WebSocket disconnection
async function handleDisconnection(ctx: WebSocketContext) {
  connections.delete(ctx.ws)

  // Remove from project channel
  if (ctx.projectId) {
    projectChannels.get(ctx.projectId)?.delete(ctx.ws)

    // Remove from online users
    if (ctx.userId) {
      const key = redisKeys.onlineUsers(ctx.projectId)
      await redis.srem(key, ctx.userId)

      // Notify remaining members
      broadcastToProject(ctx.projectId, {
        type: 'user_left',
        data: { userId: ctx.userId, projectId: ctx.projectId },
        userId: ctx.userId || 'system',
        timestamp: new Date().toISOString(),
      })
    }
  }

  // Release any locks held by this user
  if (ctx.userId) {
    // Implementation would iterate through user's locks and release them
    // This would require tracking locks per user
  }
}

// Broadcast message to all connections in a project channel
// Also queues messages for offline users
async function broadcastToProject(
  projectId: string,
  message: WebSocketMessage,
  targetUserId?: string
): Promise<void> {
  const channel = projectChannels.get(projectId)
  const messageStr = JSON.stringify(message)

  if (channel && channel.size > 0) {
    // Send to online users
    let sent = 0

    channel.forEach((ws) => {
      const ctx = connections.get(ws)

      if (ws.readyState === WebSocket.OPEN) {
        // If targetUserId specified, only send to that user
        if (targetUserId === undefined || ctx?.userId === targetUserId) {
          ws.send(messageStr)
          sent++
        }
      }
    })

    // If message was delivered to target user, we're done
    if (targetUserId && sent > 0) {
      return
    }

    // If target user not online or no specific target, queue for offline users
    if (targetUserId) {
      await queueMessageForProject(projectId, targetUserId, message)
      console.log(`Queued message for offline user ${targetUserId} in project ${projectId}`)
    }
  } else {
    // No one is online, queue for all project members
    // Note: In a real implementation, you'd fetch all project members
    // and queue the message for each one. For now, this is a placeholder.
    console.log(`No online users in project ${projectId}, message would be queued`)
  }
}

// Broadcast message to all connected clients
export function broadcastToAll(message: WebSocketMessage): void {
  const messageStr = JSON.stringify(message)

  connections.forEach((ctx) => {
    if (ctx.ws.readyState === WebSocket.OPEN) {
      ctx.ws.send(messageStr)
    }
  })
}

// Get online users for a project
export async function getOnlineUsers(projectId: string): Promise<string[]> {
  const key = redisKeys.onlineUsers(projectId)
  return redis.smembers(key)
}

// Helper function to broadcast data changes
export async function broadcastDataChange(
  type: 'project_updated' | 'shot_created' | 'shot_updated' | 'shot_deleted',
  projectId: string,
  data: any
): Promise<void> {
  await broadcastToProject(projectId, {
    type,
    data,
    userId: 'system',
    timestamp: new Date().toISOString(),
  })
}
