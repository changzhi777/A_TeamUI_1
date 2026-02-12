// Global type declarations
declare global {
  // Console methods
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test'
      PORT: string
      API_PREFIX: string

      // Database
      DB_HOST: string
      DB_PORT: string
      DB_USER: string
      DB_PASSWORD: string
      DB_NAME: string

      // Redis
      REDIS_HOST: string
      REDIS_PORT: string
      REDIS_PASSWORD: string
      REDIS_DB: string

      // JWT
      JWT_SECRET: string
      JWT_ACCESS_EXPIRY: string
      JWT_REFRESH_EXPIRY: string

      // Upload
      UPLOAD_DIR: string
      MAX_FILE_SIZE: string

      // CORS
      CORS_ORIGIN: string
    }
  }
}

export {}
