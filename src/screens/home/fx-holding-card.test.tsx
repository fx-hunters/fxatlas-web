import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { FxHoldingCard } from "./fx-holding-card";
import type { FxHoldingData } from "../../types/home";

describe("FxHoldingCard", () => {
  const sampleData: FxHoldingData = {
    fxRatio: 0.36,
    fxKrw: 64000000,
    krwAmount: 36000000,
    dayOverDayDiffPctPoints: 0.2,
    sensitivity1pctKrw: 14200,
    breakdown: {
      usd: 75,
      jpy: 15,
      eur: 10,
    },
  };

  it("도넛 차트와 비중 바, 범례 및 변동 민감도를 렌더링한다", () => {
    const onNavigateToAssets = vi.fn();
    render(<FxHoldingCard data={sampleData} onNavigateToAssets={onNavigateToAssets} />);

    expect(screen.getByRole("heading", { name: "내 외화 현황" })).toBeInTheDocument();
    expect(screen.getByText("+0.2%p")).toBeInTheDocument();
    expect(screen.getByText(/1% 변동시 ±₩14,200/)).toBeInTheDocument();
    expect(screen.getByText("USD 75%")).toBeInTheDocument();
    expect(screen.getByText("JPY 15%")).toBeInTheDocument();
    expect(screen.getByText("EUR 10%")).toBeInTheDocument();

    const editBtn = screen.getByRole("button", { name: "자산 등록 / 편집" });
    fireEvent.click(editBtn);
    expect(onNavigateToAssets).toHaveBeenCalled();
  });

  it("음수 변동치와 액션 버튼 없는 상태를 올바르게 렌더링한다", () => {
    const negativeData: FxHoldingData = {
      ...sampleData,
      dayOverDayDiffPctPoints: -0.5,
    };
    render(<FxHoldingCard data={negativeData} />);
    expect(screen.getByText("-0.5%p")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "자산 등록 / 편집" })).not.toBeInTheDocument();
  });
});
