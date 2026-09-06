/**
 * Swagger `/v3/api-docs`에서 확인한 API 계약 중 프론트에서 사용하는 타입.
 * 응답 키 변환은 `api/client.ts`에서 수행되므로 camelCase만 사용한다.
 */

export interface TokenResponse {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly expiresIn: number;
  readonly isDemo: boolean;
  readonly onboarded: boolean;
}

export interface LoginRequest {
  readonly email: string;
  readonly password: string;
}

export interface SignupRequest {
  readonly email: string;
  readonly password: string;
  readonly name: string;
  readonly onboardingPurpose?: string;
}

export interface RefreshRequest {
  readonly refreshToken: string;
}

export type HomeBlockKey =
  | "today"
  | "profile_fit"
  | "fx_status"
  | "goals_route"
  | "attention"
  | "forecast";

/** 데이터가 없는 블록도 생략되지 않고 이 상태로만 구분된다. */
export type HomeBlockState =
  | "filled"
  | "empty"
  | "route_pending"
  | "not_measured";

export interface HomeBlock {
  readonly order: number;
  readonly key: HomeBlockKey;
  readonly state: HomeBlockState;
}

export interface HomeActiveGoal {
  readonly id: string;
  readonly name: string;
  readonly currencyCode: string;
  readonly targetAmount: number;
  readonly targetDate: string;
  readonly status: string;
}

export interface HomeUpcomingEvent {
  readonly date: string;
  readonly title: string;
  readonly currencyCode: string;
  readonly importance: string;
}

/** 서버는 값이 없는 필드를 키째 생략하므로 하위 필드는 대부분 optional이다. */
export interface HomeSummaryResponse {
  readonly blocks: readonly HomeBlock[];
  readonly today: {
    readonly headlineCode?: string;
    readonly badge?: string;
  };
  readonly profileFit: {
    readonly grade?: string;
    readonly concentrationStatus?: string;
  };
  readonly fxStatus: {
    readonly fxRatio?: number;
    readonly topCurrencyCode?: string;
    readonly dayChangeKrw?: number;
    readonly sensitivity1pctKrw?: number;
  };
  readonly goalsRoute: {
    readonly activeGoals: readonly HomeActiveGoal[];
    readonly routeEnabled: boolean;
  };
  readonly attention: {
    readonly regimeBadge?: string;
    readonly upcomingEvents: readonly HomeUpcomingEvent[];
  };
  readonly forecast: {
    readonly pairCode?: string;
    readonly currentRate?: number;
    readonly interval80?: {
      readonly lo?: number;
      readonly hi?: number;
    };
  };
}

export interface ForecastHistory {
  readonly d: string;
  readonly rate: number;
}

export interface ForecastPathPoint {
  readonly d: string;
  readonly p50Lo: number;
  readonly p50Hi: number;
  readonly p80Lo: number;
  readonly p80Hi: number;
}

export interface ForecastModelPoint {
  readonly d: string;
  readonly rate: number;
}

export interface ForecastResponse {
  readonly pairCode: string;
  readonly horizonDays: number;
  readonly currentRate: number;
  readonly baseRate: number;
  readonly history: readonly ForecastHistory[];
  readonly path: readonly ForecastPathPoint[];
  readonly modelPath: readonly ForecastModelPoint[];
  readonly interval80: {
    readonly lo: number;
    readonly hi: number;
    readonly widthPct: number;
    readonly vs3yAvg: number;
  };
  readonly volatility: {
    readonly realized30d: number;
    readonly percentile5y: number;
    readonly regime: string;
  };
  readonly userImpact: {
    readonly per1pctKrw: number;
    readonly assetKrw: number;
  };
  readonly disclaimer: string;
}

export interface ForecastFactor {
  readonly key: string;
  readonly label: string;
  readonly contributionPp: number;
  readonly direction: string;
}

export interface FactorsResponse {
  readonly pairCode: string;
  readonly factors: readonly ForecastFactor[];
}

