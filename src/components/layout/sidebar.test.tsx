import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Sidebar } from "./sidebar";

describe("Sidebar", () => {
  const defaultProps = {
    activeTab: "home" as const,
    isDemo: true,
    onSelectTab: vi.fn(),
    onToggleDemo: vi.fn(),
  };

  it("서비스명 DIVURVE와 내비게이션 탭들을 렌더링한다", () => {
    render(<Sidebar {...defaultProps} />);
    expect(screen.getByRole("heading", { name: "DIVURVE" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /홈/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /환전 플래너/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /내 자산/ })).toBeInTheDocument();
  });

  it("탭 클릭 시 onSelectTab 콜백을 호출한다", () => {
    render(<Sidebar {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: /환전 플래너/ }));
    expect(defaultProps.onSelectTab).toHaveBeenCalledWith("planner");
  });

  it("데모 토글 버튼 클릭 시 핸들러가 호출된다", () => {
    render(<Sidebar {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: /목 데이터 사용 중/ }));
    expect(defaultProps.onToggleDemo).toHaveBeenCalled();
  });

  it("데모가 꺼진 상태의 제어 문구를 표시한다", () => {
    render(<Sidebar {...defaultProps} isDemo={false} />);

    expect(screen.getByRole("button", { name: "API 데이터 사용 중" })).toBeInTheDocument();
  });

  it("API 연결 중에는 전환 버튼을 비활성화한다", () => {
    render(<Sidebar {...defaultProps} isDemoSwitching={true} />);
    expect(screen.getByRole("button", { name: "API 연결 중…" })).toBeDisabled();
  });
});
