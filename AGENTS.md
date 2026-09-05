# 🎨 AI Agent 전역 Role 문서 — Frontend (React)

이 문서는 프론트엔드 레포 루트에 놓습니다. 이 레포에서 작업하는 모든 AI 에이전트는 다른 지시가 없는 한 이 규칙을 **항상** 따릅니다. 상세 근거는 팀 참고 문서(개발 컨벤션 / 네이밍 규칙 / Git Issue·PR 템플릿)를 보고, 여기서는 실무 지침만 담습니다.

---

## 0. 참고 문서 (작업 전 반드시 확인)

- **개발 컨벤션** — 용어사전·Git·프로젝트구조·UI/CSS·문구 작성 원본 규칙
- **네이밍 규칙 통일 문서 (BE/FE 공통)** — BE/FE 공통 네이밍
- **Git Issue / PR 템플릿** — 이슈/PR 생성 시 `.github/`의 템플릿을 그대로 사용

---

## 1. 프로젝트 개요

**FxAtlas** — 외화 목표·환전 타이밍 제안 서비스. 이 레포(프론트엔드)는 **표시와 입력 UI를 전담**합니다. 계산(몬테카를로, 버킷 분리, 변동성 등)은 백엔드 API에서 받은 결과를 그대로 표시합니다.

> ⚠️ **계산 로직을 프론트에 다시 구현하지 않는다.** 결과가 백엔드와 갈리면 심사에서 바로 드러납니다. 필요한 모든 수치는 API에서 받습니다.

---

## 2. 기술 스택

| 항목 | 선택 |
|---|---|
| 언어 | TypeScript |
| 라이브러리 | React |
| 빌드 도구 | **Vite** (확정) |
| API 통신 | 미확정 — fetch 래퍼 또는 axios 중 하나로 통일, `api/client.ts` 단일 진입점 관리 |
| 상태관리 | 미확정 — 서버 상태(React Query 등)와 클라이언트 상태(Context/Zustand) 분리 제안 |
| 스타일링 | 컨벤션 7.1장의 CSS 변수 토큰 기반 (유틸리티 CSS 프레임워크 미사용 가정) |
| 테스트 | Vitest + React Testing Library |
| 테스트 커버리지 | `@vitest/coverage-v8` — 100% 목표, CI 게이트 |

---

## 3. 폴더 구조

개발 컨벤션 3장 구조를 그대로 따릅니다. 단 `engine/`은 이 레포에 존재하지 않습니다(계산은 백엔드 전담).

```
src/
  app/                  라우팅·레이아웃
  screens/
    home/ xray/ forecast/ route/ mypage/
  api/                  API 클라이언트. snake_case→camelCase 변환은 여기서만
  components/           공용 UI
  styles/tokens.css     디자인 토큰
```

루트에는 Vite 관례 파일이 놓입니다: `index.html`(진입점), `src/main.tsx`(부트스트랩), `vite.config.ts`(빌드 + Vitest coverage 설정). 빌드 산출물은 `dist/`이며 `.gitignore` 처리합니다.

---

## 4. 네이밍 & 경계 변환

- 백엔드 응답 필드는 **snake_case**로 도착합니다. `api/client.ts` **한 곳에서만** camelCase로 변환하고, 이후 컴포넌트·훅에서는 항상 camelCase만 씁니다. 두 표기가 컴포넌트 안에서 섞이면 안 됩니다.
- Enum 문자열 값(`kind`, `purpose`, `regime`, `entryMethod` 등)은 백엔드와 리터럴이 동일해야 합니다. 임의로 새 값을 만들지 않고 **네이밍 규칙 통일 문서**의 값을 그대로 사용합니다.

상세 규칙은 같은 문서 참고.

---

## 5. API / Swagger 연동 규칙

