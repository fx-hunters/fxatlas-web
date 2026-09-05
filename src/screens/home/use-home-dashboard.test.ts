import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useHomeDashboard } from "./use-home-dashboard";

describe("useHomeDashboard", () => {
  it("isDemo가 true일 때 ready 상태와 데모 데이터를 반환한다", () => {
    const { result } = renderHook(() => useHomeDashboard(true));
    expect(result.current.state.status).toBe("ready");
    if (result.current.state.status === "ready") {
      expect(result.current.state.data.todayAction.amountUsd).toBe(580);
    }
  });

  it("isDemo가 false일 때 empty 상태를 반환한다", () => {
    const { result } = renderHook(() => useHomeDashboard(false));
    expect(result.current.state.status).toBe("empty");
  });

  it("recordRoundComplete 호출 시 확보율이 증가하고 남은 회차가 감소한다", () => {
    const { result } = renderHook(() => useHomeDashboard(true));

    act(() => {
      result.current.recordRoundComplete();
    });

    expect(result.current.state.status).toBe("ready");
    if (result.current.state.status === "ready") {
      expect(result.current.state.data.todayAction.remainingRounds).toBe(1);
      expect(result.current.state.data.todayAction.fundedRatio).toBeCloseTo(0.52);
    }
  });
});
