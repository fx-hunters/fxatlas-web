import type { NavTabId } from "./navigation";

export interface TodayActionData {
  readonly amountUsd: number;
  readonly amountKrw: number;
  readonly deadlineDday: number;
  readonly fundedRatio: number;
  readonly remainingRounds: number;
}

export interface FxHoldingData {
  readonly fxRatio: number;
  readonly fxKrw: number;
  readonly krwAmount: number;
  readonly dayOverDayDiffPctPoints: number;
  readonly sensitivity1PctKrw: number;
  readonly breakdown: {
    readonly usd: number;
    readonly jpy: number;
    readonly eur: number;
  };
}

export interface AttentionAlertData {
  readonly currency: "USD" | "JPY" | "EUR";
  readonly title: string;
  readonly message: string;
  readonly targetTab: NavTabId;
}

export interface MarketPricePoint {
  readonly time: string;
  readonly price: number;
}

export interface MarketSummaryData {
  readonly pair: string;
  readonly currentPrice: number;
  readonly bandLower: number;
  readonly bandUpper: number;
  readonly sparkline: readonly MarketPricePoint[];
}

export interface WeeklyComparisonData {
  readonly fundedRatioDiffPct: number;
  readonly valuationDiffKrw: number;
  readonly usdConcentrationDiffPctPoints: number;
}

export interface HomeDashboardData {
  readonly todayAction: TodayActionData;
  readonly fxHolding: FxHoldingData;
  readonly attentionAlert?: AttentionAlertData;
  readonly marketSummary: MarketSummaryData;
  readonly weeklyComparison: WeeklyComparisonData;
}
