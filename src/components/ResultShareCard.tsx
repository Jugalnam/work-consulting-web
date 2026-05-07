import { useMemo, useState } from 'react'
import { siteConfig } from '../config/siteConfig'

type Tone = '냉정하게' | '따뜻하게' | '엄마처럼' | '아빠처럼' | '코치처럼' | '친구처럼'

type Metric = {
  label: string
  value: number // 1..5
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function hash01(input: string) {
  // Deterministic tiny hash → 0..1
  let h = 2166136261
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0) / 2 ** 32
}

function toneHeadline(tone: Tone) {
  switch (tone) {
    case '냉정하게':
      return '핵심만 말할게요: “다음 행동 1개”부터 잡아요.'
    case '엄마처럼':
      return '오늘은 충분히 잘했어요. 이제, 나를 먼저 돌봐요.'
    case '아빠처럼':
      return '방향만 잡으면 돼요. 지킬 것 1개, 버릴 것 1개.'
    case '코치처럼':
      return '이번 주 실험 1개만 하면, 답이 보입니다.'
    case '친구처럼':
      return '너 진짜 많이 참았다. 이제 한 문장만 말해보자.'
    case '따뜻하게':
    default:
      return '괜찮아요. 지금은 “버티기”보다 “정리”가 먼저예요.'
  }
}

function summaryLines(topic: string) {
  // Generalized, share-safe. No user details.
  switch (topic) {
    case '번아웃':
      return [
        '에너지가 고갈된 상태에서 요구가 계속 쌓이고 있어요.',
        '반복될수록 “내가 부족해서”라는 생각이 커질 수 있어요.',
        '이번 주는 회복(수면/경계)부터 잡는 게 효과가 큽니다.',
      ]
    case '이직/커리어':
      return [
        '불확실성이 커질수록 선택이 더 어렵게 느껴질 수 있어요.',
        '결정 피로가 쌓이면 “지금도 싫고, 바꾸기도 무서운” 상태가 돼요.',
        '기준(가치) 1개만 먼저 세우면 선택이 쉬워집니다.',
      ]
    case '업무 스트레스':
      return [
        '업무가 불명확하면 스트레스는 “일”이 아니라 “예측 불가”에서 커져요.',
        '요구가 계속 바뀌면 통제감이 떨어지고 소진이 빨라집니다.',
        '범위/우선순위/마감을 문서로 맞추는 게 가장 큰 방어입니다.',
      ]
    case '자기효능감/불안':
      return [
        '불안은 종종 “내가 망칠 것 같아”라는 자동 생각을 키워요.',
        '생각이 커질수록 행동은 줄고, 더 불안해지는 루프가 생깁니다.',
        '작은 성공 1개를 만들면 자신감은 다시 올라옵니다.',
      ]
    case '직장 내 관계':
      return [
        '관계 스트레스는 “말”보다 “반복되는 패턴”에서 커집니다.',
        '상대의 반응을 예측할수록 더 위축되거나 과하게 맞추게 돼요.',
        '경계는 이기기 위한 게 아니라 나를 지키기 위한 장치입니다.',
      ]
    default:
      return [
        '지금 힘든 건 “의지가 약해서”가 아니라 부담이 누적돼서일 수 있어요.',
        '문제를 한 번에 해결하려 하면 오히려 막막해지기 쉽습니다.',
        '이번 주는 작은 행동 1개로 시작하는 게 좋습니다.',
      ]
  }
}

function microAction(topic: string) {
  switch (topic) {
    case '업무 스트레스':
      return '요청 1건만 “마감/우선순위”를 되물어 확인하기'
    case '직장 내 관계':
      return '불편한 상황 1개를 “사실/해석/감정”으로 10분만 분리해 적기'
    case '번아웃':
      return '오늘은 “퇴근 후 10분 산책”을 일정에 먼저 넣기'
    case '이직/커리어':
      return '“남을 이유 1개/떠날 이유 1개”를 메모로 적기'
    case '자기효능감/불안':
      return '내일 할 일 중 “가장 작은 것 1개”를 먼저 완료하기'
    default:
      return '이번 주에 바꿀 “아주 작은 행동 1개”를 정해보기'
  }
}

function promptQuestion(topic: string) {
  switch (topic) {
    case '직장 내 관계':
      return '당신이 지키고 싶은 “최소한의 경계”는 무엇인가요?'
    case '번아웃':
      return '지금 회복을 위해 “멈춰야 하는 것 1개”는 무엇인가요?'
    case '이직/커리어':
      return '결정을 쉽게 만드는 “기준 1개”는 무엇인가요?'
    case '업무 스트레스':
      return '요구가 바뀔 때, 가장 먼저 확인해야 할 건 무엇인가요?'
    case '자기효능감/불안':
      return '불안을 키우는 자동 생각은 어떤 문장으로 떠오르나요?'
    default:
      return '지금 가장 바꾸고 싶은 건 “관계/업무/평가/미래” 중 무엇인가요?'
  }
}

