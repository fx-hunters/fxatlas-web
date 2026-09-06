import { useCallback, useEffect, useReducer, useState } from "react";
import type {
  PlannerPlan,
  PlannerScenarioId,
  PlannerStage,
} from "../../types/route";

export type PlannerEntryMode = "firstVisit" | "returnVisit" | "replay";
export type PlannerRevealPhase =
  | "orientation"
  | "pathReveal"
  | "actionFocus"
  | "explore";

interface PlannerIntroState {
  readonly stage: "intro";
  readonly isCreationNoticeVisible: boolean;
}

interface PlannerEnteringState {
  readonly stage: "entering";
  readonly plan: PlannerPlan;
  readonly entryMode: Exclude<PlannerEntryMode, "replay">;
}

export interface PlannerActiveState {
  readonly stage: Exclude<PlannerStage, "intro" | "entering">;
  readonly plan: PlannerPlan;
  readonly entryMode: PlannerEntryMode;
  readonly revealPhase: PlannerRevealPhase;
  readonly appliedScenarioId: PlannerScenarioId;
  readonly selectedScenarioId: PlannerScenarioId;
  readonly selectedCheckpointId: string | null;
  readonly isScenarioOpen: boolean;
  readonly areAllScenariosVisible: boolean;
  readonly isComparisonOpen: boolean;
  readonly isDetailsOpen: boolean;
  readonly isGoalExpanded: boolean;
  readonly isReasonOpen: boolean;
  readonly selectedReasonProfileId: string;
  readonly hasRecordedRound: boolean;
}

export type PlannerInteractionState =
  | PlannerIntroState
  | PlannerEnteringState
  | PlannerActiveState;

export type PlannerInteractionAction =
  | { readonly type: "showCreationNotice" }
  | {
      readonly type: "selectPlan";
      readonly plan: PlannerPlan;
      readonly entryMode: Exclude<PlannerEntryMode, "replay">;
    }
  | { readonly type: "completeEntry" }
  | { readonly type: "revealPath" }
  | { readonly type: "focusAction" }
  | { readonly type: "openScenarios" }
  | { readonly type: "closeScenarios" }
  | { readonly type: "showAllScenarios" }
  | { readonly type: "selectScenario"; readonly scenarioId: PlannerScenarioId }
  | { readonly type: "compareScenario" }
  | { readonly type: "beginConfirmation" }
  | { readonly type: "cancelConfirmation" }
  | { readonly type: "applyScenario" }
  | { readonly type: "recordRound" }
  | { readonly type: "selectCheckpoint"; readonly checkpointId: string }
  | { readonly type: "toggleGoalDetails" }
  | { readonly type: "openDetails" }
  | { readonly type: "closeDetails" }
  | { readonly type: "toggleReason" }
  | { readonly type: "selectReasonProfile"; readonly profileId: string }
  | { readonly type: "replayReveal" }
  | { readonly type: "returnToIntro" };

const INITIAL_STATE: PlannerInteractionState = {
  stage: "intro",
  isCreationNoticeVisible: false,
};

const PLANNER_SESSION_KEY_PREFIX = "divurve:planner-journey-seen:";
const ORIENTATION_DURATION_MS = 620;
const PATH_REVEAL_DURATION_MS = 1000;
const REDUCED_ORIENTATION_DURATION_MS = 80;
const REDUCED_PATH_REVEAL_DURATION_MS = 120;

function plannerSessionKey(planId: string): string {
  return `${PLANNER_SESSION_KEY_PREFIX}${planId}`;
}

function isActiveState(
  state: PlannerInteractionState,
): state is PlannerActiveState {
  return state.stage !== "intro" && state.stage !== "entering";
}

function createActiveState(
  state: PlannerEnteringState,
): PlannerActiveState {
  return {
    stage: "journey",
    plan: state.plan,
    entryMode: state.entryMode,
    revealPhase:
      state.entryMode === "returnVisit" ? "actionFocus" : "orientation",
    appliedScenarioId: state.plan.baseScenarioId,
    selectedScenarioId: state.plan.baseScenarioId,
    selectedCheckpointId: null,
    isScenarioOpen: false,
    areAllScenariosVisible: false,
    isComparisonOpen: false,
    isDetailsOpen: false,
    isGoalExpanded: false,
    isReasonOpen: false,
    selectedReasonProfileId: state.plan.explanation.profiles[0].id,
    hasRecordedRound: false,
  };
}

function getFocusedCheckpointId(state: PlannerActiveState): string {
  const scenario = state.plan.scenarios.find(
    (candidate) => candidate.id === state.selectedScenarioId,
  )!;
  return scenario.checkpoints.find(
    (checkpoint) => checkpoint.status === "next",
  )!.id;
}

