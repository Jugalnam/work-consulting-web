# 직장 고민 상담

## 이 프로젝트는 무엇인가
직장인(직장생활) 고민을 위한 상담/코칭 서비스 웹페이지를 빠르게 만들기 위한 템플릿입니다.
새 프로젝트를 시작할 때 이 폴더를 복사하고, `src/config/siteConfig.ts`를 수정한 뒤,
UI 구현은 AI 도구(Cursor 등)에게 맡깁니다.

## 마스터가 담당하는 것 (이미 구현됨 - 건드리지 마세요)
- **`siteConfig.ts`**: 모든 설정의 중심. 이름, SEO, GA, API 설정
- **`SEOHead.tsx`**: siteConfig 기반 메타태그/OG/트위터카드 자동 생성
- **`AnalyticsProvider.tsx`**: GA 자동 로드 + 이벤트 전송 헬퍼
- **`ShareButtons.tsx`**: 카카오/트위터/링크복사 공유 버튼 + GA 이벤트
- **`apiClient.ts + cache.ts`**: API 호출 엔진 (타임아웃, 재시도, 캐싱)
- **`useApiCall.ts`**: API 로딩/에러 상태 자동 관리 훅
- **`vercel.json`**: Vercel 배포 + Serverless Functions 설정

## AI가 담당하는 것 (자유롭게 만드세요)
- 레이아웃 (Header, Footer, 전체 구조)
- 디자인 (색상, 폰트, 애니메이션, 다크모드)
- 페이지 구현 (`src/pages/`)
- 데이터 구조 (`src/data/`, `src/types/`)
- 프로젝트별 API 호출 로직 (`src/services/api/`)
- Serverless Functions (`api/` 폴더)

## 사용 규칙
1. SEO: 페이지를 추가할 때 `<SEOHead title="..." description="..." />`로 오버라이드하세요
2. GA: 중요한 행동에 `trackEvent('action', 'category', 'label')` 호출하세요
3. 공유: 공유가 의미 있는 곳에 `<ShareButtons />` 배치하세요
4. API: `siteConfig.api.enabled`를 true로 바꾸고, `src/services/api/`에 호출 로직 추가하세요
5. 환경 변수: API 키는 `.env`에, 절대 코드에 직접 넣지 마세요

## API Tier 가이드
- Tier 1 (기본): `api.enabled: false`. 정적 콘텐츠로 시작
- Tier 2: 무료 외부 API를 프론트에서 직접 호출
- Tier 3: `api/` 폴더에 Vercel Serverless Function 추가. API 키를 서버에서 보호
- Tier 4: 별도 백엔드 서버 구축

## 새 인스턴스 시작 시 (아래를 채우세요)

### Instance: Idea
직장 내 스트레스, 관계, 이직·승진 고민 등을 다루는 **직장 고민 상담** 랜딩. 신청은 **사이트 내 문의 폼**으로 유도.

### Instance: Tier
Tier 1 (정적 콘텐츠 + 인페이지 문의 폼 UI). 전송은 추후(Tier 3)에서 연결.

### Instance: Pages
- 홈(원페이지): 히어로, 고민 유형, 프로세스, 소개, FAQ, 문의 폼, 푸터
- (선택) multi 시: `/privacy`, `/terms` 또는 `/legal`

### Instance: Design
차분·신뢰. 과한 “힐링” 이미지 지양. 직장인에게 부담 없는 문장과 명확한 CTA.

