export const siteConfig = {
  // ── 기본 정보 (SEO + 공유에 사용) ──
  siteName: '직장 고민 상담',
  siteDescription:
    '직장 내 관계, 번아웃, 이직·승진 고민 등 직장생활의 고충을 함께 정리하는 1:1 상담입니다.',
  siteUrl: 'https://work-consulting-web.vercel.app',
  ogImage: '/og-image.svg',
  author: '직장 고민 상담',
  blogUrl: '',
  locale: 'ko_KR',
  keywords: [
    '직장인 상담',
    '직장 고민',
    '번아웃',
    '직무 스트레스',
    '직장 내 관계',
    '커리어 고민',
  ],

  // ── 라우팅 ──
  routing: 'single' as 'single' | 'multi',

  // ── Google Analytics ──
  gaId: null as string | null,

  // ── Google Search Console ──
  gscVerification: null as string | null,

  // ── 공유 버튼 ──
  share: {
    kakao: true,
    twitter: true,
    copyLink: true,
  },

  // ── API 설정 ──
  api: {
    enabled: false,
    baseUrl: '',
    timeout: 10000 as number,
    retryCount: 2 as number,
    cacheMinutes: 30 as number,
    fallbackToMock: false,
  },
} as const

export type SiteConfig = typeof siteConfig

