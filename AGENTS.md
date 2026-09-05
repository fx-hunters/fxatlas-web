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
| 버전 동기화 | 백엔드가 `/api/v1/...` URL 버저닝을 쓰므로, FE는 baseURL을 환경변수/설정 파일 한 곳에만 둔다. 하드코딩 금지 |
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

## 7. 테스트 커버리지 (Vitest, 100%)

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

CI는 `npm run test -- --coverage`를 실행하고, 기준 미달 시 빌드를 실패시킵니다(8장 참고). PR 템플릿의 "테스트 커버리지 100%" 체크는 이 CI 통과로 확인합니다.

---

## 8. Git 워크플로 (필수 — 위반 시 반려)

1. 작업 요청을 받으면 **코드보다 먼저** 단위 GitHub Issue를 만든다. `.github/ISSUE_TEMPLATE/`의 Feature/Bug 템플릿을 그대로 사용.
2. 현재 브랜치 성격과 요청 작업 유형이 다르면 **새 브랜치 생성을 먼저 제안**한다. 브랜치명은 컨벤션 2.1의 `feat/<scope>` `fix/<scope>` `chore/<scope>` 규칙을 그대로 따른다.
3. 커밋은 **절대 임의로 하지 않는다.** 커밋 메시지를 먼저 사용자에게 제시하고, 승인받은 뒤에만 커밋한다.
4. PR 생성 시 `.github/pull_request_template.md`를 그대로 쓰고, 본문에 `Closes #이슈번호`를 포함한다. 화면 변경이 있으면 스크린샷을 반드시 첨부(컨벤션 2.3).
5. `main`/`develop`으로의 push 또는 그 브랜치로 향하는 PR에는 `.github/workflows/ci.yml`이 자동으로 린트+빌드+테스트+커버리지를 돌려야 한다. 워크플로가 없으면 먼저 생성을 제안한다.

---

## 9. 확인 필요 / 미확정 (팀 결정 후 이 문서 갱신)

- [x] 빌드 도구 확정 — **Vite**
- [ ] 상태관리 라이브러리 선정
- [ ] API 클라이언트 라이브러리(fetch/axios) 선정
- [ ] 디자인 시스템/컴포넌트 라이브러리 사용 여부 (토큰 기반 자체 구축 vs 기존 라이브러리)
- [ ] ESLint/Prettier 설정 파일 커밋 여부
- [ ] OpenAPI 스펙 기반 타입 자동생성 도구(openapi-typescript 등) 도입 여부
- [ ] Vitest coverage 제외 대상(exclude) 목록 최종 확정
