import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { loadRoutePlan, type RoutePlanLoader } from "../../api/route";
import type { RoutePlanData } from "../../types/route";
import { useRoutePlan } from "./use-route-plan";

interface Deferred<T> {
  readonly promise: Promise<T>;
  readonly resolve: (value: T) => void;
  readonly reject: (reason: unknown) => void;
}

function createDeferred<T>(): Deferred<T> {
  let resolvePromise: (value: T) => void = () => undefined;
  let rejectPromise: (reason: unknown) => void = () => undefined;
  const promise = new Promise<T>((resolve, reject) => {
    resolvePromise = resolve;
    rejectPromise = reject;
  });

  return {
    promise,
    resolve: resolvePromise,
    reject: rejectPromise,
  };
}

async function getDemoRoutePlan(): Promise<RoutePlanData> {
  const data = await loadRoutePlan();
  if (data === null) {
    throw new Error("데모 Route fixture가 필요합니다.");
  }
  return data;
}

describe("useRoutePlan", () => {
  it("기본 loader의 데이터를 success 상태로 반환한다", async () => {
    const { result } = renderHook(() => useRoutePlan());

    await waitFor(() => expect(result.current.state.status).toBe("success"));
  });

  it("null 응답을 empty 상태로 반환한다", async () => {
    const loader: RoutePlanLoader = vi.fn().mockResolvedValue(null);
    const { result } = renderHook(() => useRoutePlan(loader));

    await waitFor(() => expect(result.current.state.status).toBe("empty"));
  });

  it("알 수 없는 오류를 복구 안내가 있는 error 상태로 변환한다", async () => {
    const loader: RoutePlanLoader = vi
      .fn()
      .mockRejectedValue(new Error("network"));
    const { result } = renderHook(() => useRoutePlan(loader));

    await waitFor(() => expect(result.current.state.status).toBe("error"));
    expect(result.current.state).toEqual({
      status: "error",
      message: "환전 계획 정보를 불러오지 못했습니다. 잠시 후 다시 확인해 주세요.",
    });
  });

  it("reload 시 데이터를 다시 조회한다", async () => {
    const loader: RoutePlanLoader = vi
      .fn()
      .mockResolvedValue(await getDemoRoutePlan());
    const { result } = renderHook(() => useRoutePlan(loader));

    await waitFor(() => expect(result.current.state.status).toBe("success"));
    act(() => result.current.reload());
    await waitFor(() => expect(loader).toHaveBeenCalledTimes(2));
  });

  it("언마운트 뒤 완료된 응답은 상태에 반영하지 않는다", async () => {
    const deferred = createDeferred<RoutePlanData | null>();
    const loader: RoutePlanLoader = vi.fn(() => deferred.promise);
    const { unmount } = renderHook(() => useRoutePlan(loader));

    unmount();
    await act(async () => deferred.resolve(await getDemoRoutePlan()));

    expect(loader).toHaveBeenCalledOnce();
  });

  it("언마운트 뒤 발생한 오류는 상태에 반영하지 않는다", async () => {
    const deferred = createDeferred<RoutePlanData | null>();
    const loader: RoutePlanLoader = vi.fn(() => deferred.promise);
    const { unmount } = renderHook(() => useRoutePlan(loader));

    unmount();
    await act(async () => deferred.reject(new Error("late error")));

    expect(loader).toHaveBeenCalledOnce();
  });
});
