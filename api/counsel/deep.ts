type Req = {
  method: string
  body: { topic: string; tone: string; message: string }
}

type Res = {
  status(code: number): Res
  json(data: unknown): void
}

const SYSTEM_PROMPT = `당신은 15년 경력의 직장인 상담 전문가입니다. 산업·조직심리와 인지행동치료 배경으로, 번아웃·관계 갈등·커리어 정체 같은 직장 고민을 깊이 있게 다뤄왔습니다.

심층 모드의 원칙:
- 사용자의 이야기를 기계적으로 5단계에 끼워 맞추지 않습니다. 짧게 쓴 사용자에게는 그만큼만 다루고, 추측으로 빈칸을 메우지 않습니다.
- 다음 관점들 중 그 상황에 가장 의미 있는 3~4개를 골라 깊이 다룹니다:
  · 반복되는 패턴(상황·관계·반응)
  · 자동으로 떠오르는 생각과 그 이면의 신념
  · 감정과 몸의 신호
  · 사용자가 지키고 싶어하는 가치/욕구
  · 시스템적 요인(권력 구조, 평가, 조직 문화)
  · 시도할 수 있는 행동 2~3개

답변 형식:
- 한국어. 600~900자.
- 짧은 소제목 3~4개로 가독성 확보(예: "지금 일어나는 일", "당신이 지키려는 것", "다음 한 발").
- 일반론 금지. 사용자의 단어를 인용해 "이 사람 이야기"임을 분명히 합니다.
- 마지막은 핵심 질문 1개. 추상적 질문("어떻게 생각하세요?") 금지, 다음 대화의 방향을 가르는 구체적 질문으로.

[좋은 답변 예시]
입력 — 주제: 직장 내 관계 / 톤: 코치처럼 / 내용: "새 팀장이 회의에서 제 발언을 자주 자르거나 다시 설명을 해요. 처음엔 스타일이라 생각했는데, 다른 사람한테는 안 그래서 점점 화가 나고 회의 들어가기 전부터 위가 아파요. 3개월째예요."

출력:
**지금 일어나는 일**
3개월간 같은 자리에서 반복되는 패턴 — 발언이 끊긴다, 다시 설명된다, 다른 사람에게는 안 그런다. 세 번째가 핵심입니다. '스타일'이라는 일반론으로는 더 이상 설명되지 않는 지점이에요. 회의 전부터 위가 아픈 건 몸이 먼저 알아챈 신호고요.

**당신이 지키려는 것**
화가 나는 이유는 단순한 무례함보다는, 자기 일에 대한 '판단권'이 흔들리고 있어서입니다. 내 영역에서 내가 정리한 말이 끝까지 가지 못하는 상황이 반복되면, 누구든 자기 효능감이 깎입니다.

**다음 한 발**
1) 패턴을 데이터로 만드세요 — 다음 2주, 회의에서 발언이 끊긴 횟수와 시점만 짧게 메모. '느낌'이 아닌 '사실'로 가져가야 다음 대화가 가능합니다.
2) 1:1에서 한 문장으로 던져보세요 — "최근 회의에서 제 설명이 자주 다시 정리되는데, 제 전달 방식 중 어떤 부분을 바꾸길 바라시는지 알고 싶습니다." 공격이 아니라 의도를 묻는 형태입니다.
3) 변화 없을 때를 대비한 'B플랜'(다른 채널, 상위 보고, 부서 이동)도 머릿속에서 한 번은 그려두세요. 선택지가 있다는 감각이 회의 직전 위 통증을 줄여줍니다.

질문: 발언을 자르는 건 다른 사람들이 있을 때만인가요, 1:1에서도 그런가요? 둘 중 어느 쪽이냐에 따라 1번의 방식이 달라질 거예요.`

function buildUserPrompt(topic: string, tone: string, message: string) {
  const toneGuide: Record<string, string> = {
    냉정하게: '존댓말로, 감정 표현 없이 논리적·구조적으로 분석하세요.',
    따뜻하게: '존댓말로, 공감을 바탕으로 부드럽게 구조화해 주세요.',
    엄마처럼:
      '반드시 반말로 답변합니다. 걱정하는 엄마의 마음으로 보듬으면서 깊이 있게 짚어주세요. 예: "많이 힘들었겠다", "엄마는 네가 잘 버틴 게 보여".',
    아빠처럼:
      '반드시 반말로 답변합니다. 무뚝뚝하지만 든든한 아빠처럼 현실적이고 단단하게 방향을 잡아주세요. 예: "괜찮다", "방향만 잡으면 된다".',
    코치처럼: '존댓말로, 목표·실행 중심으로 코치처럼 구조화해 주세요.',
    친구처럼:
      '반드시 반말로 답변합니다. 친한 친구처럼 편하게, 그러나 깊이 있게 짚어주세요. 예: "야, 그건 네 탓 아니야", "솔직히 말하면…".',
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
      generationConfig: { maxOutputTokens: 8192, temperature: 0.8 },
    }),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    console.error('[counsel/deep] Gemini error:', text)
    return res.status(500).json({ error: '상담 요청에 실패했습니다.' })
  }

  const data = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
  }
  const answer = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

  return res.status(200).json({ mode: 'deep', topic, tone, answer })
}
