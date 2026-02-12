import { defineConfig } from 'drizzle-kit'
import { env } from './src/config'

export default defineConfig({
  schema: './src/models/schema.ts',
  out: './drizzle',
  dialect: 'mysql',
  dbCredentials: {
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
    database: env.db.name,
  },
})
