import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../api/client";
import { XRAY_API_FIXTURE } from "../../test/api-fixtures";
import {
  applyStressScenario,
  fetchXrayBundle,
  simulateDiversification,
} from "../../api/xray";
import { useXrayApi, type XrayApiDependencies } from "./use-xray-api";

vi.mock("../../api/xray", () => ({
  applyStressScenario: vi.fn(),
  fetchXrayBundle: vi.fn(),
  simulateDiversification: vi.fn(),
}));

const STRESS_RESULT = {
  totalAssetBeforeKrw: 20_000_000,
  totalAssetAfterKrw: 19_400_000,
  impactKrw: -600_000,
  impactRatio: -0.03,
  byCurrency: [],
};
const SIMULATION_RESULT = {
  portfolioVol: { before: 0.2, after: 0.18 },
  exposureAfter: { EUR: 0.1 },
  threshold: 0.5,
  withinThreshold: true,
};

function dependencies(
  overrides: Partial<XrayApiDependencies> = {},
): XrayApiDependencies {
  return {
    load: vi.fn().mockResolvedValue(XRAY_API_FIXTURE),
    stress: vi.fn().mockResolvedValue(STRESS_RESULT),
    simulate: vi.fn().mockResolvedValue(SIMULATION_RESULT),
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

describe("useXrayApi", () => {
  beforeEach(() => {
    vi.mocked(fetchXrayBundle).mockReset();
    vi.mocked(applyStressScenario).mockReset();
    vi.mocked(simulateDiversification).mockReset();
  });

  it("기본 Swagger 의존성으로 조회와 액션을 실행한다", async () => {
    vi.mocked(fetchXrayBundle).mockResolvedValue(XRAY_API_FIXTURE);
    vi.mocked(applyStressScenario).mockResolvedValue(STRESS_RESULT);
    vi.mocked(simulateDiversification).mockResolvedValue(SIMULATION_RESULT);
    const { result } = renderHook(() => useXrayApi());
    await waitFor(() => expect(result.current.state.status).toBe("success"));

    await act(async () => result.current.runStress("usd-down"));
    expect(applyStressScenario).toHaveBeenCalledWith({ shocks: { USD: -0.1 } });
    await act(async () => result.current.runSimulation("EUR", 0.1));
    expect(simulateDiversification).toHaveBeenCalledWith({
      currencyCode: "EUR",
      deltaShare: 0.1,
    });
  });

  it("빈 자산과 재조회 결과를 구분한다", async () => {
    const load = vi
      .fn()
      .mockResolvedValueOnce({
        ...XRAY_API_FIXTURE,
        overview: { ...XRAY_API_FIXTURE.overview, exposure: [] },
      })
      .mockResolvedValueOnce(XRAY_API_FIXTURE);
    const deps = dependencies({ load });
    const { result } = renderHook(() => useXrayApi(deps));
    await waitFor(() => expect(result.current.state.status).toBe("empty"));
    act(() => result.current.reload());
    await waitFor(() => expect(result.current.state.status).toBe("success"));
  });

  it.each([
    [new ApiError("자산 서버 오류", 500, "SERVER"), "자산 서버 오류"],
    [
      new Error("network"),
      "자산 분석 정보를 불러오지 못했습니다. 잠시 후 다시 확인해 주세요.",
    ],
  ])("조회 오류를 사용자 메시지로 바꾼다", async (error, message) => {
    const deps = dependencies({ load: vi.fn().mockRejectedValue(error) });
    const { result } = renderHook(() => useXrayApi(deps));
    await waitFor(() =>
      expect(result.current.state).toEqual({ status: "error", message }),
    );
  });

  it("없는 프리셋은 요청하지 않고 액션 성공과 실패를 구분한다", async () => {
    const stress = vi
      .fn()
      .mockResolvedValueOnce(STRESS_RESULT)
      .mockRejectedValueOnce(new Error("stress failed"));
    const simulate = vi
      .fn()
      .mockResolvedValueOnce(SIMULATION_RESULT)
      .mockRejectedValueOnce(new ApiError("simulation failed", 400, "BAD"));
    const deps = dependencies({ stress, simulate });
    const { result } = renderHook(() => useXrayApi(deps));
    await waitFor(() => expect(result.current.state.status).toBe("success"));

    await act(async () => result.current.runStress("unknown"));
    expect(stress).not.toHaveBeenCalled();
    await act(async () => result.current.runStress("jpy-up"));
    expect(result.current.stressState.status).toBe("success");
    await act(async () => result.current.runStress("jpy-up"));
    expect(result.current.stressState).toEqual({
      status: "error",
      message: "자산 분석 정보를 불러오지 못했습니다. 잠시 후 다시 확인해 주세요.",
    });

    await act(async () => result.current.runSimulation("EUR", 0.1));
    expect(result.current.simulationState.status).toBe("success");
    await act(async () => result.current.runSimulation("USD", -0.1));
    expect(result.current.simulationState).toEqual({
      status: "error",
      message: "simulation failed",
    });
  });

  it("언마운트 이후의 조회 성공과 실패를 무시한다", async () => {
    const success = deferred<typeof XRAY_API_FIXTURE>();
    const successDeps = dependencies({ load: () => success.promise });
    const successHook = renderHook(() => useXrayApi(successDeps));
    successHook.unmount();
    await act(async () => success.resolve(XRAY_API_FIXTURE));

    const failure = deferred<never>();
    const failureDeps = dependencies({ load: () => failure.promise });
    const failureHook = renderHook(() => useXrayApi(failureDeps));
    failureHook.unmount();
    await act(async () => failure.reject(new Error("late")));
  });
});
