import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ApiError } from "../../api/client";
import {
  hasHomeContent,
  useHomeDashboard,
} from "./use-home-dashboard";

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

describe("useHomeDashboard", () => {
  it("isDemo가 true일 때 ready 상태와 데모 데이터를 반환한다", () => {
    const { result } = renderHook(() => useHomeDashboard(true));
    expect(result.current.state.status).toBe("ready");
    if (result.current.state.status === "ready" && result.current.state.source === "mock") {
      expect(result.current.state.data.todayAction.amountUsd).toBe(580);
    }
  });

  it("API 응답에 내용이 없을 때 empty 상태를 반환한다", async () => {
    const loader = vi.fn().mockResolvedValue({ data: {}, meta: { timestamp: "" } });
    const { result } = renderHook(() => useHomeDashboard(false, loader));
    await waitFor(() => expect(result.current.state.status).toBe("empty"));
  });

  it("홈 응답의 각 지원 필드를 내용으로 판정한다", () => {
    expect(hasHomeContent({})).toBe(false);
    expect(hasHomeContent({ todayAction: { heroAmount: "145 USD" } })).toBe(true);
    expect(hasHomeContent({ currencyStatus: { totalAssets: 2 } })).toBe(true);
    expect(hasHomeContent({ notice: { message: "확인" } })).toBe(true);
    expect(hasHomeContent({ weeklyChange: { summary: "변화" } })).toBe(true);
    expect(hasHomeContent({ marketSummary: { summary: "시장" } })).toBe(true);
  });

  it("API 성공 결과와 재시도를 처리한다", async () => {
    const loader = vi
      .fn()
      .mockResolvedValueOnce({
        data: { notice: { message: "첫 응답" } },
        meta: { timestamp: "2026-09-07T00:00:00Z" },
      })
      .mockResolvedValueOnce({
        data: { notice: { message: "새 응답" } },
        meta: { timestamp: "2026-09-07T01:00:00Z" },
      });
    const { result } = renderHook(() => useHomeDashboard(false, loader));

    await waitFor(() => expect(result.current.state.status).toBe("ready"));
    act(() => result.current.reload());
    await waitFor(() => expect(loader).toHaveBeenCalledTimes(2));
    await waitFor(() => {
      expect(result.current.state).toMatchObject({
        status: "ready",
        result: { data: { notice: { message: "새 응답" } } },
      });
    });
  });

  it.each([
    [new ApiError("서버 메시지", 500, "SERVER"), "서버 메시지"],
    [new Error("network"), "홈 정보를 불러오지 못했습니다. 잠시 후 다시 확인해 주세요."],
  ])("API 오류를 사용자 메시지로 바꾼다", async (error, expected) => {
    const loader = vi.fn().mockRejectedValue(error);
    const { result } = renderHook(() => useHomeDashboard(false, loader));

    await waitFor(() =>
      expect(result.current.state).toEqual({ status: "error", message: expected }),
    );
  });

  it("언마운트된 뒤 도착한 API 성공과 실패 응답을 무시한다", async () => {
    const pendingSuccess = deferred<{
      data: { notice: { message: string } };
      meta: { timestamp: string };
    }>();
    const successLoader = () => pendingSuccess.promise;
    const successHook = renderHook(() =>
      useHomeDashboard(false, successLoader),
    );
    successHook.unmount();
    await act(async () => pendingSuccess.resolve({
      data: { notice: { message: "늦은 응답" } },
      meta: { timestamp: "" },
    }));

    const pendingFailure = deferred<never>();
    const failureLoader = () => pendingFailure.promise;
    const failureHook = renderHook(() =>
      useHomeDashboard(false, failureLoader),
    );
    failureHook.unmount();
    await act(async () => pendingFailure.reject(new Error("late")));
  });

  it("recordRoundComplete 호출 시 확보율이 증가하고 남은 회차가 감소한다", () => {
    const { result } = renderHook(() => useHomeDashboard(true));

    act(() => {
      result.current.recordRoundComplete();
    });

    expect(result.current.state.status).toBe("ready");
    if (result.current.state.status === "ready" && result.current.state.source === "mock") {
      expect(result.current.state.data.todayAction.remainingRounds).toBe(1);
      expect(result.current.state.data.todayAction.fundedRatio).toBeCloseTo(0.52);
    }
  });
});
