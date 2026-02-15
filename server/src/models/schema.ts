/**
 * schema
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import {
  bigint,
  char,
  boolean,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/mysql-core'
import { sql } from 'drizzle-orm'

// Users table
export const users = mysqlTable('users', {
  id: char('id', { length: 36 }).primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: mysqlEnum('role', [
    'super_admin',
    'admin',
    'director',
    'screenwriter',
    'editor',
    'member',
  ]).notNull(),
  avatarUrl: varchar('avatar_url', { length: 500 }),
  phone: varchar('phone', { length: 20 }),
  bio: text('bio'),
  isEmailVerified: boolean('is_email_verified').notNull().default(false),
  otpSecret: varchar('otp_secret', { length: 255 }),
  recoveryCodes: json('recovery_codes').$type<string[]>(),
  specialPermissions: json('special_permissions').$type<Record<string, string[]>>(),
  createdAt: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
})

// Projects table
export const projects = mysqlTable('projects', {
  id: char('id', { length: 36 }).primaryKey(),
  name: varchar('name', { length: 200 }).notNull(),
  description: text('description'),
  type: mysqlEnum('type', [
    'shortDrama',
    'realLifeDrama',
    'aiPodcast',
    'advertisement',
    'mv',
    'documentary',
    'other',
  ]).notNull(),
  status: mysqlEnum('status', ['planning', 'filming', 'postProduction', 'completed']).notNull(),
  episodeRange: varchar('episode_range', { length: 50 }),
  director: varchar('director', { length: 100 }),
  createdBy: char('created_by', { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  totalShots: int('total_shots').notNull().default(0),
  completedShots: int('completed_shots').notNull().default(0),
  isFavorite: boolean('is_favorite').notNull().default(false),
  isPinned: boolean('is_pinned').notNull().default(false),
  pinnedAt: timestamp('pinned_at'),
  createdAt: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
  deletedAt: timestamp('deleted_at'), // Soft delete
})

// Project members table
export const projectMembers = mysqlTable('project_members', {
  id: char('id', { length: 36 }).primaryKey(),
  projectId: char('project_id', { length: 36 })
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  userId: char('user_id', { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  role: mysqlEnum('role', [
    'admin',
    'member',
    'director',
    'screenwriter',
    'cinematographer',
    'editor',
    'actor',
  ]).notNull(),
  joinedAt: timestamp('joined_at').notNull().default(sql`CURRENT_TIMESTAMP`),
})

// Script versions table
export const scriptVersions = mysqlTable('script_versions', {
  id: char('id', { length: 36 }).primaryKey(),
  projectId: char('project_id', { length: 36 })
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  description: varchar('description', { length: 500 }),
  createdBy: char('created_by', { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
})

// Storyboard shots table
export const storyboardShots = mysqlTable('storyboard_shots', {
  id: char('id', { length: 36 }).primaryKey(),
  projectId: char('project_id', { length: 36 })
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  shotNumber: int('shot_number').notNull(),
  sceneNumber: varchar('scene_number', { length: 50 }),
  shotSize: mysqlEnum('shot_size', [
    'extremeLong',
    'long',
    'medium',
    'closeUp',
    'extremeCloseUp',
  ]).notNull(),
  cameraMovement: mysqlEnum('camera_movement', [
    'static',
    'pan',
    'tilt',
    'dolly',
    'truck',
    'pedestral',
    'crane',
    'handheld',
    'steadicam',
    'tracking',
    'arc',
  ]).notNull(),
  duration: int('duration').notNull().default(0),
  description: text('description'),
  dialogue: text('dialogue'),
  sound: text('sound'),
  imageUrl: varchar('image_url', { length: 500 }),
  imageThumbnailUrl: varchar('image_thumbnail_url', { length: 500 }),
  aiGenerated: boolean('ai_generated').notNull().default(false),
  createdBy: char('created_by', { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
  deletedAt: timestamp('deleted_at'), // Soft delete
})

// Login history table
export const loginHistory = mysqlTable('login_history', {
  id: char('id', { length: 36 }).primaryKey(),
  userId: char('user_id', { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  device: varchar('device', { length: 100 }),
  browser: varchar('browser', { length: 100 }),
  location: varchar('location', { length: 100 }),
  ip: varchar('ip', { length: 45 }),
  isAnomalous: boolean('is_anomalous').notNull().default(false),
  createdAt: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
})

// Type exports
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

export type Project = typeof projects.$inferSelect
export type NewProject = typeof projects.$inferInsert

export type ProjectMember = typeof projectMembers.$inferSelect
export type NewProjectMember = typeof projectMembers.$inferInsert

export type ScriptVersion = typeof scriptVersions.$inferSelect
export type NewScriptVersion = typeof scriptVersions.$inferInsert

export type StoryboardShot = typeof storyboardShots.$inferSelect
export type NewStoryboardShot = typeof storyboardShots.$inferInsert

export type LoginHistory = typeof loginHistory.$inferSelect
export type NewLoginHistory = typeof loginHistory.$inferInsert
