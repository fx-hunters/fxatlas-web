# 0004. 프론트·DB 연동 확인용 연결 확인(Connectivity Check) 테스트 페이지

| 항목 | 내용 |
|---|---|
| 날짜 | 2026-09-05 |
| 작성자 | Claude (AI Agent) |
| 변경 유형 | feat |
| 영향 범위 | 화면 / API / 상태 |
| 관련 브랜치 | feat/connectivity-check |
| 관련 커밋 | (커밋 후 기입) |
| 관련 이슈·PR | (PR 생성 후 기입) |

## 변경 사유 (Why)
백엔드가 프론트·DB 왕복을 검증하는 테스트용 엔드포인트(`/api/v1/connectivity-checks`,
`/api/v1/health/ping`)와 `{ data, meta }` 표준 응답 래퍼를 첫 수직 슬라이스로 구현했다.
프론트엔드도 이에 맞춰 **실제로 백엔드를 호출해 DB 왕복을 눈으로 확인할 수단**이 필요했고,
동시에 이후 모든 API가 공유할 두 기반 — 공통 fetch 래퍼(언래핑)와 snake→camel 경계 변환
(AGENTS.md §4·§5) — 을 처음으로 세울 필요가 있었다.

## 변경 내용 (What)
- `api/client.ts`: 공통 fetch 래퍼 `request<T>` 추가. `{ data, meta }` 봉투 언래핑 +
  snake_case→camelCase 재귀 변환(`toCamelCase`) + 실패 시 `ApiError`(status 포함) 던짐.
  경계 변환은 이 파일 한 곳에서만 일어난다.
- `api/connectivity.ts`: 타입(`ConnectivityCheck`/`HealthPing`)과 API 함수 3개
  (`fetchConnectivityChecks`/`createConnectivityCheck`/`fetchHealthPing`).
- `screens/connectivity/`: custom hook(`useConnectivityCheck`) + container
  (`ConnectivityCheckPanel`) + presentational(`ConnectivityCheckView`)로 분리(§7.2·7.3).
  목록 상태는 discriminated union으로 로딩/에러/성공을 한 시점에 하나만 갖게 했다(§7.4).
- `app/app.tsx`: 라우터 확정 전까지 루트에 패널을 노출.
- 개발 프리뷰용 `.claude/launch.json` 추가(`npm run dev`, port 5173).

## 영향 / 리스크
- 새 공통 래퍼는 이후 모든 API 호출의 표준이 된다. 응답 형태(`data`/`meta`)나 표기 변환
  규칙이 바뀌면 여기만 고치면 된다.
- `App`이 마운트 시 목록을 조회하므로, 백엔드/`VITE_API_URL` 미설정 시 에러 상태가 보인다
  (의도된 동작 — 사용자에게 백엔드 실행 여부를 안내).
- 테스트 전용 화면이라 라우터 도입(§11) 후 별도 경로로 옮기거나 제거될 수 있다.

## 검증
- [x] 테스트 통과(33개) + 커버리지 100% (lines/branches/functions/statements)
- [x] `npm run lint` / `npm run build`(tsc + vite) 통과
- [x] dev 서버 기동 후 브라우저에서 페이지 렌더·폼·상태 표시 육안 확인
- [ ] (로컬 Postgres + 백엔드 bootRun 후) 실제 저장/조회 왕복 — 백엔드 기동 시 수동 확인

## 롤백 방법
- 브랜치 미병합: 브랜치 폐기.
- 병합 후: `screens/connectivity/`·`api/connectivity.ts` 및 `app.tsx`의 패널 참조 제거.
  `api/client.ts`의 래퍼는 다른 API가 쓰기 전이라면 함께 되돌릴 수 있다.
