import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useInitialSetup } from "./use-initial-setup";

describe("useInitialSetup", () => {
  it("입력 편집 시 건너뜀 상태를 해제하고 마지막 다음에서 현재 초안을 전달한다", () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useInitialSetup(onComplete));

    act(() => result.current.actions.goBack());
    expect(result.current.state.currentStepNumber).toBe(1);

    act(() => result.current.actions.skipCurrentStep());
    act(() => result.current.actions.goBack());
    act(() => result.current.actions.skipCurrentStep());
    expect(result.current.state.skippedSteps).toEqual(["explanationDomain"]);

    act(() => result.current.actions.goBack());
    act(() => result.current.actions.selectExplanationDomain("dev"));
    expect(result.current.state.skippedSteps).toEqual([]);
    expect(result.current.state.canContinue).toBe(true);

    act(() => result.current.actions.goNext());
    act(() => result.current.actions.changeAsset("krwAssets", "500000"));
    expect(result.current.state.canContinue).toBe(true);
    act(() => result.current.actions.changeAsset("krwAssets", undefined));
    expect(result.current.state.canContinue).toBe(false);
    act(() => result.current.actions.changeAsset("overseasStocks", "300000"));
    act(() => result.current.actions.goNext());

    expect(result.current.state.currentStep).toBe("riskProfile");
    expect(result.current.state.canContinue).toBe(false);
    act(() => result.current.actions.goNext());

    expect(onComplete).toHaveBeenCalledWith({
      draft: {
        explanationDomain: "dev",
        assets: {
          krwAssets: undefined,
          overseasStocks: "300000",
        },
      },
      skippedSteps: [],
    });
  });
});
