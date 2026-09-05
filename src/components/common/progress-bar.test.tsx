import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ProgressBar } from "./progress-bar";

describe("ProgressBar", () => {
  it("0~1 비율을 올바르게 퍼센트로 변환하고 progressbar 역할을 부여한다", () => {
    render(<ProgressBar ratio={0.42} label="진행률" />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "42");
    expect(screen.getByText("진행률")).toBeInTheDocument();
    expect(screen.getByText("42%")).toBeInTheDocument();
  });

  it("0~100 사이의 값을 처리하고 경계값을 클램핑한다", () => {
    render(<ProgressBar ratio={120} height="12px" color="var(--usd)" />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "100");
  });
});
