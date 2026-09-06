import { useState, useMemo, useCallback } from "react";
import type {
  ForecastCurrency,
  ForecastPeriod,
  FanChartDataPoint,
  CurrencyForecastInfo,
} from "../../types/forecast";

export const FORECAST_METRICS: Record<ForecastCurrency, CurrencyForecastInfo> = {
  USD: {
    summary: {
      upper: 1410,
      lower: 1350,
      impact: "-1.2M",
      percentile: "상위 12%",
    },
    drivers: [
      { name: "미국 고용 지표", type: "danger", barWidthPx: 64 },
      { name: "유가 변동", type: "muted", barWidthPx: 32 },
      { name: "국내 무역 수지", type: "normal", barWidthPx: 48 },
    ],
    events: [
      { title: "FOMC 금리 결정", dateLabel: "10.31 03:00", severity: "고변동성" },
      { title: "미국 CPI 발표", dateLabel: "11.14 21:30", severity: "중변동성" },
    ],
    modelScore: {
      hitRatePct: 82,
      maeKrw: 12.4,
      inclusion80Pct: 85,
      randomWalkImprovementPct: 14,
    },
    nextUpdateUtc: "15:00 UTC",
  },
  JPY: {
    summary: {
      upper: 935,
      lower: 880,
      impact: "-850K",
      percentile: "상위 5%",
    },
    drivers: [
      { name: "일본은행(BOJ) 금리", type: "danger", barWidthPx: 72 },
      { name: "엔 캐리 트레이드 청산", type: "danger", barWidthPx: 56 },
      { name: "한일 금리차", type: "normal", barWidthPx: 40 },
    ],
    events: [
      { title: "BOJ 금융정책결정회의", dateLabel: "10.25 12:00", severity: "고변동성" },
      { title: "일본 무역수지 발표", dateLabel: "11.08 08:50", severity: "중변동성" },
    ],
    modelScore: {
      hitRatePct: 79,
      maeKrw: 8.6,
      inclusion80Pct: 83,
      randomWalkImprovementPct: 12,
    },
    nextUpdateUtc: "15:00 UTC",
  },
  EUR: {
    summary: {
      upper: 1530,
      lower: 1460,
      impact: "-420K",
      percentile: "상위 28%",
    },
    drivers: [
      { name: "ECB 통화정책", type: "muted", barWidthPx: 44 },
      { name: "유로존 PMI 지수", type: "normal", barWidthPx: 52 },
      { name: "에너지 가격 변동", type: "danger", barWidthPx: 40 },
    ],
    events: [
      { title: "ECB 통화정책회의", dateLabel: "10.17 21:15", severity: "고변동성" },
      { title: "유로존 소비자물가지수", dateLabel: "10.31 19:00", severity: "중변동성" },
    ],
    modelScore: {
      hitRatePct: 81,
      maeKrw: 14.1,
      inclusion80Pct: 86,
      randomWalkImprovementPct: 15,
    },
    nextUpdateUtc: "15:00 UTC",
  },
};

export function generateFanChartPoints(
  currency: ForecastCurrency,
  period: ForecastPeriod,
): readonly FanChartDataPoint[] {
  const pointsCount = period === "30D" ? 30 : 90;
  const mid = Math.floor(pointsCount / 2);
  const basePrice = currency === "USD" ? 1382.4 : currency === "JPY" ? 905.1 : 1495.2;
  const slope = currency === "USD" ? 1.5 : currency === "JPY" ? 1.8 : 2;
  const factor = period === "90D" ? 0.7 : 1.5;

  return Array.from({ length: pointsCount }, (_, n) => {
    const isHistorical = n <= mid;
    const offset = n - mid;
    const delta = isHistorical ? 0 : offset * slope * factor;
    const center = basePrice + Math.sin(mid * 0.5) * 5;

    const day = offset === 0 ? "T0" : `D${offset > 0 ? "+" : ""}${offset}`;
    const price = isHistorical ? Number((basePrice + Math.sin(n * 0.5) * 5).toFixed(2)) : null;
    const projected = isHistorical
      ? Number(center.toFixed(2))
      : Number((basePrice + Math.sin(n * 0.2) * 2).toFixed(2));

    const range80Upper = isHistorical ? null : Number((basePrice + delta * 2.5).toFixed(2));
    const range80Lower = isHistorical ? null : Number((basePrice - Math.abs(delta * 2)).toFixed(2));
    const range50Upper = isHistorical ? null : Number((basePrice + delta * 1.2).toFixed(2));
    const range50Lower = isHistorical ? null : Number((basePrice - Math.abs(delta * 1)).toFixed(2));

    return {
      day,
      price,
      projected,
      range80Upper,
      range80Lower,
      range50Upper,
      range50Lower,
    };
  });
}

export function useForecast(isDemo: boolean = true) {
  const [currency, setCurrencyState] = useState<ForecastCurrency>("USD");
  const [period, setPeriodState] = useState<ForecastPeriod>("30D");

  const chartData = useMemo(() => {
    return generateFanChartPoints(currency, period);
  }, [currency, period]);

  const currencyInfo = useMemo(() => {
    return FORECAST_METRICS[currency];
  }, [currency]);

  const handleSetCurrency = useCallback((c: ForecastCurrency) => {
    setCurrencyState(c);
  }, []);

  const handleSetPeriod = useCallback((p: ForecastPeriod) => {
    setPeriodState(p);
  }, []);

  return {
    isDemo,
    currency,
    period,
    chartData,
    currencyInfo,
    setCurrency: handleSetCurrency,
    setPeriod: handleSetPeriod,
  };
}
