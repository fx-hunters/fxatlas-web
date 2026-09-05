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
});
