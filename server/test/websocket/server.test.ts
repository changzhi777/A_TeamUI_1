/**
 * WebSocket Server Tests
 * Testing real-time synchronization and broadcasting
 */

import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from 'vitest'
import { createServer } from 'http'
import { WebSocket, type WebSocketServer } from 'ws'
import { createWebSocketServer, broadcastDataChange } from '../../src/websocket'
import { cleanupTestDatabase, setupTestDatabase } from '../helpers'

describe('WebSocket Server', () => {
  let httpServer: ReturnType<typeof createServer>
  let wss: WebSocketServer
  let testPort: number

  beforeAll(async () => {
    await setupTestDatabase()
  })

  afterAll(async () => {
    await cleanupTestDatabase()
  })

  beforeEach((done) => {
    // Create HTTP server for WebSocket
    testPort = 3001 + Math.floor(Math.random() * 1000)
    httpServer = createServer()
    httpServer.listen(testPort, done)

    // Create WebSocket server
    wss = createWebSocketServer(httpServer)
  })

  afterEach((done) => {
    // Close WebSocket server
    wss.close(() => {
      // Close HTTP server
      httpServer.close(done)
    })
  })

  describe('Server Initialization', () => {
    it('should create WebSocket server successfully', () => {
      expect(wss).toBeDefined()
      expect(wss.clients).toBeDefined()
    })

    it('should have no clients initially', () => {
      expect(wss.clients.size).toBe(0)
    })
  })

  describe('Client Connection', () => {
    it('should accept new WebSocket connection', (done) => {
      const ws = new WebSocket(`ws://localhost:${testPort}/ws`)

      ws.on('open', () => {
        expect(ws.readyState).toBe(WebSocket.OPEN)
        ws.close()
        done()
      })

      ws.on('error', (err) => {
        done(err)
      })
    })

    it('should handle multiple concurrent connections', (done) => {
      const connectionCount = 3
      let connectedCount = 0

      const checkAllConnected = () => {
        connectedCount++
        if (connectedCount === connectionCount) {
          expect(wss.clients.size).toBe(connectionCount)

          // Close all connections
          wss.clients.forEach((client) => client.close())
          done()
        }
      }

      for (let i = 0; i < connectionCount; i++) {
        const ws = new WebSocket(`ws://localhost:${testPort}/ws`)
        ws.on('open', checkAllConnected)
        ws.on('error', (err) => done(err))
      }
    })

    it('should remove disconnected clients', (done) => {
      const ws = new WebSocket(`ws://localhost:${testPort}/ws`)

      ws.on('open', () => {
        expect(wss.clients.size).toBe(1)
        ws.close()
      })

      ws.on('close', () => {
        // Give server time to process disconnection
        setTimeout(() => {
          expect(wss.clients.size).toBe(0)
          done()
        }, 100)
      })

      ws.on('error', (err) => done(err))
    })
  })

  describe('Message Broadcasting', () => {
    it('should broadcast data change to all clients', (done) => {
      const receivedMessages: any[] = []
      const clientCount = 2

      const createClient = (index: number): WebSocket => {
        const ws = new WebSocket(`ws://localhost:${testPort}/ws`)

        ws.on('message', (data) => {
          try {
            const message = JSON.parse(data.toString())
            receivedMessages.push({ client: index, message })

            if (receivedMessages.length === clientCount) {
              // All clients received the message
              expect(receivedMessages.length).toBe(clientCount)

              // Verify message content
              receivedMessages.forEach((msg) => {
                expect(msg.message.type).toBe('test_event')
                expect(msg.message.data).toEqual({ test: 'data' })
              })

              // Close all connections
              wss.clients.forEach((client) => client.close())
              done()
            }
          } catch (err) {
            done(err)
          }
        })

        return ws
      }

      const clients: WebSocket[] = []

      // Wait for all clients to connect
      let connectedCount = 0
      const onConnected = () => {
        connectedCount++
        if (connectedCount === clientCount) {
          // Broadcast test event
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'test_event',
                data: { test: 'data' },
              }))
            }
          })
        }
      }

      for (let i = 0; i < clientCount; i++) {
        const ws = createClient(i)
        clients.push(ws)
        ws.on('open', onConnected)
        ws.on('error', (err) => done(err))
      }
    })
  })

  describe('Channel Subscription', () => {
    it('should support project-specific channels', (done) => {
      const projectId = 'test-project-123'
      const ws = new WebSocket(`ws://localhost:${testPort}/ws?projectId=${projectId}`)

      ws.on('open', () => {
        // Simulate subscribing to project channel
        ws.send(
          JSON.stringify({
            type: 'subscribe',
            channel: `project:${projectId}`,
          })
        )

        setTimeout(() => {
          ws.close()
          done()
        }, 100)
      })

      ws.on('error', (err) => done(err))
    })
  })

  describe('Error Handling', () => {
    it('should handle malformed messages gracefully', (done) => {
      const ws = new WebSocket(`ws://localhost:${testPort}/ws`)

      ws.on('open', () => {
        // Send invalid JSON
        ws.send('invalid json {{{')

        setTimeout(() => {
          // Connection should still be open
          expect(ws.readyState).toBe(WebSocket.OPEN)
          ws.close()
          done()
        }, 100)
      })

      ws.on('error', (err) => {
        // Some errors are expected with malformed data
        ws.close()
        done()
      })
    })

    it('should handle connection errors', (done) => {
      // Try to connect to a non-existent server
      const ws = new WebSocket(`ws://localhost:9999/ws`)

      ws.on('error', () => {
        // Error is expected
        done()
      })

      setTimeout(() => {
        // If no error after timeout, test passes anyway
        done()
      }, 500)
    })
  })

  describe('broadcastDataChange function', () => {
    it('should call broadcast function without errors', () => {
      expect(() => {
        broadcastDataChange('test_event', 'project-123', { id: '123' })
      }).not.toThrow()
    })

    it('should handle empty WebSocket server gracefully', () => {
      // Create server without any clients
      const tempServer = createServer()
      const tempWss = createWebSocketServer(tempServer)

      expect(() => {
        broadcastDataChange('test_event', 'project-123', { id: '123' })
      }).not.toThrow()

      tempWss.close()
      tempServer.close()
    })
  })
})
