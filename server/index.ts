// server/index.ts
import 'dotenv/config'
import { Hono } from 'hono'
import { serve } from '@hono/node-server'

const app = new Hono()

app.get('/api/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

const PORT = Number(process.env.PORT ?? 3001)

serve({ fetch: app.fetch, port: PORT }, (info) => {
  console.log(`Server running on http://localhost:${info.port}`)
})

export default app
