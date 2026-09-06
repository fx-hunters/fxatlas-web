import { getApiAccessToken } from "./session";

type ApiEnv = Pick<ImportMetaEnv, "VITE_API_URL">;

export interface ApiMeta {
  readonly timestamp: string;
  readonly sources?: readonly unknown[];
}

export interface ApiResult<T> {
  readonly data: T;
  readonly meta: ApiMeta;
}

interface ApiEnvelope {
  readonly data?: unknown;
  readonly meta?: unknown;
}

interface ApiErrorEnvelope {
  readonly error?: {
    readonly code?: unknown;
    readonly message?: unknown;
  };
}

export interface ApiRequestInit extends Omit<RequestInit, "body"> {
  readonly body?: unknown;
  readonly requiresAuth?: boolean;
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string = "HTTP_ERROR",
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function resolveApiBaseUrl(env: ApiEnv = import.meta.env): string {
  const url = env.VITE_API_URL;
  if (!url) {
    throw new Error(
      "VITE_API_URL 환경변수가 설정되지 않았습니다. .env.example을 복사해 .env를 만드세요.",
    );
  }
  return url.replace(/\/+$/, "");
}

export function apiUrl(path: string, env?: ApiEnv): string {
  return `${resolveApiBaseUrl(env)}/${path.replace(/^\/+/, "")}`;
}

export function apiPath(
  path: string,
  params: Readonly<Record<string, string | number | boolean | undefined>>,
): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) query.set(key, String(value));
  }
  const serialized = query.toString();
  return serialized ? `${path}?${serialized}` : path;
}

function snakeToCamelKey(key: string): string {
  return key.replace(/_([a-z0-9])/g, (_match, char: string) =>
    char.toUpperCase(),
  );
}

function camelToSnakeKey(key: string): string {
  return key.replace(/[A-Z]/g, (char) => `_${char.toLowerCase()}`);
}

export function toCamelCase(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(toCamelCase);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [
        snakeToCamelKey(key),
        toCamelCase(nestedValue),
      ]),
    );
  }
  return value;
}

export function toSnakeCase(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(toSnakeCase);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [
        camelToSnakeKey(key),
        toSnakeCase(nestedValue),
      ]),
    );
  }
  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function parseMeta(value: unknown): ApiMeta {
  const converted = toCamelCase(value);
  if (!isRecord(converted) || typeof converted.timestamp !== "string") {
    return { timestamp: "" };
  }
  return converted as unknown as ApiMeta;
}

function toApiError(payload: unknown, status: number): ApiError {
  const converted = toCamelCase(payload);
  const errorValue = isRecord(converted)
    ? (converted as ApiErrorEnvelope).error
    : undefined;
  const code = errorValue?.code;
  const message = errorValue?.message;
  return new ApiError(
    typeof message === "string"
      ? message
      : `요청이 실패했습니다 (HTTP ${status}).`,
    status,
    typeof code === "string" ? code : "HTTP_ERROR",
  );
}

async function parseResponseBody(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return { data: undefined, meta: { timestamp: "" } };
  }
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function requestWithMeta<T>(
  path: string,
  init: ApiRequestInit = {},
  env?: ApiEnv,
): Promise<ApiResult<T>> {
  const {
    body,
    requiresAuth = true,
    headers: suppliedHeaders,
    ...requestInit
  } = init;
  const headers = new Headers(suppliedHeaders);
  headers.set("Accept", "application/json");
  if (body !== undefined) headers.set("Content-Type", "application/json");

  if (requiresAuth) {
    const accessToken = getApiAccessToken();
    if (!accessToken) {
      throw new ApiError(
        "로그인이 필요한 요청입니다. 로그인 후 다시 시도해 주세요.",
        401,
        "AUTH_REQUIRED",
      );
    }
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  let response: Response;
  try {
    response = await fetch(apiUrl(path, env), {
      ...requestInit,
      headers,
      body: body === undefined ? undefined : JSON.stringify(toSnakeCase(body)),
    });
  } catch {
    throw new ApiError(
      "서버에 연결할 수 없습니다. 네트워크 상태를 확인해 주세요.",
      0,
      "NETWORK_ERROR",
    );
  }

  const payload = await parseResponseBody(response);
  if (!response.ok) throw toApiError(payload, response.status);
  if (!isRecord(payload) || !("data" in payload)) {
    throw new ApiError(
      "서버 응답 형식을 확인할 수 없습니다.",
      response.status,
      "INVALID_RESPONSE",
    );
  }

  return {
    data: toCamelCase((payload as ApiEnvelope).data) as T,
    meta: parseMeta((payload as ApiEnvelope).meta),
  };
}

export async function request<T>(
  path: string,
  init: ApiRequestInit = {},
  env?: ApiEnv,
): Promise<T> {
  return (await requestWithMeta<T>(path, init, env)).data;
}
