import type { ApiResult } from "../api/client";
import type {
  ForecastBundle,
  HomeSummaryResponse,
  MyPageBundle,
  SettingsResponse,
  XrayBundle,
} from "../api/generated/divurve-api";
import type { PlannerApiOverview } from "../api/planner";

export const FORECAST_API_FIXTURE: ForecastBundle = {
  forecast: {
    pairCode: "USD_KRW",
    horizonDays: 30,
    currentRate: 1_400,
    baseRate: 1_395,
    history: [
      { d: "2026-09-01", rate: 1_390 },
      { d: "2026-09-02", rate: 1_400 },
    ],
    path: [
      {
        d: "2026-09-02",
        p50Lo: 1_380,
        p50Hi: 1_420,
        p80Lo: 1_360,
        p80Hi: 1_440,
      },
      {
        d: "2026-09-30",
        p50Lo: 1_370,
        p50Hi: 1_430,
        p80Lo: 1_350,
        p80Hi: 1_450,
      },
    ],
    modelPath: [
      { d: "2026-09-02", rate: 1_401 },
      { d: "2026-09-30", rate: 1_410 },
    ],
    interval80: { lo: 1_350, hi: 1_450, widthPct: 7.1, vs3yAvg: 0.2 },
    volatility: { realized30d: 0.08, percentile5y: 63, regime: "normal" },
    userImpact: { per1pctKrw: 12_000, assetKrw: 1_200_000 },
    disclaimer: "서버 제공 범위이며 결과를 보장하지 않습니다.",
  },
  factors: {
    pairCode: "USD_KRW",
    factors: [
      { key: "rate", label: "금리 차", contributionPp: 0.4, direction: "bullish" },
      { key: "risk", label: "위험 선호", contributionPp: -0.2, direction: "BEARISH" },
      { key: "flow", label: "수급", contributionPp: 0, direction: "neutral" },
    ],
  },
  performance: {
    pairCode: "USD_KRW",
    horizonDays: 30,
    model: { hitRate: 0.61, mae: 12, coverage80: 0.82, avgWidth: 80 },
    randomWalk: { hitRate: 0.5, mae: 14 },
    validation: { method: "walk-forward", folds: 5, leakageGuard: true },
    note: "과거 검증 결과입니다.",
  },
  events: {
    events: [
      {
        date: "2026-09-12",
        title: "미국 물가 발표",
        currencyCode: "USD",
        importance: "high",
      },
      {
        date: "2026-09-15",
        title: "일본 정책 회의",
        currencyCode: "JPY",
        importance: "medium",
      },
    ],
  },
};

export const EMPTY_FORECAST_API_FIXTURE: ForecastBundle = {
  ...FORECAST_API_FIXTURE,
  forecast: {
    ...FORECAST_API_FIXTURE.forecast,
    history: [],
    path: [],
    modelPath: [],
  },
};

export const XRAY_API_FIXTURE: XrayBundle = {
  overview: {
    totalAssetKrw: 20_000_000,
    fxAssetKrw: 8_000_000,
    fxRatio: 0.4,
    exposure: [
      { currencyCode: "USD", krw: 6_000_000, share: 0.3 },
      { currencyCode: "JPY", krw: 2_000_000, share: 0.1 },
    ],
    concentration: {
      before: { USD: 0.3 },
      after: { USD: 0.25 },
      threshold: 0.5,
      verdict: "within",
    },
    sensitivity1pct: { totalKrw: 80_000, byCurrency: { USD: 60_000 } },
    dayChangeKrw: 30_000,
    upcomingOutflows: [],
  },
  attribution: {
    currencyCode: "USD",
    mode: "total",
    costBasisKrw: 5_500_000,
    currentKrw: 6_000_000,
    totalReturn: 0.09,
    components: [
      { key: "local", krw: 320_000, contributionPp: 5.8 },
      { key: "fx", krw: 180_000, contributionPp: 3.2 },
    ],
    byHolding: [],
  },
  concentration: {
    exposure: { USD: 0.3, JPY: 0.1 },
    topCurrency: "USD",
    topShare: 0.3,
    threshold: 0.5,
    status: "within",
    suggestions: ["현재 분산 수준을 점검하세요."],
  },
};

export const MY_PAGE_SETTINGS_FIXTURE: SettingsResponse = {
  defaultBankCode: "001",
  fxDiscountRatio: 0.8,
  explainLevel: "simple",
  explainDomain: "plain",
  baseSpreadRatio: 0.01,
  effectiveSpreadRatio: 0.002,
  notifyStepDue: true,
  notifyRegimeShift: true,
  notifyDeadlineNear: true,
  notifyTargetZone: false,
  notifyConcentration: true,
};

export const MY_PAGE_API_FIXTURE: MyPageBundle = {
  profile: {
    userId: "user-1",
    email: "planner@example.com",
    name: "플래너 사용자",
    isDemo: false,
    onboarded: true,
    onboardedAt: "2026-09-01T00:00:00Z",
  },
  settings: MY_PAGE_SETTINGS_FIXTURE,
  riskProfile: {
    status: "measured",
    grade: "balanced",
    gradeLabel: "균형 항로형",
    score: 72,
    diagnosedOn: "2026-08-15",
    concentrationThreshold: 0.5,
    limitationNote:
      "이 판정은 해커톤 MVP용 가설이며 통계적으로 검증된 금융회사 표준 진단이 아닙니다.",
  },
  notifications: {
    notifications: [
      {
        id: "notice-1",
        type: "plan",
        title: "회차 확인",
        message: "다음 준비 일정을 확인하세요.",
        createdAt: "2026-09-07T00:00:00Z",
        read: false,
      },
    ],
  },
};

