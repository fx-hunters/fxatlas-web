# 0023. 데모 여부 판단을 BE 세션으로 이관하고 자동 세션 부트스트랩 도입

| 항목 | 내용 |
|---|---|
| 날짜 | 2026-09-07 |
| 작성자 | Claude (Opus 5) |
| 변경 유형 | feat / refactor |
| 영향 범위 | 화면(전역 셸) / 상태 / API / 빌드·CI |
| 관련 브랜치 | feat/be-driven-demo-session |
| 관련 커밋 | (커밋 후 기입) |
| 관련 이슈·PR | #15 |

## 변경 사유 (Why)

`isDemo`라는 한 이름이 두 개념을 가리키고 있었다.

- FE: `app.tsx`의 `useState(() => readApiSession() === null)` — **"fixture를 렌더할 것인가"**
- BE: `TokenResponse.isDemo` / `ProfileResponse.isDemo` — **"이 계정이 데모 계정인가"**

그래서 사이드바 데이터소스 토글은 `startDemoSession()`(= `isDemo: true`인 세션을 만드는 호출)이 성공하면 `setIsDemo(false)`로 뒤집는 모순 상태였다. 데모 계정 개념은 원래 BE의 것이고 BE는 이미 `POST /api/v1/auth/demo`와 `isDemo` 플래그를 제공하는데, FE가 별도의 판단을 하나 더 들고 있었던 셈이다.

데모여야 하는 것은 **사용자 데이터(외화 자산·보유 종목·목표·계획)뿐**이다. 환율·전망 계열(`/forecast`, `/forecast/factors`, `/model-performance`, `/events`)은 `requiresAuth: false` 공개 엔드포인트라 계정 종류와 무관하게 실데이터다. 따라서 FE는 데모 여부를 판단하지 말고 **항상 API를 호출하고, 계정 종류는 BE가 알려준 값을 표시만** 하면 된다.

한편 `api/client.ts`는 토큰이 없으면 요청을 보내지 않고 `ApiError(401, "AUTH_REQUIRED")`를 던진다. 즉 **이 401은 네트워크를 타지 않는 가짜**라서, "401을 받고 나서 세션을 발급한다"는 사후 복구는 낭비다. 화면을 띄우기 전에 세션을 먼저 확보하는 선행 방식을 택했다.

## 변경 내용 (What)

- `api/session-bootstrap.ts` 신규: `ensureApiSession()`. 저장된 세션이 있으면 그대로 쓰고, 없으면 `POST /api/v1/auth/demo`로 데모 세션을 발급받는다. 모듈 레벨 `inflight` 메모이제이션으로 동시 호출 시 요청이 한 번만 나가고, 실패하면 비워 재시도가 가능하다
- `app/session-state.ts` 신규: `AccountKind = "demo" | "member"`, `SessionState`, `toAccountKind()`. BE의 `isDemo`를 화면 어휘로 한 번만 번역한다
- `app/use-session-bootstrap.ts` 신규: 대시보드가 보일 때만 세션을 확보하는 훅. 랜딩·인증·초기 설정 화면에서는 요청하지 않는다
- `app.tsx`: `isDemo` state와 `handleToggleDataSource`, `isApiSwitching`, `apiSwitchError`, 인라인 오류 배너를 제거하고 부트스트랩 게이트로 대체. 준비 중·실패 상태는 기존 `ApiStateView`를 재사용하고, 실패 시 재시도 버튼을 제공한다
- `sidebar.tsx`: 데이터소스 토글 버튼 제거. `accountKind` 배지 + 데모 계정일 때만 "로그인하고 내 자산 보기" CTA로 교체. 토글의 원래 의미(fixture ↔ API)가 사라졌고, "데모 ↔ 내 계정" 전환으로 재해석하면 회원 → 데모 방향이 저장된 회원 세션을 파괴하기 때문이다(`session.ts`가 단일 키를 덮어씀)
- `footer.tsx`: "예시 데이터 / 연결된 API 응답" → "데모 계정 데이터 / 내 계정 데이터"
- `test/setup.ts`, `ci.yml`: `VITE_API_URL` 주입. `resolveApiBaseUrl()`이 값 없이 예외를 던지므로 부트스트랩이 렌더 경로에 들어간 뒤로는 필수다

## 영향 / 리스크

- **대시보드 진입에 네트워크 왕복이 하나 추가된다.** 실측 698ms. 실패하면 대시보드 전체가 뜨지 않으므로 재시도 버튼을 제공한다. 랜딩 페이지는 부트스트랩 밖이라 항상 뜬다
- **화면이 렌더하는 내용은 그대로다.** 세션 없이 진입한 방문자는 데모 계정을 발급받고 `accountKind === "demo"`가 되어 기존과 동일하게 데모 fixture 화면을 본다. 도메인별로 실제 BE 데이터로 바꾸는 작업은 후속 단계(PR-C~G)에서 진행한다
- **데이터소스 토글이 사라진다.** 개발자가 "API 응답이 실제로 오는지" 눈으로 확인하던 수단이 없어진다. 대체 수단은 `연결 확인` 탭과 각 화면의 오류·빈 상태다
- 수치 변경 없음
- `POST /auth/demo`가 호출마다 새 계정을 만드는지 공용 단일 계정인지는 미확인이다. 공용이라면 시연 중 쓰기 액션이 다른 사용자에게 보일 수 있어 BE 확인이 필요하다

## 검증

- [x] 테스트 통과 + 커버리지 100% (`npm run test -- --coverage` → 349 passed, lines/branches/functions/statements 모두 100%)
- [x] `npm run lint` 오류 0건, `npm run build` 성공
- [x] 실제 배포 BE(dev 서버) 대상 수동 확인:
  - 랜딩 → "대시보드 체험하기" → "체험 데이터를 준비하고 있습니다" → 대시보드 진입
  - `POST /api/v1/auth/demo` **정확히 1회** 호출(698ms), `isDemo: true` 세션이 sessionStorage에 저장됨
  - 사이드바에 "데모 계정" 배지 + "로그인하고 내 자산 보기" 노출, 데이터소스 토글 없음
  - 푸터 "데이터 출처: 데모 계정 데이터"
  - CTA 클릭 시 로그인 화면으로 이동
- [x] (수치 변경 없음)

## 롤백 방법

단독 revert로 원복 가능하다. 신규 파일 3개(`session-bootstrap.ts`, `session-state.ts`, `use-session-bootstrap.ts`)와 `app.tsx`·`sidebar.tsx`·`footer.tsx` 변경이 한 커밋에 묶여 있다. 되돌리면 데이터소스 토글과 기존 `isDemo` 상태가 그대로 복구된다.
