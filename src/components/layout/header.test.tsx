import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Header } from "./header";

describe("Header", () => {
  it("현재 활성 탭 제목과 액션 버튼들을 렌더링한다", () => {
    const onNavigateToMypage = vi.fn();
    const onToggleTheme = vi.fn();

    render(
      <Header
        activeTabTitle="환율 범위"
        isDark={true}
        onNavigateToMypage={onNavigateToMypage}
        onToggleTheme={onToggleTheme}
      />,
    );

    expect(screen.getByRole("heading", { name: "환율 범위" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "마이페이지" }));
    expect(onNavigateToMypage).toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "라이트 모드로 변경" }));
    expect(onToggleTheme).toHaveBeenCalled();
  });
});