export const PLANNER_API_FIXTURE: PlannerApiOverview = {
  items: [
    {
      goal: {
        id: "goal-usd",
        name: "미국 ETF 준비",
        kind: "recurring",
        purpose: "investment",
        currencyCode: "USD",
        targetAmount: 3_000,
        targetDate: "2026-12-31",
        isSpeculative: false,
        status: "active",
        heldAmount: 1_260,
      },
      activePlan: {
        id: "plan-usd",
        goalId: "goal-usd",
        version: 2,
        isActive: true,
        reason: "서버가 반환한 계획 설명입니다.",
        safeRatio: 0.6,
        splitCount: 3,
        opportunityAmount: 200,
        opportunityTriggerRate: 1_350,
        steps: [
          {
            seq: 1,
            scheduledDate: "2026-09-01",
            amount: 145,
            krwEstimate: 203_000,
            executedAmount: 145,
            status: "completed",
          },
          {
            seq: 2,
            scheduledDate: "2026-09-12",
            amount: 145,
            krwEstimate: 203_000,
            status: "pending",
          },
        ],
      },
    },
    {
      goal: {
        id: "goal-jpy",
        name: "일본 여행 준비",
        kind: "deadline",
        purpose: "travel",
        currencyCode: "JPY",
        targetAmount: 180_000,
        isSpeculative: false,
        status: "active",
        heldAmount: 40_000,
      },
      activePlan: null,
    },
  ],
};

export const HOME_SUMMARY_FIXTURE: ApiResult<HomeSummaryResponse> = {
  data: {
    blocks: [
      { order: 1, key: "today", state: "filled" },
      { order: 2, key: "profile_fit", state: "filled" },
      { order: 3, key: "fx_status", state: "filled" },
      { order: 4, key: "goals_route", state: "filled" },
      { order: 5, key: "attention", state: "filled" },
      { order: 6, key: "forecast", state: "filled" },
    ],
    today: { headlineCode: "vol_elevated_usd", badge: "caution" },
    profileFit: { grade: "balanced", concentrationStatus: "above_threshold" },
    fxStatus: {
      fxRatio: 0.361,
      topCurrencyCode: "USD",
      dayChangeKrw: 84_000,
      sensitivity1pctKrw: 247_200,
    },
    goalsRoute: {
      activeGoals: [
        {
          id: "goal-1",
          name: "도쿄 여행",
          currencyCode: "JPY",
          targetAmount: 300_000,
          targetDate: "2026-12-20",
          status: "active",
        },
      ],
      routeEnabled: true,
    },
    attention: {
      regimeBadge: "caution",
      upcomingEvents: [
        {
          date: "2026-09-09",
          title: "Federal Funds Rate Decision",
          currencyCode: "USD",
          importance: "High",
        },
        {
          date: "2026-09-18",
          title: "Retail Sales",
          currencyCode: "USD",
          importance: "Medium",
        },
      ],
    },
    forecast: {
      pairCode: "USDKRW",
      currentRate: 1_382.4,
      interval80: { lo: 1_330.6, hi: 1_389.02 },
    },
  },
  meta: { asOf: "2026-09-06T22:32:09.924Z" },
};

/** 위험성향 미측정 + 자산·목표 없음. 서버는 값 없는 필드를 키째 생략한다. */
export const SPARSE_HOME_SUMMARY_FIXTURE: ApiResult<HomeSummaryResponse> = {
  data: {
    blocks: [
      { order: 1, key: "today", state: "filled" },
      { order: 2, key: "profile_fit", state: "not_measured" },
      { order: 3, key: "fx_status", state: "filled" },
      { order: 4, key: "goals_route", state: "route_pending" },
      { order: 5, key: "attention", state: "filled" },
      { order: 6, key: "forecast", state: "filled" },
    ],
    today: { headlineCode: "vol_normal_usd", badge: "normal" },
    profileFit: { concentrationStatus: "unknown" },
    fxStatus: {
      fxRatio: 1.0,
      topCurrencyCode: "USD",
      sensitivity1pctKrw: 93_806,
    },
    goalsRoute: { activeGoals: [], routeEnabled: false },
    attention: { regimeBadge: "normal", upcomingEvents: [] },
    forecast: {
      pairCode: "USDKRW",
      currentRate: 1_359.5,
      interval80: { lo: 1_330.6, hi: 1_389.02 },
    },
  },
  meta: { asOf: "2026-09-06T22:32:09.924Z" },
};

/** 모든 블록이 비어 있는 계정. 홈은 빈 화면으로 떨어진다. */
export const EMPTY_HOME_SUMMARY_FIXTURE: ApiResult<HomeSummaryResponse> = {
  data: {
    blocks: [
      { order: 1, key: "today", state: "empty" },
      { order: 2, key: "profile_fit", state: "empty" },
      { order: 3, key: "fx_status", state: "empty" },
      { order: 4, key: "goals_route", state: "empty" },
      { order: 5, key: "attention", state: "empty" },
      { order: 6, key: "forecast", state: "empty" },
    ],
    today: {},
    profileFit: {},
    fxStatus: {},
    goalsRoute: { activeGoals: [], routeEnabled: false },
    attention: { upcomingEvents: [] },
    forecast: {},
  },
  meta: { asOf: "2026-09-06T22:32:09.924Z" },
};
