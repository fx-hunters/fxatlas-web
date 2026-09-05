import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { XRayExposureView } from "./xray-exposure-view";
import { DEMO_XRAY_DATA } from "./use-xray";

describe("XRayExposureView", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("외화 비중, 통화 노출, 손익 분해 테이블 및 스트레스 시나리오를 렌더링한다", () => {
    const onSelectScenario = vi.fn();
    const onNavigateToPlanner = vi.fn();
    const onOpenAssetEdit = vi.fn();

    render(
      <XRayExposureView
        data={DEMO_XRAY_DATA}
        selectedScenarioId="2008"
        activeScenario={DEMO_XRAY_DATA.scenarios[0]}
        onSelectScenario={onSelectScenario}
        onNavigateToPlanner={onNavigateToPlanner}
        onOpenAssetEdit={onOpenAssetEdit}
      />,
    );

    expect(screen.getByRole("heading", { name: "외화 비중" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "통화별 노출" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "예정 외화 지출 (플래너 연동)" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "손익 분해" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "스트레스 시나리오" })).toBeInTheDocument();

    expect(screen.getAllByText("64").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("외화 ₩64,000,000")).toBeInTheDocument();
    expect(screen.getByText("USD 85%")).toBeInTheDocument();
    expect(screen.getByText("기준선 60%")).toBeInTheDocument();

    // 플래너 이동
    fireEvent.click(screen.getByRole("button", { name: "계획 수정" }));
    expect(onNavigateToPlanner).toHaveBeenCalled();

    // 자산 편집 버튼 및 토스트
    fireEvent.click(screen.getByRole("button", { name: /자산 편집/ }));
    expect(onOpenAssetEdit).toHaveBeenCalled();
    expect(screen.getByRole("status")).toHaveTextContent("자산 편집 모달이 준비 중입니다.");

    act(() => {
      vi.advanceTimersByTime(2100);
    });
    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    // 스트레스 시나리오 버튼 클릭
    fireEvent.click(screen.getByRole("button", { name: "2020 팬데믹" }));
    expect(onSelectScenario).toHaveBeenCalledWith("2020");
  });
});
