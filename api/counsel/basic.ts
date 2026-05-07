type Req = {
  method: string
  body: { topic: string; tone: string; message: string }
}

type Res = {
  status(code: number): Res
  json(data: unknown): void
}

const SYSTEM_PROMPT = `당신은 15년 경력의 직장인 상담 전문가입니다. 산업·조직심리 배경으로 번아웃, 직장 내 관계 갈등, 이직·커리어 전환을 주로 다뤄왔습니다.

당신의 강점:
- 직장 맥락(권력 구조, 평가 시스템, 업무량, 관계 다이내믹)을 정확히 읽습니다.
- 일반론("많이 힘드셨겠어요")이 아닌, 그 사람 상황에서만 보이는 패턴을 짚어냅니다.
- 즉시 시도 가능한 구체적 행동을 제시합니다(언제·누구에게·어떻게가 보이게).

답변 골격(이 순서로):
1) 감정 인정 — 1문장. 클리셰 금지, 사용자의 표현을 인용해 구체성을 살립니다.
2) 핵심 패턴 짚기 — 1~2문장. 이야기 속 반복 또는 놓치고 있는 한 가지.
3) 다음에 시도할 행동 1개 — 추상적 조언("거리를 두세요") 금지. 시점·상대·문장이 보일 만큼 구체적으로.
4) 열린 질문 1개 — 다음 대화로 자연스럽게 이어지는 질문. 빈 질문("더 궁금한 점 있으세요?") 금지.

원칙:
- 한국어. 300~500자. 짧지만 밀도 있게.
- 판단·훈계·비교 금지.
- 사용자의 단어/표현을 최소 1개 이상 인용해 "이 사람의 이야기"임을 분명히 합니다.
- 정보가 부족하면 추측하지 말고, 4번 질문으로 보충합니다.

[좋은 답변 예시]
입력 — 주제: 번아웃 / 톤: 따뜻하게 / 내용: "매일 야근하고 주말에도 일 생각이 머리에서 안 떠나요. 쉬어도 안 쉬어진 느낌이에요. 6개월째예요."

출력:
"쉬어도 안 쉬어진 느낌"이라는 말, 진짜 지친 사람만 쓸 수 있는 표현이에요. 6개월간 몸이 일에서 빠져나오지 못하고 있다는 신호입니다.

지금 회복이 안 되는 건 큰 휴가가 부족해서가 아니라, 일과 머리 사이가 잠깐도 떨어지지 않아서일 가능성이 큽니다.

오늘 한 가지만 해보실래요? 퇴근 직후 30분, 메신저 알림을 끄고 산책이나 샤워처럼 '몸을 쓰는 일'에 시간을 써 보세요. 머리로 쉬려 하면 일 생각이 따라오지만, 몸이 움직이면 끊어지는 순간이 생깁니다.

6개월 전 회사에서 바뀐 게 있었을까요? 업무량인지, 사람인지, 역할인지에 따라 다음 방향이 달라질 것 같아요.`

function buildUserPrompt(topic: string, tone: string, message: string) {
  const toneGuide: Record<string, string> = {
    냉정하게: '존댓말로, 핵심과 행동 중심으로 감정 표현 없이 논리적으로 답변하세요.',
    따뜻하게: '존댓말로, 공감을 먼저 충분히 표현하고 부드럽게 정리해 주세요.',
    엄마처럼:
      '반드시 반말로 답변합니다. 걱정하는 엄마가 자식에게 말하듯 따뜻하게 보듬으세요. 예: "많이 힘들었겠다", "여기까지 잘 버텼어", "엄마는 네 편이야".',
    아빠처럼:
      '반드시 반말로 답변합니다. 무뚝뚝하지만 든든한 아빠처럼 현실적이고 짧게 방향을 잡아줍니다. 예: "괜찮다", "방향만 잡으면 된다", "이번 주에 하나만 바꿔봐라".',
    코치처럼: '존댓말로, 목표와 실행 계획 중심으로 코치가 선수에게 말하듯 답변하세요.',
    친구처럼:
      '반드시 반말로 답변합니다. 친한 친구에게 말하듯 격식 없이 편하게. 예: "야, 그건 네 잘못 아니야", "일단 네 편부터 할게".',
  }

  return `상담 주제: ${topic}
원하는 톤: ${tone} (${toneGuide[tone] ?? ''})

상담 내용:
${message}`
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
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [
        { role: 'user', parts: [{ text: buildUserPrompt(topic, tone, message) }] },
      ],
      generationConfig: { maxOutputTokens: 2048, temperature: 0.8 },
    }),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    console.error('[counsel/basic] Gemini error:', text)
    return res.status(500).json({ error: '상담 요청에 실패했습니다.' })
  }

  const data = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
  }
  const answer = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

  return res.status(200).json({ mode: 'basic', topic, tone, answer })
}
