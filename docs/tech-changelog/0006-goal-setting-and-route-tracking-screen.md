# 0006. 목표(Goal) 설정 및 환율 경로 트래킹 화면 구현

| 항목 | 내용 |
|---|---|
| 날짜 | 2026-09-05 |
| 작성자 | Antigravity (AI Agent) |
| 변경 유형 | feat |
| 영향 범위 | 화면 (`src/screens/route/`), 훅, 타입, 테스트 |
| 관련 브랜치 | feat/route-goal-planner |
| 관련 커밋 | 508494a |
| 관련 이슈·PR | (이슈/PR 생성 후 기입) |

## 변경 사유 (Why)
- 피그마 디자인 프로토타입(https://wise-lyric-41826757.figma.site/)과 리브랜딩('Divurve') 지침에 따라 외화 목표 설정(CRUD) 및 분할 환율 경로 시뮬레이션(환전 플래너) 화면을 완비하기 위함.
- 사용자가 정기 매수(반복) 또는 특정일 사용(단건) 목적 함수를 선택하여 목표를 생성/수정/삭제하고, 월 가용 원화/안전 버킷 비율/분할 횟수 파라미터를 조절하여 진입가 변동폭, 예산 내 달성 확률, 최악 5% 진입가, 회차별 스케줄을 실시간으로 시뮬레이션 및 회차 완료를 기록할 수 있도록 인터랙티브 상태 로직을 구축하기 위함.

## 변경 내용 (What)
- **타입 정의 확장 (`src/types/route.ts`)**:
  - `GoalSummary`, `GoalFormData`, `ScheduleRound`, `StrategyComparison`, `GoalSimulationResult`, `GoalDetailPlan` 등 엄격한 TypeScript 타입 정의.
- **상태 관리 훅 (`src/screens/route/use-route-planner.ts`)**:
  - 목표 리스트 및 CRUD 상태(추가, 수정, 삭제, 회차 완료 기록), 뷰 모드 전환(`list` / `create` / `edit` / `detail`), 파라미터 조절(슬라이더) 및 제약 조건(안전 버킷 하한 35% 클램프) 로직 구현.
  - 슬라이더 입력에 따른 실시간 시뮬레이션 계산 함수(`computeSimulation`) 순수 함수화.
- **목표 카드 목록 뷰 (`src/screens/route/goal-list-view.tsx`)**:
  - 피그마 데모와 100% 일치하는 목표 카드 리스트, 반응형 그리드, 프로그레스 바(확보율), D-Day 뱃지, 수정/삭제 액션 버튼 및 키보드 접근성 지원.
  - 빈 상태 및 하단 데이터 연동 안내 배너 구현.
- **목표 생성 및 수정 폼 뷰 (`src/screens/route/goal-form-view.tsx`)**:
  - 목적 함수 선택(정기 매수 vs 특정일 사용), 세부 목적 드롭다운, 목표 이름, 통화(USD/JPY/EUR), 목표 금액, 날짜 입력 필드 및 삭제 기능 구현.
- **목표 상세 및 환율 경로 트래킹 뷰 (`src/screens/route/goal-detail-view.tsx`)**:
  - 입력 파라미터(월 가용 원화, 안전 버킷 비율, 분할 횟수) 인터랙티브 슬라이더 및 자동 반영 값 카드.
  - 계획 상세 시뮬레이션 히어로 영역(진입가 변동폭 1σ, 달성 확률), 2열 스탯 요약(버킷 비율, 최악 5% 진입가), 3가지 전략 비교 테이블(A/B/C), 접이식 회차별 분할 스케줄 아코디언, 계획 리셋 및 회차 완료 토스트 알림 인터랙션 구현.
- **화면 컨테이너 (`src/screens/route/route-screen.tsx`)**:
  - 훅과 Presentational 뷰 컴포넌트를 조율하는 Container/Presentational 아키텍처 패턴 적용.
- **테스트 스위트 완비 (`src/screens/route/*.test.tsx`, `*.test.ts`)**:
  - 114개 전체 단위/통합 테스트 통과 및 100% Statement/Function/Line 커버리지 달성.

## 영향 / 리스크
- 기존 홈 대시보드의 '환전 플래너로 이동' 링크 및 사이드바 탭과의 원활한 연동.
- 계산 로직은 UI 시뮬레이션용 수치 매핑으로 프론트 단에서 안전하게 격리되어 동작합니다.

## 검증
- [x] 단위/통합 테스트 114개 전체 통과
- [x] Vitest 커버리지 100% Statement / Function / Line 달성
- [x] Vite 프로덕션 빌드 성공 (`npx vite build`)
- [x] 모바일 / 태블릿 / 데스크톱 반응형 뷰포트 레이아웃 검증

## 롤백 방법
- 이 변경 관련 커밋을 revert합니다.
