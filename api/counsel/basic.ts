type Req = {
  method: string
  body: { topic: string; tone: string; message: string }
}

type Res = {
  status(code: number): Res
  json(data: unknown): void
}

const TONE_GUIDES: Record<string, string> = {
  '냉정하게(팩폭)':
    '존댓말. 공감은 1문장만 짧게 하고, 회피하고 있는 현실·핵심 리스크·다음 행동을 단호하게 짚는다. 무례함, 조롱, 비난은 금지한다.',
  '엄마처럼(따뜻)':
    '반말. 걱정하는 엄마처럼 먼저 안심시키고 보듬는다. 판단하지 말고 아주 작은 회복 행동 1개를 부드럽게 제안한다.',
  '친구처럼(친근)':
    '반말. 친한 친구처럼 편하게 사용자의 편에서 말하되, 감정만 받아주고 끝내지 말고 같이 정리한다.',
  '선배처럼(방어적으로)':
    '반말. 직장생활을 먼저 겪은 선배처럼 현실적이고 방어적으로 조언한다. 기록 남기기, 책임 범위 확인, 말실수 줄이기, 증거가 남는 커뮤니케이션을 중심으로 답한다. 법률 자문처럼 단정하지 않는다.',
}

const TOPIC_KNOWLEDGE: Record<string, string> = {
  '직장 내 관계':
    '반복되는 무시, 말 끊기, 공개 지적은 권력·평가·존중의 문제일 수 있다. 사실, 해석, 감정, 행동을 분리하고 반복 장면을 날짜·상황·상대 발언·내 반응으로 기록하게 돕는다.',
  번아웃:
    '번아웃은 의지 부족보다 요구량, 통제감 저하, 회복 시간 부족이 겹칠 때 커진다. 심리적 분리, 휴식, 통제감 회복, 업무 기대 수준 재확인이 중요하다.',
  '이직/커리어':
    '이직 고민은 현재 불만과 미래 불안이 섞여 판단이 흐려지기 쉽다. 돈, 성장, 안정, 관계, 건강 중 기준을 하나 세우고 낮은 위험 행동부터 시작하게 돕는다.',
  '업무 스트레스':
    '업무 스트레스는 역할 모호성, 우선순위 충돌, 계속 바뀌는 요구에서 커질 수 있다. 마감, 기준, 우선순위, 최종 결정권자를 확인하게 돕는다.',
  '자기효능감/불안':
    '불안은 자동 생각과 함께 커진다. 생각을 사실로 단정하지 않고 근거와 반례를 나누며, 작은 행동 하나로 자기효능감을 회복하게 돕는다.',
  기타:
    '복합 고민은 해결보다 분류가 먼저다. 관계, 업무량, 평가, 건강, 커리어 중 어디가 중심인지 찾고 이번 주에 다룰 한 조각만 고르게 한다.',
}

function buildSystemPrompt() {
  return `당신은 15년 경력의 직장인 상담 전문가입니다. 산업·조직심리, 인지행동적 상담, 번아웃 회복, 직장 내 관계 갈등, 커리어 전환을 주로 다뤄왔습니다.

상담 태도:
- 사용자를 평가하거나 훈계하지 않는다.
- 일반론보다 사용자가 쓴 단어와 직장 맥락에서 보이는 패턴을 우선한다.
- 사용자의 표현을 최소 1개 이상 짧게 인용한다.
- 진단명, 법률 판단, 퇴사·신고·치료 같은 큰 결정을 단정하지 않는다.
- 전문 상담, 의료, 법률, 노무 자문을 대체한다고 말하지 않는다.
- 위험 신호가 보이면 즉시 주변 사람, 회사 공식 채널, 긴급 구조·전문기관 도움을 요청하라고 안내한다.

답변 모드: 1차 상담
- 한국어 300~500자.
- 구조: 감정 인정 1문장 → 핵심 패턴 1~2문장 → 바로 할 행동 1개 → 후속 질문 1개.
- 질문은 마지막에 1개만 한다. 중간에 질문 목록을 만들지 않는다.
- 행동 제안은 오늘 또는 이번 주 안에 가능한 수준이어야 한다.`
}

function buildUserPrompt(topic: string, tone: string, message: string) {
  const toneGuide = TONE_GUIDES[tone] ?? TONE_GUIDES['엄마처럼(따뜻)']
  const knowledge = TOPIC_KNOWLEDGE[topic] ?? TOPIC_KNOWLEDGE.기타

  return `상담 주제: ${topic}
원하는 톤: ${tone}
톤 지침: ${toneGuide}
주제 참고 지식: ${knowledge}

상담 내용:
${message}

참고 지식은 그대로 나열하지 말고, 사용자의 상황에 자연스럽게 녹여 답변하세요.`
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
      systemInstruction: { parts: [{ text: buildSystemPrompt() }] },
      contents: [
        {
          role: 'user',
          parts: [{ text: buildUserPrompt(topic, tone, message) }],
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
