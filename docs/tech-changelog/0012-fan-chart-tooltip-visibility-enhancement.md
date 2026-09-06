# 0012. 환율범위 팬 차트 마우스 호버 툴팁 가시성 개선

| 항목 | 내용 |
|---|---|
| 날짜 | 2026-09-06 |
| 작성자 | Antigravity (AI Agent) |
| 변경 유형 | fix / feat |
| 영향 범위 | 환율범위 팬 차트 컴포넌트(`FanChart`, `FanChartTooltip`), 테스트(`fan-chart.test.tsx`) |
| 관련 브랜치 | feature/frontEom |
| 관련 커밋 | 373c09a |
| 관련 이슈·PR | (이슈/PR 생성 후 기입) |

## 변경 사유 (Why)
- 환율범위 팬 차트(FanChart)에서 마우스 호버 시 기본 Recharts 툴팁의 원화(₩) 금액 및 레이블 색감이 배경색에 묻혀 가시성이 저하되는 문제 개선.
- 다크/라이트 모드 모두에서 원화 환율 금액과 각 항목(실제 환율, 투영 시나리오, 80%/50% 신뢰구간)이 선명하고 또렷하게 식별되도록 커스텀 툴팁 UI 도입.

## 변경 내용 (What)
1. **`FanChartTooltip` 커스텀 툴팁 컴포넌트 도입**:
   - `var(--surface)` 배경, `var(--border)` 테두리, `var(--shadow-lg)` 그림자로 차트 위에서 시각적 입체감과 뚜렷한 대비 제공.
   - 상단 헤더에 날짜 라벨(`var(--text)`, font-bold) 및 통화 뱃지(`currency/KRW`) 배치.
   - 실제 환율(`price`)과 투영 시나리오(`projected`)는 메인 항목으로 분류하여 `var(--primary)` 인디케이터 점과 선명한 볼드 원화 텍스트(`var(--text)`, `tabular-nums`)로 강조.
   - 80%/50% 신뢰구간 상/하한선은 서브 항목으로 정돈하여 직관적인 정보 위계 형성.
2. **차트 호버 커서 인디케이터 라인 적용**:
   - 마우스 이동 시 시점 식별을 위한 점선 가이드라인(`strokeDasharray="3 3"`) 추가.
3. **단위 테스트 및 커버리지 100% 검증**:
   - 비활성 상태, 유효 데이터 렌더링, 통화 기본값, dataKey/name fallback 및 널 처리 등 100% 브랜치 커버리지 확보.

## 검증
- [x] 전체 39개 테스트 파일, 155개 단위/통합 테스트 100% 통과 (`npm.cmd test`)
- [x] 테스트 커버리지 100% 달성 (`Statements: 100%`, `Branches: 100%`, `Functions: 100%`, `Lines: 100%`)
- [x] TypeScript 및 Vite 프로덕션 빌드 성공 (`tsc --noEmit && vite build`)

## 롤백 방법
- 이 변경 관련 커밋을 revert합니다.
