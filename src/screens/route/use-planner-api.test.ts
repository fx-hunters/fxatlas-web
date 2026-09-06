import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../api/client";
import { PLANNER_API_FIXTURE } from "../../test/api-fixtures";
import {
  completePlanStep,
  fetchPlannerOverview,
  skipPlanStep,
} from "../../api/planner";
import {
  usePlannerApi,
  type PlannerApiDependencies,
} from "./use-planner-api";

vi.mock("../../api/planner", () => ({
  completePlanStep: vi.fn(),
  fetchPlannerOverview: vi.fn(),
  skipPlanStep: vi.fn(),
}));

const COMPLETE_RESULT = {
  seq: 2,
  status: "completed",
  executedAmount: 145,
  executedRate: 1_400,
  remainingAmount: 1_595,
};
const SKIP_RESULT = {
  redistributed: { perStepBefore: 145, perStepAfter: 160, increasePct: 10.3 },
  achieveProb: { before: 0.8, after: 0.75 },
  consecutiveSkips: 1,
  safeModeTriggered: false,
  newPlanVersion: 3,
};

function dependencies(
  overrides: Partial<PlannerApiDependencies> = {},
): PlannerApiDependencies {
  return {
    load: vi.fn().mockResolvedValue(PLANNER_API_FIXTURE),
    complete: vi.fn().mockResolvedValue(COMPLETE_RESULT),
    skip: vi.fn().mockResolvedValue(SKIP_RESULT),
    ...overrides,
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

describe("usePlannerApi", () => {
  beforeEach(() => {
    vi.mocked(fetchPlannerOverview).mockReset();
    vi.mocked(completePlanStep).mockReset();
    vi.mocked(skipPlanStep).mockReset();
  });

  it("기본 Swagger 의존성으로 조회·완료·건너뛰기를 실행한다", async () => {
    vi.mocked(fetchPlannerOverview).mockResolvedValue(PLANNER_API_FIXTURE);
    vi.mocked(completePlanStep).mockResolvedValue(COMPLETE_RESULT);
    vi.mocked(skipPlanStep).mockResolvedValue(SKIP_RESULT);
    const { result } = renderHook(() => usePlannerApi());
    await waitFor(() => expect(result.current.state.status).toBe("success"));

    await act(async () =>
      result.current.complete("plan-usd", 2, 145, 1_400),
    );
    expect(completePlanStep).toHaveBeenCalledWith("plan-usd", 2, {
      executedAmount: 145,
      executedRate: 1_400,
    });
    expect(result.current.actionState).toMatchObject({
      status: "success",
      message: "2회차 기록을 서버에 저장했습니다.",
    });

    await act(async () => result.current.skip("plan-usd", 3));
    expect(skipPlanStep).toHaveBeenCalledWith("plan-usd", 3);
    expect(result.current.actionState).toMatchObject({
      status: "success",
      message: "3회차 건너뛰기를 서버에 저장했습니다.",
    });
  });

  it("빈 목표와 재조회 결과를 구분한다", async () => {
    const load = vi
      .fn()
      .mockResolvedValueOnce({ items: [] })
      .mockResolvedValueOnce(PLANNER_API_FIXTURE);
    const deps = dependencies({ load });
    const { result } = renderHook(() => usePlannerApi(deps));
    await waitFor(() => expect(result.current.state.status).toBe("empty"));
    act(() => result.current.reload());
    await waitFor(() => expect(result.current.state.status).toBe("success"));
  });

  it.each([
    [new ApiError("플래너 서버 오류", 500, "SERVER"), "플래너 서버 오류"],
    [
      new Error("network"),
      "플래너 정보를 불러오지 못했습니다. 잠시 후 다시 확인해 주세요.",
    ],
  ])("조회 오류를 사용자 메시지로 바꾼다", async (error, message) => {
    const deps = dependencies({ load: vi.fn().mockRejectedValue(error) });
    const { result } = renderHook(() => usePlannerApi(deps));
    await waitFor(() =>
      expect(result.current.state).toEqual({ status: "error", message }),
    );
  });

  it("완료와 건너뛰기 오류를 표시한다", async () => {
    const deps = dependencies({
      complete: vi.fn().mockRejectedValue(new Error("complete")),
      skip: vi.fn().mockRejectedValue(
        new ApiError("건너뛰기 오류", 400, "BAD"),
      ),
    });
    const { result } = renderHook(() => usePlannerApi(deps));
    await waitFor(() => expect(result.current.state.status).toBe("success"));

    await act(async () => result.current.complete("p", 1, 1, 1));
    expect(result.current.actionState).toEqual({
      status: "error",
      message: "플래너 정보를 불러오지 못했습니다. 잠시 후 다시 확인해 주세요.",
    });
    await act(async () => result.current.skip("p", 1));
    expect(result.current.actionState).toEqual({
      status: "error",
      message: "건너뛰기 오류",
    });
  });

  it("언마운트 이후의 조회 성공과 실패를 무시한다", async () => {
    const success = deferred<typeof PLANNER_API_FIXTURE>();
    const successDeps = dependencies({ load: () => success.promise });
    const successHook = renderHook(() => usePlannerApi(successDeps));
    successHook.unmount();
    await act(async () => success.resolve(PLANNER_API_FIXTURE));

    const failure = deferred<never>();
    const failureDeps = dependencies({ load: () => failure.promise });
    const failureHook = renderHook(() => usePlannerApi(failureDeps));
    failureHook.unmount();
    await act(async () => failure.reject(new Error("late")));
  });
});
