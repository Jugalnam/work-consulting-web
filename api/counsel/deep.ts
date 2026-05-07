type Tone = '냉정하게' | '따뜻하게' | '엄마처럼' | '아빠처럼' | '코치처럼' | '친구처럼'

type Body = {
  topic?: string
  tone?: Tone
  message?: string
}

function buildDeepAnswer(tone: Tone, topic: string, message: string) {
  const header = `주제: ${topic}\n톤: ${tone}\n\n`
  const context = `입력 내용:\n${message.trim() || '(입력 없음)'}\n\n`

  const framework =
    `심층 정리(구조화):\n` +
    `1) 사실(관찰): 무엇이 반복되나요?\n` +
    `2) 해석(생각): 머릿속 자동 생각은 무엇인가요?\n` +
    `3) 감정/신체: 어떤 감정과 반응이 있나요?\n` +
    `4) 욕구/가치: 무엇이 중요해서 이렇게 힘든가요?\n` +
    `5) 선택지: 지금 선택 가능한 행동 3가지\n\n`

  const closingByTone: Record<Tone, string> = {
    냉정하게:
      `결론: 지금은 “감정 해결”보다 “상황 개선”이 우선입니다.\n- 이번 주 실행 1개: (예) 1:1 미팅에서 요구사항을 문서화해 확인하기\n- 경계 1개: (예) 야근 요청은 “가능/불가능” 기준을 먼저 공유\n\n추가 질문(1개만 답해도 됨): 지금 가장 잃고 싶지 않은 건 무엇인가요?`,
    따뜻하게:
      `지금까지 버텨온 과정 자체가 이미 큰 에너지였을 거예요.\n오늘은 “나를 지키는 선택”을 하나만 잡아도 충분합니다.\n\n추가 질문: 지금 당신에게 가장 필요한 건 위로/명확한 기준/실행 계획 중 무엇인가요?`,
    '엄마처럼':
      `아가, 네가 약해서가 아니라 상황이 너무 빡센 거야.\n너를 탓하는 생각이 올라오면, “나는 지금 도움을 받는 중이야”라고 말해주자.\n\n추가 질문: 오늘 하루만큼은 어떤 방식으로 너를 돌봐주고 싶어?`,
    '아빠처럼':
      `좋다. 이제는 방향을 정하자.\n- 단기 목표: 이번 달까지 ‘지킬 것 1개’와 ‘버릴 것 1개’ 결정\n- 중기 목표: 3개월 안에 환경을 바꿀지/협상할지 판단\n\n추가 질문: 남아야 하는 이유 1개, 떠나야 하는 이유 1개를 적어볼래?`,
    '코치처럼':
      `좋습니다. 실행으로 연결해볼게요.\n- 목표(측정 가능): 예) “주 3회 11시 이전 퇴근”\n- 장애물: 예) “업무 범위 불명확”\n- 실험: 예) “업무 요청 시 데드라인/우선순위 확인”을 1주일 실험\n\n추가 질문: 이번 주에 가장 영향력 큰 ‘한 사람/한 회의/한 순간’은 무엇인가요?`,
    '친구처럼':
      `솔직히 말하면, 너 지금 꽤 많이 참고 있어.\n그리고 참고만 하면 상황이 자동으로 좋아지진 않더라.\n\n우리 이렇게 해보자:\n- “꼭 해야 하는 말 1문장”을 같이 만들고\n- 그걸 언제, 누구에게, 어떤 톤으로 말할지 정하자.\n\n추가 질문: 그 사람(또는 상황)한테 진짜로 하고 싶은 말, 한 문장만 적어봐.`,
  }

  return `${header}${context}${framework}${closingByTone[tone]}`
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method not allowed' })
    return
  }

  const body = (req.body ?? {}) as Body
  const topic = (body.topic || '기타') as string
  const tone = (body.tone || '따뜻하게') as Tone
  const message = (body.message || '') as string

  const answer = buildDeepAnswer(tone, topic, message)
  res.status(200).json({ mode: 'deep', topic, tone, answer })
}

