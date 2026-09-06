# 0013. DIVURVE 랜딩 페이지 (LandingPage.tsx) 구현 및 온보딩 진입 플로우 연동

| 항목 | 내용 |
|---|---|
| 날짜 | 2026-09-06 |
| 작성자 | Antigravity (AI Agent) |
| 변경 유형 | feat |
| 영향 범위 | 랜딩 페이지 컴포넌트(`LandingPage.tsx`, `LandingPage.test.tsx`), 메인 앱(`app.tsx`, `app.test.tsx`), 스타일 토큰(`tokens.css`) |
| 관련 브랜치 | feature/frontEom |
| 관련 커밋 | 123ad22 |
| 관련 이슈·PR | (이슈/PR 생성 후 기입) |

## 변경 사유 (Why)
- 서비스명 및 브랜드 아이덴티티(DIVURVE = Divisa + Curve)를 명확히 전달하고, 서비스의 3대 핵심 가치(몬테카를로 팬 차트 예측, 스마트 분할 환전 라우트, 외화 리스크 X-Ray)를 한눈에 파악할 수 있는 고품질 랜딩 페이지 구축.
- 신규 방문자가 대시보드 진입 전 서비스 소개, 어원, 작동 방식, 통계 지표를 확인하고 부드럽게 온보딩할 수 있도록 `App` 레벨에서 `showLanding` 상태 분기 제공.

## 변경 내용 (What)
1. **디자인 토큰 및 Google Fonts 통합**:
   - `Sora`(Display), `JetBrains Mono`(Mono), `Inter`(Sans) 폰트 import 및 `--font-display`, `--font-mono`, `--font-sans`, `--muted` 토큰 선언.
   - 다크/라이트 테마 전역 호환 변수 및 네온 글로우 효과 적용.
2. **`LandingPage.tsx` 컴포넌트 구현**:
   - **네비게이션 헤더**: 반응형 메뉴, 테마 전환 버튼, 대시보드 CTA 버튼.
   - **히어로 섹션**: 헤드라인, 몬테카를로 팬 차트(80% 신뢰구간 밴드 + 실제 과거 환율 + 투영 경로) 라이브 프리뷰, 실시간 3대 통화(USD, JPY, EUR) 미니 스파크라인 티커.
   - **어원(Etymology) 섹션**: Divisa(외화) + Curve(확률 곡선) = DIVURVE 그라디언트 브랜딩 인터랙션.
   - **주요 기능(Features) 섹션**: 3대 핵심 기능 카드(호버 glow 및 elevation 효과).
   - **작동 방식(How it Works) 4단계 섹션**: 마우스 호버 시 스프링 바운스(`translateY(-6px)`), 네온 글로우 번호, 세부 항목 슬라이드 다운(`max-height` transition), 하단 액센트 라인 확장 애니메이션.
   - **성과 통계(Stats) 섹션**: 4대 핵심 지표(`tabular-nums`).
   - **하단 CTA 및 푸터**: 대시보드 바로가기 및 면책조항.
3. **순수 CSS + `useInView` 스크롤 인터랙션**:
   - 외부 라이브러리 없이 `IntersectionObserver` 기반으로 섹션별 진입 애니메이션 구현(한 번 진입 시 고정).
4. **차트 애니메이션 보존**:
   - Recharts 컴포넌트의 내장 애니메이션(`isAnimationActive={true}`) 유지.
5. **App.tsx 연동**:
   - `showLanding` state를 통해 초기 방문 시 랜딩 페이지를 표시하고, `onEnter` 시 메인 대시보드로 자연스럽게 전환.
6. **단위/통합 테스트 및 커버리지 100% 검증**:
   - `LandingPage.test.tsx` 작성 및 `app.test.tsx` 갱신.

## 검증
- [x] 전체 40개 테스트 파일, 165개 단위/통합 테스트 100% 통과 (`npm.cmd test`)
- [x] 테스트 커버리지 100% 달성 (`Statements: 100%`, `Branches: 100%`, `Functions: 100%`, `Lines: 100%`)
- [x] TypeScript 및 Vite 프로덕션 빌드 성공 (`tsc --noEmit && vite build`)

## 롤백 방법
- 이 변경 관련 커밋을 revert합니다.
