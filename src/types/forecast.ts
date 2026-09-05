export type ForecastCurrency = "USD" | "JPY" | "EUR";
export type ForecastPeriod = "30D" | "90D";

export interface FanChartDataPoint {
  readonly day: string;
  readonly price: number | null;
  readonly projected: number | null;
  readonly range80Upper: number | null;
  readonly range80Lower: number | null;
  readonly range50Upper: number | null;
  readonly range50Lower: number | null;
}

export interface ForecastRangeSummary {
  readonly upper: number;
  readonly lower: number;
  readonly impact: string;
  readonly percentile: string;
}

export interface ForecastDriverItem {
  readonly name: string;
  readonly type: "danger" | "muted" | "normal";
  readonly barWidthPx: number;
}

export interface ForecastEventItem {
  readonly title: string;
  readonly dateLabel: string;
  readonly severity: "고변동성" | "중변동성";
}

export interface ModelPerformanceScore {
  readonly hitRatePct: number;
  readonly maeKrw: number;
  readonly inclusion80Pct: number;
  readonly randomWalkImprovementPct: number;
}

export interface CurrencyForecastInfo {
  readonly summary: ForecastRangeSummary;
  readonly drivers: readonly ForecastDriverItem[];
  readonly events: readonly ForecastEventItem[];
  readonly modelScore: ModelPerformanceScore;
  readonly nextUpdateUtc: string;
}
