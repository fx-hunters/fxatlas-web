/**
 * API 클라이언트 단일 진입점.
 *
 * 규칙 (AGENTS.md 4·5장 참조):
 * - 백엔드 주소는 코드에 박지 않는다. 빌드타임 환경변수 VITE_API_URL로만 참조한다.
 *   (설정은 .env / .env.example 한 곳에서만 관리)
 * - 백엔드는 /api/v1/... URL 버저닝을 사용한다.
 * - 모든 응답은 { data, meta } 로 감싸져 온다. 여기 래퍼에서만 언래핑한다.
 * - 백엔드 응답 필드는 snake_case로 도착한다. 이 파일 한 곳에서만 camelCase로 변환하고,
 *   이후 컴포넌트·훅에서는 항상 camelCase만 사용한다.
 *
 * TODO(미확정): fetch 래퍼 vs axios 중 하나로 통일 (AGENTS.md 9장).
 */

/** resolveApiBaseUrl / apiUrl가 참조하는 환경변수의 최소 형태 */
type ApiEnv = Pick<ImportMetaEnv, "VITE_API_URL">;

/**
 * 백엔드 API 베이스 URL을 환경변수에서 읽어 정규화한다.
 * 값이 없으면 즉시 예외를 던져, 설정 누락을 앱 부팅 시점에 바로 드러낸다.
 */
export function resolveApiBaseUrl(env: ApiEnv = import.meta.env): string {
  const url = env.VITE_API_URL;
  if (!url) {
    throw new Error(
      "VITE_API_URL 환경변수가 설정되지 않았습니다. .env.example을 복사해 .env를 만드세요.",
    );
  }
  // 끝의 슬래시는 경로 결합 시 중복을 막기 위해 제거한다.
  return url.replace(/\/+$/, "");
}

/** 베이스 URL과 경로를 합쳐 완전한 요청 URL을 만든다. */
export function apiUrl(path: string, env?: ApiEnv): string {
  const base = resolveApiBaseUrl(env);
  return `${base}/${path.replace(/^\/+/, "")}`;
}
