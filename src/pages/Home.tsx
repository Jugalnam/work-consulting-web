import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { SEOHead } from '../components/SEOHead'
import { ResultShareCard } from '../components/ResultShareCard'
import { ShareButtons } from '../components/ShareButtons'
import { MarkdownAnswer } from '../components/MarkdownAnswer'
import { siteConfig } from '../config/siteConfig'
import { trackEvent } from '../components/AnalyticsProvider'

type Tone = '냉정하게' | '따뜻하게' | '엄마처럼' | '아빠처럼' | '코치처럼' | '친구처럼'

type Step = 1 | 2 | 3 | 4 | 5 | 6

type ChatRole = 'user' | 'assistant'
type ChatMessage = {
  role: ChatRole
  content: string
}

type InquiryFormState = {
  name: string
  contact: string
  topic: string
  message: string
  consent: boolean
}

const initialState: InquiryFormState = {
  name: '',
  contact: '',
  topic: '직장 내 관계',
  message: '',
  consent: false,
}

function validate(values: InquiryFormState) {
  const errors: Partial<Record<keyof InquiryFormState, string>> = {}
  if (!values.name.trim()) errors.name = '이름을 입력해 주세요.'
  if (!values.contact.trim()) errors.contact = '연락처(이메일 또는 휴대폰)를 입력해 주세요.'
  if (!values.message.trim()) errors.message = '상담 내용을 간단히 입력해 주세요.'
  if (!values.consent) errors.consent = '개인정보 수집·이용에 동의해 주세요.'
  return errors
}

type CounselResponse = {
  mode: 'basic' | 'deep'
  topic: string
  tone: Tone
  answer: string
}

function buildBasicMockAnswer(tone: Tone, topic: string, message: string) {
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

function buildDeepMockAnswer(tone: Tone, topic: string, message: string) {
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
      `많이 힘들었겠다. 네가 약해서가 아니라 상황이 너무 빡센 거야.\n너를 탓하는 생각이 올라오면, “나는 지금 도움을 받는 중이야”라고 말해주자.\n\n추가 질문: 오늘 하루만큼은 어떤 방식으로 너를 돌봐주고 싶어?`,
    '아빠처럼':
      `좋다. 이제는 방향을 정하자.\n- 단기 목표: 이번 달까지 ‘지킬 것 1개’와 ‘버릴 것 1개’ 결정\n- 중기 목표: 3개월 안에 환경을 바꿀지/협상할지 판단\n\n추가 질문: 남아야 하는 이유 1개, 떠나야 하는 이유 1개를 적어볼래?`,
    '코치처럼':
      `좋습니다. 실행으로 연결해볼게요.\n- 목표(측정 가능): 예) “주 3회 11시 이전 퇴근”\n- 장애물: 예) “업무 범위 불명확”\n- 실험: 예) “업무 요청 시 데드라인/우선순위 확인”을 1주일 실험\n\n추가 질문: 이번 주에 가장 영향력 큰 ‘한 사람/한 회의/한 순간’은 무엇인가요?`,
    '친구처럼':
      `솔직히 말하면, 너 지금 꽤 많이 참고 있어.\n그리고 참고만 하면 상황이 자동으로 좋아지진 않더라.\n\n우리 이렇게 해보자:\n- “꼭 해야 하는 말 1문장”을 같이 만들고\n- 그걸 언제, 누구에게, 어떤 톤으로 말할지 정하자.\n\n추가 질문: 그 사람(또는 상황)한테 진짜로 하고 싶은 말, 한 문장만 적어봐.`,
  }

  return `${header}${context}${framework}${closingByTone[tone]}`
}

