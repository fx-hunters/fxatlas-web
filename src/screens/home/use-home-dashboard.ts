import { useCallback, useEffect, useState } from "react";
import { ApiError, type ApiResult } from "../../api/client";
import {
  DEMO_HOME_DATA,
  DEMO_HOME_RECORDED_DATA,
} from "../../api/fixtures/home-dashboard";
import type { HomeSummaryResponse } from "../../api/generated/divurve-api";
import { fetchHomeSummary } from "../../api/home";
import type { HomeDashboardData } from "../../types/home";

export type HomeSummaryLoader = () => Promise<ApiResult<HomeSummaryResponse>>;

export type HomeDashboardState =
  | { readonly status: "loading" }
  | { readonly status: "error"; readonly message: string }
  | { readonly status: "empty" }
  | {
      readonly status: "ready";
      readonly source: "mock";
      readonly data: HomeDashboardData;
    }
  | {
      readonly status: "ready";
      readonly source: "api";
      readonly result: ApiResult<HomeSummaryResponse>;
    };

export function hasHomeContent(data: HomeSummaryResponse): boolean {
  return Boolean(
    data.todayAction?.heroAmount ||
      data.currencyStatus?.totalAssets ||
      data.notice?.message ||
      data.weeklyChange?.summary ||
      data.marketSummary?.summary,
  );
}

function toHomeErrorMessage(error: unknown): string {
  return error instanceof ApiError
    ? error.message
    : "홈 정보를 불러오지 못했습니다. 잠시 후 다시 확인해 주세요.";
}

export function useHomeDashboard(
  isDemo: boolean = true,
  loader: HomeSummaryLoader = fetchHomeSummary,
) {
  const [demoData, setDemoData] = useState<HomeDashboardData>(DEMO_HOME_DATA);
  const [apiState, setApiState] = useState<HomeDashboardState>({
    status: "loading",
  });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (isDemo) return;
    let isActive = true;
    setApiState({ status: "loading" });

    void loader()
      .then((result) => {
        if (!isActive) return;
        setApiState(
          hasHomeContent(result.data)
            ? { status: "ready", source: "api", result }
            : { status: "empty" },
        );
      })
      .catch((error: unknown) => {
        if (isActive) {
          setApiState({ status: "error", message: toHomeErrorMessage(error) });
        }
      });

    return () => {
      isActive = false;
    };
  }, [isDemo, loader, reloadKey]);

  const recordRoundComplete = useCallback(() => {
    setDemoData(DEMO_HOME_RECORDED_DATA);
  }, []);
  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  return {
    state: isDemo
      ? ({ status: "ready", source: "mock", data: demoData } as const)
      : apiState,
    recordRoundComplete,
    reload,
  };
}

export { DEMO_HOME_DATA } from "../../api/fixtures/home-dashboard";
