/**
 * 연결 확인 페이지의 상태·로직을 담는 custom hook.
 * 값과 핸들러만 반환하고 JSX는 반환하지 않는다 (AGENTS.md 7.3).
 * 서버 데이터는 로컬에 colocate하며 전역 스토어에 복사하지 않는다 (7.5).
 */
import { useCallback, useEffect, useState } from "react";
import { ApiError } from "../../api/client";
import {
  createConnectivityCheck,
  fetchConnectivityChecks,
  type ConnectivityCheck,
} from "../../api/connectivity";

/** 목록 조회의 3가지 상태를 한 시점에 하나만 갖도록 한 discriminated union. */
export type ChecksState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; checks: ConnectivityCheck[] };

/** 알 수 없는 예외를 사용자에게 보여줄 메시지 문자열로 좁힌다. */
function toErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  return "서버에 연결하지 못했습니다. 백엔드가 실행 중인지 확인하세요.";
}

export interface UseConnectivityCheck {
  checksState: ChecksState;
  message: string;
  isSubmitting: boolean;
  submitError: string | null;
  setMessage: (value: string) => void;
  handleSubmit: () => Promise<void>;
  reload: () => Promise<void>;
}

export function useConnectivityCheck(): UseConnectivityCheck {
  const [checksState, setChecksState] = useState<ChecksState>({
    status: "loading",
  });
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setChecksState({ status: "loading" });
    try {
      const checks = await fetchConnectivityChecks();
      setChecksState({ status: "success", checks });
    } catch (error) {
      setChecksState({ status: "error", message: toErrorMessage(error) });
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const handleSubmit = useCallback(async () => {
    const trimmed = message.trim();
    if (trimmed === "") {
      setSubmitError("메시지를 입력하세요.");
      return;
    }
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await createConnectivityCheck(trimmed);
      setMessage("");
      await reload();
    } catch (error) {
      setSubmitError(toErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }, [message, reload]);

  return {
    checksState,
    message,
    isSubmitting,
    submitError,
    setMessage,
    handleSubmit,
    reload,
  };
}