export interface ModelPerformanceResponse {
  readonly pairCode: string;
  readonly horizonDays: number;
  readonly model: {
    readonly hitRate: number;
    readonly mae: number;
    readonly coverage80: number;
    readonly avgWidth: number;
  };
  readonly randomWalk: {
    readonly hitRate: number;
    readonly mae: number;
  };
  readonly validation: {
    readonly method: string;
    readonly folds: number;
    readonly leakageGuard: boolean;
  };
  readonly note: string;
}

export interface ForecastEvent {
  readonly date: string;
  readonly title: string;
  readonly currencyCode: string;
  readonly importance: string;
}

export interface EventsResponse {
  readonly events: readonly ForecastEvent[];
}

export interface ForecastBundle {
  readonly forecast: ForecastResponse;
  readonly factors: FactorsResponse;
  readonly performance: ModelPerformanceResponse;
  readonly events: EventsResponse;
}

export interface XrayExposure {
  readonly currencyCode: string;
  readonly krw: number;
  readonly share: number;
}

export interface XrayResponse {
  readonly totalAssetKrw: number;
  readonly fxAssetKrw: number;
  readonly fxRatio: number;
  readonly exposure: readonly XrayExposure[];
  readonly concentration: {
    readonly before: Readonly<Record<string, number>>;
    readonly after: Readonly<Record<string, number>>;
    readonly threshold: number;
    readonly verdict: string;
  };
  readonly sensitivity1pct: {
    readonly totalKrw: number;
    readonly byCurrency: Readonly<Record<string, number>>;
  };
  readonly dayChangeKrw: number;
  readonly upcomingOutflows: readonly {
    readonly goalId: string;
    readonly date: string;
    readonly currencyCode: string;
    readonly amount: number;
    readonly hasPlan: boolean;
  }[];
}

export interface AttributionResponse {
  readonly currencyCode: string;
  readonly mode: string;
  readonly costBasisKrw: number;
  readonly currentKrw: number;
  readonly totalReturn: number;
  readonly components: readonly {
    readonly key: string;
    readonly krw: number;
    readonly contributionPp: number;
  }[];
  readonly byHolding: readonly {
    readonly ticker: string;
    readonly krw: number;
    readonly localReturn: number;
    readonly fxContributionPp: number;
    readonly krwReturn: number;
  }[];
}

export interface ConcentrationResponse {
  readonly exposure: Readonly<Record<string, number>>;
  readonly topCurrency: string;
  readonly topShare: number;
  readonly threshold: number;
  readonly status: string;
  readonly suggestions: readonly string[];
}

export interface StressRequest {
  readonly shocks: Readonly<Record<string, number>>;
}

export interface StressResponse {
  readonly totalAssetBeforeKrw: number;
  readonly totalAssetAfterKrw: number;
  readonly impactKrw: number;
  readonly impactRatio: number;
  readonly byCurrency: readonly {
    readonly currencyCode: string;
    readonly shock: number;
    readonly impactKrw: number;
  }[];
}

export interface SimulateRequest {
  readonly currencyCode: string;
  readonly deltaShare: number;
}

export interface SimulateResponse {
  readonly portfolioVol: {
    readonly before: number;
    readonly after: number;
  };
  readonly exposureAfter: Readonly<Record<string, number>>;
  readonly threshold: number;
  readonly withinThreshold: boolean;
  readonly suggestedGoal?: {
    readonly kind: string;
    readonly purpose: string;
    readonly currencyCode: string;
    readonly targetAmount: number;
  };
}

export interface XrayBundle {
  readonly overview: XrayResponse;
  readonly attribution: AttributionResponse;
  readonly concentration: ConcentrationResponse;
}

export interface ProfileResponse {
  readonly userId: string;
  readonly email: string;
  readonly name: string;
  readonly isDemo: boolean;
  readonly onboarded: boolean;
  readonly onboardedAt?: string;
}

/** 알림 설정 항목. `SettingsResponse`와 `SettingsUpdateRequest`가 공유한다. */
export type NotificationSettingKey =
  | "notifyStepDue"
  | "notifyRegimeShift"
  | "notifyDeadlineNear"
  | "notifyTargetZone"
  | "notifyConcentration";

