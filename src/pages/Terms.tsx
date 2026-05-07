import { SEOHead } from '../components/SEOHead'
import { siteConfig } from '../config/siteConfig'

const EFFECTIVE_DATE = '2026년 5월 7일'
const CONTACT_EMAIL = 'fortin2004@gmail.com'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold tracking-tight text-neutral-900">{title}</h2>
      <div className="mt-3 space-y-2 text-sm leading-relaxed text-neutral-700">{children}</div>
    </section>
  )
}

export function Terms() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-cyan-50">
      <SEOHead title="이용약관" description="직장 고민 상담 서비스의 이용약관입니다." path="/terms" />
      <div className="mx-auto max-w-2xl px-5 py-14">
        <a
          href="/"
          className="inline-flex items-center gap-1 rounded-full border bg-white/70 px-3 py-1 text-xs text-neutral-600 backdrop-blur hover:bg-white/90"
        >
          ← 홈으로 돌아가기
        </a>

        <h1 className="mt-6 text-3xl font-semibold tracking-tight">이용약관</h1>
        <p className="mt-2 text-sm text-neutral-500">시행일: {EFFECTIVE_DATE}</p>

        <p className="mt-6 text-sm leading-relaxed text-neutral-700">
          본 약관은 <span className="font-semibold">{siteConfig.siteName}</span>(이하 "서비스")의 이용 조건 및
          절차, 이용자와 서비스 운영자의 권리·의무에 관한 사항을 규정합니다.
        </p>

        <Section title="제1조 (목적)">
          <p>
            본 약관은 서비스가 제공하는 직장인 고민 상담 서비스의 이용과 관련하여 서비스와 이용자 간의
            권리, 의무 및 책임 사항을 규정함을 목적으로 합니다.
          </p>
        </Section>

        <Section title="제2조 (서비스의 내용)">
          <p>서비스는 다음과 같은 기능을 제공합니다.</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>AI 기반 직장인 고민 상담 (1차 상담 / 심층 상담)</li>
            <li>상담 결과 공유 기능</li>
            <li>전문 상담 연결을 위한 문의 접수</li>
          </ul>
          <p className="mt-2">
            본 서비스는 의료, 법률, 심리 치료 등 전문적인 서비스를 대체하지 않습니다.
            위기 상황(자해·타해 위험 등)에서는 즉시 전문 기관의 도움을 받으시기 바랍니다.
          </p>
        </Section>

        <Section title="제3조 (서비스 이용)">
          <p>이용자는 본 약관에 동의함으로써 서비스를 이용할 수 있습니다.</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>서비스는 별도의 회원가입 없이 이용할 수 있습니다.</li>
            <li>이용자는 서비스 이용 시 타인의 개인정보를 무단으로 입력해서는 안 됩니다.</li>
            <li>서비스를 통해 생성된 상담 결과는 참고용이며, 전문가 상담을 대체하지 않습니다.</li>
          </ul>
        </Section>

        <Section title="제4조 (금지 행위)">
          <p>이용자는 다음 행위를 해서는 안 됩니다.</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>서비스를 이용한 불법적인 행위</li>
            <li>타인의 개인정보 도용 또는 허위 정보 제출</li>
            <li>서비스의 정상적인 운영을 방해하는 행위</li>
            <li>서비스에서 제공하는 콘텐츠를 무단으로 복제·배포·상업적으로 이용하는 행위</li>
          </ul>
        </Section>

        <Section title="제5조 (서비스의 중단)">
          <p>
            서비스는 시스템 점검, 장비 교체, 천재지변 등 불가피한 사유가 발생한 경우 서비스 제공을
            일시적으로 중단할 수 있습니다. 이 경우 사전 또는 사후에 공지합니다.
          </p>
        </Section>

        <Section title="제6조 (면책 조항)">
          <ul className="list-disc space-y-1 pl-5">
            <li>
              서비스는 AI가 생성한 상담 결과의 정확성·완전성을 보장하지 않으며, 이를 근거로 한
              이용자의 행동에 대해 책임을 지지 않습니다.
            </li>
            <li>
              이용자가 서비스에 입력한 내용으로 인해 발생하는 문제에 대해 서비스는 책임을 지지 않습니다.
            </li>
            <li>
              서비스는 이용자 간 또는 이용자와 제3자 간의 분쟁에 개입하지 않습니다.
            </li>
          </ul>
        </Section>

        <Section title="제7조 (개인정보 보호)">
          <p>
            서비스의 개인정보 처리에 관한 사항은{' '}
            <a href="/privacy" className="text-indigo-600 underline underline-offset-2">
              개인정보처리방침
            </a>
            을 따릅니다.
          </p>
        </Section>

        <Section title="제8조 (약관의 변경)">
          <p>
            서비스는 필요한 경우 본 약관을 변경할 수 있으며, 변경된 약관은 서비스 내 공지를 통해
            안내합니다. 변경 후 서비스를 계속 이용하면 변경된 약관에 동의한 것으로 간주합니다.
          </p>
        </Section>

        <Section title="제9조 (문의)">
          <ul className="list-none space-y-1">
            <li>
              <span className="font-semibold">서비스명:</span> {siteConfig.siteName}
            </li>
            <li>
              <span className="font-semibold">이메일:</span>{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-indigo-600 underline underline-offset-2">
                {CONTACT_EMAIL}
              </a>
            </li>
          </ul>
        </Section>

        <div className="mt-12 border-t pt-6 text-center text-xs text-neutral-400">
          © {new Date().getFullYear()} {siteConfig.siteName}
        </div>
      </div>
    </main>
  )
}
