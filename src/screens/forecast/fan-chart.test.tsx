import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { FanChart, formatYTick, formatTooltipValue } from "./fan-chart";
import { generateFanChartPoints } from "./use-forecast";

describe("FanChart", () => {
  it("데이터가 있을 때 팬 차트 컨테이너를 렌더링한다", () => {
    const data = generateFanChartPoints("USD", "30D");

    render(<FanChart data={data} currency="USD" />);

    const chartEl = screen.getByRole("img", { name: "시뮬레이션 팬 차트 (USD/KRW)" });
    expect(chartEl).toBeInTheDocument();
    expect(chartEl.querySelector(".recharts-responsive-container")).toBeInTheDocument();
  });

  it("formatYTick과 formatTooltipValue가 포맷팅을 올바르게 수행한다", () => {
    expect(formatYTick(1350, 0)).toBe("");
    expect(formatYTick(1350, 1)).toBe("1,350");
    expect(formatTooltipValue(1400)).toEqual(["₩1,400"]);
    expect(formatTooltipValue("N/A")).toEqual(["N/A"]);
  });

  it("데이터가 비어 있을 때 안내 텍스트를 표시한다", () => {
    render(<FanChart data={[]} currency="USD" />);
    expect(screen.getByText("데이터가 없습니다.")).toBeInTheDocument();
  });
});

