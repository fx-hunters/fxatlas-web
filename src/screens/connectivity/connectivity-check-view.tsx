/**
 * 연결 확인 페이지의 표현(presentational) 컴포넌트.
 * props만 받아 렌더하고 데이터 취득·전역 접근을 하지 않는다 (AGENTS.md 7.2).
 * 로딩·에러·성공 상태를 각각 렌더한다 (7.8).
 */
import type { ChecksState } from "./use-connectivity-check";

export interface ConnectivityCheckViewProps {
  checksState: ChecksState;
  message: string;
  isSubmitting: boolean;
  submitError: string | null;
  onMessageChange: (value: string) => void;
  onSubmit: () => void;
  onReload: () => void;
}

export function ConnectivityCheckView({
  checksState,
  message,
  isSubmitting,
  submitError,
  onMessageChange,
  onSubmit,
  onReload,
}: ConnectivityCheckViewProps) {
  return (
    <section aria-labelledby="connectivity-heading">
      <h2 id="connectivity-heading">연결 확인 (Connectivity Check)</h2>
      <p>프론트엔드 ↔ 백엔드 ↔ DB 왕복을 확인하는 테스트 페이지입니다.</p>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <label htmlFor="connectivity-message">메시지</label>
        <input
          id="connectivity-message"
          type="text"
          value={message}
          onChange={(event) => onMessageChange(event.target.value)}
          placeholder="DB에 저장할 메시지"
          disabled={isSubmitting}
        />
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "저장 중…" : "저장"}
        </button>
      </form>
      {submitError !== null && <p role="alert">{submitError}</p>}

      <div>
        <button type="button" onClick={onReload}>
          목록 새로고침
        </button>
      </div>

      <ConnectivityCheckList checksState={checksState} />
    </section>
  );
}

function ConnectivityCheckList({ checksState }: { checksState: ChecksState }) {
  if (checksState.status === "loading") {
    return <p>불러오는 중…</p>;
  }
  if (checksState.status === "error") {
    return <p role="alert">{checksState.message}</p>;
  }
  if (checksState.checks.length === 0) {
    return <p>저장된 레코드가 없습니다.</p>;
  }
  return (
    <ul>
      {checksState.checks.map((check) => (
        <li key={check.id}>
          <strong>#{check.id}</strong> {check.message}{" "}
          <time dateTime={check.createdAt}>{check.createdAt}</time>
        </li>
      ))}
    </ul>
  );
}
