# 0016 — 마이페이지 로그인/로그아웃 기능 구현 및 인증 상태 분기

- **작성일**: 2026-09-06
- **작성자**: Frontend Team
- **유형**: `feat`
- **관련 브랜치**: `feature/frontEom`
- **관련 이슈 / PR**: -

---

## 1. 배경 및 목적

기존 마이페이지(`src/screens/mypage/mypage-screen.tsx`)에는 "비밀번호 변경" 버튼만 존재하여 대시보드에서 안전하게 로그아웃하거나 로그인할 수 있는 인터페이스가 부재했습니다.
현재 대시보드는 김데모 사용자로 로그인된 상태이므로, 로그인 상태(`isLoggedIn=true`)에서는 **비밀번호 변경**과 **로그아웃** 버튼을 노출하고, 비로그인 상태(`isLoggedIn=false`)에서는 **로그인** 버튼을 노출하도록 상태 분기 UI를 구현했습니다.

---

## 2. 변경 내용 요약

1. **공용 아이콘 확장 (`src/components/common/icon.tsx`, `icon.test.tsx`)**:
   - `logIn`, `logOut` SVG 아이콘 추가 및 단위 테스트 케이스 갱신.
2. **마이페이지 훅 확장 (`src/screens/mypage/use-mypage.ts`)**:
   - `handleLogout` ("로그아웃되었습니다.") 및 `handleLogin` ("로그인 페이지로 이동합니다.") 기본 토스트 핸들러 추가.
3. **마이페이지 컴포넌트 인증 상태 분기 (`src/screens/mypage/mypage-screen.tsx`)**:
   - `MyPageScreenProps`에 `isLoggedIn?: boolean`(기본값: `true`), `onLogin?: () => void`, `onLogout?: () => void` 추가.
   - **로그인 상태 (`isLoggedIn=true`)**: "비밀번호 변경" + "로그아웃" 버튼 그룹 렌더링 (로그아웃 시 `var(--danger)` 호버 피드백).
   - **비로그인 상태 (`isLoggedIn=false`)**: "로그인" 버튼 렌더링.
4. **앱 루트 연동 (`src/app/app.tsx`)**:
   - 마이페이지 내 로그아웃 클릭 시 `handleLogout()`을 통해 랜딩 페이지(`LandingPage`)로 복귀.
5. **테스트 커버리지 및 신뢰성 확보 (`mypage-screen.test.tsx`, `app.test.tsx`)**:
   - `isLoggedIn` true/false 상태별 버튼 렌더링 및 클릭/호버 인터랙션 검증.
   - 전체 42개 파일, 210개 테스트 전원 통과 및 100% 커버리지 유지.

---

## 3. 기술적 결정 및 근거

| 결정 항목 | 선택 | 이유 |
|---|---|---|
| 로그인 상태 기반 버튼 분기 | `isLoggedIn` prop 조건부 렌더링 | 이미 로그인된 사용자에게 불필요한 '로그인' 버튼 노출을 방지하고 '로그아웃' 버튼만 명확히 제공 |
| Fallback 토스트 및 콜백 우선 호출 | `onLogout` prop 우선 호출 | 단독 화면 및 앱 쉘 통합 환경 모두에서 안정적으로 동작 |
| 로그아웃 호버 스타일링 | `var(--danger)` 토큰 적용 | 세션 종료 액션에 대한 시각적 주의 피드백 제공 |

---

## 4. 영향 범위 및 검증 결과

- **영향 파일**:
  - `src/components/common/icon.tsx`, `src/components/common/icon.test.tsx`
  - `src/screens/mypage/use-mypage.ts`
  - `src/screens/mypage/mypage-screen.tsx`
  - `src/screens/mypage/mypage-screen.test.tsx`
  - `src/app/app.tsx`
  - `src/app/app.test.tsx`
  - `docs/tech-changelog/0016-mypage-login-logout-support.md` (신규)
- **검증 결과**:
  - `npm run test -- --run --coverage` (42 test files, 210 tests) 100% 커버리지 달성
  - `npm run build` (`tsc --noEmit && vite build`) 빌드 성공

---

## 5. 롤백 계획

이슈 발생 시 `MyPageScreen`의 액션 버튼 그룹을 이전 단일 버튼 구조로 롤백합니다.
