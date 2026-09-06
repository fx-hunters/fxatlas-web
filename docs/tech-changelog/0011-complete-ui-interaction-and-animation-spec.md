# 0011. 피그마 데모 Recharts 차트 진입 애니메이션 및 11대 UI 인터랙션 명세 완성

| 항목 | 내용 |
|---|---|
| 날짜 | 2026-09-06 |
| 작성자 | Antigravity (AI Agent) |
| 변경 유형 | feat |
| 영향 범위 | 차트 컴포넌트(SparklineChart, DonutChart, FanChart), 스타일(src/styles/layout.css), 레이아웃(App, Sidebar), 화면 컴포넌트(GoalListView, GoalDetailView, TodayActionCard, MyPageScreen, XRayScreen, ForecastScreen) |
| 관련 브랜치 | feature/frontEom |
| 관련 커밋 | cea74f0 |
| 관련 이슈·PR | (이슈/PR 생성 후 기입) |

## 변경 사유 (Why)
- 피그마 데모(https://wise-lyric-41826757.figma.site/) 기준 핵심 애니메이션인 **Recharts 컴포넌트의 마운트 시 자동 진입 애니메이션**(좌->우 펼침 선/영역 드로잉, 12시 시계방향 도넛 스윕)과 11대 UI 인터랙션·트랜지션 명세를 완벽히 일치시키기 위함.
- 무거운 외부 애니메이션 라이브러리(Framer Motion, GSAP) 대신 Recharts 내장 SVG 애니메이션(`isAnimationActive=true`) 및 경량 CSS 트랜지션(150~200ms ease) 조합을 사용.

## 변경 내용 (What)
1. **Recharts 차트 진입 애니메이션 (핵심)**:
   - `SparklineChart`: Recharts `ResponsiveContainer` + `AreaChart` + `Area`로 전환, 마운트 시 1500ms 좌->우 스파크라인 드로잉 애니메이션 구현.
   - `DonutChart`: Recharts `ResponsiveContainer` + `PieChart` + `Pie` + `Cell`로 전환, 12시 방향부터 시계방향 400ms 스윕 회전 진입 애니메이션 구현.
   - `FanChart`: Recharts `ResponsiveContainer` + `ComposedChart` + `Area` + `Line`으로 전환, 과거 실선, 투영 점선 및 50%/80% 밴드 진입 애니메이션 구현.
2. **전역 색상 테마 전환**: 전체 레이아웃 컨테이너 및 사이드바/헤더/푸터에 `transition-colors duration-200` 적용.
3. **사이드바 활성 항목**: `bg-primary/10 text-primary border-l-2 border-primary` 및 150ms 동시 fade 전환.
4. **버튼 호버 인터랙션**: Primary(`hover:bg-primary/90`), 보더(`hover:border-primary`), 텍스트(`hover:text-text`) 150ms 트랜지션.
5. **카드 호버 elevation**: 플래너 목표 카드에 `hover:border-primary hover:shadow-lg hover:shadow-primary/5` glow 섀도 적용.
6. **Group-hover 텍스트 전환**: 부모 카드 호버 시 제목 텍스트가 `group-hover:text-primary`로 민트 그린 전환.
7. **<details> 아코디언 아이콘 회전**: `<summary>` 내부 chevron 아이콘이 `details[open]` 시 90도 부드럽게 회전(`transition: transform 150ms ease`).
8. **탭 언더라인 인디케이터**: `border-b-2` 언더라인이 활성 시 투명 -> 민트 그린(`var(--primary)`)으로 fade in.
9. **환율 범위 탭 선택**: 통화/기간 필터 버튼 `transition-all 150ms` 필 버튼 전환.
10. **슬라이더 실시간 수치 반영**: `tabular-nums` 적용된 지표값 즉각 갱신 및 부드러운 상태 색상 반영.
11. **진행률 바**: `transition-all` 및 width 퍼센트 변화 부드러운 애니메이션.
12. **컬러 드롭 섀도 (정적 glow)**: Primary 버튼 및 강조 카드에 민트 그린 반투명 glow 적용.

## 검증
- [x] 전체 39개 테스트 파일, 151개 단위/통합 테스트 100% 통과 (`npm.cmd test`)
- [x] 테스트 커버리지 100% 달성 (`Statements: 100%`, `Branches: 100%`, `Functions: 100%`, `Lines: 100%`) (`npm.cmd test -- --coverage`)
- [x] TypeScript 및 Vite 프로덕션 빌드 성공 (`tsc --noEmit && vite build`)
- [x] 피그마 데모와 시각적·동작적 애니메이션 일치 검증

## 롤백 방법
- 이 변경 관련 커밋을 revert합니다.
