import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { XRayScreen } from "./xray-screen";

describe("XRayScreen", () => {
  it("서브 탭 전환 인터랙션을 정상적으로 처리한다", () => {
    const onNavigate = vi.fn();

    render(<XRayScreen isDemo={true} onNavigate={onNavigate} />);

    // 초기 탭: 통화 노출 · 손익 분해
    expect(screen.getByRole("heading", { name: "외화 비중" })).toBeInTheDocument();

    // 통화 적합도 탭 클릭
    fireEvent.click(screen.getByRole("button", { name: "통화 적합도" }));
    expect(screen.getByRole("heading", { name: "집중도 진단" })).toBeInTheDocument();

    // 플래너 이동 인터랙션
    fireEvent.click(screen.getByRole("button", { name: "새 통화 목표 만들기" }));
    expect(onNavigate).toHaveBeenCalledWith("planner");

    // 다시 통화 노출 탭 클릭
    fireEvent.click(screen.getByRole("button", { name: "통화 노출 · 손익 분해" }));
    expect(screen.getByRole("heading", { name: "외화 비중" })).toBeInTheDocument();
  });

  it("onNavigate prop 없이도 에러 없이 렌더링되고 동작한다", () => {
    render(<XRayScreen isDemo={false} />);
    expect(screen.getByRole("heading", { name: "외화 비중" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "계획 수정" }));
  });
});
