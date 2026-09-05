import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { TodayActionCard } from "./today-action-card";
import type { TodayActionData } from "../../types/home";

describe("TodayActionCard", () => {
  const sampleData: TodayActionData = {
    amountUsd: 580,
    amountKrw: 798000,
    deadlineDday: 3,
    fundedRatio: 0.42,
    remainingRounds: 2,
  };

  it("금액, D-day, 확보율 및 버튼을 올바르게 렌더링한다", () => {
    const onRecordComplete = vi.fn();
    render(<TodayActionCard data={sampleData} onRecordComplete={onRecordComplete} />);

    expect(screen.getByText("580")).toBeInTheDocument();
    expect(screen.getByText(/약 ₩798,000/)).toBeInTheDocument();
    expect(screen.getByText("마감일: D-3")).toBeInTheDocument();
    expect(screen.getByText(/이번 주 확보율 42%/)).toBeInTheDocument();
    expect(screen.getByText(/남은 회차: 2/)).toBeInTheDocument();

    const button = screen.getByRole("button", { name: "환전 완료 기록" });
    fireEvent.click(button);
    expect(onRecordComplete).toHaveBeenCalled();
  });
});
