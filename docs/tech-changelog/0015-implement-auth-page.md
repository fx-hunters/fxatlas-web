# 0015 — 인증 페이지(로그인/회원가입) 구현 및 랜딩/앱 연동

- **작성일**: 2026-09-06
- **작성자**: Frontend Team
- **유형**: `feat`
- **관련 브랜치**: `feature/frontEom`
- **관련 이슈 / PR**: -

---

## 1. 배경 및 목적

DIVURVE 서비스 진입 단계에서 사용자가 로그인 및 회원가입을 원활히 진행할 수 있도록 전용 인증 화면(`src/AuthPage.tsx`)이 필요했습니다.
외부 무거운 폼 라이브러리 없이 순수 React State와 디자인 토큰 CSS(`var(--surface)`, `var(--primary)` 등)를 기반으로, 브랜드 아이덴티티가 반영된 2분할 레이아웃(좌측 로고 브랜딩 + 우측 인터랙티브 폼)을 구성하였습니다.

---

## 2. 변경 내용 요약

1. **공용 아이콘 확장 (`src/components/common/icon.tsx`, `icon.test.tsx`)**:
   - `eye`, `eyeOff`, `x`, `alertCircle` SVG 아이콘 추가 및 100% 테스트 커버리지 유지.
2. **인증 화면 컴포넌트 (`src/AuthPage.tsx`) 신규 구현**:
   - **반응형 2분할 레이아웃**: 데스크톱(lg 이상) 좌측 440px 고정 브랜드 로고 전용 패널(카피 문구 제외) + 우측 폼 패널.
   - **로그인 폼**: 이메일/비밀번호 입력, 비밀번호 표시/숨김 토글, 아이디 저장/자동 로그인 체크박스, 3대 소셜 로그인(카카오, 네이버, 구글), 회원가입 모드 전환 링크.
   - **회원가입 폼**: 이름, 이메일 중복 확인(입력 변경 시 확인 상태 리셋), 5단계 비밀번호 강도 게이지(`pwStrength`), 비밀번호 확인 일치 힌트, 휴대폰 인증번호 180초 카운트다운 타이머(언마운트 시 cleanup), 약관 전체/개별 동기화 체크박스.
   - **접근성 및 인터랙션**: 탭 스위처 `role="tablist"`/`role="tab"`, 폼 전환 시 부드러운 `fadeInUp` 애니메이션 적용, 모든 필드 실시간 유효성 검사 및 에러 메시지 지원.
3. **랜딩 페이지 연동 (`src/LandingPage.tsx`, `LandingPage.test.tsx`)**:
   - `onLogin`, `onSignup` 콜백 props를 추가하여 헤더 우측의 "로그인" 및 "무료 시작" 버튼 클릭 시 AuthPage의 해당 탭으로 즉시 전환 지원.
4. **앱 루트 연동 (`src/app/app.tsx`, `app.test.tsx`)**:
   - `showAuth`, `authMode`(`login` | `signup`) 상태 관리 및 `goToLogin`, `goToSignup`, `handleBackToLanding`, `handleEnterDashboard` 네비게이션 흐름 연결.
5. **테스트 커버리지 및 신뢰성 확보 (`src/AuthPage.test.tsx` 등)**:
   - 24개의 단위 테스트 추가 및 전체 42개 파일, 204개 테스트 전원 통과, 라인·브랜치·함수·구문 **100% 커버리지** 유지.

---

## 3. 기술적 결정 및 근거

| 결정 항목 | 선택 | 이유 |
|---|---|---|
| 외부 폼 라이브러리 미사용 | 순수 React 상태 + 커스텀 Hook/컴포넌트 | 번들 오버헤드 없이 정밀한 타이머(`timerRef`), 비밀번호 강도 계산, 약관 동기화 제어 가능 |
| 좌측 브랜딩 패널 구성 | 브랜드 로고(D 아이콘 + DIVURVE 텍스트)만 배치 | 마케팅 문구 배제를 통해 절제되고 신뢰도 높은 금융/환율 서비스 브랜드 톤앤매너 구축 |
| 체크박스 접근성 구조 | 숨겨진 native `<input type="checkbox">` + 커스텀 SVG 체크박스 | Testing Library의 `getByLabelText`, `toBeChecked()` 및 스크린리더 표준 접근성 완벽 호환 |
| 이메일 중복 확인 상태 관리 | `emailChecked` boolean/null 상태 | 이메일 인풋 변경 시 즉시 `null`로 초기화하여 재검증 유도 및 미검증 가입 방지 |

---

## 4. 영향 범위 및 검증 결과

- **영향 파일**:
  - `src/components/common/icon.tsx`, `src/components/common/icon.test.tsx`
  - `src/AuthPage.tsx` (신규)
  - `src/AuthPage.test.tsx` (신규)
  - `src/LandingPage.tsx`, `src/LandingPage.test.tsx`
  - `src/app/app.tsx`, `src/app/app.test.tsx`
  - `docs/tech-changelog/0015-implement-auth-page.md` (신규)
- **검증 결과**:
  - `npm run test -- --run --coverage` (42 test files, 204 tests) 100% 커버리지 달성
  - `npm run build` (`tsc --noEmit && vite build`) 성공 (번들링 완료)

---

## 5. 롤백 계획

인증 페이지 문제 발생 시 `src/app/app.tsx`에서 `showAuth` 분기를 비활성화하거나 이전 커밋으로 되돌립니다.
