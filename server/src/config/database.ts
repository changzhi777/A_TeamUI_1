import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'
import { env } from './index'

// Create MySQL connection pool
const pool = mysql.createPool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.name,
  connectionLimit: 10,
  // Enable multiple statements (required for migrations)
  multipleStatements: true,
  // Disable SSL and use default authentication
  ssl: false,
})

// Create Drizzle instance
export const db = drizzle(pool)

// Test connection
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    await pool.getConnection()
    console.log('✅ Database connection established')
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    return false
  }
}

// Close connection
export async function closeDatabaseConnection(): Promise<void> {
  await pool.end()
  console.log('Database connection closed')
}
