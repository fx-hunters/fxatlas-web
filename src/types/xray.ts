export type XRayTabId = "exposure" | "fitness";

export interface StockHoldingItem {
  readonly symbol: string;
  readonly returnPct: number;
}

export interface PnLDecompositionData {
  readonly costBasisKrw: number;
  readonly stockReturnKrw: number;
  readonly stockReturnPct: number;
  readonly fxReturnKrw: number;
  readonly fxReturnPct: number;
  readonly interactionKrw: number;
  readonly interactionPct: number;
  readonly totalValuationKrw: number;
  readonly totalReturnPct: number;
  readonly stockHoldings: readonly StockHoldingItem[];
}

export interface StressScenarioItem {
  readonly id: string;
  readonly label: string;
  readonly stockShockPct: number;
  readonly fxShockPct: number;
  readonly resultKrw: number;
  readonly title: string;
  readonly defenseMessage: string;
}

export interface CurrencyTraitItem {
  readonly currency: "USD" | "JPY" | "EUR";
  readonly volatility: string;
  readonly liquidity: string;
  readonly diversificationContribution: string;
  readonly isHighContribution: boolean;
}

export interface XRayDashboardData {
  readonly fxRatioPct: number;
  readonly fxKrw: number;
  readonly krwAmount: number;
  readonly exposureBreakdown: {
    readonly usd: number;
    readonly jpy: number;
    readonly eur: number;
    readonly baselinePct: number;
  };
  readonly scheduledExpenditure: {
    readonly title: string;
    readonly dateLabel: string;
    readonly amountUsd: number;
  };
  readonly fxSensitivity1pctKrw: number;
  readonly pnl: PnLDecompositionData;
  readonly scenarios: readonly StressScenarioItem[];
  readonly concentrationPct: number;
  readonly concentrationBaselinePct: number;
  readonly currencyTraits: readonly CurrencyTraitItem[];
}
