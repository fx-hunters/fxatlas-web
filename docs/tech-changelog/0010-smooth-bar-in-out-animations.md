# 0010. 인디케이터 바 및 진행률 바 자연스러운 In/Out 모션 애니메이션 적용

| 항목 | 내용 |
|---|---|
| 날짜 | 2026-09-06 |
| 작성자 | Antigravity (AI Agent) |
| 변경 유형 | feat |
| 영향 범위 | 디자인 토큰 (src/styles/tokens.css), 공용 컴포넌트(ProgressBar), 레이아웃(Sidebar, MobileNav), 화면 컴포넌트(AttentionBanner, ForecastScreen, MyPageScreen, XRayFitnessView) |
| 관련 브랜치 | feat/smooth-bar-animations |
| 관련 커밋 | ffccded |
| 관련 이슈·PR | (이슈/PR 생성 후 기입) |

## 변경 사유 (Why)
- 사용자의 시각적 인지와 부드러운 상호작용 경험을 극대화하기 위해 프로그레스 바(ProgressBar), 사이드바/모바일 내비게이션 활성 인디케이터 바, 알림 배너 및 토스트 바, 시뮬레이션 지표 바 등의 진입(In)·퇴장(Out) 및 상태 변화 시 자연스러운 감속 곡선(cubic-bezier(0.16, 1, 0.3, 1)) 모션을 적용하기 위함.

## 변경 내용 (What)
- **모션 디자인 토큰 및 키프레임 (`src/styles/tokens.css`)**:
  - `--ease-out-smooth: cubic-bezier(0.16, 1, 0.3, 1)` 및 `--ease-in-out-smooth` 타이밍 함수 추가.
  - `@keyframes barSlideInDown`, `@keyframes barGrowIn`, `@keyframes barFadeIn`, `@keyframes barPulseGlow` 키프레임 정의.
- **프로그레스 바 컴포넌트 (`src/components/common/progress-bar.tsx`)**:
  - 비율 변동 시 부드러운 `width 0.6s var(--ease-out-smooth)` 및 `transformOrigin: left` 전환 모션 적용.
- **사이드바 & 모바일 내비게이션 바 (`src/components/layout/sidebar.tsx`, `src/components/layout/mobile-nav.tsx`)**:
  - 사이드바: 선택된 메뉴 좌측에 수직 인디케이터 바가 `scaleY(0) -> scaleY(1)`로 부드럽게 등장/퇴장하는 애니메이션 적용.
  - 모바일 내비게이션: 선택된 탭 상단에 수평 인디케이터 바가 너비와 투명도 전환(`width: 0 -> 2rem`)과 함께 자연스럽게 나타나도록 적용.
- **배너 & 토스트 알림 (`src/screens/home/attention-banner.tsx`, `src/screens/mypage/mypage-screen.tsx`)**:
  - 슬라이드 다운 + 페이드 인 키프레임 애니메이션(`barSlideInDown 0.35s`) 적용.
- **차트 및 시뮬레이터 바 (`src/screens/forecast/forecast-screen.tsx`, `src/screens/xray/xray-fitness-view.tsx`)**:
  - 통화별 전망 동인 수평 바 및 적합도 변동성 시뮬레이션 바에 부드러운 감속 트랜지션 적용.

## 검증
- [x] 전체 39개 테스트 파일, 147개 단위/통합 테스트 100% 통과 (`npm.cmd test`)
- [x] TypeScript 빌드 및 Vite 프로덕션 번들링 성공 (`npm.cmd run build`)
- [x] 모바일 / 데스크톱 뷰포트에서의 부드러운 바 애니메이션 동작 검증

## 롤백 방법
- 이 변경 관련 커밋을 revert합니다.
