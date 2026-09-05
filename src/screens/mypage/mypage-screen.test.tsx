import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MyPageScreen } from "./mypage-screen";

describe("MyPageScreen", () => {
  it("마이페이지 플레이스홀더를 렌더링한다", () => {
    render(<MyPageScreen />);
    expect(screen.getByRole("heading", { name: "마이페이지" })).toBeInTheDocument();
  });
});
