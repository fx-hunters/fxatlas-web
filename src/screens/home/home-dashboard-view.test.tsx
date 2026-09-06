import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { HomeDashboardView } from "./home-dashboard-view";
import type { HomeDashboardData } from "../../types/home";

describe("HomeDashboardView", () => {
  const sampleData: HomeDashboardData = {
    todayAction: {
      amountUsd: 580,
      amountKrw: 798000,
      deadlineDday: 3,
      fundedRatio: 0.42,
      remainingRounds: 2,
    },
    fxHolding: {
      fxRatio: 0.36,
      fxKrw: 64000000,
      krwAmount: 36000000,
      dayOverDayDiffPctPoints: 0.2,
      sensitivity1pctKrw: 14200,
      breakdown: { usd: 75, jpy: 15, eur: 10 },
    },
    attentionAlert: {
      currency: "JPY",
      title: "JPY 임박 이벤트",
      message: "내일 BOJ 금리 결정.",
      targetTab: "planner",
    },
    marketSummary: {
      pair: "USD/KRW",
      currentPrice: 1382.4,
      bandLower: 1378,
      bandUpper: 1390,
      sparkline: [{ time: "09:00", price: 1378.2 }],
    },
    weeklyComparison: {
      fundedRatioDiffPct: 12.5,
      valuationDiffKrw: 312000,
      usdConcentrationDiffPctPoints: 2.1,
    },
  };

  it("대시보드 내 모든 하위 위젯 카드를 렌더링한다", () => {
    render(<HomeDashboardView data={sampleData} />);

    expect(screen.getByRole("heading", { name: "오늘의 행동 (이번 주 확보액)" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "내 외화 현황" })).toBeInTheDocument();
    expect(screen.getByText("주의 필요")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "오늘의 시장 (USD/KRW)" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "지난주 대비" })).toBeInTheDocument();
  });
});
