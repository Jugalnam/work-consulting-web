type Tone = '냉정하게' | '따뜻하게' | '엄마처럼' | '아빠처럼' | '코치처럼' | '친구처럼'

type Body = {
  topic?: string
  tone?: Tone
  message?: string
}

function buildAnswer(tone: Tone, topic: string, message: string) {
  const common = `주제: ${topic}\n\n당신의 상황 요약:\n- ${message.trim() || '(입력 없음)'}\n`

  switch (tone) {
    case '냉정하게':
      return `${common}\n핵심만 말할게요.\n1) 지금 문제를 ‘통제 가능한 것/불가능한 것’으로 나누세요.\n2) 다음 72시간 안에 할 수 있는 행동 1개를 정하세요.\n3) 감정은 기록하되, 행동은 작게 실행하세요.\n\n질문: 지금 가장 바꾸고 싶은 건 ‘관계/업무량/평가/미래불안’ 중 무엇인가요?`
    case '엄마처럼':
      return `${common}\n많이 힘들었겠다. 여기까지 버틴 것만으로도 충분히 잘하고 있어.\n오늘은 3가지만 해보자.\n- 지금 가장 무거운 감정에 이름 붙이기\n- 나를 지키는 최소한의 경계 1개 정하기\n- 내 편이 되어줄 사람/장소 1개 떠올리기\n\n원하면, 어떤 순간에 제일 마음이 무너졌는지 한 장면만 더 알려줘.`
    case '아빠처럼':
      return `${common}\n괜찮다. 지금은 방향만 잡으면 된다.\n- 목표: 당장 ‘버티기’가 아니라 ‘정리’다.\n- 기준: 내 건강/성과/관계를 동시에 다 잡으려 하지 말자.\n- 방법: 이번 주에 하나만 바꾸자.\n\n지금 상황에서 가장 큰 리스크가 뭐라고 보니? (건강/평가/관계/커리어)`
    case '코치처럼':
      return `${common}\n좋아요. 문제를 구조화해볼게요.\n1) 원하는 상태(목표): 무엇이 되면 ‘상담이 도움됐다’고 느낄까요?\n2) 현재 상태: 방해 요소 1~2개는 무엇인가요?\n3) 선택지: 할 수 있는 행동 3개를 적고, 비용/효과를 비교해봅시다.\n\n질문: 목표를 한 문장으로 적어볼까요? (예: “퇴근 후에도 마음이 편해지고 싶다”)`
    case '친구처럼':
      return `${common}\n오케이, 일단 네 편부터 할게.\n지금 상황에서 제일 짜증나는 포인트가 뭐야?\n그리고 “그 사람이/그 일이” 건드리는 네 기준이 뭔지도 같이 보자.\n\n한 가지 제안: 오늘은 딱 10분만 ‘사실/해석/감정’을 나눠서 써보자.`
    case '따뜻하게':
    default:
      return `${common}\n지금 겪는 감정이 당연해요. 먼저 숨을 고르고, 상황을 조금만 정리해볼게요.\n- 어떤 일이 있었는지(사실)\n- 그걸 어떻게 받아들였는지(해석)\n- 그래서 어떤 감정/몸반응이 있었는지(반응)\n\n질문: ‘가장 자주 반복되는 장면’이 있다면 한 가지를 적어주실래요?`
  }
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

  const answer = buildAnswer(tone, topic, message)
  res.status(200).json({ mode: 'basic', topic, tone, answer })
}

