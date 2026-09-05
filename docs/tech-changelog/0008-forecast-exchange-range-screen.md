# 0008. 환율 범위 (Forecast) 시뮬레이션 팬 차트 및 전망 화면 구현

| 항목 | 내용 |
|---|---|
| 날짜 | 2026-09-05 |
| 작성자 | Antigravity (AI Agent) |
| 변경 유형 | feat |
| 영향 범위 | 화면 (`src/screens/forecast/`), 훅, 타입, 테스트 |
| 관련 브랜치 | feat/forecast-exchange-range |
| 관련 커밋 | a03d847 |
| 관련 이슈·PR | (이슈/PR 생성 후 기입) |

## 변경 사유 (Why)
- 피그마 디자인 프로토타입(https://wise-lyric-41826757.figma.site/)과 리브랜딩('Divurve') 지침에 따라 환율 범위(Forecast) 화면을 완성하여 통화별(USD/JPY/EUR), 기간별(30D/90D) 시뮬레이션 팬 차트, 신뢰도 밴드(50%/80%), 전망 동인, 다가오는 이벤트 및 모델 성적을 시각화하기 위함.

## 변경 내용 (What)
- **타입 정의 (`src/types/forecast.ts`)**:
  - `ForecastCurrency`, `ForecastPeriod`, `FanChartDataPoint`, `ForecastRangeSummary`, `ForecastDriverItem`, `ForecastEventItem`, `ModelPerformanceScore`, `CurrencyForecastInfo` 타입 정의.
- **상태 관리 훅 (`src/screens/forecast/use-forecast.ts`)**:
  - 통화 전환(USD/JPY/EUR), 기간 토글(30D/90D)에 따른 차트 데이터 포인트 및 메트릭 생성 로직 구현.
- **시뮬레이션 팬 차트 SVG 컴포넌트 (`src/screens/forecast/fan-chart.tsx`)**:
  - 80% 및 50% 신뢰 구간 폴리곤 밴드 렌더링.
  - 과거 실제 가격(실선) 및 미래 시나리오 중심선(점선) 시각화.
  - 마우스 호버 시 크로스헤어 인디케이터 및 툴팁 피드백 제공.
- **환율 범위 대시보드 (`src/screens/forecast/forecast-screen.tsx`)**:
  - 통화 및 기간 선택 버튼 그룹, 다음 갱신 시각 안내.
  - 80% 범위 카드, 변동성 백분위 카드, 내 자산에 미치는 영향 네온 그라디언트 카드 및 환전 플래너 바로가기.
  - 하단 전망 동인(위험/주의/정상 바), 다가오는 일정(FOMC, CPI 등), 모델 성적(적중률, MAE, 포함률) 아코디언 배치.
- **단위 및 통합 테스트 (`src/screens/forecast/*.test.tsx`, `*.test.ts`)**:
  - `use-forecast`, `fan-chart`, `forecast-screen` 테스트 스위트 작성 및 100% 통과.

## 영향 / 리스크
- 사이드바 '환율 범위' 탭 및 홈 화면의 환율 위젯과의 연동이 완비되었습니다.

## 검증
- [x] 단위/통합 테스트 127개 전체 통과
- [x] Vite 프로덕션 빌드 성공
- [x] 모바일 / 데스크톱 반응형 그리드 및 툴팁 호버 인터랙션 검증

## 롤백 방법
- 이 변경 관련 커밋을 revert합니다.