async function requestCounsel(mode: 'basic' | 'deep', payload: { topic: string; tone: Tone; message: string }) {
  // 로컬 개발(Vite dev)에서는 Vercel Serverless(`/api/*`)가 없으므로 모의 응답으로 폴백합니다.
  if (import.meta.env.DEV) {
    const answer =
      mode === 'basic'
        ? buildBasicMockAnswer(payload.tone, payload.topic, payload.message)
        : buildDeepMockAnswer(payload.tone, payload.topic, payload.message)
    await new Promise((r) => window.setTimeout(r, 900))
    return { mode, topic: payload.topic, tone: payload.tone, answer }
  }

  const res = await fetch(`/api/counsel/${mode}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `요청에 실패했습니다. (${res.status})`)
  }

  return (await res.json()) as CounselResponse
}

function classNames(...classes: Array<string | undefined | null | false>) {
  return classes.filter(Boolean).join(' ')
}

function StepPill({ index, label, active, done }: { index: number; label: string; active: boolean; done: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={classNames(
          'flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold',
          done ? 'bg-black text-white border-black' : active ? 'border-black text-black' : 'text-neutral-400',
        )}
      >
        {index}
      </div>
      <span className={classNames('text-xs', active ? 'text-black' : done ? 'text-neutral-700' : 'text-neutral-400')}>
        {label}
      </span>
    </div>
  )
}

function CardShell({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="wizard-enter rounded-3xl border bg-white/70 p-6 shadow-[0_12px_30px_-20px_rgba(0,0,0,0.35)] backdrop-blur">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      {description ? <p className="mt-2 text-sm text-neutral-600">{description}</p> : null}
      <div className="mt-6">{children}</div>
    </section>
  )
}

export function Home() {
  const [step, setStep] = useState<Step>(1)
  const [topic, setTopic] = useState<string>('직장 내 관계')
  const [tone, setTone] = useState<Tone>('따뜻하게')
  const [message, setMessage] = useState<string>('')

  const [basicCounsel, setBasicCounsel] = useState<CounselResponse | null>(null)
  const [deepCounsel, setDeepCounsel] = useState<CounselResponse | null>(null)
  const [isCounselLoading, setIsCounselLoading] = useState(false)
  const [counselError, setCounselError] = useState<string | null>(null)

  const [basicChat, setBasicChat] = useState<ChatMessage[]>([])
  const [basicFollowUp, setBasicFollowUp] = useState('')
  const [isBasicChatLoading, setIsBasicChatLoading] = useState(false)

  const [deepChat, setDeepChat] = useState<ChatMessage[]>([])
  const [deepFollowUp, setDeepFollowUp] = useState('')
  const [isDeepChatLoading, setIsDeepChatLoading] = useState(false)

  const [showInquiry, setShowInquiry] = useState(false)
  const [inquiryValues, setInquiryValues] = useState<InquiryFormState>(initialState)
  const [inquirySubmitted, setInquirySubmitted] = useState(false)
  const [isInquiryLoading, setIsInquiryLoading] = useState(false)
  const [inquiryErrors, setInquiryErrors] = useState<
    Partial<Record<keyof InquiryFormState, string>>
  >({})

  const [loadingLineIndex, setLoadingLineIndex] = useState(0)

  const topics = useMemo(
    () => ['직장 내 관계', '번아웃', '이직/커리어', '업무 스트레스', '자기효능감/불안', '기타'],
    [],
  )

  const tones = useMemo<Tone[]>(
    () => ['냉정하게', '따뜻하게', '엄마처럼', '아빠처럼', '코치처럼', '친구처럼'],
    [],
  )

  async function runBasicCounsel() {
    trackEvent('counsel_start', 'counseling', 'basic')
    setCounselError(null)
    setBasicCounsel(null)
    setIsCounselLoading(true)
    setStep(4)
    try {
      const data = await requestCounsel('basic', { topic, tone, message })
      setBasicCounsel(data)
      setBasicChat([
        { role: 'user', content: message },
        { role: 'assistant', content: data.answer },
      ])
      setBasicFollowUp('')
      trackEvent('counsel_complete', 'counseling', 'basic')
      setStep(5)
    } catch (e) {
      setCounselError(e instanceof Error ? e.message : '요청에 실패했습니다.')
      setStep(3)
    } finally {
      setIsCounselLoading(false)
    }
  }

  async function sendBasicFollowUp() {
    const text = basicFollowUp.trim()
    if (!text) return

    trackEvent('followup_send', 'counseling', 'basic')
    setCounselError(null)
    setIsBasicChatLoading(true)

    const nextChat: ChatMessage[] = [...basicChat, { role: 'user', content: text }]
    setBasicChat(nextChat)
    setBasicFollowUp('')

    try {
      // In v0: we embed history into the message so both mock/prod can respond without changing API.
      const historyPrompt = nextChat
        .slice(-8)
        .map((m) => `${m.role === 'user' ? '사용자' : '상담자'}: ${m.content}`)
        .join('\n\n')

      const data = await requestCounsel('basic', {
        topic,
        tone,
        message: `아래 대화 맥락을 참고해서 이어서 상담해줘.\n\n${historyPrompt}`,
      })

      setBasicChat((prev) => [...prev, { role: 'assistant', content: data.answer }])
    } catch (e) {
      setCounselError(e instanceof Error ? e.message : '요청에 실패했습니다.')
    } finally {
      setIsBasicChatLoading(false)
    }
  }

  async function runDeepCounsel() {
    trackEvent('counsel_start', 'counseling', 'deep')
    setCounselError(null)
    setDeepCounsel(null)
    setIsCounselLoading(true)
    setStep(6)
    try {
      const data = await requestCounsel('deep', { topic, tone, message })
      setDeepCounsel(data)
      setDeepChat([
        { role: 'user', content: message },
        { role: 'assistant', content: data.answer },
      ])
      setDeepFollowUp('')
      trackEvent('counsel_complete', 'counseling', 'deep')
    } catch (e) {
      setCounselError(e instanceof Error ? e.message : '요청에 실패했습니다.')
    } finally {
      setIsCounselLoading(false)
    }
  }

  function resetAll() {
    setStep(1)
    setTopic('직장 내 관계')
    setTone('따뜻하게')
    setMessage('')

    setBasicCounsel(null)
    setDeepCounsel(null)
    setCounselError(null)
    setIsCounselLoading(false)

    setBasicChat([])
    setBasicFollowUp('')
    setIsBasicChatLoading(false)

    setDeepChat([])
    setDeepFollowUp('')
    setIsDeepChatLoading(false)

    setShowInquiry(false)
    setInquirySubmitted(false)
    setIsInquiryLoading(false)
    setInquiryErrors({})
    setInquiryValues(initialState)
  }

  async function sendDeepFollowUp() {
    const text = deepFollowUp.trim()
    if (!text) return

    trackEvent('followup_send', 'counseling', 'deep')
    setCounselError(null)
    setIsDeepChatLoading(true)

    const nextChat: ChatMessage[] = [...deepChat, { role: 'user', content: text }]
    setDeepChat(nextChat)
    setDeepFollowUp('')

    try {
      const historyPrompt = nextChat
        .slice(-8)
        .map((m) => `${m.role === 'user' ? '사용자' : '상담자'}: ${m.content}`)
        .join('\\n\\n')

      const data = await requestCounsel('deep', {
        topic,
        tone,
        message: `아래 대화 맥락을 참고해서 이어서 심층 상담해줘.\\n\\n${historyPrompt}`,
      })

      setDeepChat((prev) => [...prev, { role: 'assistant', content: data.answer }])
      setDeepCounsel(data)
    } catch (e) {
      setCounselError(e instanceof Error ? e.message : '요청에 실패했습니다.')
    } finally {
      setIsDeepChatLoading(false)
    }
  }

  function onInquiryChange<K extends keyof InquiryFormState>(key: K, next: InquiryFormState[K]) {
    setInquiryValues((prev) => ({ ...prev, [key]: next }))
  }

  async function onInquirySubmit(e: FormEvent) {
    e.preventDefault()
    const nextErrors = validate(inquiryValues)
    setInquiryErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setIsInquiryLoading(true)
    try {
      if (import.meta.env.DEV) {
        await new Promise((r) => window.setTimeout(r, 800))
        setInquirySubmitted(true)
        return
      }

      const res = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: inquiryValues.name,
          contact: inquiryValues.contact,
          topic: inquiryValues.topic,
          message: inquiryValues.message,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string }
        throw new Error(data.error ?? '전송에 실패했습니다.')
      }

      trackEvent('inquiry_submit', 'inquiry', inquiryValues.topic)
      setInquirySubmitted(true)
    } catch (err) {
      setInquiryErrors({ message: err instanceof Error ? err.message : '전송에 실패했습니다.' })
    } finally {
      setIsInquiryLoading(false)
    }
  }

  useEffect(() => {
    // "심리테스트" 느낌으로 스텝 변경 시 상단으로 이동
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [step])

  const loadingLines = useMemo(() => {
    const base = [
      '상담 톤을 맞추는 중…',
      '상황을 요약하는 중…',
      '실행 가능한 한 가지를 찾는 중…',
      '답변을 다듬는 중…',
    ]
    return base
  }, [])

  useEffect(() => {
    if (step !== 4 && !(step === 6 && isCounselLoading)) return
    setLoadingLineIndex(0)
    const id = window.setInterval(() => {
      setLoadingLineIndex((prev) => (prev + 1) % loadingLines.length)
    }, 900)
    return () => window.clearInterval(id)
  }, [isCounselLoading, loadingLines.length, step])

  const progress = useMemo(() => {
    const map: Record<Step, number> = { 1: 10, 2: 25, 3: 45, 4: 65, 5: 80, 6: 95 }
    return map[step]
  }, [step])

  const stepBgClass = useMemo(() => {
    switch (step) {
      case 1:
        return 'from-indigo-50 via-white to-cyan-50'
      case 2:
        return 'from-fuchsia-50 via-white to-indigo-50'
      case 3:
        return 'from-cyan-50 via-white to-amber-50'
      case 4:
        return 'from-indigo-100 via-white to-pink-100'
      case 5:
        return 'from-fuchsia-100 via-white to-cyan-100'
      case 6:
      default:
        return 'from-indigo-100 via-white to-amber-100'
    }
  }, [step])

  const topicMeta = useMemo(() => {
    const map: Record<string, { icon: string; hint: string }> = {
      '직장 내 관계': { icon: '💬', hint: '말/태도/경계' },
      번아웃: { icon: '🔥', hint: '소진/회복' },
      '이직/커리어': { icon: '🧭', hint: '방향/기준' },
      '업무 스트레스': { icon: '📌', hint: '우선순위/범위' },
      '자기효능감/불안': { icon: '🌫️', hint: '생각/불안 루프' },
      기타: { icon: '🧩', hint: '복합 고민' },
    }
    return map
  }, [])

  const toneMeta = useMemo(() => {
    const map: Record<Tone, { icon: string; desc: string }> = {
      냉정하게: { icon: '🧊', desc: '핵심·행동 중심' },
      따뜻하게: { icon: '☁️', desc: '공감·정리 중심' },
      엄마처럼: { icon: '🫶', desc: '보듬는 위로' },
      아빠처럼: { icon: '🧱', desc: '기준·방향 제시' },
      코치처럼: { icon: '🎯', desc: '목표·실험 설계' },
      친구처럼: { icon: '🤝', desc: '편하게 대화' },
    }
    return map
  }, [])

  return (
    <main className={classNames('min-h-screen bg-gradient-to-b transition-colors duration-300', stepBgClass)}>
      <SEOHead path="/" />
      <div className="mx-auto max-w-3xl px-5 py-10">
        <header className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border bg-white/70 px-3 py-1 text-xs text-neutral-700 backdrop-blur">
            <span className="font-semibold text-black">1차</span>
            <span>→</span>
            <span>심층</span>
            <span>→</span>
            <span>문의하기</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">{siteConfig.siteName}</h1>
          <p className="text-base text-neutral-700">{siteConfig.siteDescription}</p>
        </header>

        <div className="mt-8 rounded-3xl border bg-white/70 p-4 shadow-[0_12px_30px_-20px_rgba(0,0,0,0.35)] backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-3">
              <StepPill index={1} label="고민 선택" active={step === 1} done={step > 1} />
              <StepPill index={2} label="톤 선택" active={step === 2} done={step > 2} />
              <StepPill index={3} label="내용 입력" active={step === 3} done={step > 3} />
              <StepPill index={4} label="대기" active={step === 4} done={step > 4} />
              <StepPill index={5} label="결과" active={step === 5} done={step > 5} />
              <StepPill index={6} label="심층" active={step === 6} done={false} />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-xl border bg-white/60 px-3 py-2 text-xs backdrop-blur hover:bg-white/80"
                onClick={resetAll}
              >
                처음부터 다시하기
              </button>
              <span className="text-xs text-neutral-600">{progress}%</span>
              <div className="h-2 w-20 overflow-hidden rounded-full bg-neutral-100 sm:w-44">
                <div
                  className="h-full bg-gradient-to-r from-indigo-600 via-fuchsia-500 to-cyan-500 transition-[width] duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          {step === 1 ? (
            <CardShell title="화면 1 · 직장생활 중 고민을 골라주세요" description="가장 가까운 주제 하나를 선택하세요.">
              <div className="grid grid-cols-2 gap-3">
                {topics.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      trackEvent('select_topic', 'counseling', t)
                      setTopic(t)
                      setStep(2)
                    }}
                    className={classNames(
                      'group relative overflow-hidden rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:border-black/30 hover:bg-white/70 hover:shadow-[0_16px_40px_-28px_rgba(0,0,0,0.55)]',
                      topic === t ? 'border-black/40 bg-white/80 shadow-[0_16px_40px_-28px_rgba(0,0,0,0.55)]' : 'bg-white/50',
                    )}
                  >
                    <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-gradient-to-br from-indigo-200 to-fuchsia-200 blur-2xl opacity-0 transition group-hover:opacity-70" />
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">{t}</p>
                        <p className="mt-1 text-xs text-neutral-600">{topicMeta[t]?.hint ?? '선택해 주세요'}</p>
                      </div>
                      <div className="text-xl">{topicMeta[t]?.icon ?? '🗂️'}</div>
                    </div>
                    <p className="mt-3 text-xs text-neutral-500">선택하면 다음 화면으로 이동합니다.</p>
                  </button>
                ))}
              </div>
              <div className="mt-6 text-xs text-neutral-500">
                선택한 고민: <span className="font-semibold text-neutral-900">{topic}</span>
              </div>
            </CardShell>
          ) : null}

          {step === 2 ? (
            <CardShell title="화면 2 · 원하는 톤을 골라주세요" description="답변이 나오는 말투/느낌이 달라집니다.">
              <div className="grid grid-cols-2 gap-3">
                {tones.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      trackEvent('select_tone', 'counseling', t)
                      setTone(t)
                      setStep(3)
                    }}
                    className={classNames(
                      'group relative overflow-hidden rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:border-black/30 hover:bg-white/70 hover:shadow-[0_16px_40px_-28px_rgba(0,0,0,0.55)]',
                      tone === t ? 'border-black/40 bg-white/80 shadow-[0_16px_40px_-28px_rgba(0,0,0,0.55)]' : 'bg-white/50',
                    )}
                  >
                    <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-gradient-to-br from-cyan-200 to-amber-200 blur-2xl opacity-0 transition group-hover:opacity-70" />
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">{t}</p>
                        <p className="mt-1 text-xs text-neutral-600">{toneMeta[t].desc}</p>
                      </div>
                      <div className="text-xl">{toneMeta[t].icon}</div>
                    </div>
                    <p className="mt-3 text-xs text-neutral-500">선택하면 다음 화면으로 이동합니다.</p>
                  </button>
                ))}
              </div>

              <div className="mt-6 flex gap-2">
                <button
                  type="button"
                  className="rounded-xl border bg-white/60 px-4 py-2 text-sm backdrop-blur hover:bg-white/80"
                  onClick={() => setStep(1)}
                >
                  이전
                </button>
              </div>
            </CardShell>
          ) : null}

          {step === 3 ? (
            <CardShell
              title="화면 3 · 고민을 입력해 주세요"
              description="구체적으로 적을수록 답변이 좋아집니다. (예시를 참고해도 좋아요)"
            >
              <div className="grid gap-3">
                <div className="rounded-xl border bg-neutral-50 p-4 text-sm text-neutral-700">
                  <p className="font-semibold text-neutral-900">예시</p>
                  <p className="mt-2">
                    “상사가 업무 지시를 자주 바꾸고, 제가 실수한 것처럼 몰아가요. 퇴근 후에도 계속
                    생각나서 잠이 잘 안 와요.”
                  </p>
                </div>

                <textarea
                  className="min-h-36 rounded-2xl border bg-white/70 px-4 py-3 text-sm shadow-sm backdrop-blur focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="지금 겪는 상황을 편하게 적어주세요."
                />

                {counselError ? (
                  <div className="rounded-xl bg-red-50 p-4 text-sm text-red-900">{counselError}</div>
                ) : null}

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-xl border bg-white/60 px-4 py-2 text-sm backdrop-blur hover:bg-white/80"
                    onClick={() => setStep(2)}
                  >
                    이전
                  </button>
                  <button
                    type="button"
                    className="rounded-xl bg-gradient-to-r from-indigo-600 via-fuchsia-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_18px_50px_-28px_rgba(79,70,229,0.8)] disabled:opacity-50"
                    disabled={!message.trim()}
                    onClick={() => void runBasicCounsel()}
                  >
                    1차 상담 시작
                  </button>
                </div>

                <p className="text-xs text-neutral-500">
                  선택한 주제: <span className="font-semibold text-neutral-900">{topic}</span> · 톤:{' '}
                  <span className="font-semibold text-neutral-900">{tone}</span>
                </p>
              </div>
            </CardShell>
          ) : null}

          {step === 4 ? (
            <CardShell title="화면 4 · 상담을 준비 중이에요" description="잠시만 기다려 주세요.">
              <div className="grid gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-300 border-t-black" />
                  <p className="text-sm text-neutral-700">
                    1차 상담 답변을 생성하고 있어요… <span className="font-semibold">{loadingLines[loadingLineIndex]}</span>
                  </p>
                </div>

                <div className="rounded-2xl border bg-gradient-to-br from-neutral-50 to-white p-5">
                  <p className="text-xs font-semibold text-neutral-500">광고/안내 영역</p>
                  <p className="mt-2 text-sm font-semibold">직장 고민, 혼자 끌어안지 마세요</p>
                  <p className="mt-2 text-sm text-neutral-700">
                    답변이 부족하면 심층 상담을 시도하거나, “문의하기”로 더 깊게 이어갈 수 있어요.
                  </p>
                  <ul className="mt-3 list-disc pl-5 text-sm text-neutral-700">
                    <li>원하는 톤으로 답변을 받을 수 있어요</li>
                    <li>심층 상담은 추후 유료 API로 전환 가능</li>
                    <li>그래도 부족하면 사람 상담/후속 문의로 연결</li>
                  </ul>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    className="rounded-xl border bg-white/60 px-4 py-2 text-sm backdrop-blur hover:bg-white/80"
                    disabled={isCounselLoading}
                    onClick={() => setStep(3)}
                  >
                    입력으로 돌아가기
                  </button>
                </div>
              </div>
            </CardShell>
          ) : null}

          {step === 5 ? (
            <CardShell
              title="화면 5 · 1차 상담 결과"
              description="공유 카드와 함께, 필요하면 심층 상담으로 넘어갈 수 있어요."
            >
              <div className="grid gap-4">
                <ResultShareCard topic={topic} tone={tone} />

                <div className="rounded-2xl border bg-neutral-50 p-5">
                  <p className="text-xs font-semibold text-neutral-600">상담 내용(상세)</p>
                  <div className="mt-3 text-[15px] leading-[1.75] text-neutral-800">
                    {basicCounsel?.answer ? (
                      <MarkdownAnswer>{basicCounsel.answer}</MarkdownAnswer>
                    ) : (
                      <p>결과를 불러오지 못했습니다.</p>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold">대화로 더 물어보기 (1차 상담)</p>
                    <span className="text-xs text-neutral-500">필요하면 2~3번 더 물어보고 결정해도 돼요</span>
                  </div>

                  <div className="mt-4 max-h-72 overflow-auto rounded-xl border bg-white p-4">
                    <div className="grid gap-3">
                      {basicChat.length === 0 ? (
                        <p className="text-sm text-neutral-600">
                          아직 대화가 없어요. 위 단계에서 1차 상담을 먼저 시작해 주세요.
                        </p>
                      ) : (
                        basicChat.map((m, idx) => (
                          // eslint-disable-next-line react/no-array-index-key
                          <div key={idx} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                            <div
                              className={classNames(
                                'max-w-[85%] rounded-2xl px-4 py-3 text-[15px] leading-[1.75]',
                                m.role === 'user'
                                  ? 'whitespace-pre-wrap bg-black text-white'
                                  : 'bg-neutral-100 text-neutral-800',
                              )}
                            >
                              {m.role === 'assistant' ? (
                                <MarkdownAnswer>{m.content}</MarkdownAnswer>
                              ) : (
                                m.content
                              )}
                            </div>
                          </div>
                        ))
                      )}
                      {isBasicChatLoading ? (
                        <div className="flex justify-start">
                          <div className="rounded-2xl bg-neutral-100 px-4 py-3 text-sm text-neutral-700">
                            답변 작성 중…
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]">
                    <input
                      className="rounded-xl border px-4 py-3 text-sm"
                      value={basicFollowUp}
                      onChange={(e) => setBasicFollowUp(e.target.value)}
                      placeholder="추가로 물어보고 싶은 내용을 적어보세요. (예: 지금 당장 할 수 있는 한 가지는?)"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          void sendBasicFollowUp()
                        }
                      }}
                      disabled={isBasicChatLoading}
                    />
                    <button
                      type="button"
                      className="rounded-xl bg-black px-4 py-3 text-sm text-white disabled:opacity-50"
                      disabled={isBasicChatLoading || basicFollowUp.trim().length === 0}
                      onClick={() => void sendBasicFollowUp()}
                    >
                      보내기
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border p-5">
                  <p className="text-sm font-semibold">공유 카드</p>
                  <p className="mt-2 text-sm text-neutral-600">
                    결과가 도움이 됐다면 링크를 공유해보세요. (카카오 키/GA는 나중에 연결해도 됩니다)
                  </p>
                  <div className="mt-4">
                    <ShareButtons />
                  </div>
                </div>

                <div className="rounded-2xl border bg-white/60 p-4 text-xs text-neutral-600 backdrop-blur">
                  이 서비스는 의료/법률/위기 개입을 대체하지 않습니다. 위기 상황(자해/타해 위험 등)에서는
                  즉시 지역의 긴급 도움을 이용해 주세요.
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-xl border bg-white/60 px-4 py-2 text-sm backdrop-blur hover:bg-white/80"
                    onClick={() => setStep(3)}
                  >
                    다시 입력하기
                  </button>
                  <button
                    type="button"
                    className="rounded-xl bg-gradient-to-r from-indigo-600 via-fuchsia-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_18px_50px_-28px_rgba(79,70,229,0.8)]"
                    onClick={() => void runDeepCounsel()}
                  >
                    더 상담하고 싶어요 (심층 상담)
                  </button>
                  <button
                    type="button"
                    className="rounded-xl border bg-white/60 px-4 py-2 text-sm backdrop-blur hover:bg-white/80"
                    onClick={() => {
                      trackEvent('inquiry_open', 'inquiry', topic)
                      setShowInquiry(true)
                      setInquiryValues((prev) => ({
                        ...prev,
                        topic,
                        message,
                      }))
                      setStep(6)
                      window.setTimeout(() => {
                        document.getElementById('inquiry')?.scrollIntoView({ behavior: 'smooth' })
                      }, 50)
                    }}
                  >
                    그래도 부족해요 (문의하기)
                  </button>
                </div>
              </div>
            </CardShell>
          ) : null}

          {step === 6 ? (
            <CardShell title="화면 6 · 심층 상담" description="조금 더 구조적으로 정리해서 답변합니다.">
              <div className="grid gap-4">
                {isCounselLoading ? (
                  <div className="grid gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-300 border-t-black" />
                      <p className="text-sm text-neutral-700">
                        심층 상담 답변을 생성하고 있어요… <span className="font-semibold">{loadingLines[loadingLineIndex]}</span>
                      </p>
                    </div>
                    <div className="rounded-2xl border bg-gradient-to-br from-neutral-50 to-white p-5">
                      <p className="text-xs font-semibold text-neutral-500">안내</p>
                      <p className="mt-2 text-sm text-neutral-700">
                        트래픽이 커지면 이 단계는 유료 API로 전환할 수 있도록 구조를 분리해뒀어요.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {counselError ? (
                      <div className="rounded-xl bg-red-50 p-4 text-sm text-red-900">{counselError}</div>
                    ) : null}

                    <div className="rounded-2xl border bg-neutral-50 p-5">
                      <p className="text-xs text-neutral-600">
                        주제 <span className="font-semibold text-neutral-900">{topic}</span> · 톤{' '}
                        <span className="font-semibold text-neutral-900">{tone}</span>
                      </p>
                      <div className="mt-4 text-[15px] leading-[1.75] text-neutral-800">
                        {deepCounsel?.answer ? (
                          <MarkdownAnswer>{deepCounsel.answer}</MarkdownAnswer>
                        ) : (
                          <p>심층 상담 결과가 아직 없습니다.</p>
                        )}
                      </div>
                    </div>

                    <div className="rounded-2xl border bg-white/60 p-5 backdrop-blur">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold">대화로 더 물어보기 (심층 상담)</p>
                        <span className="text-xs text-neutral-500">심층 단계에서도 추가 질문이 가능합니다</span>
                      </div>

                      <div className="mt-4 max-h-72 overflow-auto rounded-2xl border bg-white/70 p-4 shadow-sm">
                        <div className="grid gap-3">
                          {deepChat.length === 0 ? (
                            <div className="grid gap-3">
                              <p className="text-sm text-neutral-600">
                                아직 심층 상담 대화가 없어요. 1차 결과 화면에서 “심층 상담”을 눌러 시작해 주세요.
                              </p>
                              <button
                                type="button"
                                className="w-fit rounded-xl border bg-white/60 px-4 py-2 text-sm backdrop-blur hover:bg-white/80"
                                onClick={() => setStep(5)}
                              >
                                1차 결과로 돌아가기
                              </button>
                            </div>
                          ) : (
                            deepChat.map((m, idx) => (
                              // eslint-disable-next-line react/no-array-index-key
                              <div key={idx} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                                <div
                                  className={classNames(
                                    'max-w-[85%] rounded-2xl px-4 py-3 text-[15px] leading-[1.75]',
                                    m.role === 'user'
                                      ? 'whitespace-pre-wrap bg-black text-white'
                                      : 'bg-neutral-100 text-neutral-800',
                                  )}
                                >
                                  {m.role === 'assistant' ? (
                                    <MarkdownAnswer>{m.content}</MarkdownAnswer>
                                  ) : (
                                    m.content
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                          {isDeepChatLoading ? (
                            <div className="flex justify-start">
                              <div className="rounded-2xl bg-neutral-100 px-4 py-3 text-sm text-neutral-700">
                                답변 작성 중…
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </div>

                      <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]">
                        <input
                          className="rounded-2xl border bg-white/70 px-4 py-3 text-sm shadow-sm backdrop-blur focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
                          value={deepFollowUp}
                          onChange={(e) => setDeepFollowUp(e.target.value)}
                          placeholder="심층 상담에 추가 질문을 적어보세요."
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              void sendDeepFollowUp()
                            }
                          }}
                          disabled={isDeepChatLoading || deepChat.length === 0}
                        />
                        <button
                          type="button"
                          className="rounded-2xl bg-gradient-to-r from-indigo-600 via-fuchsia-500 to-cyan-500 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
                          disabled={isDeepChatLoading || deepChat.length === 0 || deepFollowUp.trim().length === 0}
                          onClick={() => void sendDeepFollowUp()}
                        >
                          보내기
                        </button>
                      </div>
                    </div>

                    <div className="rounded-2xl border bg-white/60 p-4 text-xs text-neutral-600 backdrop-blur">
                      이 서비스는 의료/법률/위기 개입을 대체하지 않습니다. 위기 상황(자해/타해 위험 등)에서는
                      즉시 지역의 긴급 도움을 이용해 주세요.
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="rounded-xl border bg-white/60 px-4 py-2 text-sm backdrop-blur hover:bg-white/80"
                        onClick={() => setStep(5)}
                      >
                        1차 결과로 돌아가기
                      </button>
                      <button
                        type="button"
                        className="rounded-xl border bg-white/60 px-4 py-2 text-sm backdrop-blur hover:bg-white/80"
                        onClick={() => {
                          trackEvent('inquiry_open', 'inquiry', topic)
                          setShowInquiry(true)
                          setInquiryValues((prev) => ({ ...prev, topic, message }))
                          window.setTimeout(() => {
                            document.getElementById('inquiry')?.scrollIntoView({ behavior: 'smooth' })
                          }, 50)
                        }}
                      >
                        그래도 부족해요 (문의하기)
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </CardShell>
          ) : null}

          {step === 6 && showInquiry ? (
            <section id="inquiry" className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold tracking-tight">문의하기</h2>
              <p className="mt-2 text-sm text-neutral-600">
                자동 상담으로 부족하다고 느낄 때만 사용하세요. 제출은 “접수”까지만 동작합니다. 실제
                전송(메일/알림)은 추후 연결합니다.
              </p>

              {inquirySubmitted ? (
                <div className="mt-4 rounded-xl bg-green-50 p-4 text-sm text-green-900">
                  접수가 완료되었습니다. 빠른 시일 내에 연락드리겠습니다.
                </div>
              ) : null}

              <form className="mt-6 grid gap-4" onSubmit={(e) => { void onInquirySubmit(e) }}>
                <div className="grid gap-2">
                  <label className="text-sm font-medium" htmlFor="name">
                    이름
                  </label>
                  <input
                    id="name"
                    className="rounded-md border px-3 py-2"
                    value={inquiryValues.name}
                    onChange={(e) => onInquiryChange('name', e.target.value)}
                    placeholder="홍길동"
                  />
                  {inquiryErrors.name ? <p className="text-sm text-red-600">{inquiryErrors.name}</p> : null}
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium" htmlFor="contact">
                    연락처 (이메일 또는 휴대폰)
                  </label>
                  <input
                    id="contact"
                    className="rounded-md border px-3 py-2"
                    value={inquiryValues.contact}
                    onChange={(e) => onInquiryChange('contact', e.target.value)}
                    placeholder="email@example.com 또는 010-0000-0000"
                  />
                  {inquiryErrors.contact ? <p className="text-sm text-red-600">{inquiryErrors.contact}</p> : null}
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium" htmlFor="inquiry-topic">
                    상담 주제
                  </label>
                  <select
                    id="inquiry-topic"
                    className="rounded-md border px-3 py-2"
                    value={inquiryValues.topic}
                    onChange={(e) => onInquiryChange('topic', e.target.value)}
                  >
                    {topics.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium" htmlFor="inquiry-message">
                    간단한 상황 설명
                  </label>
                  <textarea
                    id="inquiry-message"
                    className="min-h-28 rounded-md border px-3 py-2"
                    value={inquiryValues.message}
                    onChange={(e) => onInquiryChange('message', e.target.value)}
                    placeholder="예: 자동 상담으로는 해결이 어려웠던 지점이 무엇인지 적어주세요."
                  />
                  {inquiryErrors.message ? <p className="text-sm text-red-600">{inquiryErrors.message}</p> : null}
                </div>

                <div className="grid gap-2">
                  <label className="flex items-start gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={inquiryValues.consent}
                      onChange={(e) => onInquiryChange('consent', e.target.checked)}
                    />
                    <span>
                      문의 처리를 위해 개인정보(이름, 연락처, 문의 내용) 수집·이용에 동의합니다.{' '}
                      <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 text-indigo-600">
                        개인정보처리방침
                      </a>
                    </span>
                  </label>
                  {inquiryErrors.consent ? <p className="text-sm text-red-600">{inquiryErrors.consent}</p> : null}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="submit"
                    disabled={isInquiryLoading}
                    className="rounded-xl bg-gradient-to-r from-indigo-600 via-fuchsia-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_18px_50px_-28px_rgba(79,70,229,0.8)] disabled:opacity-50"
                  >
                    {isInquiryLoading ? '전송 중…' : '문의 접수'}
                  </button>
                  <button
                    type="button"
                    className="rounded-xl border bg-white/60 px-4 py-2 text-sm backdrop-blur hover:bg-white/80"
                    onClick={() => {
                      setInquirySubmitted(false)
                      setInquiryErrors({})
                      setInquiryValues(initialState)
                      setShowInquiry(false)
                    }}
                  >
                    닫기
                  </button>
                </div>
              </form>
            </section>
          ) : null}

          <footer className="pt-4 text-center text-xs text-neutral-500 space-y-2">
            <div className="flex justify-center gap-4">
              <a href="/terms" className="underline underline-offset-2 hover:text-neutral-700">이용약관</a>
              <a href="/privacy" className="underline underline-offset-2 hover:text-neutral-700">개인정보처리방침</a>
            </div>
            <div>© {new Date().getFullYear()} {siteConfig.siteName}</div>
          </footer>
        </div>
      </div>
    </main>
  )
}