| 항목 | 규칙 |
|---|---|
| 버전 동기화 | 백엔드가 `/api/v1/...` URL 버저닝을 쓰므로, FE는 baseURL을 환경변수/설정 파일 한 곳에만 둔다. 하드코딩 금지. 백엔드 주소는 빌드타임 환경변수 `VITE_API_URL`(`.env` / `.env.example`)로만 참조하고, `api/client.ts`의 `resolveApiBaseUrl()`을 거친다 |
| 타입 동기화 | 백엔드 Swagger UI(`/swagger-ui/index.html`)와 OpenAPI 스펙(`/v3/api-docs`)을 참고해 요청/응답 타입을 맞춘다 |
| 버전 변경 대응 | 백엔드가 `/api/v2`를 열면(이슈/PR에서 공지됨) 같은 스프린트 내 대응 PR을 올린다 |
| 응답 해석 | 모든 응답은 `data`+`meta`로 감싸서 온다. 공통 fetch 래퍼에서 언래핑한다 |

---

## 6. UI 원칙 (요약)

- 색상은 항상 `:root` 토큰 사용, 리터럴 색상 금지 (컨벤션 7.1)
- 통화 색은 USD·JPY·EUR 고정 배정, 상태색과 섞지 않음 (7.2)
- 듀얼 액스 금지, 범례/직접라벨 규칙 (7.3)
- "예측/추천/보장" 등 금지어는 UI 문구에도 그대로 적용 (네이밍 문서 6장)

상세는 개발 컨벤션 7장·8장 참고.

---

## 7. 클린 코드 및 아키텍처 설계 원칙

> 🧭 **이 섹션의 규칙들은 코드 작성·리뷰·리팩토링 시 반드시 우선 적용한다.** 새 코드는 이 원칙을 따르고, 기존 코드를 만지면 그 파일은 이 원칙에 맞게 정리하고 나온다(보이스카웃 규칙). 원칙과 요청이 충돌하면 먼저 알리고 결정을 받는다.

각 원칙은 **왜(요약) → 하지 말 것(❌) → 할 것(✅) → 강제 수단** 순서로 읽는다. 예시는 FxAtlas 도메인(goals·plans·safeRatio·currencyCode 등)에 맞춘다. "권장"으로 표기한 ESLint 규칙은 아직 `.eslintrc.cjs`에 없으므로 도입 시 활성화한다(§11 참고).

### 7.1 아키텍처 레이어링 — 단방향 의존성

의존성은 **한 방향으로만** 흐른다. 하위 레이어가 상위를 import하면 순환이 생기고 단위 테스트가 불가능해진다.

레이어(위 → 아래로만 의존): `app` → `screens` → `components` → `hooks` → `api`. `api/`는 백엔드 경계(snake_case→camelCase 변환, §4)만 담당하며 화면·컴포넌트를 **몰라야** 한다.

```ts
// ❌ api가 상위(컴포넌트)를 참조 — 경계가 무너진다
// src/api/client.ts
import { GoalCard } from "../components/goal-card";

// ❌ 공용 컴포넌트가 특정 화면에 의존
// src/components/currency-badge.tsx
import { HomeScreen } from "../screens/home/home-screen";
```

```ts
// ✅ 데이터는 아래에서 위로 흐른다. api는 순수하게 경계만 담당
// src/api/goals.ts
export async function fetchGoals(): Promise<Goal[]> { /* ... */ }

// src/screens/home/home-screen.tsx
import { fetchGoals } from "../../api/goals";
import { GoalCard } from "../../components/goal-card";
```

**강제**: `eslint-plugin-import`의 `import/no-cycle`, 레이어 위반 차단용 `no-restricted-imports`(예: `components`에서 `screens/**` import 금지) — 둘 다 도입 권장.

### 7.2 컴포넌트 설계 — Container/Presentational · SRP

한 컴포넌트는 **한 가지 책임**만 진다. 데이터 취득(container)과 표현(presentational)을 분리하면 표현 컴포넌트를 props만으로 테스트할 수 있다.

