import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { serveStatic } from '@hono/node-server/serve-static'
import { createServer } from 'node:http'
import { env } from './config'
import { testDatabaseConnection, db, closeDatabaseConnection } from './config/database'
import { testRedisConnection, redis, closeRedisConnection } from './config/redis'
import { errorHandlerMiddleware, notFoundHandler } from './middleware'
import { createWebSocketServer, broadcastDataChange } from './websocket'
import { authRouter } from './api/auth'
import { projectsRouter } from './api/projects'
import { storyboardRouter } from './api/storyboard'
import { usersRouter } from './api/users'
import { uploadRouter } from './api/upload'
import { membersRouter } from './api/members'

const app = new Hono()

// Middleware
app.use('*', logger())
app.use('*', prettyJSON())
app.use(
  '*',
  cors({
    origin: env.cors.origin,
    credentials: true,
  })
)
app.use('*', errorHandlerMiddleware)

// Static file serving for uploads
app.use('/uploads/*', serveStatic({ root: './' }))

// Health check
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: env.nodeEnv,
    services: {
      database: 'connected',
      redis: 'connected',
    },
  })
})

// API routes
app.route('/api/auth', authRouter)
app.route('/api/projects', projectsRouter)
app.route('/api', storyboardRouter)  // Routes are /api/shots/*, /api/reorder, /api/duplicate, /api/batch
app.route('/api/users', usersRouter)
app.route('/api/upload', uploadRouter)
app.route('/api/members', membersRouter)

// 404 handler
app.notFound(notFoundHandler)

// Start server
const port = env.port
const server = createServer(app)

// Create WebSocket server (reuse HTTP server)
const wss = createWebSocketServer(server)

// Store wss for access in API routes
;(app as any).ws = wss

// Initialize connections
async function start() {
  console.log('🚀 A_TeamUI Backend Server starting...')
  console.log(`   Environment: ${env.nodeEnv}`)
  console.log(`   Port: ${port}`)

  // Test database connection
  const dbOk = await testDatabaseConnection()
  if (!dbOk) {
    console.error('❌ Failed to connect to database')
    process.exit(1)
  }

  // Test Redis connection
  const redisOk = await testRedisConnection()
  if (!redisOk) {
    console.error('❌ Failed to connect to Redis')
    process.exit(1)
  }

  // Start listening
  server.listen(port, () => {
    console.log('')
    console.log('✅ Server is ready!')
    console.log(`   API: http://localhost:${port}${env.apiPrefix}`)
    console.log(`   WebSocket: ws://localhost:${port}/ws`)
    console.log(`   Health: http://localhost:${port}/health`)
    console.log('')
  })
}

// Graceful shutdown
async function shutdown() {
  console.log('')
  console.log('🛑 Shutting down server...')

  // Close WebSocket server
  wss.close(() => {
    console.log('WebSocket server closed')
  })

  // Close HTTP server
  server.close(() => {
    console.log('HTTP server closed')
  })

  // Close database connection
  await closeDatabaseConnection()

  // Close Redis connection
  await closeRedisConnection()

  console.log('✅ Server shut down complete')
  process.exit(0)
}

// Handle shutdown signals
process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error)
  shutdown()
})

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason)
  shutdown()
})

// Start server
start().catch((error) => {
  console.error('Failed to start server:', error)
  process.exit(1)
})

export default app
export { db, redis, broadcastDataChange }
