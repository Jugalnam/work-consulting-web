type Req = {
  method: string
  body: { topic: string; tone: string; message: string }
}

type Res = {
  status(code: number): Res
  json(data: unknown): void
}

const SYSTEM_PROMPT = `당신은 직장인의 고민을 심층적으로 분석하고 구조화된 조언을 주는 전문 상담사입니다.

규칙:
- 답변은 반드시 한국어로 작성합니다.
- 아래 5단계 프레임워크로 구조화하여 답변합니다.
  1) 사실(관찰): 상황에서 반복되는 패턴
  2) 해석(생각): 자동으로 떠오르는 생각
  3) 감정/신체: 감정과 몸의 반응
  4) 욕구/가치: 무엇이 중요해서 힘든지
  5) 선택지: 지금 할 수 있는 행동 2~3가지
- 답변은 600~900자 이내로 작성합니다.
- 마지막에 핵심 질문 1개로 마무리합니다.`

function buildUserPrompt(topic: string, tone: string, message: string) {
  const toneGuide: Record<string, string> = {
    냉정하게: '감정 표현 없이 논리적·구조적으로 분석하세요.',
    따뜻하게: '공감을 바탕으로 부드럽게 구조화해 주세요.',
    엄마처럼: '걱정하는 부모의 마음으로 보듬으면서 구조화해 주세요.',
    아빠처럼: '현실적이고 든든하게, 방향을 잡아주는 느낌으로 구조화하세요.',
    코치처럼: '목표·실행 중심으로 코치처럼 구조화해 주세요.',
    친구처럼: '친한 친구처럼 편하게, 그러나 깊이 있게 구조화해 주세요.',
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
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildUserPrompt(topic, tone, message) }],
    }),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    console.error('[counsel/deep] Anthropic error:', text)
    return res.status(500).json({ error: '상담 요청에 실패했습니다.' })
  }

  const data = await response.json() as { content: Array<{ type: string; text: string }> }
  const answer = data.content.find((c) => c.type === 'text')?.text ?? ''

  return res.status(200).json({ mode: 'deep', topic, tone, answer })
}
