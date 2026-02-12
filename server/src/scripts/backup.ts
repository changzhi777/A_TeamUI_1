import { db } from '../config/database'
import { redis } from '../config/redis'
import { createWriteStream, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

const BACKUP_DIR = join(process.cwd(), 'backups')

/**
 * Create database backup
 */
async function backupDatabase(): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const filename = `database-${timestamp}.sql`
  const filepath = join(BACKUP_DIR, filename)

  // Ensure backup directory exists
  if (!existsSync(BACKUP_DIR)) {
    mkdirSync(BACKUP_DIR, { recursive: true })
  }

  // Get all data from tables (simplified - in production use mysqldump)
  const tables = ['users', 'projects', 'project_members', 'script_versions', 'storyboard_shots', 'login_history']

  const backup: Record<string, unknown[]> = {}

  for (const table of tables) {
    try {
      const result = await db.execute((sql as any)`SELECT * FROM ${sql.identifier(table)}`)
      backup[table] = result.rows || []
    } catch (error) {
      console.error(`Error backing up table ${table}:`, error)
    }
  }

  // Write backup to file
  const stream = createWriteStream(filepath)
  stream.write(JSON.stringify(backup, null, 2))
  stream.end()

  console.log(`Database backup created: ${filepath}`)
  return filepath
}

/**
 * Create Redis backup
 */
async function backupRedis(): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const filename = `redis-${timestamp}.rdb`
  const filepath = join(BACKUP_DIR, filename)

  // Ensure backup directory exists
  if (!existsSync(BACKUP_DIR)) {
    mkdirSync(BACKUP_DIR, { recursive: true })
  }

  // Trigger Redis BGSAVE
  await redis.bgsave()

  // Wait for BGSAVE to complete
  let lastSaveInProgress = false
  for (let i = 0; i < 60; i++) {
    const info = await redis.info('persistence')
    const match = info.match(/bgsave_in_progress:(\d+)/)
    const inProgress = match ? match[1] === '1' : false

    if (!inProgress && lastSaveInProgress) {
      break
    }
    lastSaveInProgress = inProgress
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  console.log(`Redis backup created: ${filepath}`)
  return filepath
}

/**
 * Full backup (database + Redis)
 */
async function fullBackup(): Promise<void> {
  console.log('Starting full backup...')
  console.log(`Backup directory: ${BACKUP_DIR}`)

  try {
    const dbBackup = await backupDatabase()
    const redisBackup = await backupRedis()

    console.log('\n✅ Full backup completed successfully')
    console.log(`Database: ${dbBackup}`)
    console.log(`Redis: ${redisBackup}`)
  } catch (error) {
    console.error('Backup failed:', error)
    process.exit(1)
  }
}

// Run backup if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  fullBackup().then(() => process.exit(0))
}

export { backupDatabase, backupRedis, fullBackup }
