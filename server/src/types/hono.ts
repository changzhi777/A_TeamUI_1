import type { JWTPayloadContext } from '../middleware'

declare module 'hono' {
  interface ContextVariableMap {
    // Add WebSocket server to context
    ws: import('ws').Server
  }
}

// Extend Hono context types globally
declare global {
  namespace Hono {
    interface Context extends JWTPayloadContext {}
  }
}
