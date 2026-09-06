import type {
  CurrencyForecastInfo,
  FanChartDataPoint,
  ForecastCurrency,
  ForecastPeriod,
} from "../../types/forecast";

export const DEMO_FORECAST_METRICS: Record<
  ForecastCurrency,
  CurrencyForecastInfo
> = {
  USD: {
    summary: { upper: 1410, lower: 1350, impact: "-1.2M", percentile: "상위 12%" },
    drivers: [
      { name: "미국 고용 지표", type: "danger", barWidthPx: 64 },
      { name: "유가 변동", type: "muted", barWidthPx: 32 },
      { name: "국내 무역 수지", type: "normal", barWidthPx: 48 },
    ],
    events: [
      { title: "FOMC 금리 결정", dateLabel: "10.31 03:00", severity: "고변동성" },
      { title: "미국 CPI 발표", dateLabel: "11.14 21:30", severity: "중변동성" },
    ],
    modelScore: { hitRatePct: 82, maeKrw: 12.4, inclusion80Pct: 85, randomWalkImprovementPct: 14 },
    nextUpdateUtc: "15:00 UTC",
  },
  JPY: {
    summary: { upper: 935, lower: 880, impact: "-850K", percentile: "상위 5%" },
    drivers: [
      { name: "일본은행(BOJ) 금리", type: "danger", barWidthPx: 72 },
      { name: "엔 캐리 트레이드 청산", type: "danger", barWidthPx: 56 },
      { name: "한일 금리차", type: "normal", barWidthPx: 40 },
    ],
    events: [
      { title: "BOJ 금융정책결정회의", dateLabel: "10.25 12:00", severity: "고변동성" },
      { title: "일본 무역수지 발표", dateLabel: "11.08 08:50", severity: "중변동성" },
    ],
    modelScore: { hitRatePct: 79, maeKrw: 8.6, inclusion80Pct: 83, randomWalkImprovementPct: 12 },
    nextUpdateUtc: "15:00 UTC",
  },
  EUR: {
    summary: { upper: 1530, lower: 1460, impact: "-420K", percentile: "상위 28%" },
    drivers: [
      { name: "ECB 통화정책", type: "muted", barWidthPx: 44 },
      { name: "유로존 PMI 지수", type: "normal", barWidthPx: 52 },
      { name: "에너지 가격 변동", type: "danger", barWidthPx: 40 },
    ],
    events: [
      { title: "ECB 통화정책회의", dateLabel: "10.17 21:15", severity: "고변동성" },
      { title: "유로존 소비자물가지수", dateLabel: "10.31 19:00", severity: "중변동성" },
    ],
    modelScore: { hitRatePct: 81, maeKrw: 14.1, inclusion80Pct: 86, randomWalkImprovementPct: 15 },
    nextUpdateUtc: "15:00 UTC",
  },
};

const USD_30: readonly FanChartDataPoint[] = [
  { day: "D-2", price: 1378.2, projected: 1378.2, range80Upper: null, range80Lower: null, range50Upper: null, range50Lower: null },
  { day: "D-1", price: 1380.4, projected: 1380.4, range80Upper: null, range80Lower: null, range50Upper: null, range50Lower: null },
  { day: "T0", price: 1382.4, projected: 1382.4, range80Upper: null, range80Lower: null, range50Upper: null, range50Lower: null },
  { day: "D+10", price: null, projected: 1384, range80Upper: 1392, range80Lower: 1372, range50Upper: 1388, range50Lower: 1378 },
  { day: "D+20", price: null, projected: 1385, range80Upper: 1401, range80Lower: 1361, range50Upper: 1393, range50Lower: 1373 },
  { day: "D+30", price: null, projected: 1386, range80Upper: 1410, range80Lower: 1350, range50Upper: 1398, range50Lower: 1368 },
];

const USD_90: readonly FanChartDataPoint[] = [
  ...USD_30.slice(0, 3),
  { day: "D+30", price: null, projected: 1387, range80Upper: 1414, range80Lower: 1346, range50Upper: 1400, range50Lower: 1366 },
  { day: "D+60", price: null, projected: 1390, range80Upper: 1432, range80Lower: 1328, range50Upper: 1409, range50Lower: 1353 },
  { day: "D+90", price: null, projected: 1392, range80Upper: 1450, range80Lower: 1310, range50Upper: 1418, range50Lower: 1340 },
];

function currencyChart(
  current: number,
  lower: number,
  upper: number,
  period: ForecastPeriod,
): readonly FanChartDataPoint[] {
  const lastDay = period === "30D" ? "D+30" : "D+90";
  return [
    { day: "D-1", price: current, projected: current, range80Upper: null, range80Lower: null, range50Upper: null, range50Lower: null },
    { day: "T0", price: current, projected: current, range80Upper: null, range80Lower: null, range50Upper: null, range50Lower: null },
    { day: lastDay, price: null, projected: current, range80Upper: upper, range80Lower: lower, range50Upper: upper, range50Lower: lower },
  ];
}

export const DEMO_FORECAST_CHARTS: Record<
  ForecastCurrency,
  Record<ForecastPeriod, readonly FanChartDataPoint[]>
> = {
  USD: { "30D": USD_30, "90D": USD_90 },
  JPY: {
    "30D": currencyChart(905.1, 880, 935, "30D"),
    "90D": currencyChart(905.1, 860, 950, "90D"),
  },
  EUR: {
    "30D": currencyChart(1495.2, 1460, 1530, "30D"),
    "90D": currencyChart(1495.2, 1430, 1560, "90D"),
  },
};
