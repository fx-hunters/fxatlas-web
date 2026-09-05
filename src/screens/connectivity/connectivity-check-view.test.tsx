import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ConnectivityCheckView } from "./connectivity-check-view";
import type { ConnectivityCheckViewProps } from "./connectivity-check-view";
import type { ChecksState } from "./use-connectivity-check";

function renderView(overrides: Partial<ConnectivityCheckViewProps> = {}) {
  const props: ConnectivityCheckViewProps = {
    checksState: { status: "loading" },
    message: "",
    isSubmitting: false,
    submitError: null,
    onMessageChange: vi.fn(),
    onSubmit: vi.fn(),
    onReload: vi.fn(),
    ...overrides,
  };
  render(<ConnectivityCheckView {...props} />);
  return props;
}

describe("ConnectivityCheckView", () => {
  it("로딩 상태를 렌더한다", () => {
    renderView({ checksState: { status: "loading" } });
    expect(screen.getByText("불러오는 중…")).toBeInTheDocument();
  });

  it("에러 상태 메시지를 렌더한다", () => {
    renderView({ checksState: { status: "error", message: "연결 실패" } });
    expect(screen.getByText("연결 실패")).toBeInTheDocument();
  });

  it("빈 목록 상태를 렌더한다", () => {
    renderView({ checksState: { status: "success", checks: [] } });
    expect(screen.getByText("저장된 레코드가 없습니다.")).toBeInTheDocument();
  });

  it("레코드 목록을 렌더한다", () => {
    const checksState: ChecksState = {
      status: "success",
      checks: [{ id: 7, message: "hello", createdAt: "2026-01-01" }],
    };
    renderView({ checksState });
    expect(screen.getByText("#7")).toBeInTheDocument();
    expect(screen.getByText("hello")).toBeInTheDocument();
  });

  it("submitError가 있으면 alert로 보여준다", () => {
    renderView({ submitError: "메시지를 입력하세요." });
    expect(screen.getByRole("alert")).toHaveTextContent("메시지를 입력하세요.");
  });

  it("저장 중이면 버튼이 비활성·저장 중 문구가 된다", () => {
    renderView({ isSubmitting: true });
    const button = screen.getByRole("button", { name: "저장 중…" });
    expect(button).toBeDisabled();
  });

  it("폼 제출 시 onSubmit을 호출한다", () => {
    const props = renderView();
    fireEvent.click(screen.getByRole("button", { name: "저장" }));
    expect(props.onSubmit).toHaveBeenCalledTimes(1);
  });

  it("입력 변경 시 onMessageChange를 호출한다", () => {
    const props = renderView();
    fireEvent.change(screen.getByLabelText("메시지"), {
      target: { value: "abc" },
    });
    expect(props.onMessageChange).toHaveBeenCalledWith("abc");
  });

  it("새로고침 버튼이 onReload를 호출한다", () => {
    const props = renderView();
    fireEvent.click(screen.getByRole("button", { name: "목록 새로고침" }));
    expect(props.onReload).toHaveBeenCalledTimes(1);
  });
});
