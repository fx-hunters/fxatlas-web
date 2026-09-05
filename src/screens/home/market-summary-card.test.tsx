import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MarketSummaryCard } from "./market-summary-card";
import type { MarketSummaryData } from "../../types/home";

describe("MarketSummaryCard", () => {
  const sampleData: MarketSummaryData = {
    pair: "USD/KRW",
    currentPrice: 1382.4,
    bandLower: 1378,
    bandUpper: 1390,
    sparkline: [
      { time: "09:00", price: 1378.2 },
      { time: "14:00", price: 1382.4 },
    ],
  };

  it("통화쌍 제목, 현재가, 밴드 범위 및 차트를 렌더링한다", () => {
    render(<MarketSummaryCard data={sampleData} />);

    expect(screen.getByRole("heading", { name: "오늘의 시장 (USD/KRW)" })).toBeInTheDocument();
    expect(screen.getByText("1,382.40")).toBeInTheDocument();
    expect(screen.getByText("하단 1,378 - 상단 1,390")).toBeInTheDocument();
  });
});
