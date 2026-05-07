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

export function Privacy() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-cyan-50">
      <SEOHead title="개인정보처리방침" description="직장 고민 상담 서비스의 개인정보처리방침입니다." path="/privacy" />
      <div className="mx-auto max-w-2xl px-5 py-14">
        <a
          href="/"
          className="inline-flex items-center gap-1 rounded-full border bg-white/70 px-3 py-1 text-xs text-neutral-600 backdrop-blur hover:bg-white/90"
        >
          ← 홈으로 돌아가기
        </a>

        <h1 className="mt-6 text-3xl font-semibold tracking-tight">개인정보처리방침</h1>
        <p className="mt-2 text-sm text-neutral-500">시행일: {EFFECTIVE_DATE}</p>

        <p className="mt-6 text-sm leading-relaxed text-neutral-700">
          <span className="font-semibold">{siteConfig.siteName}</span>(이하 "서비스")는 이용자의 개인정보를
          소중히 여기며, 「개인정보 보호법」 및 관련 법령을 준수합니다. 본 방침을 통해 수집하는 개인정보의
          항목·목적·보유 기간 및 처리 방법을 안내합니다.
        </p>

        <Section title="1. 수집하는 개인정보 항목">
          <p>서비스는 문의 접수 시 아래 항목을 수집합니다.</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>이름(닉네임 가능)</li>
            <li>연락처 (이메일 주소 또는 휴대폰 번호)</li>
            <li>상담 주제</li>
            <li>상담 내용(이용자가 직접 입력한 텍스트)</li>
          </ul>
          <p className="mt-2">자동으로 생성·수집되는 정보(IP 주소, 브라우저 정보 등)는 Google Analytics를 통해 통계 목적으로 수집될 수 있습니다.</p>
        </Section>

        <Section title="2. 개인정보 수집 및 이용 목적">
          <ul className="list-disc space-y-1 pl-5">
            <li>문의에 대한 답변 및 상담 연결</li>
            <li>서비스 품질 개선 및 이용 통계 분석</li>
          </ul>
        </Section>

        <Section title="3. 개인정보 보유 및 이용 기간">
          <p>
            문의 접수 목적 달성 후 <strong>3개월</strong> 이내에 파기합니다. 단, 관련 법령에 의해 보존이
            필요한 경우 해당 기간 동안 보관합니다.
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>전자상거래법에 의한 소비자 불만·분쟁 기록: 3년</li>
            <li>통신비밀보호법에 의한 로그 기록: 3개월</li>
          </ul>
        </Section>

        <Section title="4. 개인정보의 제3자 제공">
          <p>
            서비스는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만, 아래의 경우에는
            예외로 합니다.
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>이용자가 사전에 동의한 경우</li>
            <li>법령의 규정에 의거하거나 수사 목적으로 법령에 정해진 절차에 따라 요청이 있는 경우</li>
          </ul>
        </Section>

        <Section title="5. 개인정보 처리 위탁">
          <p>서비스는 원활한 운영을 위해 아래와 같이 처리를 위탁합니다.</p>
          <div className="mt-2 overflow-auto rounded-xl border">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-neutral-700">수탁업체</th>
                  <th className="px-4 py-2 text-left font-semibold text-neutral-700">위탁 업무</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="px-4 py-2">Vercel Inc.</td>
                  <td className="px-4 py-2">서버 호스팅 및 서비스 운영</td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-2">Google LLC (Gmail)</td>
                  <td className="px-4 py-2">이메일 발송</td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-2">Google LLC</td>
                  <td className="px-4 py-2">이용 통계 분석(Google Analytics)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="6. 정보주체의 권리·의무 및 행사 방법">
          <p>이용자는 언제든지 아래 권리를 행사할 수 있습니다.</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>개인정보 열람 요청</li>
            <li>오류 등이 있을 경우 정정 요청</li>
            <li>삭제 요청</li>
            <li>처리 정지 요청</li>
          </ul>
          <p className="mt-2">
            권리 행사는 아래 연락처로 이메일을 보내 주시면 지체 없이 조치하겠습니다.
          </p>
        </Section>

        <Section title="7. 개인정보 보호책임자">
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

        <Section title="8. 개인정보 처리방침 변경">
          <p>
            본 방침은 {EFFECTIVE_DATE}부터 시행됩니다. 변경 시 서비스 내 공지사항 또는 웹사이트를 통해
            사전 안내합니다.
          </p>
        </Section>

        <div className="mt-12 border-t pt-6 text-center text-xs text-neutral-400">
          © {new Date().getFullYear()} {siteConfig.siteName}
        </div>
      </div>
    </main>
  )
}
