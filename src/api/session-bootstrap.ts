import { startDemoSession } from "./auth";
import { readApiSession, type ApiSession } from "./session";

let inflight: Promise<ApiSession> | null = null;

/**
 * API 세션을 보장한다.
 *
 * 저장된 세션이 있으면 그대로 쓰고, 없으면 BE의 데모 계정 세션을 발급받는다.
 * 데모 계정 여부는 BE가 `TokenResponse.isDemo`로 알려주므로 프론트가 판단하지 않는다.
 *
 * 여러 호출자가 동시에 불러도 발급 요청은 한 번만 나간다. 실패하면 진행 중인
 * 요청을 비워 다음 호출이 다시 시도할 수 있게 한다.
 */
export function ensureApiSession(): Promise<ApiSession> {
  const existing = readApiSession();
  if (existing) {
    return Promise.resolve(existing);
  }

  inflight ??= startDemoSession().finally(() => {
    inflight = null;
  });

  return inflight;
}
