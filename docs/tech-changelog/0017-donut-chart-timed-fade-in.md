# 0017 — 외화 비중 도넛 차트 회전 애니메이션 연동 중앙 숫자 페이드 인 구현

- **작성일**: 2026-09-06
- **작성자**: Frontend Team
- **유형**: `feat`
- **관련 브랜치**: `feature/frontEom`
- **관련 이슈 / PR**: -

---

## 1. 배경 및 목적

외화 비중을 나타내는 도넛 차트(`src/components/common/donut-chart.tsx`) 렌더링 시, 차트 호(Pie arc)가 회전하며 채워지는 동안 중앙의 백분율 수치(%)가 처음부터 노출되어 애니메이션의 시각적 완성도와 몰입감이 저하되는 현상이 있었습니다.
파이 차트가 0%에서 목표 퍼센트까지 완전히 회전하여 채워지는 타이밍에 맞추어 중앙 숫자가 부드럽게 스케일업되며 페이드 인(`donutNumberFadeIn`)되도록 타이밍 동기화 모션을 구현했습니다.

---

## 2. 변경 내용 요약

1. **디자인 토큰 애니메이션 키프레임 추가 (`src/styles/tokens.css`)**:
   - `@keyframes donutNumberFadeIn`: `opacity: 0, transform: scale(0.82)` → `opacity: 1, transform: scale(1)` 정의.
2. **도넛 차트 컴포넌트 타이밍 동기화 (`src/components/common/donut-chart.tsx`)**:
   - `isAnimationActive`(기본: `true`), `animationDuration`(기본: `800ms`) props 추가.
   - `Pie` 컴포넌트에 `animationDuration={animationDuration}`, `animationEasing="ease-out"` 명시.
   - 중앙 텍스트 영역에 초기 `opacity: 0` 및 파이 회전 완료 시점(`animationDuration - 100ms`, 기본 700ms 딜레이)에 `donutNumberFadeIn` 애니메이션 트리거 적용 (`forwards` 유지).
   - 애니메이션 비활성화(`isAnimationActive=false`) 시 즉시 `opacity: 1` 렌더링 지원.
3. **단위 테스트 추가 및 검증 (`donut-chart.test.tsx`)**:
   - `isAnimationActive` 활성 및 비활성 시의 스타일 및 딜레이 애니메이션 적용 여부 테스트 추가.
   - 전체 42개 파일, 212개 테스트 전원 통과 및 100% 커버리지 유지.

---

## 3. 기술적 결정 및 근거

| 결정 항목 | 선택 | 이유 |
|---|---|---|
| CSS Keyframes 기반 딜레이 페이드 인 | `animation-delay: ${animDelay}ms` + `forwards` | 불필요한 JS 타이머 state(`setTimeout` 등) 없이 순수 브라우저 하드웨어 가속 컴포지터를 활용하여 끊김 없는 60fps 애니메이션 보장 |
| 스케일 + 불투명도 복합 트랜지션 | `scale(0.82)` → `scale(1)` + `opacity: 0` → `1` | 단순 페이드 인보다 파이 차트가 완성되는 찰나에 숫자가 안착하는 입체적인 마이크로 인터랙션 제공 |

---

## 4. 영향 범위 및 검증 결과

- **영향 파일**:
  - `src/styles/tokens.css`
  - `src/components/common/donut-chart.tsx`
  - `src/components/common/donut-chart.test.tsx`
  - `docs/tech-changelog/0017-donut-chart-timed-fade-in.md` (신규)
- **검증 결과**:
  - `npm run test -- --run --coverage` (42 test files, 212 tests) 100% 커버리지 달성
  - `npm run build` (`tsc --noEmit && vite build`) 빌드 성공

---

## 5. 롤백 계획

이슈 발생 시 `DonutChart`의 중앙 텍스트 컨테이너 애니메이션 스타일을 이전 정적 스타일로 복구합니다.
