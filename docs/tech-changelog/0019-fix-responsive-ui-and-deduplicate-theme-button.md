# 0019. UI 레이아웃 반응형 개선 및 테마 토글 버튼 중복 제거

| 항목 | 내용 |
|---|---|
| 날짜 | 2026-09-06 |
| 작성자 | AI Agent (Antigravity) |
| 변경 유형 | fix / ui |
| 영향 범위 | 화면 전반 (Landing, Auth, Home, Forecast, X-Ray, Route, MyPage, Layout) |
| 관련 브랜치 | fix/responsive-ui-layout |
| 관련 커밋 | - |
| 관련 이슈·PR | - |

## 변경 사유 (Why)
1. **반응형 레이아웃 깨짐 현상 해결**:
   - 모바일, 태블릿, 데스크톱 등 다양한 뷰포트 너비 및 브라우저 화면 비율에서 `gridTemplateColumns: repeat(auto-fit, minmax(320px, 1fr))` 및 하위 고정 폭(`gridColumn: span 2`, 고정 px 막대 너비 등)으로 인해 가로 오버플로우 및 깨짐 현상이 발생하는 문제를 해결.
   - `AuthPage`, `LandingPage` 등에서 미정의 CSS 클래스 누락으로 인한 렌더링 결함을 순수 CSS 반응형 규칙으로 전환.
2. **테마 토글 버튼 중복 제거**:
   - 사이드바(좌하단)와 헤더(우상단) 두 곳에 라이트/다크 모드 전환 버튼이 중복 배치되어 있어, 헤더 우상단 단일 버튼으로 일원화하고 온보딩 투어 타겟을 연동.

## 변경 내용 (What)
- **`src/styles/layout.css`**:
  - 미디어 쿼리 기반 반응형 유틸리티 클래스(`.hidden-below-md`, `.hidden-below-lg`, `.hidden-lg`, `.landing-nav`, `.forecast-main-grid`, `.forecast-chart-card` 등) 추가 및 가로 스크롤 방지.
- **`src/components/layout/sidebar.tsx` & `header.tsx`**:
  - `sidebar.tsx` 하단 영역의 테마 토글 버튼 제거.
  - `header.tsx` 테마 토글 버튼에 `data-tour="tour-theme"` 부착.
  - `OnboardingTour.tsx`에서 우상단 헤더 버튼 위치에 맞춰 툴팁 배치 및 화살표 방향 스마트 조정.
- **`src/screens/forecast/forecast-screen.tsx`**:
  - 1컬럼 모바일 화면에서 가로 깨짐을 유발하던 고정 `gridColumn: "span 2"` 제거 및 `.forecast-chart-card` 클래스로 1024px 이상 데스크톱에서만 2열 span 적용.
  - 전망 동인 고정 너비 바를 반응형 너비로 제한.
- **`src/screens/xray/` & `src/screens/route/` & `src/screens/home/` & `src/screens/mypage/`**:
  - 고정 `3.5rem`, `4.5rem` 수치 폰트를 `clamp(...)` 반응형 폰트로 전환.
  - 그리드 컬럼을 `minmax(min(100%, 280px), 1fr)` 형태로 안전하게 제한하여 소형 디바이스(320px~375px)에서도 넘침 현상 방지.
  - 컨테이너 패딩 및 다열 스탯 박스를 `clamp` 및 `flex-wrap`으로 유연화.
- **`src/AuthPage.tsx` & `src/LandingPage.tsx`**:
  - 반응형 클래스 연동 및 패딩 유연화.

## 영향 / 리스크
- 사이드바 하단 UI가 간소화되고 테마 변경 인터랙션이 헤더 우상단으로 단일화됨.
- 기존 모든 비즈니스 로직 및 계산 수치, API 인터페이스에는 변경 없음.

## 검증
- [x] 테스트 통과 (42개 테스트 파일, 218개 테스트 전체 통과)
- [x] TypeScript 컴파일 및 Vite 프로덕션 빌드 성공 (`npm run build`)
- [x] ESLint 검사 통과 (`npm run lint`)

## 롤백 방법
- 본 변경 커밋을 `git revert`하여 이전 버전으로 롤백.
