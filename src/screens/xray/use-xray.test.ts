import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useXRay } from "./use-xray";

describe("useXRay", () => {
  it("초기 상태를 올바르게 제공한다", () => {
    const { result } = renderHook(() => useXRay());

    expect(result.current.activeTab).toBe("exposure");
    expect(result.current.selectedScenarioId).toBe("2008");
    expect(result.current.activeScenario.label).toBe("2008 금융위기");
    expect(result.current.eurSimulationPct).toBe(10);
    expect(result.current.isAssetModalOpen).toBe(false);
  });

  it("탭을 전환하고 시나리오를 선택할 수 있다", () => {
    const { result } = renderHook(() => useXRay());

    act(() => {
      result.current.setActiveTab("fitness");
    });
    expect(result.current.activeTab).toBe("fitness");

    act(() => {
      result.current.setSelectedScenarioId("2020");
    });
    expect(result.current.selectedScenarioId).toBe("2020");
    expect(result.current.activeScenario.label).toBe("2020 팬데믹");

    act(() => {
      result.current.setSelectedScenarioId("non-existing");
    });
    expect(result.current.activeScenario.id).toBe("2008");
  });

  it("EUR 시뮬레이션 슬라이더 값을 클램핑하여 설정한다", () => {
    const { result } = renderHook(() => useXRay());

    act(() => {
      result.current.setEurSimulationPct(25);
    });
    expect(result.current.eurSimulationPct).toBe(25);

    act(() => {
      result.current.setEurSimulationPct(-10);
    });
    expect(result.current.eurSimulationPct).toBe(0);

    act(() => {
      result.current.setEurSimulationPct(100);
    });
    expect(result.current.eurSimulationPct).toBe(50);
  });

  it("자산 편집 모달 열기/닫기 동작을 제어한다", () => {
    const { result } = renderHook(() => useXRay());

    act(() => {
      result.current.openAssetModal();
    });
    expect(result.current.isAssetModalOpen).toBe(true);

    act(() => {
      result.current.closeAssetModal();
    });
    expect(result.current.isAssetModalOpen).toBe(false);
  });
});