export function plannerInteractionReducer(
  state: PlannerInteractionState,
  action: PlannerInteractionAction,
): PlannerInteractionState {
  switch (action.type) {
    case "showCreationNotice":
      return state.stage === "intro"
        ? { ...state, isCreationNoticeVisible: true }
        : state;
    case "selectPlan":
      return {
        stage: "entering",
        plan: action.plan,
        entryMode: action.entryMode,
      };
    case "completeEntry":
      return state.stage === "entering" ? createActiveState(state) : state;
    case "revealPath":
      return isActiveState(state) && state.revealPhase === "orientation"
        ? { ...state, revealPhase: "pathReveal" }
        : state;
    case "focusAction":
      return isActiveState(state) && state.revealPhase === "pathReveal"
        ? { ...state, revealPhase: "actionFocus" }
        : state;
    case "openScenarios":
      return isActiveState(state)
        ? {
            ...state,
            revealPhase: "explore",
            isScenarioOpen: true,
          }
        : state;
    case "closeScenarios":
      return isActiveState(state)
        ? {
            ...state,
            stage: state.hasRecordedRound ? "recorded" : "journey",
            revealPhase: "actionFocus",
            selectedScenarioId: state.appliedScenarioId,
            selectedCheckpointId: null,
            isScenarioOpen: false,
            areAllScenariosVisible: false,
            isComparisonOpen: false,
            isReasonOpen: false,
          }
        : state;
    case "showAllScenarios":
      return isActiveState(state)
        ? { ...state, areAllScenariosVisible: true }
        : state;
    case "selectScenario":
      if (!isActiveState(state)) {
        return state;
      }
      return {
        ...state,
        stage:
          action.scenarioId === state.appliedScenarioId
            ? state.hasRecordedRound
              ? "recorded"
              : "journey"
            : "scenarioPreview",
        revealPhase: "explore",
        selectedScenarioId: action.scenarioId,
        selectedCheckpointId: null,
        isScenarioOpen: true,
        isComparisonOpen: false,
        isReasonOpen: false,
      };
    case "compareScenario":
      return isActiveState(state) &&
        state.selectedScenarioId !== state.appliedScenarioId
        ? { ...state, isComparisonOpen: true }
        : state;
    case "beginConfirmation":
      return isActiveState(state) && state.isComparisonOpen
        ? { ...state, stage: "confirmChange" }
        : state;
    case "cancelConfirmation":
      return isActiveState(state) && state.stage === "confirmChange"
        ? { ...state, stage: "scenarioPreview" }
        : state;
    case "applyScenario":
      return isActiveState(state) && state.stage === "confirmChange"
        ? {
            ...state,
            stage: state.hasRecordedRound ? "recorded" : "journey",
            appliedScenarioId: state.selectedScenarioId,
            isComparisonOpen: false,
          }
        : state;
    case "recordRound":
      return isActiveState(state)
        ? {
            ...state,
            stage: "recorded",
            revealPhase: "actionFocus",
            selectedCheckpointId: state.plan.recordedState.nextCheckpointId,
            isScenarioOpen: false,
            isComparisonOpen: false,
            isReasonOpen: false,
            hasRecordedRound: true,
          }
        : state;
    case "selectCheckpoint":
      return isActiveState(state)
        ? {
            ...state,
            selectedCheckpointId: action.checkpointId,
            isReasonOpen: false,
          }
        : state;
    case "toggleGoalDetails":
      return isActiveState(state)
        ? { ...state, isGoalExpanded: !state.isGoalExpanded }
        : state;
    case "openDetails":
      return isActiveState(state)
        ? { ...state, isDetailsOpen: true }
        : state;
    case "closeDetails":
      return isActiveState(state)
        ? { ...state, isDetailsOpen: false }
        : state;
    case "toggleReason":
      return isActiveState(state)
        ? {
            ...state,
            selectedCheckpointId:
              state.selectedCheckpointId ?? getFocusedCheckpointId(state),
            isReasonOpen: !state.isReasonOpen,
          }
        : state;
    case "selectReasonProfile":
      return isActiveState(state)
        ? { ...state, selectedReasonProfileId: action.profileId }
        : state;
    case "replayReveal":
      return isActiveState(state)
        ? {
            ...state,
            stage: state.hasRecordedRound ? "recorded" : "journey",
            entryMode: "replay",
            revealPhase: "orientation",
            selectedScenarioId: state.appliedScenarioId,
            selectedCheckpointId: null,
            isScenarioOpen: false,
            areAllScenariosVisible: false,
            isComparisonOpen: false,
            isDetailsOpen: false,
            isGoalExpanded: false,
            isReasonOpen: false,
          }
        : state;
    case "returnToIntro":
      return INITIAL_STATE;
  }
}

