import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { HomeEmptyView } from "./home-empty-view";

describe("HomeEmptyView", () => {
  it("외화 목표 없음 안내 및 플래너 이동 버튼을 렌더링한다", () => {
    const onNavigateToPlanner = vi.fn();
    render(<HomeEmptyView onNavigateToPlanner={onNavigateToPlanner} />);

    expect(screen.getByRole("heading", { name: "외화 목표가 없습니다" })).toBeInTheDocument();
    const btn = screen.getByRole("button", { name: "환전 플래너로 이동" });
    fireEvent.click(btn);
    expect(onNavigateToPlanner).toHaveBeenCalled();
  });
});
