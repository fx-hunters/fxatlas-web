import type { ForecastBundle } from "../../api/generated/divurve-api";
import type { FanChartDataPoint } from "../../types/forecast";

export function toFanChartData(
  bundle: ForecastBundle,
): readonly FanChartDataPoint[] {
  const dates = [
    ...bundle.forecast.history.map((point) => point.d),
    ...bundle.forecast.path.map((point) => point.d),
    ...bundle.forecast.modelPath.map((point) => point.d),
  ].filter((date, index, allDates) => allDates.indexOf(date) === index);

  return dates.map((day) => {
    const history = bundle.forecast.history.find((point) => point.d === day);
    const path = bundle.forecast.path.find((point) => point.d === day);
    const model = bundle.forecast.modelPath.find((point) => point.d === day);
    return {
      day,
      price: history?.rate ?? null,
      projected: model?.rate ?? null,
      range80Upper: path?.p80Hi ?? null,
      range80Lower: path?.p80Lo ?? null,
      range50Upper: path?.p50Hi ?? null,
      range50Lower: path?.p50Lo ?? null,
    };
  });
}

export function ratioLabel(value: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(value);
}

export function directionVariant(
  direction: string,
): "danger" | "normal" | "default" {
  const normalized = direction.toLowerCase();
  if (normalized === "bullish") return "normal";
  if (normalized === "bearish") return "danger";
  return "default";
}
