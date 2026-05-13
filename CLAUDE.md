# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 이 프로젝트는 무엇인가
직장인 고민 상담/코칭 서비스 랜딩 페이지. React + Vite + Tailwind CSS v4 + TypeScript. Vercel에 배포.

## 개발 명령어

```bash
npm run dev       # 로컬 개발 서버 (http://localhost:5173)
npm run build     # TypeScript 타입 체크 → Vite 빌드
npm run lint      # ESLint 실행
npm run preview   # 빌드 결과물 로컬 미리보기
```

> Vercel Serverless Functions(`api/` 폴더)는 `npm run dev`로는 실행되지 않는다. 함수 테스트는 `vercel dev` 명령 또는 실제 Vercel 배포 후에 가능하다.

## 아키텍처 핵심

### 설정의 중심: `src/config/siteConfig.ts`
모든 설정(사이트명, SEO, GA ID, 라우팅 모드, API 활성화 여부 등)이 여기에 집중된다. **새 기능을 추가하기 전에 여기서 설정값을 확인한다.**

- `routing: 'single' | 'multi'` — `'single'`이면 BrowserRouter 없이 `<Home />`만 렌더링, `'multi'`이면 react-router-dom 사용
- `api.enabled: false` — 이 값이 `false`이면 `apiClient`의 모든 호출이 즉시 에러를 던진다

### Serverless Functions: `api/` 폴더
Vercel에서 각 파일이 독립 API 엔드포인트가 된다.

| 파일 | 역할 |
|------|------|
| `api/inquiry.ts` | 문의 폼 수신 → Gmail(nodemailer)로 메일 발송. `GMAIL_USER` + `GMAIL_PASS` 환경 변수 필요 |
| `api/og.tsx` | OG 이미지 동적 생성 (`@vercel/og`, Edge Runtime). `siteConfig.ogImage: '/api/og'` |

### 마스터 컴포넌트 (수정 금지)
| 파일 | 역할 |
|------|------|
| `src/components/SEOHead.tsx` | `siteConfig` 기반 메타태그/OG/트위터카드 자동 생성 |
| `src/components/AnalyticsProvider.tsx` | GA 스크립트 동적 로드. `trackEvent()`, `trackPageView()` export |
| `src/components/ShareButtons.tsx` | 카카오/트위터/링크복사 버튼 |
| `src/services/apiClient.ts` | GET/POST + 타임아웃·재시도·캐시 처리 |
| `src/hooks/useApiCall.ts` | API 로딩·에러 상태 관리 훅 (race condition 처리 포함) |

### AI가 만드는 영역
- `src/pages/` — 페이지 컴포넌트 (현재: Home, Privacy, Terms)
- `src/components/` — 마스터 컴포넌트 외의 UI 컴포넌트
- `src/data/`, `src/types/` — 데이터 구조
- `src/services/api/` — 프로젝트별 API 호출 로직

## 환경 변수

`.env.example` 참고. 프론트(Vite)에서 쓰려면 `VITE_` 접두어 필수.

| 변수 | 용도 |
|------|------|
| `VITE_KAKAO_APP_KEY` | 카카오 공유 버튼 |
| `VITE_GA_ID` | GA ID (siteConfig에서도 설정 가능) |
| `VITE_API_KEY` | API 인증키 (`X-API-Key` 헤더로 전송) |
| `VITE_API_BASE_URL` | API 베이스 URL (siteConfig보다 우선) |
| `GMAIL_USER` | Serverless Function용 Gmail 계정 |
| `GMAIL_PASS` | Gmail 앱 비밀번호 |

## 사용 패턴

**SEO 오버라이드**: 페이지별 타이틀·설명을 바꿀 때
```tsx
<SEOHead title="페이지 제목" description="설명" />
```

**GA 이벤트 전송**: 중요한 사용자 행동에
```tsx
import { trackEvent } from '../components/AnalyticsProvider'
trackEvent('submit', 'inquiry_form', '문의 제출')
```

**API 호출 활성화**: Tier 3 이상으로 올릴 때
1. `siteConfig.api.enabled`를 `true`로 변경
2. `src/services/api/`에 호출 로직 작성
3. `api/` 폴더에 Serverless Function 추가

## API Tier 가이드
- **Tier 1** (현재): `api.enabled: false`. 정적 콘텐츠 + 인페이지 폼 UI
- **Tier 2**: 무료 외부 API를 프론트에서 직접 호출
- **Tier 3**: `api/` 폴더에 Vercel Serverless Function 추가 (API 키 서버에서 보호)
- **Tier 4**: 별도 백엔드 서버 구축

## 현재 인스턴스 정보
- **서비스**: 직장 내 스트레스·관계·이직·승진 고민 다루는 직장 고민 상담 랜딩
- **신청 방식**: 사이트 내 문의 폼 → `api/inquiry.ts`로 Gmail 발송
- **디자인 방향**: 차분·신뢰. 과한 "힐링" 이미지 지양. 직장인에게 부담 없는 문장과 명확한 CTA
- **페이지**: 홈(원페이지) — 히어로, 고민 유형, 프로세스, 소개, FAQ, 문의 폼, 푸터 + `/privacy`, `/terms`
