type Req = {
  method: string
  body: { topic: string; tone: string; message: string }
}

type Res = {
  status(code: number): Res
  json(data: unknown): void
}

const SYSTEM_PROMPT = `당신은 직장인의 고민을 듣고 공감하며 실질적인 조언을 주는 상담사입니다.

규칙:
- 답변은 반드시 한국어로 작성합니다.
- 판단하거나 비판하지 않습니다.
- 상황을 요약하고, 감정을 인정하고, 실행 가능한 제안 1~2개를 제시합니다.
- 답변은 300~500자 이내로 간결하게 작성합니다.
- 마지막에 추가 질문 1개를 덧붙여 대화를 이어갑니다.`

function buildUserPrompt(topic: string, tone: string, message: string) {
  const toneGuide: Record<string, string> = {
    냉정하게: '핵심과 행동 중심으로, 감정 표현 없이 논리적으로 답변하세요.',
    따뜻하게: '공감을 먼저 충분히 표현하고, 부드럽게 정리해 주세요.',
    엄마처럼: '걱정하는 부모처럼 보듬어주고 따뜻하게 위로해 주세요.',
    아빠처럼: '든든하고 현실적인 조언을 주되, 방향을 잡아주는 느낌으로 답변하세요.',
    코치처럼: '목표와 실행 계획 중심으로, 코치가 선수에게 말하듯 답변하세요.',
    친구처럼: '격식 없이 편하게, 친한 친구에게 말하듯 답변하세요.',
  }

  return `상담 주제: ${topic}
원하는 톤: ${tone} (${toneGuide[tone] ?? ''})

상담 내용:
${message}`
}

export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { topic, tone, message } = req.body
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'Server configuration error' })

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildUserPrompt(topic, tone, message) }],
    }),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    console.error('[counsel/basic] Anthropic error:', text)
    return res.status(500).json({ error: '상담 요청에 실패했습니다.' })
  }

  const data = await response.json() as { content: Array<{ type: string; text: string }> }
  const answer = data.content.find((c) => c.type === 'text')?.text ?? ''

  return res.status(200).json({ mode: 'basic', topic, tone, answer })
}
