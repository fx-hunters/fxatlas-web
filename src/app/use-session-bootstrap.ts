import { useCallback, useEffect, useState } from "react";
import { ApiError } from "../api/client";
import { ensureApiSession } from "../api/session-bootstrap";
import type { ApiSession } from "../api/session";
import { toAccountKind, type SessionState } from "./session-state";

export type SessionEnsurer = () => Promise<ApiSession>;

interface UseSessionBootstrapResult {
  readonly state: SessionState;
  readonly retry: () => void;
}

function toBootstrapErrorMessage(error: unknown): string {
  return error instanceof ApiError
    ? error.message
    : "체험 데이터를 준비하지 못했습니다. 잠시 후 다시 시도해 주세요.";
}

/**
 * 대시보드 진입 전에 API 세션을 확보한다.
 *
 * `api/client.ts`는 토큰이 없으면 요청 자체를 보내지 않고 401을 던지므로,
 * 화면을 띄우기 전에 세션을 먼저 확보한다. 그래야 여러 화면이 동시에
 * 인증 실패를 만드는 상황이 생기지 않는다.
 */
export function useSessionBootstrap(
  isEnabled: boolean,
  ensure: SessionEnsurer = ensureApiSession,
): UseSessionBootstrapResult {
  const [state, setState] = useState<SessionState>({ status: "bootstrapping" });
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    let isActive = true;
    setState({ status: "bootstrapping" });

    void ensure()
      .then((session) => {
        if (isActive) {
          setState({ status: "ready", accountKind: toAccountKind(session) });
        }
      })
      .catch((error: unknown) => {
        if (isActive) {
          setState({ status: "failed", message: toBootstrapErrorMessage(error) });
        }
      });

    return () => {
      isActive = false;
    };
  }, [isEnabled, ensure, retryKey]);

  const retry = useCallback(() => {
    setRetryKey((currentKey) => currentKey + 1);
  }, []);

  return { state, retry };
}
