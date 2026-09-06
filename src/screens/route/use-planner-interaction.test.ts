import { act, renderHook } from "@testing-library/react";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { loadRoutePlan } from "../../api/route";
import type { PlannerPlan } from "../../types/route";
import {
  plannerInteractionReducer,
  type PlannerActiveState,
  type PlannerInteractionAction,
  type PlannerInteractionState,
  usePlannerInteraction,
} from "./use-planner-interaction";

async function getPlan(index = 0): Promise<PlannerPlan> {
  const data = await loadRoutePlan();
  if (data === null) {
    throw new Error("데모 플래너 fixture가 필요합니다.");
  }
  return data.plans[index]!;
}

function createIntro(): PlannerInteractionState {
  return { stage: "intro", isCreationNoticeVisible: false };
}

function enterPlan(
  plan: PlannerPlan,
  entryMode: "firstVisit" | "returnVisit" = "firstVisit",
): PlannerActiveState {
  const entering = plannerInteractionReducer(createIntro(), {
    type: "selectPlan",
    plan,
    entryMode,
  });
  const active = plannerInteractionReducer(entering, {
    type: "completeEntry",
  });
  if (active.stage === "intro" || active.stage === "entering") {
    throw new Error("Journey 상태가 필요합니다.");
  }
  return active;
}

function reduceActive(
  state: PlannerInteractionState,
  action: PlannerInteractionAction,
): PlannerActiveState {
  const nextState = plannerInteractionReducer(state, action);
  if (nextState.stage === "intro" || nextState.stage === "entering") {
    throw new Error("Journey 액션은 활성 상태를 유지해야 합니다.");
  }
  return nextState;
}

