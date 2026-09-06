import type { TokenResponse } from "./generated/divurve-api";

export type SessionPersistence = "session" | "local";
export type ApiSession = TokenResponse;

export const API_SESSION_STORAGE_KEY = "divurve_api_session";
let memorySession: ApiSession | null = null;

function isApiSession(value: unknown): value is ApiSession {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Partial<ApiSession>;
  return (
    typeof candidate.accessToken === "string" &&
    typeof candidate.refreshToken === "string" &&
    typeof candidate.expiresIn === "number" &&
    typeof candidate.isDemo === "boolean"
  );
}

function readStorage(storage: Storage): ApiSession | null {
  try {
    const serialized = storage.getItem(API_SESSION_STORAGE_KEY);
    if (!serialized) return null;
    const parsed: unknown = JSON.parse(serialized);
    return isApiSession(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function readApiSession(): ApiSession | null {
  return memorySession ?? readStorage(sessionStorage) ?? readStorage(localStorage);
}

export function saveApiSession(
  session: ApiSession,
  persistence: SessionPersistence = "session",
): void {
  memorySession = session;
  const target = persistence === "local" ? localStorage : sessionStorage;
  const other = persistence === "local" ? sessionStorage : localStorage;
  try {
    target.setItem(API_SESSION_STORAGE_KEY, JSON.stringify(session));
    other.removeItem(API_SESSION_STORAGE_KEY);
  } catch {
    // 저장소가 차단된 환경에서는 현재 페이지의 메모리 상태만 사용한다.
  }
}

export function clearApiSession(): void {
  memorySession = null;
  for (const storage of [sessionStorage, localStorage]) {
    try {
      storage.removeItem(API_SESSION_STORAGE_KEY);
    } catch {
      // 차단된 저장소에는 지속 세션이 남지 않는다.
    }
  }
}

export function getApiAccessToken(): string | null {
  return readApiSession()?.accessToken ?? null;
}