function buildMetrics(seed: string): Metric[] {
  const r1 = hash01(`${seed}:a`)
  const r2 = hash01(`${seed}:b`)
  const r3 = hash01(`${seed}:c`)

  return [
    { label: '스트레스', value: clamp(Math.round(2 + r1 * 3), 1, 5) },
    { label: '통제감', value: clamp(Math.round(1 + r2 * 4), 1, 5) },
    { label: '명확도', value: clamp(Math.round(1 + r3 * 4), 1, 5) },
  ]
}

function Dots({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          className={i < value ? 'h-2 w-2 rounded-full bg-black' : 'h-2 w-2 rounded-full bg-neutral-200'}
        />
      ))}
    </span>
  )
}

export function ResultShareCard({
  topic,
  tone,
}: {
  topic: string
  tone: Tone
}) {
  const [copied, setCopied] = useState(false)

  const headline = useMemo(() => toneHeadline(tone), [tone])
  const lines = useMemo(() => summaryLines(topic), [topic])
  const action = useMemo(() => microAction(topic), [topic])
  const question = useMemo(() => promptQuestion(topic), [topic])
  const metrics = useMemo(() => buildMetrics(`${topic}|${tone}`), [topic, tone])

  const shareText = useMemo(() => {
    return [
      `오늘의 직장 고민 상담 결과`,
      `주제: ${topic} / 톤: ${tone}`,
      ``,
      headline,
      `- ${lines[0]}`,
      `- ${lines[1]}`,
      `- ${lines[2]}`,
      ``,
      `오늘의 1분 행동: ${action}`,
      `질문: ${question}`,
      ``,
      siteConfig.siteUrl.replace(/\/+$/, ''),
    ].join('\n')
  }, [action, headline, lines, question, tone, topic])

  async function copyShareText() {
    try {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      alert('복사에 실패했습니다.')
    }
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border bg-white p-5 shadow-sm">
      <div className="pointer-events-none absolute inset-0 opacity-80">
        <div className="absolute -left-24 -top-24 h-56 w-56 rounded-full bg-gradient-to-br from-fuchsia-200 to-cyan-200 blur-2xl" />
        <div className="absolute -bottom-24 -right-24 h-56 w-56 rounded-full bg-gradient-to-br from-amber-200 to-pink-200 blur-2xl" />
      </div>

      <div className="relative">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="grid gap-1">
            <p className="text-xs font-semibold text-neutral-600">{siteConfig.siteName}</p>
            <p className="text-xs text-neutral-500">오늘의 1차 상담 결과</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border bg-white/70 px-3 py-1 text-xs">주제: {topic}</span>
            <span className="rounded-full border bg-white/70 px-3 py-1 text-xs">톤: {tone}</span>
          </div>
        </div>

        <p className="mt-4 text-lg font-semibold tracking-tight">{headline}</p>

        <div className="mt-4 grid gap-2 rounded-xl border bg-white/70 p-4">
          <p className="text-xs font-semibold text-neutral-600">3줄 요약</p>
          <ul className="list-disc space-y-1 pl-5 text-sm text-neutral-800">
            {lines.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <div className="rounded-xl border bg-white/70 p-4">
            <p className="text-xs font-semibold text-neutral-600">오늘의 1분 행동</p>
            <p className="mt-2 text-sm font-semibold">{action}</p>
          </div>
          <div className="rounded-xl border bg-white/70 p-4">
            <p className="text-xs font-semibold text-neutral-600">질문 1개</p>
            <p className="mt-2 text-sm font-semibold">{question}</p>
          </div>
        </div>

        <div className="mt-4 grid gap-2 rounded-xl border bg-white/70 p-4">
          <p className="text-xs font-semibold text-neutral-600">오늘의 지표</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {metrics.map((m) => (
              <div key={m.label} className="flex items-center justify-between gap-3">
                <span className="text-sm text-neutral-700">{m.label}</span>
                <Dots value={m.value} />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-neutral-500">공유용 문구는 사연 디테일 없이 요약만 포함합니다.</p>
          <button
            type="button"
            className="rounded-md border bg-white/70 px-3 py-2 text-sm"
            onClick={() => void copyShareText()}
          >
            {copied ? '복사됨!' : '결과 문구 복사'}
          </button>
        </div>
      </div>
    </div>
  )
}

