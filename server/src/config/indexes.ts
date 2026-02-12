import { sql } from 'drizzle-orm'
import { db } from './database'

/**
 * Database indexes for performance optimization
 *
 * These indexes improve query performance for common search and filter operations
 */

export async function createIndexes() {
  console.log('Creating database indexes...')

  try {
    // Users table indexes
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `)
    console.log('✓ Created index on users.email')

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    `)
    console.log('✓ Created index on users.role')

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users(deleted_at);
    `)
    console.log('✓ Created index on users.deleted_at')

    // Projects table indexes
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_projects_created_by ON projects(created_by);
    `)
    console.log('✓ Created index on projects.created_by')

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
    `)
    console.log('✓ Created index on projects.status')

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_projects_type ON projects(type);
    `)
    console.log('✓ Created index on projects.type')

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_projects_is_favorite ON projects(is_favorite);
    `)
    console.log('✓ Created index on projects.is_favorite')

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_projects_is_pinned ON projects(is_pinned);
    `)
    console.log('✓ Created index on projects.is_pinned')

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_projects_deleted_at ON projects(deleted_at);
    `)
    console.log('✓ Created index on projects.deleted_at')

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_projects_created_updated ON projects(created_at DESC, updated_at DESC);
    `)
    console.log('✓ Created composite index on projects(created_at, updated_at)')

    // Project members table indexes
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON project_members(project_id);
    `)
    console.log('✓ Created index on project_members.project_id')

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_project_members_user_id ON project_members(user_id);
    `)
    console.log('✓ Created index on project_members.user_id')

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_project_members_project_user ON project_members(project_id, user_id);
    `)
    console.log('✓ Created composite index on project_members(project_id, user_id)')

    // Script versions table indexes
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_script_versions_project_id ON script_versions(project_id);
    `)
    console.log('✓ Created index on script_versions.project_id')

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_script_versions_created_at ON script_versions(created_at DESC);
    `)
    console.log('✓ Created index on script_versions.created_at')

    // Storyboard shots table indexes
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_storyboard_shots_project_id ON storyboard_shots(project_id);
    `)
    console.log('✓ Created index on storyboard_shots.project_id')

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_storyboard_shots_shot_number ON storyboard_shots(shot_number);
    `)
    console.log('✓ Created index on storyboard_shots.shot_number')

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_storyboard_shots_deleted_at ON storyboard_shots(deleted_at);
    `)
    console.log('✓ Created index on storyboard_shots.deleted_at')

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_storyboard_shots_project_shot ON storyboard_shots(project_id, shot_number);
    `)
    console.log('✓ Created composite index on storyboard_shots(project_id, shot_number)')

    // Login history table indexes
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_login_history_user_id ON login_history(user_id);
    `)
    console.log('✓ Created index on login_history.user_id')

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_login_history_created_at ON login_history(created_at DESC);
    `)
    console.log('✓ Created index on login_history.created_at')

    console.log('\n✅ Database indexes created successfully')
  } catch (error) {
    console.error('Error creating indexes:', error)
    throw error
  }
}

/**
 * Drop all indexes (useful for testing)
 */
export async function dropIndexes() {
  console.log('Dropping database indexes...')

  const indexes = [
    // Users
    'idx_users_email',
    'idx_users_role',
    'idx_users_deleted_at',
    // Projects
    'idx_projects_created_by',
    'idx_projects_status',
    'idx_projects_type',
    'idx_projects_is_favorite',
    'idx_projects_is_pinned',
    'idx_projects_deleted_at',
    'idx_projects_created_updated',
    // Project members
    'idx_project_members_project_id',
    'idx_project_members_user_id',
    'idx_project_members_project_user',
    // Script versions
    'idx_script_versions_project_id',
    'idx_script_versions_created_at',
    // Storyboard shots
    'idx_storyboard_shots_project_id',
    'idx_storyboard_shots_shot_number',
    'idx_storyboard_shots_deleted_at',
    'idx_storyboard_shots_project_shot',
    // Login history
    'idx_login_history_user_id',
    'idx_login_history_created_at',
  ]

  for (const index of indexes) {
    try {
      await db.execute(sql`DROP INDEX IF EXISTS ${sql.identifier(index)}`)
      console.log(`✓ Dropped index ${index}`)
    } catch (error) {
      console.warn(`Warning: Could not drop index ${index}`)
    }
  }

  console.log('\n✅ Database indexes dropped')
}
