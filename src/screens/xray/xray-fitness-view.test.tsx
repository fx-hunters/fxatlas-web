import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { XRayFitnessView } from "./xray-fitness-view";
import { DEMO_XRAY_DATA } from "./use-xray";

describe("XRayFitnessView", () => {
  it("집중도 진단, 쏠림 해결 가이드, 분산효과 시뮬레이터 및 통화별 성격 비교를 렌더링한다", () => {
    const onSetEurSimulationPct = vi.fn();
    const onNavigateToPlanner = vi.fn();

    render(
      <XRayFitnessView
        data={DEMO_XRAY_DATA}
        eurSimulationPct={10}
        onSetEurSimulationPct={onSetEurSimulationPct}
        onNavigateToPlanner={onNavigateToPlanner}
      />,
    );

    expect(screen.getByRole("heading", { name: "집중도 진단" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /쏠림을 고치는 방법/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "분산효과 시뮬레이터" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "통화별 성격 비교" })).toBeInTheDocument();

    expect(screen.getByText("85")).toBeInTheDocument();
    expect(screen.getByText("+10%")).toBeInTheDocument();

    // 슬라이더 변경
    fireEvent.change(screen.getByLabelText("EUR 추가 매수 비율 시뮬레이션"), {
      target: { value: "30" },
    });
    expect(onSetEurSimulationPct).toHaveBeenCalledWith(30);

    // 플래너 이동 버튼 클릭
    fireEvent.click(screen.getByRole("button", { name: "새 통화 목표 만들기" }));
    expect(onNavigateToPlanner).toHaveBeenCalled();

    // 통화 성격 표
    expect(screen.getByText("USD")).toBeInTheDocument();
    expect(screen.getByText("JPY")).toBeInTheDocument();
    expect(screen.getByText("EUR")).toBeInTheDocument();
  });
});
