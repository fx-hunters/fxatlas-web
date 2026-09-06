import { useCallback, useEffect, useState } from "react";
import { ApiError } from "../../api/client";
import { fetchForecastBundle } from "../../api/forecast";
import type { ForecastBundle } from "../../api/generated/divurve-api";
import type { ForecastCurrency, ForecastPeriod } from "../../types/forecast";

export type ForecastApiLoader = (
  pairCode: string,
  horizon: number,
) => Promise<ForecastBundle>;

export type ForecastApiState =
  | { readonly status: "loading" }
  | { readonly status: "error"; readonly message: string }
  | { readonly status: "empty" }
  | { readonly status: "success"; readonly data: ForecastBundle };

function isEmptyForecast(bundle: ForecastBundle): boolean {
  return (
    bundle.forecast.history.length === 0 &&
    bundle.forecast.path.length === 0 &&
    bundle.forecast.modelPath.length === 0
  );
}

export function useForecastApi(
  loader: ForecastApiLoader = fetchForecastBundle,
) {
  const [currency, setCurrency] = useState<ForecastCurrency>("USD");
  const [period, setPeriod] = useState<ForecastPeriod>("30D");
  const [state, setState] = useState<ForecastApiState>({ status: "loading" });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isActive = true;
    setState({ status: "loading" });
    const horizon = period === "30D" ? 30 : 90;

    void loader(`${currency}_KRW`, horizon)
      .then((data) => {
        if (!isActive) return;
        setState(
          isEmptyForecast(data)
            ? { status: "empty" }
            : { status: "success", data },
        );
      })
      .catch((error: unknown) => {
        if (!isActive) return;
        setState({
          status: "error",
          message:
            error instanceof ApiError
              ? error.message
              : "환율 범위 정보를 불러오지 못했습니다. 잠시 후 다시 확인해 주세요.",
        });
      });

    return () => {
      isActive = false;
    };
  }, [currency, loader, period, reloadKey]);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);
  return { currency, period, state, setCurrency, setPeriod, reload };
}
