import { Hono } from 'hono'
import { auth } from '../auth.js'
import prisma from '../prisma.js'

const terms = new Hono()

async function getSession(c: any) {
  return auth.api.getSession({ headers: c.req.raw.headers })
}

terms.get('/', async (c) => {
  const session = await getSession(c)
  if (!session) return c.json({ error: 'Unauthorized' }, 401)

  const data = await prisma.term.findMany({
    where: { ownerId: session.user.id },
    orderBy: { updatedAt: 'desc' },
  })
  return c.json(data)
})

terms.get('/:id', async (c) => {
  const session = await getSession(c)
  if (!session) return c.json({ error: 'Unauthorized' }, 401)

  const term = await prisma.term.findUnique({ where: { id: c.req.param('id') } })
  if (!term || term.ownerId !== session.user.id) return c.json({ error: 'Not found' }, 404)

  return c.json(term)
})

terms.post('/', async (c) => {
  const session = await getSession(c)
  if (!session) return c.json({ error: 'Unauthorized' }, 401)

  const body = await c.req.json()
  const term = await prisma.term.upsert({
    where: { id: body.id },
    update: { ...body, ownerId: session.user.id },
    create: { ...body, ownerId: session.user.id },
  })
  return c.json(term)
})

terms.delete('/:id', async (c) => {
  const session = await getSession(c)
  if (!session) return c.json({ error: 'Unauthorized' }, 401)

  const term = await prisma.term.findUnique({ where: { id: c.req.param('id') } })
  if (!term || term.ownerId !== session.user.id) return c.json({ error: 'Not found' }, 404)

  await prisma.term.delete({ where: { id: c.req.param('id') } })
  return c.json({ ok: true })
})

export default terms
