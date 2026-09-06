import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ApiStateView } from "./api-state-view";

describe("ApiStateView", () => {
  it.each([
    ["loading", "불러오는 중", "잠시 기다려 주세요.", "status"],
    ["empty", "표시할 내용 없음", "데이터가 없습니다.", "status"],
    ["error", "연결 실패", "다시 시도해 주세요.", "alert"],
  ] as const)("%s 상태를 접근 가능한 안내로 표시한다", (status, title, message, role) => {
    render(<ApiStateView status={status} title={title} message={message} />);

    expect(screen.getByRole(role)).toHaveTextContent(title);
    expect(screen.getByRole(role)).toHaveTextContent(message);
    expect(screen.queryByRole("button", { name: "다시 시도" })).not.toBeInTheDocument();
  });

  it("오류 상태에서 다시 시도를 전달한다", () => {
    const onRetry = vi.fn();
    render(
      <ApiStateView
        status="error"
        title="연결 실패"
        message="다시 확인해 주세요."
        onRetry={onRetry}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "다시 시도" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
