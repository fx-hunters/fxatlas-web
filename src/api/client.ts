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

/**
 * 모든 응답을 감싸는 공통 메타 정보. 백엔드가 응답마다 자동 생성한다.
 * 필드는 snake_case로 도착하므로 언래핑 시 camelCase로 변환된다.
 */
export interface ApiMeta {
  timestamp: string;
}

/** 백엔드 표준 응답 봉투. 실제 데이터는 data, 부가정보는 meta에 담긴다. */
interface ApiEnvelope<T> {
  data: T;
  meta: ApiMeta;
}

/**
 * API 호출 실패를 나타내는 타입이 있는 에러.
 * 화면은 이 타입으로 좁혀 사용자에게 복구 가능한 메시지를 보여준다 (AGENTS.md 7.8).
 */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** snake_case 키 하나를 camelCase로 바꾼다. (`created_at` → `createdAt`) */
function snakeToCamelKey(key: string): string {
  return key.replace(/_([a-z0-9])/g, (_match, char: string) =>
    char.toUpperCase(),
  );
}

/**
 * 백엔드에서 온 값의 모든 객체 키를 재귀적으로 camelCase로 변환한다.
 * 경계 변환은 이 파일 한 곳에서만 일어난다 (AGENTS.md 4장).
 * 배열은 원소별로, 객체는 키별로 변환하고, 원시값·null은 그대로 둔다.
 */
export function toCamelCase(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(toCamelCase);
  }
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, val]) => [
        snakeToCamelKey(key),
        toCamelCase(val),
      ]),
    );
  }
  return value;
}

/**
 * 공통 fetch 래퍼. 요청을 보내고 { data, meta } 봉투를 언래핑한 뒤,
 * snake_case → camelCase 변환을 거쳐 data만 반환한다.
 * 실패 응답(2xx 외)은 ApiError로 던진다.
 */
export async function request<T>(
  path: string,
  init?: RequestInit,
  env?: ApiEnv,
): Promise<T> {
  const response = await fetch(apiUrl(path, env), {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  if (!response.ok) {
    throw new ApiError(
      `요청이 실패했습니다 (HTTP ${response.status}).`,
      response.status,
    );
  }

  const envelope = (await response.json()) as ApiEnvelope<unknown>;
  return toCamelCase(envelope.data) as T;
}
