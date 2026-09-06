import { useCallback, useState } from "react";
import {
  DEMO_FORECAST_CHARTS,
  DEMO_FORECAST_METRICS,
} from "../../api/fixtures/forecast-screen";
import type { ForecastCurrency, ForecastPeriod } from "../../types/forecast";

export function generateFanChartPoints(
  currency: ForecastCurrency,
  period: ForecastPeriod,
) {
  return DEMO_FORECAST_CHARTS[currency][period];
}

export function useForecast() {
  const [currency, setCurrency] = useState<ForecastCurrency>("USD");
  const [period, setPeriod] = useState<ForecastPeriod>("30D");

  const handleSetCurrency = useCallback((value: ForecastCurrency) => {
    setCurrency(value);
  }, []);
  const handleSetPeriod = useCallback((value: ForecastPeriod) => {
    setPeriod(value);
  }, []);

  return {
    currency,
    period,
    chartData: generateFanChartPoints(currency, period),
    currencyInfo: DEMO_FORECAST_METRICS[currency],
    setCurrency: handleSetCurrency,
    setPeriod: handleSetPeriod,
  };
}

export { DEMO_FORECAST_METRICS as FORECAST_METRICS };
