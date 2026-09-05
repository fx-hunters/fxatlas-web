import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { XRayScreen } from "./xray-screen";

describe("XRayScreen", () => {
  it("내 자산 플레이스홀더를 렌더링한다", () => {
    render(<XRayScreen />);
    expect(screen.getByRole("heading", { name: "내 자산 (X-Ray)" })).toBeInTheDocument();
  });
});