export interface SettingsResponse {
  readonly defaultBankCode?: string;
  readonly fxDiscountRatio: number;
  readonly explainLevel: string;
  readonly explainDomain: string;
  readonly baseSpreadRatio: number;
  readonly effectiveSpreadRatio: number;
  readonly notifyStepDue: boolean;
  readonly notifyRegimeShift: boolean;
  readonly notifyDeadlineNear: boolean;
  readonly notifyTargetZone: boolean;
  readonly notifyConcentration: boolean;
}

export interface RiskProfileSimple {
  readonly answers: Readonly<Record<string, unknown>>;
  readonly rationale?: readonly unknown[];
  readonly mixedResponseNote?: string;
}

export interface RiskProfileDetail {
  readonly completed: boolean;
  readonly answered: Readonly<Record<string, unknown>>;
  readonly nextQuestion?: string;
  readonly titleModifier?: string;
}

export interface RiskProfileResponse {
  /** 예: "not_measured". 진단 전에도 200으로 내려온다. */
  readonly status: string;
  readonly grade?: string;
  readonly gradeLabel?: string;
  readonly score?: number;
  readonly diagnosedOn?: string;
  readonly concentrationThreshold?: number;
  readonly simple?: RiskProfileSimple;
  readonly detail?: RiskProfileDetail;
  readonly limitationNote?: string;
}

export interface NotificationDto {
  readonly id: string;
  readonly type: string;
  readonly title: string;
  readonly message: string;
  readonly createdAt: string;
  readonly read: boolean;
}

export interface NotificationsResponse {
  readonly notifications: readonly NotificationDto[];
}

export interface MyPageBundle {
  readonly profile: ProfileResponse;
  readonly settings: SettingsResponse;
  /** 진단 전에도 `status: "not_measured"`로 내려온다. 404일 때만 null. */
  readonly riskProfile: RiskProfileResponse | null;
  readonly notifications: NotificationsResponse;
}

export interface SettingsUpdateRequest {
  readonly defaultBankCode?: string;
  readonly fxDiscountRatio?: number;
  readonly explainLevel?: string;
  readonly explainDomain?: string;
  readonly notifyStepDue?: boolean;
  readonly notifyRegimeShift?: boolean;
  readonly notifyDeadlineNear?: boolean;
  readonly notifyTargetZone?: boolean;
  readonly notifyConcentration?: boolean;
}

export interface GoalResponse {
  readonly id: string;
  readonly name: string;
  readonly kind: string;
  readonly purpose: string;
  readonly currencyCode: string;
  readonly targetAmount: number;
  readonly targetDate?: string;
  readonly recurInterval?: string;
  readonly budgetAmount?: number;
  readonly budgetCurrencyCode?: string;
  readonly budgetPeriod?: string;
  readonly isSpeculative: boolean;
  readonly status: string;
  readonly heldAmount: number;
  readonly suggested?: {
    readonly safeRatio: number;
    readonly floor: number;
    readonly splitCount: number;
  };
}

export interface GoalListResponse {
  readonly goals: readonly GoalResponse[];
}

export interface PlanStep {
  readonly seq: number;
  readonly scheduledDate: string;
  readonly amount: number;
  readonly krwEstimate: number;
  readonly executedAmount?: number;
  readonly status: string;
}

export interface ActivePlanResponse {
  readonly id: string;
  readonly goalId: string;
  readonly version: number;
  readonly isActive: boolean;
  readonly reason: string;
  readonly safeRatio: number;
  readonly splitCount: number;
  readonly opportunityAmount: number;
  readonly opportunityTriggerRate: number;
  readonly steps: readonly PlanStep[];
}

export interface StepCompleteRequest {
  readonly executedAmount: number;
  readonly executedRate: number;
}

export interface StepCompleteResponse {
  readonly seq: number;
  readonly status: string;
  readonly executedAmount: number;
  readonly executedRate: number;
  readonly remainingAmount: number;
}

export interface StepSkipResponse {
  readonly redistributed: {
    readonly perStepBefore: number;
    readonly perStepAfter: number;
    readonly increasePct: number;
  };
  readonly achieveProb: {
    readonly before: number;
    readonly after: number;
  };
  readonly consecutiveSkips: number;
  readonly safeModeTriggered: boolean;
  readonly newPlanVersion: number;
}
