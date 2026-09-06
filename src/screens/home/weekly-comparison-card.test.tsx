import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { WeeklyComparisonCard } from "./weekly-comparison-card";
import type { WeeklyComparisonData } from "../../types/home";

describe("WeeklyComparisonCard", () => {
  const sampleData: WeeklyComparisonData = {
    fundedRatioDiffPct: 12.5,
    valuationDiffKrw: 312000,
    usdConcentrationDiffPctPoints: 2.1,
  };

  it("확보율, 평가액, USD 집중도 변동 지표를 올바르게 렌더링한다", () => {
    render(<WeeklyComparisonCard data={sampleData} />);

    expect(screen.getByRole("heading", { name: "지난주 대비" })).toBeInTheDocument();
    expect(screen.getByText("+12.5%")).toBeInTheDocument();
    expect(screen.getByText("+₩312,000")).toBeInTheDocument();
    expect(screen.getByText("+2.1%p")).toBeInTheDocument();
  });

  it("감소한 지표와 낮아진 USD 집중도를 부호와 함께 표시한다", () => {
    render(
      <WeeklyComparisonCard
        data={{
          fundedRatioDiffPct: -1.5,
          valuationDiffKrw: -120000,
          usdConcentrationDiffPctPoints: -0.8,
        }}
      />,
    );

    expect(screen.getByText("-1.5%")).toBeInTheDocument();
    expect(screen.getByText("-₩120,000")).toBeInTheDocument();
    expect(screen.getByText("-0.8%p")).toBeInTheDocument();
  });
});