beforeEach(() => {
  window.sessionStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("plannerInteractionReducer", () => {
  it("Intro 안내와 첫 방문·재방문 진입을 구분한다", async () => {
    const plan = await getPlan();
    const intro = createIntro();
    const notice = plannerInteractionReducer(intro, {
      type: "showCreationNotice",
    });
    const entering = plannerInteractionReducer(notice, {
      type: "selectPlan",
      plan,
      entryMode: "firstVisit",
    });
    const firstVisit = plannerInteractionReducer(entering, {
      type: "completeEntry",
    });
    const returnVisit = enterPlan(plan, "returnVisit");

    expect(notice).toEqual({
      stage: "intro",
      isCreationNoticeVisible: true,
    });
    expect(entering).toMatchObject({
      stage: "entering",
      entryMode: "firstVisit",
    });
    expect(firstVisit).toMatchObject({
      stage: "journey",
      revealPhase: "orientation",
      appliedScenarioId: "expectedRange",
      selectedReasonProfileId: "brief",
      hasRecordedRound: false,
    });
    expect(returnVisit.revealPhase).toBe("actionFocus");
    expect(
      plannerInteractionReducer(firstVisit, { type: "showCreationNotice" }),
    ).toBe(firstVisit);
    expect(
      plannerInteractionReducer(intro, { type: "completeEntry" }),
    ).toBe(intro);
    expect(
      plannerInteractionReducer(firstVisit, { type: "returnToIntro" }),
    ).toEqual(intro);
  });

  it("현재 위치, Curve, 다음 행동과 상황 탐색 공개 단계를 전환한다", async () => {
    const active = enterPlan(await getPlan());
    const pathReveal = plannerInteractionReducer(active, {
      type: "revealPath",
    });
    const actionFocus = plannerInteractionReducer(pathReveal, {
      type: "focusAction",
    });
    const exploring = plannerInteractionReducer(actionFocus, {
      type: "openScenarios",
    });
    const allScenarios = plannerInteractionReducer(exploring, {
      type: "showAllScenarios",
    });
    const closed = plannerInteractionReducer(allScenarios, {
      type: "closeScenarios",
    });

    expect(pathReveal).toMatchObject({ revealPhase: "pathReveal" });
    expect(actionFocus).toMatchObject({ revealPhase: "actionFocus" });
    expect(exploring).toMatchObject({
      revealPhase: "explore",
      isScenarioOpen: true,
    });
    expect(allScenarios).toMatchObject({ areAllScenariosVisible: true });
    expect(closed).toMatchObject({
      stage: "journey",
      revealPhase: "actionFocus",
      isScenarioOpen: false,
      areAllScenariosVisible: false,
    });
    expect(
      plannerInteractionReducer(pathReveal, { type: "revealPath" }),
    ).toBe(pathReveal);
    expect(
      plannerInteractionReducer(active, { type: "focusAction" }),
    ).toBe(active);

    const recorded = plannerInteractionReducer(active, {
      type: "recordRound",
    });
    const recordedOpen = plannerInteractionReducer(recorded, {
      type: "openScenarios",
    });
    expect(
      plannerInteractionReducer(recordedOpen, { type: "closeScenarios" }),
    ).toMatchObject({ stage: "recorded" });
  });

  it("대체 계획을 비교하고 확인 취소와 적용 상태를 구분한다", async () => {
    const active = enterPlan(await getPlan());
    const preview = plannerInteractionReducer(active, {
      type: "selectScenario",
      scenarioId: "rapidRise",
    });
    const compared = plannerInteractionReducer(preview, {
      type: "compareScenario",
    });
    const confirming = plannerInteractionReducer(compared, {
      type: "beginConfirmation",
    });
    const canceled = plannerInteractionReducer(confirming, {
      type: "cancelConfirmation",
    });
    const reconfirming = plannerInteractionReducer(canceled, {
      type: "beginConfirmation",
    });
    const applied = plannerInteractionReducer(reconfirming, {
      type: "applyScenario",
    });

    expect(preview).toMatchObject({
      stage: "scenarioPreview",
      revealPhase: "explore",
      selectedScenarioId: "rapidRise",
      isComparisonOpen: false,
    });
    expect(compared).toMatchObject({ isComparisonOpen: true });
    expect(confirming.stage).toBe("confirmChange");
    expect(canceled.stage).toBe("scenarioPreview");
    expect(applied).toMatchObject({
      stage: "journey",
      appliedScenarioId: "rapidRise",
      isComparisonOpen: false,
    });
    expect(
      plannerInteractionReducer(active, { type: "compareScenario" }),
    ).toBe(active);
    expect(
      plannerInteractionReducer(active, { type: "beginConfirmation" }),
    ).toBe(active);
    expect(
      plannerInteractionReducer(active, { type: "cancelConfirmation" }),
    ).toBe(active);
    expect(
      plannerInteractionReducer(active, { type: "applyScenario" }),
    ).toBe(active);

    const current = plannerInteractionReducer(applied, {
      type: "selectScenario",
      scenarioId: "rapidRise",
    });
    expect(current.stage).toBe("journey");

    const recorded = plannerInteractionReducer(active, {
      type: "recordRound",
    });
    const recordedPreview = plannerInteractionReducer(recorded, {
      type: "selectScenario",
      scenarioId: "decline",
    });
    const recordedCompared = plannerInteractionReducer(recordedPreview, {
      type: "compareScenario",
    });
    const recordedConfirming = plannerInteractionReducer(recordedCompared, {
      type: "beginConfirmation",
    });
    const recordedApplied = plannerInteractionReducer(recordedConfirming, {
      type: "applyScenario",
    });
    expect(recordedApplied).toMatchObject({
      stage: "recorded",
      appliedScenarioId: "decline",
    });
    expect(
      plannerInteractionReducer(recorded, {
        type: "selectScenario",
        scenarioId: "expectedRange",
      }),
    ).toMatchObject({ stage: "recorded" });
  });

  it("노드·상세·설명·기록 상태를 바꾸고 다시 보기에서 계획 상태를 보존한다", async () => {
    const active = enterPlan(await getPlan());
    const selected = reduceActive(active, {
      type: "selectCheckpoint",
      checkpointId: "usd-next",
    });
    const goalOpen = reduceActive(selected, {
      type: "toggleGoalDetails",
    });
    const goalClosed = reduceActive(goalOpen, {
      type: "toggleGoalDetails",
    });
    const detailOpen = reduceActive(goalClosed, {
      type: "openDetails",
    });
    const detailClosed = reduceActive(detailOpen, {
      type: "closeDetails",
    });
    const reasonOpen = reduceActive(active, {
      type: "toggleReason",
    });
    const profiled = reduceActive(reasonOpen, {
      type: "selectReasonProfile",
      profileId: "detail",
    });
    const reasonClosed = reduceActive(profiled, {
      type: "toggleReason",
    });
    const recorded = reduceActive(reasonClosed, {
      type: "recordRound",
    });
    const replay = reduceActive(recorded, {
      type: "replayReveal",
    });
    const unrecordedReplay = reduceActive(active, {
      type: "replayReveal",
    });

    expect(selected.selectedCheckpointId).toBe("usd-next");
    expect(goalOpen.isGoalExpanded).toBe(true);
    expect(goalClosed.isGoalExpanded).toBe(false);
    expect(detailOpen.isDetailsOpen).toBe(true);
    expect(detailClosed.isDetailsOpen).toBe(false);
    expect(reasonOpen).toMatchObject({
      isReasonOpen: true,
      selectedCheckpointId: "usd-next",
    });
    expect(profiled.selectedReasonProfileId).toBe("detail");
    expect(reasonClosed).toMatchObject({
      isReasonOpen: false,
      selectedCheckpointId: "usd-next",
    });
    expect(recorded).toMatchObject({
      stage: "recorded",
      hasRecordedRound: true,
      selectedCheckpointId: "usd-context",
    });
    expect(replay).toMatchObject({
      stage: "recorded",
      entryMode: "replay",
      revealPhase: "orientation",
      hasRecordedRound: true,
      isDetailsOpen: false,
    });
    expect(unrecordedReplay.stage).toBe("journey");
  });

  it("Journey 전용 액션은 Intro 상태를 변경하지 않는다", async () => {
    const intro = createIntro();
    const actions: readonly PlannerInteractionAction[] = [
      { type: "revealPath" },
      { type: "focusAction" },
      { type: "openScenarios" },
      { type: "closeScenarios" },
      { type: "showAllScenarios" },
      { type: "selectScenario", scenarioId: "decline" },
      { type: "compareScenario" },
      { type: "beginConfirmation" },
      { type: "cancelConfirmation" },
      { type: "applyScenario" },
      { type: "recordRound" },
      { type: "selectCheckpoint", checkpointId: "usd-next" },
      { type: "toggleGoalDetails" },
      { type: "openDetails" },
      { type: "closeDetails" },
      { type: "toggleReason" },
      { type: "selectReasonProfile", profileId: "detail" },
      { type: "replayReveal" },
    ];

    actions.forEach((action) => {
      expect(plannerInteractionReducer(intro, action)).toBe(intro);
    });
    expect(await getPlan()).toBeDefined();
  });
});

describe("usePlannerInteraction", () => {
  it("첫 방문 연출을 자동 진행하고 같은 세션 재방문은 바로 다음 행동을 표시한다", async () => {
    const plan = await getPlan();
    vi.useFakeTimers();
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockReturnValue({ matches: false } as MediaQueryList),
    );
    const { result, unmount } = renderHook(() => usePlannerInteraction());

    act(() => result.current.selectPlan(plan));
    expect(result.current.state).toMatchObject({
      stage: "entering",
      entryMode: "firstVisit",
    });
    act(() => result.current.completeEntry());
    expect(result.current.state).toMatchObject({
      revealPhase: "orientation",
    });

    act(() => vi.advanceTimersByTime(620));
    expect(result.current.state).toMatchObject({ revealPhase: "pathReveal" });
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.state).toMatchObject({ revealPhase: "actionFocus" });

    act(() => result.current.completeEntry());
    act(() => result.current.returnToIntro());
    act(() => result.current.selectPlan(plan));
    expect(result.current.state).toMatchObject({
      stage: "entering",
      entryMode: "returnVisit",
    });
    act(() => result.current.completeEntry());
    expect(result.current.state).toMatchObject({ revealPhase: "actionFocus" });

    act(() => result.current.replayReveal());
    expect(result.current.state).toMatchObject({ revealPhase: "orientation" });
    unmount();
  });

  it("reduced-motion에서는 짧은 fade 시간으로 공개 단계를 진행한다", async () => {
    const plan = await getPlan(1);
    vi.useFakeTimers();
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockReturnValue({ matches: true } as MediaQueryList),
    );
    const { result } = renderHook(() => usePlannerInteraction());

    act(() => result.current.selectPlan(plan));
    act(() => result.current.completeEntry());
    act(() => vi.advanceTimersByTime(80));
    expect(result.current.state).toMatchObject({ revealPhase: "pathReveal" });
    act(() => vi.advanceTimersByTime(120));
    expect(result.current.state).toMatchObject({ revealPhase: "actionFocus" });
  });
});
