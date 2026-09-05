import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { GoalListView } from "./goal-list-view";
import { DEMO_GOALS } from "./use-route-planner";

describe("GoalListView", () => {
  it("목표 목록과 헤더 액션 버튼을 렌더링한다", () => {
    const onSelectGoal = vi.fn();
    const onCreateNew = vi.fn();

    render(
      <GoalListView
        goals={DEMO_GOALS}
        onSelectGoal={onSelectGoal}
        onCreateNew={onCreateNew}
      />,
    );

    expect(screen.getByRole("heading", { name: "목표 목록" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "새 목표 만들기 +" })).toBeInTheDocument();
    expect(screen.getByText("미국 주식 정기매수")).toBeInTheDocument();
    expect(screen.getByText("도쿄 여행 경비")).toBeInTheDocument();

    fireEvent.click(screen.getByText("미국 주식 정기매수"));
    expect(onSelectGoal).toHaveBeenCalledWith("goal-1");

    fireEvent.click(screen.getByRole("button", { name: "새 목표 만들기 +" }));
    expect(onCreateNew).toHaveBeenCalled();
  });

  it("키보드 Enter 및 Space 키로 목표를 선택할 수 있다", () => {
    const onSelectGoal = vi.fn();
    render(
      <GoalListView
        goals={DEMO_GOALS}
        onSelectGoal={onSelectGoal}
        onCreateNew={vi.fn()}
      />,
    );

    const goalCards = screen.getAllByRole("button");
    const firstCard = goalCards.find((el) => el.textContent?.includes("미국 주식 정기매수"));
    expect(firstCard).toBeDefined();

    if (firstCard) {
      fireEvent.keyDown(firstCard, { key: "Enter" });
      expect(onSelectGoal).toHaveBeenCalledWith("goal-1");

      fireEvent.keyDown(firstCard, { key: " " });
      expect(onSelectGoal).toHaveBeenCalledWith("goal-1");

      fireEvent.keyDown(firstCard, { key: "Escape" });
    }
  });

  it("목표 카드의 수정 및 삭제 버튼을 클릭할 수 있다", () => {
    const onSelectGoal = vi.fn();
    const onCreateNew = vi.fn();
    const onEditGoal = vi.fn();
    const onDeleteGoal = vi.fn();

    render(
      <GoalListView
        goals={DEMO_GOALS}
        onSelectGoal={onSelectGoal}
        onCreateNew={onCreateNew}
        onEditGoal={onEditGoal}
        onDeleteGoal={onDeleteGoal}
      />,
    );

    const editBtn = screen.getByRole("button", { name: "미국 주식 정기매수 수정" });
    fireEvent.click(editBtn);
    expect(onEditGoal).toHaveBeenCalledWith("goal-1");

    const deleteBtn = screen.getByRole("button", { name: "미국 주식 정기매수 삭제" });
    fireEvent.click(deleteBtn);
    expect(onDeleteGoal).toHaveBeenCalledWith("goal-1");
  });

  it("EUR 통화 및 목표가 없을 때 빈 상태 안내 문구를 표시한다", () => {
    const { rerender } = render(
      <GoalListView
        goals={[
          {
            id: "goal-3",
            name: "유럽 출장",
            category: "기타 외화 지출",
            currency: "EUR",
            isRecurring: false,
            targetAmount: 800,
            deadlineDday: 7,
            fundedRatio: 0.8,
          },
        ]}
        onSelectGoal={vi.fn()}
        onCreateNew={vi.fn()}
      />,
    );

    expect(screen.getByText(/€ 800/)).toBeInTheDocument();

    rerender(
      <GoalListView
        goals={[]}
        onSelectGoal={vi.fn()}
        onCreateNew={vi.fn()}
      />,
    );

    expect(
      screen.getByText("아직 외화 목표가 없습니다. 첫 목표를 만들어보세요."),
    ).toBeInTheDocument();
  });
});