**God Component 판정 기준(하나라도 걸리면 분리)**: 200줄 초과, `useState`/`useEffect` 다수 혼재, 서로 다른 도메인을 한 파일에서 다룸, props 7개 초과.

```tsx
// ❌ God Component — 취득·계산·표현이 한 덩어리
function GoalPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  useEffect(() => { fetchGoals().then(setGoals); }, []);
  return (
    <div>{goals.map((g) => (
      <div key={g.goalCode}>{g.name} {(g.fundedRatio * 100).toFixed(1)}%</div>
    ))}</div>
  );
}
```

```tsx
// ✅ container(데이터) + presentational(props만, 부수효과 없음)
function GoalListContainer() {
  const { goals } = useGoals();           // 데이터는 훅으로
  return <GoalList goals={goals} />;
}

function GoalList({ goals }: { goals: Goal[] }) {
  return <ul>{goals.map((g) => <GoalRow key={g.goalCode} goal={g} />)}</ul>;
}
```

**강제**: ESLint `max-lines-per-function`, `complexity`, `react/jsx-max-depth`(권장). 표현 컴포넌트는 `fetch`/전역 접근 금지.

### 7.3 Custom Hooks 작성 규칙

재사용되는 상태·로직은 `use*` 훅으로 뽑는다. 훅은 **값과 핸들러만** 반환하고 JSX를 반환하지 않는다(그건 컴포넌트의 몫).

- 이름은 `use`로 시작하고 한 훅은 한 관심사만 다룬다.
- 훅 호출은 조건·반복문 안에서 하지 않는다(Rules of Hooks).
- `useEffect` 의존성 배열을 임의로 비우지 않는다 — 필요한 값을 모두 넣는다.

```tsx
// ❌ 의존성 누락 + 훅이 JSX 반환
function useGoalName(id: string) {
  const [g, setG] = useState<Goal>();
  useEffect(() => { fetchGoal(id).then(setG); }, []); // id 누락
  return <span>{g?.name}</span>;                       // 훅이 마크업 반환
}
```

```tsx
// ✅ 값/상태만 반환, 의존성 정확
function useGoal(goalCode: string) {
  const [goal, setGoal] = useState<Goal | null>(null);
  useEffect(() => {
    let alive = true;
    fetchGoal(goalCode).then((g) => alive && setGoal(g));
    return () => { alive = false; };
  }, [goalCode]);
  return { goal };
}
```

**강제**: `react-hooks/rules-of-hooks`(error), `react-hooks/exhaustive-deps`(warn) — 이미 `plugin:react-hooks/recommended`로 활성.

### 7.4 TypeScript 엄격성

타입으로 **불가능한 상태를 표현할 수 없게** 만든다. `strict`는 이미 켜져 있다(`tsconfig.json`).

- `any` 금지. 불가피하면 `unknown`으로 받은 뒤 좁힌다.
- 여러 boolean 플래그로 상태를 흉내 내지 말고 **discriminated union**을 쓴다.
- Enum 성격 값(`kind`·`regime` 등)은 문자열 리터럴 유니온으로(값은 네이밍 문서 기준, §4).

```ts
// ❌ any + 옵셔널 남발 → { isLoading:true, data:{...} } 같은 불가능 상태 허용
type State = { isLoading: boolean; data?: any; error?: any };
```

```ts
// ✅ discriminated union — 한 시점에 한 상태만 가능
type Async<T> =
  | { status: "loading" }
  | { status: "error"; error: ApiError }
  | { status: "success"; data: T };

type Regime = "low" | "normal" | "high" | "extreme";
```

**강제**: `tsconfig` `strict`(적용됨), `noUncheckedIndexedAccess`(권장 추가). ESLint `@typescript-eslint/no-explicit-any`(현재 warn → **error 승격 권장**), `@typescript-eslint/no-unnecessary-condition`(타입체크 기반, 권장).

### 7.5 상태 관리 — Colocation · 서버/클라이언트 구분

