# 0022. Route 로더에서 데모 분기 결합 제거

| 항목 | 내용 |
|---|---|
| 날짜 | 2026-09-07 |
| 작성자 | Claude (Opus 5) |
| 변경 유형 | refactor / fix |
| 영향 범위 | 화면(Route·X-Ray·MyPage) / 상태 / 테스트 |
| 관련 브랜치 | chore/route-loader-decoupling |
| 관련 커밋 | (커밋 후 기입) |
| 관련 이슈·PR | #13 |

## 변경 사유 (Why)

데모 데이터를 누가 결정하는지가 FE와 BE 양쪽에 흩어져 있다. FE의 `isDemo`는 "세션이 없다 = fixture를 렌더한다"는 뜻이고, BE의 `TokenResponse.isDemo` / `ProfileResponse.isDemo`는 "이 계정이 데모 계정이다"라는 **다른 뜻**이다. 한 이름이 두 개념을 가리키는 탓에 `app.tsx`의 데이터소스 토글은 `startDemoSession()`(= `isDemo: true` 세션 생성)이 성공하면 `setIsDemo(false)`가 되는 모순 상태다.

데모 여부는 BE가 결정하게 하고 FE는 항상 API를 호출하도록 옮기는 것이 최종 목표다. 그 첫 단계로, **동작을 바꾸지 않으면서** 판단하기 어렵게 만드는 결합부터 걷어낸다. 특히 `route-screen.tsx`의 `if (!isDemo && loadPlan === loadRoutePlan)`은 "테스트가 loader를 주입했으면 무조건 데모 경로"라는 우회 장치여서, 화면 분기 조건에 테스트 사정이 섞여 있었다.

`api/route.ts`가 `isDemo`를 인자로 받는 것도 문제였다. AGENTS.md §7.1상 `api/` 레이어는 화면 사정을 몰라야 하는데, 화면 모드가 API 로더 시그니처까지 올라와 있었다.

또한 `mypage-api-screen.tsx`의 설정 폼이 서버 값을 `useEffect`로 사후 동기화하고 있어, 조회 완료 커밋과 사용자 입력 사이에 경합이 있었다. `--coverage`로 실행하면(= CI가 실행하는 방식) 계측 오버헤드 때문에 이 창이 벌어져 `mypage-api-screen.test.tsx`가 실패했다 — 이 변경 이전부터 develop에 존재하던 결함이며, CI가 이미 빨간 상태였다.

## 변경 내용 (What)

- `api/route.ts`: `RoutePlanLoader`에서 `isDemo` 인자 제거(`() => Promise<RoutePlanData | null>`), `if (!isDemo) return null` 삭제. 로더는 계약이 생길 때까지 fixture만 반환한다
- `route-screen.tsx`: loader identity 비교를 명시적 `mode: "demo" | "api"` prop으로 교체. `app.tsx`가 `mode={isDemo ? "demo" : "api"}`를 전달
- `use-route-plan.ts`: `isDemo` 인자 제거
- 데드 코드 제거: `use-xray.ts`·`use-mypage.ts`가 반환하던 소비처 없는 `isDemo`, `xray-screen.tsx`의 `useXRay(true)` 하드코딩
- `mypage-api-screen.tsx`: 설정 폼을 `SettingsForm` 자식 컴포넌트로 분리. 조회가 끝난 뒤에만 마운트되므로 서버 값으로 state를 직접 초기화하고, 동기화용 `useEffect`를 제거했다
- `app.test.tsx`: API 모드에서 플래너 탭이 Swagger 화면을 렌더링하는지 검증하는 케이스 추가

## 영향 / 리스크

- **화면 동작 변화 없음.** 데모 화면·API 화면 모두 기존과 동일하게 렌더된다. 수치 변경 없음
- `RouteScreen`의 public prop이 `isDemo` → `mode`로 바뀐다. 호출처는 `app.tsx` 한 곳
- 설정 폼은 이제 저장 성공 후 서버 응답 값으로 리셋되지 않고 사용자 입력을 유지한다. 서버 응답이 저장한 값을 그대로 되돌려주므로 화면상 차이는 없고, 오히려 입력이 덮이지 않는다
- `isDemo`는 여전히 `app.tsx`에서 화면들로 흐른다. 개념 자체의 정리는 다음 단계(세션 부트스트랩)에서 다룬다

## 검증

- [x] 테스트 통과 + 커버리지 100% (`npm run test -- --coverage` → 343 passed, lines/branches/functions/statements 모두 100%)
- [x] `npm run lint` 오류 0건, `npm run build` 성공
- [x] `--coverage` 실행 시 재현되던 `mypage-api-screen.test.tsx` 실패 해소 (변경 전 develop에서도 재현됨을 확인)
- [x] (수치 변경 없음)

## 롤백 방법

단독 revert로 원복 가능하다. 다른 변경에 의존하지 않으며, `RouteScreen`의 `mode` prop을 되돌리면 `app.tsx`의 호출처 한 줄만 함께 되돌리면 된다.
