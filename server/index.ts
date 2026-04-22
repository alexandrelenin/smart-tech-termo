import 'dotenv/config'
import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { auth } from './auth.js'
import terms from './routes/terms.js'
import gemini from './routes/gemini.js'

const app = new Hono()

app.get('/api/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.on(['GET', 'POST'], '/api/auth/**', (c) => auth.handler(c.req.raw))

app.route('/api/terms', terms)
app.route('/api/gemini', gemini)

const PORT = Number(process.env.PORT ?? 3001)

serve({ fetch: app.fetch, port: PORT }, (info) => {
  console.log(`Server running on http://localhost:${info.port}`)
})
