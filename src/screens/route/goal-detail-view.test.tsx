import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GoalDetailView } from "./goal-detail-view";
import { DEMO_GOALS, computeSimulation } from "./use-route-planner";

describe("GoalDetailView", () => {
  const goal = DEMO_GOALS[0];
  const simulation = computeSimulation(150, 50, 4);

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("목표 상세 정보, 시뮬레이션 지표, 슬라이더를 렌더링한다", () => {
    const onBack = vi.fn();
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const onSetMonthlyKrw = vi.fn();
    const onSetSafeRatioPct = vi.fn();
    const onSetSplitRounds = vi.fn();
    const onResetParameters = vi.fn();
    const onCompleteRound = vi.fn();

    render(
      <GoalDetailView
        goal={goal}
        simulation={simulation}
        monthlyKrw={150}
        safeRatioPct={50}
        splitRounds={4}
        safeRatioFloor={35}
        onBack={onBack}
        onEdit={onEdit}
        onDelete={onDelete}
        onSetMonthlyKrw={onSetMonthlyKrw}
        onSetSafeRatioPct={onSetSafeRatioPct}
        onSetSplitRounds={onSetSplitRounds}
        onResetParameters={onResetParameters}
        onCompleteRound={onCompleteRound}
      />,
    );

    expect(screen.getByRole("heading", { name: "미국 주식 정기매수 계획" })).toBeInTheDocument();
    expect(screen.getByText("입력 파라미터")).toBeInTheDocument();
    expect(screen.getByText("계획 상세 (시뮬레이션 결과)")).toBeInTheDocument();
    expect(screen.getByText("150만")).toBeInTheDocument();
    expect(screen.getByText("50%")).toBeInTheDocument();
    expect(screen.getByText("4회")).toBeInTheDocument();

    // 슬라이더 이벤트
    fireEvent.change(screen.getByLabelText("월 가용 원화"), { target: { value: "200" } });
    expect(onSetMonthlyKrw).toHaveBeenCalledWith(200);

    fireEvent.change(screen.getByLabelText("안전 버킷 비율"), { target: { value: "60" } });
    expect(onSetSafeRatioPct).toHaveBeenCalledWith(60);

    fireEvent.change(screen.getByLabelText("분할 횟수"), { target: { value: "6" } });
    expect(onSetSplitRounds).toHaveBeenCalledWith(6);

    // 액션 버튼
    fireEvent.click(screen.getByRole("button", { name: "← 목록으로" }));
    expect(onBack).toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "목표 수정" }));
    expect(onEdit).toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "삭제" }));
    expect(onDelete).toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "계획 다시 짜기" }));
    expect(onResetParameters).toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "이번 회차 완료" }));
    expect(onCompleteRound).toHaveBeenCalled();
    expect(screen.getByRole("status")).toHaveTextContent("이번 회차 환전이 성공적으로 기록되었습니다.");

    // 토스트 자동 숨김 타이머 검증
    act(() => {
      vi.advanceTimersByTime(2600);
    });
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("안전 비율이 하한선(35%)에 도달했을 때 경고 안내 문구를 노출한다", () => {
    render(
      <GoalDetailView
        goal={goal}
        simulation={simulation}
        monthlyKrw={150}
        safeRatioPct={35}
        splitRounds={4}
        safeRatioFloor={35}
        onBack={vi.fn()}
        onSetMonthlyKrw={vi.fn()}
        onSetSafeRatioPct={vi.fn()}
        onSetSplitRounds={vi.fn()}
        onResetParameters={vi.fn()}
        onCompleteRound={vi.fn()}
      />,
    );

    expect(
      screen.getByText("이 목적의 안전 버킷 하한입니다. 그 아래로는 내릴 수 없습니다."),
    ).toBeInTheDocument();
  });

  it("EUR 통화 및 4회를 초과하는 분할 횟수일 때 초과 회차 안내 텍스트를 노출한다", () => {
    const eightRoundsSimulation = computeSimulation(150, 50, 8);
    render(
      <GoalDetailView
        goal={{
          id: "goal-eur",
          name: "유럽 주식 적립",
          category: "해외주식 적립",
          currency: "EUR",
          isRecurring: true,
          targetAmount: 2000,
          deadlineDday: 20,
          fundedRatio: 0.5,
        }}
        simulation={eightRoundsSimulation}
        monthlyKrw={150}
        safeRatioPct={50}
        splitRounds={8}
        safeRatioFloor={35}
        onBack={vi.fn()}
        onSetMonthlyKrw={vi.fn()}
        onSetSafeRatioPct={vi.fn()}
        onSetSplitRounds={vi.fn()}
        onResetParameters={vi.fn()}
        onCompleteRound={vi.fn()}
      />,
    );

    expect(screen.getByText("...외 4회 예정")).toBeInTheDocument();
    expect(screen.getByText("RECURRING")).toBeInTheDocument();
  });
});
