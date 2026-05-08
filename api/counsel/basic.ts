import { buildSystemPrompt, buildUserPrompt } from './promptContext'

type Req = {
  method: string
  body: { topic: string; tone: string; message: string }
}

type Res = {
  status(code: number): Res
  json(data: unknown): void
}

export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { topic, tone, message } = req.body
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'Server configuration error' })

  const model = 'gemini-2.5-flash'
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: buildSystemPrompt('basic') }] },
      contents: [
        {
          role: 'user',
          parts: [{ text: buildUserPrompt({ mode: 'basic', topic, tone, message }) }],
        },
      ],
      generationConfig: { maxOutputTokens: 2048, temperature: 0.72 },
    }),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    console.error('[counsel/basic] Gemini error:', text)
    return res.status(500).json({ error: `Gemini error ${response.status}: ${text}` })
  }

  const data = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
  }
  const answer = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

  return res.status(200).json({ mode: 'basic', topic, tone, answer })
}
