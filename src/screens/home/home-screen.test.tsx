import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { HomeScreen } from "./home-screen";

describe("HomeScreen", () => {
  it("데모 모드일 때 대시보드 뷰를 렌더링하고 다른 화면 이동 핸들러를 연결한다", () => {
    const onNavigate = vi.fn();
    render(<HomeScreen isDemo={true} onNavigate={onNavigate} />);

    expect(screen.getByRole("heading", { name: "오늘의 행동 (이번 주 확보액)" })).toBeInTheDocument();

    const assetsLink = screen.getByRole("button", { name: "자산 등록 / 편집" });
    fireEvent.click(assetsLink);
    expect(onNavigate).toHaveBeenCalledWith("assets");

    fireEvent.click(screen.getByRole("button", { name: "플래너 확인하기 →" }));
    expect(onNavigate).toHaveBeenCalledWith("planner");
  });

  it("빈 상태일 때 HomeEmptyView를 렌더링하고 플래너로 이동할 수 있다", () => {
    const onNavigate = vi.fn();
    render(<HomeScreen isDemo={false} onNavigate={onNavigate} />);

    expect(screen.getByRole("heading", { name: "외화 목표가 없습니다" })).toBeInTheDocument();

    const plannerBtn = screen.getByRole("button", { name: "환전 플래너로 이동" });
    fireEvent.click(plannerBtn);
    expect(onNavigate).toHaveBeenCalledWith("planner");
  });
});
