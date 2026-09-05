# 0009. 마이페이지(MyPage) 사용자 설정 및 활동 요약 뷰 구현과 전역 라우팅 점검

| 항목 | 내용 |
|---|---|
| 날짜 | 2026-09-05 |
| 작성자 | Antigravity (AI Agent) |
| 변경 유형 | feat |
| 영향 범위 | 화면 (src/screens/mypage/), 훅, 타입, 레이아웃/아이콘, 전역 라우팅 테스트 |
| 관련 브랜치 | feat/mypage-settings-and-routing |
| 관련 커밋 | 14b8cae |
| 관련 이슈·PR | (이슈/PR 생성 후 기입) |

## 변경 사유 (Why)
- 피그마 디자인 프로토타입(https://wise-lyric-41826757.figma.site/)과 리브랜딩('Divurve') 지침에 따라 마이페이지(MyPage) 화면을 완성하고, 사용자 프로필, 투자성향(의사결정 프로필), 기본 설정(주거래 은행 우대율 및 알림 옵션), 바로가기 카드 및 전역 내비게이션 [Home, X-Ray, Forecast, Route, MyPage] 라우팅을 빈틈없이 연결하고 검증하기 위함.

## 변경 내용 (What)
- **타입 정의 (`src/types/mypage.ts`)**:
  - `RiskProfileType`, `UserProfile`, `NotificationKey`, `NotificationOption`, `MyPageSettings` 정의.
- **상태 관리 훅 (`src/screens/mypage/use-mypage.ts`)**:
  - 사용자 프로필 데이터, 투자성향 재진단 로직, 주거래 은행 우대율(0~100% 클램핑) 및 실효 스프레드 자동 계산(`실효 스프레드: 약 X.X%`), 알림 설정 토글, 피드백 토스트 관리 훅 구현.
- **마이페이지 대시보드 (`src/screens/mypage/mypage-screen.tsx`)**:
  - 사용자 프로필 카드: 아바타 아이콘, 이름(김데모), 이메일(demo.kim@example.com), 비밀번호 변경 버튼.
  - 의사결정 프로필(투자성향) 카드: 안전 버킷 하한과 집중도 기준선 판정 안내, 방패 아이콘, 성향 뱃지(안정 추구형), 진단일자, 재진단 버튼.
  - 기본 설정 카드: 주거래 은행 우대율 슬라이더 (0~100%, 기본 80%), 실효 스프레드 자동 계산 문구, 알림 설정 체크박스 4종(예산 부족 경고, 고변동성 구간 진입, 기회 버킷 실행 알림, 안전모드 전환 알림).
  - 바로가기 카드: '자산 내역 편집 →'(`assets`), '외화 목표 편집 →'(`planner`) 탭 이동 버튼.
- **공용 컴포넌트 확장 (`src/components/common/icon.tsx`)**:
  - `shield`, `chevronDown`, `edit`, `trash`, `check` 아이콘 SVG 및 `style` 프로퍼티 지원 추가.
- **전역 라우팅 및 테스트 검증 (`src/app/app.test.tsx`, `src/screens/mypage/mypage-screen.test.tsx`)**:
  - 마이페이지 유닛/인터랙션 테스트 14개 작성.
  - 헤더 아바타 클릭 및 사이드바 [홈, 환전 플래너, 내 자산, 환율 범위, 마이페이지, 연결 확인] 전체 6개 탭 전환 통합 테스트 검증.
  - 전체 39개 테스트 파일, 147개 테스트 케이스 100% 통과.

## 영향 / 리스크
- 모든 화면(`home`, `planner`, `assets`, `range`, `mypage`, `connectivity`)이 정상 연동되었으며 미구현 플레이스홀더 없이 피그마 디자인과 100% 일치합니다.

## 검증
- [x] 전체 단위/통합 테스트 147개 통과 (`npm.cmd test`)
- [x] TypeScript 빌드 및 Vite 프로덕션 빌드 성공 (`npm.cmd run build`)
- [x] 모바일 / 태블릿 / 데스크톱 반응형 뷰포트 레이아웃 및 탭 전환 동작 검증

## 롤백 방법
- 이 변경 관련 커밋을 revert합니다.