export interface UsePlannerInteractionResult {
  readonly state: PlannerInteractionState;
  readonly showCreationNotice: () => void;
  readonly selectPlan: (plan: PlannerPlan) => void;
  readonly completeEntry: () => void;
  readonly openScenarios: () => void;
  readonly closeScenarios: () => void;
  readonly showAllScenarios: () => void;
  readonly selectScenario: (scenarioId: PlannerScenarioId) => void;
  readonly compareScenario: () => void;
  readonly beginConfirmation: () => void;
  readonly cancelConfirmation: () => void;
  readonly applyScenario: () => void;
  readonly recordRound: () => void;
  readonly selectCheckpoint: (checkpointId: string) => void;
  readonly toggleGoalDetails: () => void;
  readonly openDetails: () => void;
  readonly closeDetails: () => void;
  readonly toggleReason: () => void;
  readonly selectReasonProfile: (profileId: string) => void;
  readonly replayReveal: () => void;
  readonly returnToIntro: () => void;
}

function prefersReducedMotion(): boolean {
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function usePlannerInteraction(): UsePlannerInteractionResult {
  const [state, dispatch] = useReducer(plannerInteractionReducer, INITIAL_STATE);
  const [isReducedMotion] = useState(prefersReducedMotion);
  const revealPhase = isActiveState(state) ? state.revealPhase : null;

  useEffect(() => {
    if (revealPhase !== "orientation" && revealPhase !== "pathReveal") {
      return undefined;
    }

    const isOrientation = revealPhase === "orientation";
    const delay = isReducedMotion
      ? isOrientation
        ? REDUCED_ORIENTATION_DURATION_MS
        : REDUCED_PATH_REVEAL_DURATION_MS
      : isOrientation
        ? ORIENTATION_DURATION_MS
        : PATH_REVEAL_DURATION_MS;
    const timer = window.setTimeout(
      () => dispatch({ type: isOrientation ? "revealPath" : "focusAction" }),
      delay,
    );

    return () => window.clearTimeout(timer);
  }, [isReducedMotion, revealPhase]);

  const showCreationNotice = useCallback(
    () => dispatch({ type: "showCreationNotice" }),
    [],
  );
  const selectPlan = useCallback((plan: PlannerPlan) => {
    const entryMode =
      window.sessionStorage.getItem(plannerSessionKey(plan.id)) === "seen"
        ? "returnVisit"
        : "firstVisit";
    dispatch({ type: "selectPlan", plan, entryMode });
  }, []);
  const completeEntry = useCallback(() => {
    if (state.stage === "entering") {
      window.sessionStorage.setItem(plannerSessionKey(state.plan.id), "seen");
    }
    dispatch({ type: "completeEntry" });
  }, [state]);
  const openScenarios = useCallback(
    () => dispatch({ type: "openScenarios" }),
    [],
  );
  const closeScenarios = useCallback(
    () => dispatch({ type: "closeScenarios" }),
    [],
  );
  const showAllScenarios = useCallback(
    () => dispatch({ type: "showAllScenarios" }),
    [],
  );
  const selectScenario = useCallback(
    (scenarioId: PlannerScenarioId) =>
      dispatch({ type: "selectScenario", scenarioId }),
    [],
  );
  const compareScenario = useCallback(
    () => dispatch({ type: "compareScenario" }),
    [],
  );
  const beginConfirmation = useCallback(
    () => dispatch({ type: "beginConfirmation" }),
    [],
  );
  const cancelConfirmation = useCallback(
    () => dispatch({ type: "cancelConfirmation" }),
    [],
  );
  const applyScenario = useCallback(
    () => dispatch({ type: "applyScenario" }),
    [],
  );
  const recordRound = useCallback(
    () => dispatch({ type: "recordRound" }),
    [],
  );
  const selectCheckpoint = useCallback(
    (checkpointId: string) =>
      dispatch({ type: "selectCheckpoint", checkpointId }),
    [],
  );
  const toggleGoalDetails = useCallback(
    () => dispatch({ type: "toggleGoalDetails" }),
    [],
  );
  const openDetails = useCallback(
    () => dispatch({ type: "openDetails" }),
    [],
  );
  const closeDetails = useCallback(
    () => dispatch({ type: "closeDetails" }),
    [],
  );
  const toggleReason = useCallback(
    () => dispatch({ type: "toggleReason" }),
    [],
  );
  const selectReasonProfile = useCallback(
    (profileId: string) =>
      dispatch({ type: "selectReasonProfile", profileId }),
    [],
  );
  const replayReveal = useCallback(
    () => dispatch({ type: "replayReveal" }),
    [],
  );
  const returnToIntro = useCallback(
    () => dispatch({ type: "returnToIntro" }),
    [],
  );

  return {
    state,
    showCreationNotice,
    selectPlan,
    completeEntry,
    openScenarios,
    closeScenarios,
    showAllScenarios,
    selectScenario,
    compareScenario,
    beginConfirmation,
    cancelConfirmation,
    applyScenario,
    recordRound,
    selectCheckpoint,
    toggleGoalDetails,
    openDetails,
    closeDetails,
    toggleReason,
    selectReasonProfile,
    replayReveal,
    returnToIntro,
  };
}