상태는 **쓰는 곳 가까이** 둔다(colocation). 전역으로 올리는 건 실제로 여러 곳에서 공유될 때뿐이다. 그리고 **서버 상태와 클라이언트 상태를 구분**한다(§2).

- **서버 상태**(API 응답: goals·plans·holdings)는 서버 상태 도구(React Query 등, 라이브러리 미확정 §11)로 캐시·동기화한다. `useEffect`+`useState`로 받아 전역에 복사해두지 않는다.
- **클라이언트 상태**(폼 입력, 모달 open, 탭 선택)는 로컬 `useState`나 Context/Zustand에 둔다.

```tsx
// ❌ 서버 데이터를 수동 fetch해 전역 스토어에 복사 → 캐시·무효화·중복요청을 직접 떠안음
useEffect(() => { fetchGoals().then((g) => globalStore.setGoals(g)); }, []);

// ❌ 한 화면에서만 쓰는 값을 전역으로 끌어올림
const isDialogOpen = useGlobalStore((s) => s.homeDialogOpen);
```

```tsx
// ✅ 서버 상태는 캐시 훅, 클라 상태는 로컬에 colocate
const { data: goals } = useGoalsQuery();       // 서버 상태 (캐시/재검증)
const [isDialogOpen, setDialogOpen] = useState(false); // 클라 상태, 쓰는 곳에
```

**강제**: 라이브러리 확정 전이라 원칙 준수로 관리(§2·§11). 서버 응답을 담는 전역 `useState`가 보이면 리뷰에서 지적한다.

### 7.6 함수/로직 레벨 클린 코드 — 순수 함수 · 불변성 · 추상화 레벨

로직은 부수효과 없는 **순수 함수**로 뽑고, 데이터는 **불변**으로 다루며, 한 함수는 **하나의 추상화 레벨**만 다룬다. (무거운 계산은 백엔드 담당 — §1. 프론트는 표시용 파생·포매팅 수준.)

- 순수 함수는 `new Date()`·전역을 직접 부르지 않고 인자로 받는다(테스트 가능).
- 배열·객체를 직접 변형(mutation)하지 않는다.

```ts
// ❌ 인자 변형 + 추상화 레벨 혼재(정렬 세부 + 포매팅이 한 함수에)
function prepare(goals: Goal[]) {
  goals.sort((a, b) => b.fundedRatio - a.fundedRatio); // 원본 mutation
  return goals.map((g) => g.name + " " + g.fundedRatio * 100 + "%");
}
```

```ts
// ✅ 불변 정렬 + 순수 포매터 분리
const byFunded = (a: Goal, b: Goal) => b.fundedRatio - a.fundedRatio;
export const formatFundedRatio = (ratio: number) => `${(ratio * 100).toFixed(1)}%`;

function toRows(goals: Goal[]) {
  return [...goals].sort(byFunded).map((g) => ({ name: g.name, funded: formatFundedRatio(g.fundedRatio) }));
}
```

**강제**: ESLint `no-param-reassign`, `prefer-const`(적용됨), `react/no-array-index-key`(권장). 불변 업데이트가 복잡하면 Immer 도입 검토(§11).

### 7.7 네이밍 컨벤션 (프론트 보강)

기준은 **개발 컨벤션 4.1**과 **§4**다. 여기서는 프론트 특화만 보강한다.

- 파일: kebab-case(`plan-detail.tsx`, `use-goal.ts`). export하는 컴포넌트 식별자는 PascalCase(`PlanDetail`), 훅은 `useGoal`.
- 불리언: `is`/`has`/`can` 접두사(`isLoading`, `hasError`).
- 이벤트 핸들러: 컴포넌트 내부 정의는 `handleX`(`handleSubmit`), props로 넘기는 콜백은 `onX`(`onSelect`).
- 금지어(예측·추천·보장 등)는 식별자·문구 모두에 적용(컨벤션 1.2 / §6).

