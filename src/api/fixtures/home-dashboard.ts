import type { HomeDashboardData } from "../../types/home";

export const DEMO_HOME_DATA: HomeDashboardData = {
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
    message: "내일 BOJ 금리 결정. 안전 버킷 하한을 점검하세요.",
    targetTab: "planner",
  },
  marketSummary: {
    pair: "USD/KRW",
    currentPrice: 1382.4,
    bandLower: 1378,
    bandUpper: 1390,
    sparkline: [
      { time: "09:00", price: 1378.2 },
      { time: "10:00", price: 1379.5 },
      { time: "11:00", price: 1381.1 },
      { time: "12:00", price: 1380.4 },
      { time: "13:00", price: 1382.0 },
      { time: "14:00", price: 1382.4 },
    ],
  },
  weeklyComparison: {
    fundedRatioDiffPct: 12.5,
    valuationDiffKrw: 312000,
    usdConcentrationDiffPctPoints: 2.1,
  },
};

/** 기록 완료 후 서버가 반환했다고 가정한 별도 목 응답 값. */
export const DEMO_HOME_RECORDED_DATA: HomeDashboardData = {
  ...DEMO_HOME_DATA,
  todayAction: {
    ...DEMO_HOME_DATA.todayAction,
    fundedRatio: 0.52,
    remainingRounds: 1,
  },
};
