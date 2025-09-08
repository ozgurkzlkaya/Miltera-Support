import { serve } from '@hono/node-server'
import { Hono } from 'hono'

const app = new Hono()

app.get('/api/v1/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

const port = 3001
console.log(`Test server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port,
  hostname: 'localhost'
})