```tsx
// ❌
function planDetail() {}                 // 컴포넌트인데 camelCase
const loading = true;                    // 불리언인데 접두사 없음
<GoalCard clicked={handle} />            // 콜백 prop인데 on* 아님

// ✅
export function PlanDetail() {}
const isLoading = true;
<GoalCard onSelect={handleSelect} />
```

**강제**: `@typescript-eslint/naming-convention`으로 규칙화 가능(권장). 파일명은 컨벤션 4.1 기준을 유지한다.

### 7.8 에러 처리

에러를 **삼키지 않는다**. 경계에서 좁혀 처리하고, 사용자에게는 무엇을 하면 되는지 알려준다(사과 문구 금지 — 컨벤션 API장).

- API 실패는 `api/client.ts` 래퍼에서 타입이 있는 에러로 변환해 던진다(응답의 `data`/`meta` 언래핑도 여기서, §5).
- 화면은 **로딩/빈/에러** 상태를 각각 렌더한다. 렌더 중 예외는 Error Boundary로 잡는다.
- 프로미스를 떠다니게(floating) 두지 않는다 — `await`하거나 명시적으로 처리한다.

```ts
// ❌ 빈 catch — 실패가 조용히 사라진다
try { await saveGoal(input); } catch (e) { /* 무시 */ }
```

```ts
// ✅ 좁혀서 처리하고, 복구 가능한 메시지로 사용자에게 전달
try {
  await saveGoal(input);
} catch (e) {
  if (e instanceof ApiError && e.code === "VALIDATION") {
    showToast(e.message);            // 사용자 언어 메시지(백엔드 제공)
    return;
  }
  throw e;                            // 모르는 에러는 상위/바운더리로
}
```

**강제**: ESLint `no-empty`(catch 포함), `@typescript-eslint/no-floating-promises`(타입체크 기반, 권장), `no-console`(warn, 권장).

### 7.9 성능 최적화 (과도한 최적화 경계 포함)

**먼저 올바르게, 측정한 뒤 최적화한다.** 습관적 `memo`/`useMemo`/`useCallback`은 오히려 코드를 흐리고 이득이 없다.

- `useMemo`/`useCallback`은 **실제로 비싼 계산**이거나 **참조 동일성이 하위 memo 컴포넌트에 필요할 때**만.
- 원시값(number·string)이나 값싼 계산을 memo로 감싸지 않는다.
- 리스트 `key`는 안정적인 도메인 id(`goalCode`)를 쓴다(index 금지). 가상화는 실제로 큰 목록에서만.

```tsx
// ❌ 이득 없는 과최적화 — 원시값/값싼 계산을 memo
const total = useMemo(() => a + b, [a, b]);
const onClick = useCallback(() => setOpen(true), []); // memo 안 쓰는 자식엔 불필요
```

```tsx
// ✅ 무거운 계산에만 memo, 근거가 있을 때만
const rows = useMemo(() => toRows(goals), [goals]); // goals 클 때 정렬+매핑 비용 회피
```

**강제**: `react-hooks/exhaustive-deps`(deps 정확성), `react/no-unstable-nested-components`·`react/jsx-no-constructed-context-values`(권장). 최적화 전후는 React DevTools Profiler로 **측정**해 근거를 남긴다(§10 변경 로그).

---

## 8. 테스트 커버리지 (Vitest, 100%)

> 🎯 목표: 라인·브랜치·함수·구문 커버리지 100%.

실무적 예외: 부트스트랩 파일(`main.tsx`), 자동 생성된 API 타입(`api/generated/**`), 순수 타입 정의(`*.d.ts`)처럼 로직이 없는 파일은 측정 대상에서 제외합니다. 그 외 컴포넌트·훅·유틸은 예외 없이 포함합니다.

