# 0003. 서비스명 FxAtlas → Divurve 리브랜딩

| 항목 | 내용 |
|---|---|
| 날짜 | 2026-09-05 |
| 작성자 | Claude (AI Agent) |
| 변경 유형 | chore |
| 영향 범위 | 화면(표시명) / 문서 / package 식별자 |
| 관련 브랜치 | chore/rebrand-divurve |
| 관련 커밋 | (이 커밋) |
| 관련 이슈·PR | — |

## 변경 사유 (Why)
서비스명을 FxAtlas에서 Divurve로 확정·변경한다. 브라우저 탭·화면 타이틀·문서·패키지
이름이 갈리면 사용자와 팀 모두 혼동하므로, 표시명과 package 식별자를 일괄 통일한다.

## 변경 내용 (What)
- 화면 표시명: `index.html`(title), `src/app/app.tsx`(h1), `src/app/app.test.tsx`(검사 문자열)
- 문서: `AGENTS.md`(프로젝트 개요·예시 도메인 언급), `README.md`
- 예시 도메인 주석: `src/vite-env.d.ts` `api.fxatlas.example` → `api.divurve.example`
- package 식별자: `package.json`·`package-lock.json` name `fxatlas-web` → `divurve-web`

## 영향 / 리스크
- **GitHub 레포명(`fx-hunters/fxatlas-web`)은 이번 변경에서 제외**했다. 레포 rename은
  원격 URL·클론 경로·CI에 영향을 주는 외부 작업이라 팀이 GitHub에서 직접 수행한다.
- 백엔드 실제 API 도메인은 `.env`의 `VITE_API_URL`로 관리되므로 코드 변경과 무관.

## 검증
- [x] `grep fxatlas` 잔여 참조 0건 (node_modules/dist 제외)
- [x] `npm run build` 성공, `npm run test` 6/6 통과 (Divurve heading 테스트 포함)

## 롤백 방법
- 이 커밋을 revert한다. package name 되돌린 뒤 `npm install --package-lock-only`로 lock 동기화.
