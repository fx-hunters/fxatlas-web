/**
 * 연결 확인 페이지의 컨테이너(container) 컴포넌트.
 * 데이터·로직은 훅에 맡기고, 표현은 view에 위임한다 (AGENTS.md 7.2).
 */
import { ConnectivityCheckView } from "./connectivity-check-view";
import { useConnectivityCheck } from "./use-connectivity-check";

export function ConnectivityCheckPanel() {
  const {
    checksState,
    message,
    isSubmitting,
    submitError,
    setMessage,
    handleSubmit,
    reload,
  } = useConnectivityCheck();

  return (
    <ConnectivityCheckView
      checksState={checksState}
      message={message}
      isSubmitting={isSubmitting}
      submitError={submitError}
      onMessageChange={setMessage}
      onSubmit={handleSubmit}
      onReload={reload}
    />
  );
}
