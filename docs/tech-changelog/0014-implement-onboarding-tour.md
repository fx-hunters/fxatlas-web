# 0014 — 온보딩 투어 가이드 구현 및 대시보드 연동

- **작성일**: 2026-09-06
- **작성자**: Frontend Team
- **유형**: `feat`
- **관련 브랜치**: `feature/frontEom`
- **관련 이슈 / PR**: -

---

## 1. 배경 및 목적

사용자가 랜딩 페이지에서 대시보드로 처음 진입할 때 주요 메뉴(홈, 환율 범위, 내 자산, 환전 플래너, 마이페이지, 테마 토글)의 기능과 역할을 단계별로 안내하는 온보딩 가이드 투어가 필요했습니다.
외부 무거운 라이브러리(Shepherd.js, Intro.js 등)에 의존하지 않고, 경량의 순수 React State와 CSS transition, Spotlight 오버레이 기법(`box-shadow: 0 0 0 9999px rgba(...)`)으로 자연스러운 스포트라이트와 툴팁 가이드 UI를 제공하도록 구현했습니다.

---

## 2. 변경 내용 요약

1. **온보딩 투어 컴포넌트 (`src/OnboardingTour.tsx`) 신규 구현**:
   - **Step 0**: 중앙 환영 모달 (서비스 가치 안내, 가로 점 바 프로그레스, 투어 시작/건너뛰기).
   - **Step 1~6**: 타겟 요소 DOM 측정(`getBoundingClientRect`) 기반 Spotlight 하이라이트 및 카드 툴팁 가이드.
   - 탭 이동(`onNavigate`) 연동 및 부드러운 위치/크기 트랜지션 제공.
   - 키보드/터치 및 백드롭 클릭을 통한 단계 진행 지원.
2. **사이드바 및 테마 토글 버튼 타겟 지정 (`src/components/layout/sidebar.tsx`)**:
   - `data-tour="tour-home"`, `tour-planner`, `tour-assets`, `tour-range`, `tour-mypage`, `tour-theme` 속성 부여.
3. **앱 루트 연동 (`src/app/app.tsx`)**:
   - `localStorage`의 `divurve_tour_done` 키 확인 후 첫 진입 시 온보딩 투어 활성화 (`showTour`).
   - 투어 완료 또는 건너뛰기 시 `localStorage`에 완료 상태 기록 및 모달 종료.
4. **테스트 커버리지 및 신뢰성 확보 (`src/OnboardingTour.test.tsx`, `src/app/app.test.tsx`)**:
   - 전체 라인, 브랜치, 함수, 구문 **100% 커버리지** 달성.

---

## 3. 기술적 결정 및 근거

| 결정 항목 | 선택 | 이유 |
|---|---|---|
| 외부 라이브러리 미사용 | 순수 React + CSS 전환 | 번들 크기 최소화 및 프로젝트 전역 CSS 토큰(`var(--primary)`, `var(--surface)` 등)과의 완벽한 일관성 유지 |
| Spotlight 오버레이 기법 | `box-shadow: 0 0 0 9999px` | 복잡한 캔버스나 SVG 마스킹 없이 단일 `div` 요소로 뷰포트 전체 딤 처리 및 타겟 영역 하이라이트 구현 가능 |
| 탭 네비게이션 연동 | `onNavigate(tab)` 콜백 | 투어 진행 중 스텝별 해당 탭으로 사이드바/메인 화면을 자동 전환하여 실제 UI 맥락에서 기능 학습 유도 |

---

## 4. 영향 범위 및 검증 결과

- **영향 파일**:
  - `src/OnboardingTour.tsx` (신규)
  - `src/OnboardingTour.test.tsx` (신규)
  - `src/components/layout/sidebar.tsx`
  - `src/app/app.tsx`
  - `src/app/app.test.tsx`
- **검증 결과**:
  - `npm run test -- --run --coverage` (41 test files, 174 tests) 전원 통과 및 100% 커버리지 달성
  - `npm run build` (`tsc --noEmit && vite build`) 성공

---

## 5. 롤백 계획

온보딩 투어 비활성화가 필요한 경우 `App.tsx`에서 `showTour` 상태 및 `<OnboardingTour />` 렌더링 부분을 롤백하면 기존 대시보드 직접 진입 동작으로 복원할 수 있습니다.
