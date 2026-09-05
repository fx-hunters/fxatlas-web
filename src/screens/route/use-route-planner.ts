import { useState, useCallback, useMemo } from "react";
import type {
  GoalSummary,
  GoalFormData,
  GoalSimulationResult,
  ScheduleRound,
  StrategyComparison,
} from "../../types/route";

export const DEMO_GOALS: readonly GoalSummary[] = [
  {
    id: "goal-1",
    name: "미국 주식 정기매수",
    category: "해외주식 적립",
    currency: "USD",
    isRecurring: true,
    targetAmount: 1200,
    deadlineDday: 14,
    fundedRatio: 0.6,
    targetDate: "2026-09-19",
    monthlyKrw: 150,
    safeRatioPct: 50,
    splitRounds: 4,
    holdingFxAmount: 450,
    riskProfile: "안정 추구형",
    volatilityPercentile: "상위 12%",
  },
  {
    id: "goal-2",
    name: "도쿄 여행 경비",
    category: "해외 여행 경비",
    currency: "JPY",
    isRecurring: false,
    targetAmount: 150000,
    deadlineDday: 30,
    fundedRatio: 0.4,
    targetDate: "2026-10-05",
    monthlyKrw: 100,
    safeRatioPct: 60,
    splitRounds: 3,
    holdingFxAmount: 60000,
    riskProfile: "안정 추구형",
    volatilityPercentile: "상위 8%",
  },
] as const;

export const DEFAULT_PARAMETERS = {
  monthlyKrw: 150,
  safeRatioPct: 50,
  splitRounds: 4,
  safeRatioFloor: 35,
} as const;

export type RoutePlannerViewMode = "list" | "create" | "edit" | "detail";

export function computeSimulation(
  monthlyKrw: number,
  safeRatioPct: number,
  splitRounds: number,
): GoalSimulationResult {
  const clampedSafeRatio = Math.max(DEFAULT_PARAMETERS.safeRatioFloor, safeRatioPct);
  const clampedRounds = Math.max(1, Math.min(16, splitRounds));

  const successRatePct = Math.min(99, Math.floor(60 + clampedSafeRatio * 0.2 + clampedRounds * 2));
  const worst5PctEntryPriceKrw = Number(
    (1380 + (100 - clampedSafeRatio) * 0.3 + (16 - clampedRounds)).toFixed(2),
  );
  const oneSigmaVolatilityKrw = Number((20 - clampedRounds * 0.4).toFixed(2));
  const avgEntryPriceKrw = 1382.38;

  const roundsSchedule: ScheduleRound[] = Array.from({ length: clampedRounds }, (_, i) => ({
    roundNumber: i + 1,
    dDayOffset: i * 3,
    bucketType: i === 0 || i % 2 === 0 ? "안전" : "기회",
    krwAmount: Math.round((monthlyKrw * 10000) / clampedRounds),
  }));

  const strategies: StrategyComparison[] = [
    {
      strategyKey: "A",
      strategyName: "A. 목표일 1회",
      avgEntryPriceKrw: 1382.4,
      worst5PctPriceKrw: 1415.0,
      successRatePct: 68,
    },
    {
      strategyKey: "B",
      strategyName: "B. 균등 분할",
      avgEntryPriceKrw: 1382.35,
      worst5PctPriceKrw: 1398.0,
      successRatePct: 85,
    },
    {
      strategyKey: "C",
      strategyName: "C. 현재 계획안",
      avgEntryPriceKrw: avgEntryPriceKrw,
      worst5PctPriceKrw: worst5PctEntryPriceKrw,
      successRatePct: successRatePct,
      isCurrentPlan: true,
    },
  ];

  return {
    oneSigmaVolatilityKrw,
    successRatePct,
    worst5PctEntryPriceKrw,
    avgEntryPriceKrw,
    roundsSchedule,
    strategies,
  };
}