```ts
// vite.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      thresholds: { lines: 100, functions: 100, branches: 100, statements: 100 },
      exclude: ["**/main.tsx", "**/api/generated/**", "**/*.d.ts"],
    },
  },
});
```

CI는 `npm run test -- --coverage`를 실행하고, 기준 미달 시 빌드를 실패시킵니다(9장 참고). PR 템플릿의 "테스트 커버리지 100%" 체크는 이 CI 통과로 확인합니다.

---

## 9. Git 워크플로 (필수 — 위반 시 반려)

1. 작업 요청을 받으면 **코드보다 먼저** 단위 GitHub Issue를 만든다. `.github/ISSUE_TEMPLATE/`의 Feature/Bug 템플릿을 그대로 사용.
2. 현재 브랜치 성격과 요청 작업 유형이 다르면 **새 브랜치 생성을 먼저 제안**한다. 브랜치명은 컨벤션 2.1의 `feat/<scope>` `fix/<scope>` `chore/<scope>` 규칙을 그대로 따른다.
3. 커밋은 **절대 임의로 하지 않는다.** 커밋 메시지를 먼저 사용자에게 제시하고, 승인받은 뒤에만 커밋한다.
4. PR 생성 시 `.github/pull_request_template.md`를 그대로 쓰고, 본문에 `Closes #이슈번호`를 포함한다. 화면 변경이 있으면 스크린샷을 반드시 첨부(컨벤션 2.3).
5. `main`/`develop`으로의 push 또는 그 브랜치로 향하는 PR에는 `.github/workflows/ci.yml`이 자동으로 린트+빌드+테스트+커버리지를 돌려야 한다. 워크플로가 없으면 먼저 생성을 제안한다.

---

## 10. 기술적 변경 로그 (필수)

단위적·기능적 변경은 **변경 사유를 문서로 남겨 추적**합니다. "무엇을 바꿨는지"는 diff가 말해주므로, 여기서는 **왜(Why)** 와 영향·검증·롤백을 기록합니다.

- **작성 대상**: 기능 추가·변경·제거(`feat`), 버그 수정(`fix`), 계산/수치 영향 변경(`calc`), 동작이 바뀌는 리팩터링·API 계약·데이터 형태 변경, 빌드·CI·아키텍처 등 구조적 변경.
- **생략 가능**: 오탈자·주석·포맷팅 등 동작에 영향 없는 순수 문서/스타일 변경.
- **작성 방법**: `docs/tech-changelog/TEMPLATE.md`를 복사해 `docs/tech-changelog/NNNN-<슬러그>.md`로 추가한다(4자리 순번). 관련 브랜치·커밋·이슈·PR을 링크하고, PR 본문에서 해당 로그를 참조한다. 규칙 상세는 `docs/tech-changelog/README.md` 참고.
- 한 논리적 변경 = 로그 파일 하나. 수치가 바뀌면 변경 전후 값을 표로 남긴다.

---

## 11. 확인 필요 / 미확정 (팀 결정 후 이 문서 갱신)

- [x] 빌드 도구 확정 — **Vite**
- [ ] 상태관리 라이브러리 선정 (서버/클라 구분 — §7.5)
- [ ] API 클라이언트 라이브러리(fetch/axios) 선정
- [ ] 디자인 시스템/컴포넌트 라이브러리 사용 여부 (토큰 기반 자체 구축 vs 기존 라이브러리)
- [ ] ESLint/Prettier 설정 파일 커밋 여부
- [ ] §7 강제용 ESLint 확장 도입 여부 — `eslint-plugin-import`(no-cycle·no-restricted-imports), `@typescript-eslint/naming-convention`, 타입체크 기반 규칙(no-floating-promises·no-unnecessary-condition), `no-explicit-any` error 승격, tsconfig `noUncheckedIndexedAccess`
- [ ] OpenAPI 스펙 기반 타입 자동생성 도구(openapi-typescript 등) 도입 여부
- [ ] Vitest coverage 제외 대상(exclude) 목록 최종 확정
