import { serve } from '@hono/node-server'
import { createServer } from 'http'
import initializeApp from './src/app'
import { initializeWebSocket } from './src/lib/websocket'
import env from './src/config/env'

const port = 3011

async function startServer() {
  try {
    console.log('🚀 Starting server...')
    
    // Initialize the app
    const app = await initializeApp()
    console.log('✅ App initialized')
    
    // Create HTTP server
    const httpServer = createServer()
    
    // Initialize WebSocket server
    initializeWebSocket(httpServer)
    console.log('✅ WebSocket initialized')
    
    // Serve Hono app with the HTTP server
    serve({
      fetch: app.fetch,
      port,
      hostname: 'localhost',
      server: httpServer
    })
    
    console.log(`✅ Server is running on port ${port}`)
  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

startServer()
