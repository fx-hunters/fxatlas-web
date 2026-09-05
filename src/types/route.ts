export type GoalPurposeType = "recurring" | "single";
export type CurrencyCode = "USD" | "JPY" | "EUR";

export interface GoalSummary {
  readonly id: string;
  readonly name: string;
  readonly category: string;
  readonly currency: CurrencyCode;
  readonly isRecurring: boolean;
  readonly targetAmount: number;
  readonly deadlineDday: number;
  readonly fundedRatio: number;
  readonly targetDate?: string;
  readonly monthlyKrw?: number;
  readonly safeRatioPct?: number;
  readonly splitRounds?: number;
  readonly holdingFxAmount?: number;
  readonly riskProfile?: string;
  readonly volatilityPercentile?: string;
}

export interface GoalFormData {
  readonly purposeType: GoalPurposeType;
  readonly category: string;
  readonly name: string;
  readonly currency: CurrencyCode;
  readonly targetAmount: number;
  readonly targetDate: string;
}

export interface ScheduleRound {
  readonly roundNumber: number;
  readonly dDayOffset: number;
  readonly bucketType: "안전" | "기회";
  readonly krwAmount: number;
  readonly isCompleted?: boolean;
}

export interface StrategyComparison {
  readonly strategyKey: "A" | "B" | "C";
  readonly strategyName: string;
  readonly avgEntryPriceKrw: number;
  readonly worst5PctPriceKrw: number;
  readonly successRatePct: number;
  readonly isCurrentPlan?: boolean;
}

export interface GoalSimulationResult {
  readonly oneSigmaVolatilityKrw: number;
  readonly successRatePct: number;
  readonly worst5PctEntryPriceKrw: number;
  readonly avgEntryPriceKrw: number;
  readonly roundsSchedule: readonly ScheduleRound[];
  readonly strategies: readonly StrategyComparison[];
}

export interface GoalDetailPlan {
  readonly goal: GoalSummary;
  readonly availableKrwMonthly: number;
  readonly safeRatioPct: number;
  readonly splitRounds: number;
  readonly holdingFxAmount: number;
  readonly riskProfile: string;
  readonly volatilityPercentile: string;
  readonly simulation: GoalSimulationResult;
}

