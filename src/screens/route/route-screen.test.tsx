import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { RouteScreen } from "./route-screen";

describe("RouteScreen", () => {
  it("환전 플래너 플레이스홀더를 렌더링한다", () => {
    render(<RouteScreen />);
    expect(screen.getByRole("heading", { name: "환전 플래너" })).toBeInTheDocument();
  });
});
