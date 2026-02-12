import { drizzle } from 'drizzle-orm/mysql-core'
import { mysql } from './database'

/**
 * Database connection pool configuration
 */
interface PoolConfig {
  maxConnections: number
  idleTimeout: number
  acquireTimeout: number
  maxWait: number
  minConnections: number
}

const poolConfig: PoolConfig = {
  maxConnections: 10,        // Maximum connections in the pool
  idleTimeout: 60000,      // 60 seconds
  acquireTimeout: 10000,    // 10 seconds
  maxWait: 10000,           // 10 seconds
  minConnections: 2,          // Minimum connections to keep alive
}

/**
 * Get a database connection from the pool
 * Returns the existing Drizzle instance with connection pooling enabled
 */
export async function getDbConnection() {
  // The drizzle instance already has connection pooling built in
  // We just need to configure it properly

  // Configure connection pool
  const pool = mysql.createPool({
    ...poolConfig,
    // Enable prepared statements
    prepareStatements: true,
    // Enable named placeholders
    namedPlaceholders: true,
  })

  // Return database instance with pool configuration
  return drizzle(pool, { logger: false })
}

/**
 * Close database connection pool
 */
export async function closeDbConnectionPool(): Promise<void> {
  const { pool } = await import('./database')

  if (pool && 'end' in pool) {
    await pool.end()
    console.log('Database connection pool closed')
  }
}

/**
 * Get pool statistics
 */
export async function getPoolStats(): Promise<{
  totalConnections: number
  activeConnections: number
  idleConnections: number
  waitingTasks: number
}> {
  const { pool } = await import('./database')

  if (!pool) {
    return {
      totalConnections: 0,
      activeConnections: 0,
      idleConnections: 0,
      waitingTasks: 0,
    }
  }

  return new Promise((resolve, reject) => {
    pool.getConnections((err, connections) => {
      if (err) {
        reject(err)
        return
      }

      resolve({
        totalConnections: connections.length,
        activeConnections: connections.filter((c) => c.state === 'active').length,
        idleConnections: connections.filter((c) => c.state === 'idle').length,
        waitingTasks: pool.pool._acquiringConnections.length,
      })
    })
  })
}

/**
 * Health check for database connection pool
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const db = await getDbConnection()
    await db.execute(sql`SELECT 1`)
    return true
  } catch (error) {
    console.error('Database health check failed:', error)
    return false
  }
}
