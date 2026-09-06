import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { DonutChart } from "./donut-chart";

describe("DonutChart", () => {
  it("퍼센트와 svg 서클 및 텍스트를 올바르게 렌더링한다", () => {
    render(<DonutChart percent={36} label="외화 비중 36%" />);
    const img = screen.getByRole("img", { name: "외화 비중 36%" });
    expect(img).toBeInTheDocument();
    expect(screen.getByText("36")).toBeInTheDocument();
    expect(screen.getByText("%")).toBeInTheDocument();
  });

  it("0 미만과 100 초과 값을 안전하게 클램핑한다", () => {
    render(<DonutChart percent={150} />);
    expect(screen.getByText("100")).toBeInTheDocument();
  });

  it("isAnimationActive가 false일 때 애니메이션 없이 바로 표시된다", () => {
    const { container } = render(<DonutChart percent={45} isAnimationActive={false} />);
    const centerText = container.querySelector(".pointer-events-none");
    expect(centerText).toHaveStyle({ opacity: "1" });
  });

  it("isAnimationActive가 true일 때 파이 회전 완료 딜레이 애니메이션이 적용된다", () => {
    const { container } = render(<DonutChart percent={45} isAnimationActive={true} animationDuration={600} />);
    const centerText = container.querySelector(".pointer-events-none");
    expect(centerText).toHaveStyle({ opacity: "0" });
  });
});
