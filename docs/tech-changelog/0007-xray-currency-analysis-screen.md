# 0007. 내 자산 (X-Ray) 통화 노출 및 적합도 분석 화면 구현

| 항목 | 내용 |
|---|---|
| 날짜 | 2026-09-05 |
| 작성자 | Antigravity (AI Agent) |
| 변경 유형 | feat |
| 영향 범위 | 화면 (`src/screens/xray/`), 훅, 타입, 테스트 |
| 관련 브랜치 | feat/xray-currency-analysis |
| 관련 커밋 | 9569277 |
| 관련 이슈·PR | (이슈/PR 생성 후 기입) |

## 변경 사유 (Why)
- 피그마 디자인 프로토타입(https://wise-lyric-41826757.figma.site/)의 '내 자산 (X-Ray)' 화면을 완비하여 사용자의 통화 노출 진단, 손익 분해(P&L Decomposition), 스트레스 시나리오 및 통화 적합도(집중도 진단 및 분산효과 시뮬레이터)를 시각화하기 위함.

## 변경 내용 (What)
- **타입 정의 (`src/types/xray.ts`)**:
  - `XRayTabId`, `StockHoldingItem`, `PnLDecompositionData`, `StressScenarioItem`, `CurrencyTraitItem`, `XRayDashboardData` 타입 정의.
- **상태 관리 훅 (`src/screens/xray/use-xray.ts`)**:
  - 서브 탭 전환(`exposure` ↔ `fitness`), 스트레스 시나리오 선택(`2008` / `2020` / `custom`), EUR 추가 매수 비율 시뮬레이션 슬라이더 상태 관리.
- **통화 노출 및 손익 분해 뷰 (`src/screens/xray/xray-exposure-view.tsx`)**:
  - 외화 비중 도넛 차트 및 원화/외화 평가액 지표.
  - 통화별 노출 게이지 바 (60% 빨간색 기준선 마커 및 집중 높음 뱃지).
  - 예정 외화 지출 카드 및 1% 환율 민감도 지표.
  - 손익 분해 테이블(매입원가, 주가기여, 환율기여, 상호작용, 현재평가액) 및 종목별 상세(AAPL/TSLA) 아코디언.
  - 3가지 스트레스 시나리오 버튼 및 방어 효과 충격 결과 카드.
- **통화 적합도 뷰 (`src/screens/xray/xray-fitness-view.tsx`)**:
  - 집중도 진단(85% 대형 지표 및 경고 안내).
  - 쏠림을 고치는 방법 네온 액센트 상단 보더 카드 및 환전 플래너 바로가기.
  - 분산효과 시뮬레이터 (EUR 추가 매수 비율 슬라이더 조절 시 조정 전후 변동성 바 너비 동적 반영).
  - 통화별 성격 비교 표(USD/JPY/EUR의 변동성, 유동성, 분산기여도).
- **화면 컨테이너 (`src/screens/xray/xray-screen.tsx`)**:
  - 상단 탭 전환 및 플래너 내비게이션 라우팅 연동.
- **단위 및 통합 테스트 (`src/screens/xray/*.test.tsx`, `*.test.ts`)**:
  - `use-xray`, `xray-exposure-view`, `xray-fitness-view`, `xray-screen` 테스트 스위트 작성 및 100% 통과.

## 영향 / 리스크
- 기존 `App.tsx`의 '내 자산' 탭 및 홈 대시보드의 자산 분석 링크와 매끄럽게 연결됩니다.

## 검증
- [x] 단위/통합 테스트 121개 전체 통과
- [x] Vite 프로덕션 빌드 성공
- [x] 모바일 / 태블릿 / 데스크톱 반응형 뷰포트 레이아웃 검증

## 롤백 방법
- 이 변경 관련 커밋을 revert합니다.
