# 0018 — 온보딩 가이드 투어 최초/오랜만 접속 유저 재노출 로직 및 마이페이지 다시보기 연동

- **작성일**: 2026-09-06
- **작성자**: Frontend Team
- **유형**: `feat`
- **관련 브랜치**: `feature/frontEom`
- **관련 이슈 / PR**: -

---

## 1. 배경 및 목적

기존 온보딩 가이드 투어는 완료 시 `localStorage`에 단순 플래그(`"1"`)를 저장하여 한 번 완료하면 영구히 재노출되지 않았습니다.
이에 따라 최초 로그인 사용자뿐만 아니라 오랜만에 서비스를 다시 방문한 휴면/복귀 사용자에게도 서비스 핵심 가이드라인이 노출되도록 타임스탬프 기반의 재노출 로직(`shouldShowTour`)을 구현하고, 마이페이지에서 언제든 가이드 투어를 다시 시작할 수 있는 수동 트리거를 추가했습니다.

---

## 2. 변경 내용 요약

1. **타임스탬프 기반 투어 노출 판정 유틸 (`src/app/app.tsx`)**:
   - `TOUR_STORAGE_KEY = "divurve_tour_done"`, `TOUR_INACTIVITY_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000` (7일 기준).
   - `shouldShowTour(storedValue, now)`:
     - 저장된 값이 없거나(`null`, 최초 로그인/접속),
     - 이전 레거시 플래그(`"1"`) 또는 비정상 포맷인 경우,
     - 마지막 투어 완료 시점으로부터 7일 이상 경과한(오랜만에 접속한) 경우 모두 `true`를 반환하여 가이드 투어 활성화.
   - 투어 완료 시 현재 타임스탬프(`Date.now().toString()`)를 저장.
2. **마이페이지 가이드 투어 다시보기 버튼 연동 (`src/screens/mypage/mypage-screen.tsx`, `app.tsx`)**:
   - `MyPageScreenProps`에 `onStartTour?: () => void` 추가.
   - 마이페이지 '바로가기' 섹션에 `가이드 투어 다시보기` 버튼 추가 (`sparkles` 아이콘).
   - 클릭 시 `handleStartTour()`를 통해 대시보드 온보딩 투어 모달을 즉시 재실행.
3. **단위 및 통합 테스트 검증 (`app.test.tsx`, `mypage-screen.test.tsx`)**:
   - `shouldShowTour`의 최초/레거시/최근/휴면 유저 조건별 분기 단위 테스트 추가.
   - 마이페이지 내 가이드 투어 다시보기 버튼 클릭 시 투어 실행 통합 테스트 추가.
   - 전체 42개 파일, 218개 테스트 전원 통과 및 100% 커버리지 유지.

---

## 3. 기술적 결정 및 근거

| 결정 항목 | 선택 | 이유 |
|---|---|---|
| 단순 플래그에서 타임스탬프 전환 | `Date.now().toString()` 저장 | 7일 이상 비접속 휴면 복귀 유저를 감지하여 적응을 돕는 가이드라인 재노출 가능 |
| 레거시 플래그("1") 호환 마이그레이션 | 레거시 값 감지 시 투어 노출 및 타임스탬프로 갱신 | 기존에 한 번 봐서 투어가 차단되었던 사용자도 자연스럽게 가이드를 확인할 수 있도록 지원 |
| 마이페이지 수동 다시보기 지원 | 바로가기 섹션 내 투어 시작 버튼 제공 | 사용자가 원할 때 언제든 다시 기능을 복습할 수 있는 접근성 보장 |

---

## 4. 영향 범위 및 검증 결과

- **영향 파일**:
  - `src/app/app.tsx`
  - `src/app/app.test.tsx`
  - `src/screens/mypage/mypage-screen.tsx`
  - `src/screens/mypage/mypage-screen.test.tsx`
  - `docs/tech-changelog/0018-onboarding-tour-reactivation-and-dormant-logic.md` (신규)
- **검증 결과**:
  - `npm run test -- --run --coverage` (42 test files, 218 tests) 100% 커버리지 달성
  - `npm run build` (`tsc --noEmit && vite build`) 빌드 성공

---

## 5. 롤백 계획

이슈 발생 시 `shouldShowTour` 조건을 단순 null 체크로 복구하거나 마이페이지 `onStartTour` prop을 제거합니다.