export function useRoutePlanner(isDemo: boolean = true) {
  const [goals, setGoals] = useState<GoalSummary[]>(() => (isDemo ? [...DEMO_GOALS] : []));
  const [viewMode, setViewMode] = useState<RoutePlannerViewMode>("list");
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(() =>
    isDemo && DEMO_GOALS[0] ? DEMO_GOALS[0].id : null,
  );

  const [monthlyKrw, setMonthlyKrwState] = useState<number>(DEFAULT_PARAMETERS.monthlyKrw);
  const [safeRatioPct, setSafeRatioPctState] = useState<number>(DEFAULT_PARAMETERS.safeRatioPct);
  const [splitRounds, setSplitRoundsState] = useState<number>(DEFAULT_PARAMETERS.splitRounds);

  const selectedGoal = useMemo(
    () => goals.find((g) => g.id === selectedGoalId) ?? null,
    [goals, selectedGoalId],
  );

  const simulation = useMemo(
    () => computeSimulation(monthlyKrw, safeRatioPct, splitRounds),
    [monthlyKrw, safeRatioPct, splitRounds],
  );

  const handleOpenCreate = useCallback(() => {
    setViewMode("create");
  }, []);

  const handleOpenEdit = useCallback((goalId: string) => {
    setSelectedGoalId(goalId);
    setViewMode("edit");
  }, []);

  const handleSelectGoal = useCallback(
    (goalId: string) => {
      setSelectedGoalId(goalId);
      const target = goals.find((g) => g.id === goalId);
      if (target) {
        setMonthlyKrwState(target.monthlyKrw ?? DEFAULT_PARAMETERS.monthlyKrw);
        setSafeRatioPctState(target.safeRatioPct ?? DEFAULT_PARAMETERS.safeRatioPct);
        setSplitRoundsState(target.splitRounds ?? DEFAULT_PARAMETERS.splitRounds);
      }
      setViewMode("detail");
    },
    [goals],
  );

  const handleBackToList = useCallback(() => {
    setViewMode("list");
  }, []);

  const handleSetSafeRatioPct = useCallback((value: number) => {
    const clamped = Math.max(DEFAULT_PARAMETERS.safeRatioFloor, Math.min(100, value));
    setSafeRatioPctState(clamped);
  }, []);

  const handleSetMonthlyKrw = useCallback((value: number) => {
    setMonthlyKrwState(Math.max(40, Math.min(400, value)));
  }, []);

  const handleSetSplitRounds = useCallback((value: number) => {
    setSplitRoundsState(Math.max(1, Math.min(16, value)));
  }, []);

  const handleResetParameters = useCallback(() => {
    setMonthlyKrwState(DEFAULT_PARAMETERS.monthlyKrw);
    setSafeRatioPctState(DEFAULT_PARAMETERS.safeRatioPct);
    setSplitRoundsState(DEFAULT_PARAMETERS.splitRounds);
  }, []);

  const handleCreateGoal = useCallback((formData: GoalFormData) => {
    const newId = `goal-${Date.now()}`;
    const newGoal: GoalSummary = {
      id: newId,
      name: formData.name || "새 외화 목표",
      category: formData.category || "해외주식 적립",
      currency: formData.currency,
      isRecurring: formData.purposeType === "recurring",
      targetAmount: Number(formData.targetAmount) || 1000,
      deadlineDday: 14,
      fundedRatio: 0,
      targetDate: formData.targetDate || "2026-09-20",
      holdingFxAmount: 0,
      riskProfile: "안정 추구형",
      volatilityPercentile: "상위 12%",
    };

    setGoals((prev) => [newGoal, ...prev]);
    setSelectedGoalId(newId);
    setViewMode("detail");
  }, []);

  const handleUpdateGoal = useCallback(
    (goalId: string, formData: GoalFormData) => {
      setGoals((prev) =>
        prev.map((g) => {
          if (g.id !== goalId) return g;
          return {
            ...g,
            name: formData.name || g.name,
            category: formData.category || g.category,
            currency: formData.currency,
            isRecurring: formData.purposeType === "recurring",
            targetAmount: Number(formData.targetAmount) || g.targetAmount,
            targetDate: formData.targetDate || g.targetDate,
          };
        }),
      );
      setViewMode("detail");
    },
    [],
  );

  const handleDeleteGoal = useCallback(
    (goalId: string) => {
      setGoals((prev) => prev.filter((g) => g.id !== goalId));
      if (selectedGoalId === goalId) {
        setSelectedGoalId(null);
      }
      setViewMode("list");
    },
    [selectedGoalId],
  );

  const handleCompleteCurrentRound = useCallback(() => {
    if (!selectedGoalId) return;
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== selectedGoalId) return g;
        return {
          ...g,
          fundedRatio: Math.min(1, Number((g.fundedRatio + 0.1).toFixed(2))),
          deadlineDday: Math.max(0, g.deadlineDday - 3),
        };
      }),
    );
  }, [selectedGoalId]);

  return {
    goals,
    viewMode,
    selectedGoal,
    selectedGoalId,
    monthlyKrw,
    safeRatioPct,
    splitRounds,
    safeRatioFloor: DEFAULT_PARAMETERS.safeRatioFloor,
    simulation,
    openCreateView: handleOpenCreate,
    openEditView: handleOpenEdit,
    selectGoal: handleSelectGoal,
    backToList: handleBackToList,
    setMonthlyKrw: handleSetMonthlyKrw,
    setSafeRatioPct: handleSetSafeRatioPct,
    setSplitRounds: handleSetSplitRounds,
    resetParameters: handleResetParameters,
    createGoal: handleCreateGoal,
    updateGoal: handleUpdateGoal,
    deleteGoal: handleDeleteGoal,
    completeCurrentRound: handleCompleteCurrentRound,
  };
}
