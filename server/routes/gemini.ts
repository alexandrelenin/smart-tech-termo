import { Hono } from 'hono'
import { GoogleGenAI } from '@google/genai'
import { auth } from '../auth.js'

const gemini = new Hono()

function getAI() {
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })
}

async function getSession(c: any) {
  return auth.api.getSession({ headers: c.req.raw.headers })
}

gemini.post('/improve', async (c) => {
  const session = await getSession(c)
  if (!session) return c.json({ error: 'Unauthorized' }, 401)

  const { text, type } = await c.req.json<{ text: string; type: 'objective' | 'observations' }>()
  const prompt = type === 'objective'
    ? `Melhore o seguinte objetivo de entrega de licenças de software para um tom mais formal e profissional em português brasileiro. Mantenha-o conciso: "${text}"`
    : `Melhore as seguintes observações de um relatório de entrega de licenças. Transforme anotações informais em um parágrafo profissional e estruturado em português brasileiro: "${text}"`

  try {
    const ai = getAI()
    const response = await ai.models.generateContent({ model: 'gemini-2.0-flash', contents: prompt })
    return c.json({ result: response.text?.trim() || text })
  } catch {
    return c.json({ result: text })
  }
})

gemini.post('/summary', async (c) => {
  const session = await getSession(c)
  if (!session) return c.json({ error: 'Unauthorized' }, 401)

  const { items } = await c.req.json<{ items: Array<{ quantity: string; category: string; key: string }> }>()
  const itemsText = items.map(i => `${i.quantity}x ${i.category} (Chave: ${i.key})`).join(', ')
  const prompt = `Gere uma breve conclusão formal em português para um relatório que está entregando as seguintes licenças: ${itemsText}. Fale sobre a importância da conformidade e uso correto.`

  try {
    const ai = getAI()
    const response = await ai.models.generateContent({ model: 'gemini-2.0-flash', contents: prompt })
    return c.json({ result: response.text?.trim() || '' })
  } catch {
    return c.json({ result: '' })
  }
})

export default gemini
