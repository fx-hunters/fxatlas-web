import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { GoalFormView } from "./goal-form-view";
import { DEMO_GOALS } from "./use-route-planner";

describe("GoalFormView", () => {
  it("새 목표 생성 폼을 렌더링하고 입력 후 제출할 수 있다", () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();

    render(<GoalFormView onSubmit={onSubmit} onCancel={onCancel} />);

    expect(screen.getByRole("heading", { name: "새 목표 생성" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /특정일 사용 \(단건\)/ }));
    fireEvent.change(screen.getByLabelText("2. 세부 목적"), {
      target: { value: "유학/송금" },
    });
    fireEvent.change(screen.getByLabelText("3. 목표 이름"), {
      target: { value: "유럽 배낭여행" },
    });
    fireEvent.change(screen.getByLabelText("4. 통화"), {
      target: { value: "EUR" },
    });
    fireEvent.change(screen.getByLabelText("5. 목표 금액 (외화)"), {
      target: { value: "2500" },
    });
    fireEvent.change(screen.getByLabelText(/목표 사용일/), {
      target: { value: "2026-12-01" },
    });

    fireEvent.click(screen.getByRole("button", { name: "계획 수립하기" }));

    expect(onSubmit).toHaveBeenCalledWith({
      purposeType: "single",
      category: "유학/송금",
      name: "유럽 배낭여행",
      currency: "EUR",
      targetAmount: 2500,
      targetDate: "2026-12-01",
    });

    fireEvent.click(screen.getByRole("button", { name: "취소" }));
    expect(onCancel).toHaveBeenCalled();
  });

  it("이름을 입력하지 않고 제출할 때 기본 이름이 적용된다", () => {
    const onSubmit = vi.fn();
    render(<GoalFormView onSubmit={onSubmit} onCancel={vi.fn()} />);

    // 정기 매수 기본 이름
    fireEvent.click(screen.getByRole("button", { name: /정기 매수 \(반복\)/ }));
    fireEvent.change(screen.getByLabelText("3. 목표 이름"), { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: "계획 수립하기" }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "정기 외화 매수",
        purposeType: "recurring",
      }),
    );

    // 단건 사용 기본 이름 및 기본 목표 금액
    fireEvent.click(screen.getByRole("button", { name: /특정일 사용 \(단건\)/ }));
    fireEvent.change(screen.getByLabelText("3. 목표 이름"), { target: { value: "" } });
    fireEvent.change(screen.getByLabelText("5. 목표 금액 (외화)"), { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: "계획 수립하기" }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "외화 목표",
        purposeType: "single",
        targetAmount: 1000,
      }),
    );
  });

  it("기존 목표 수정 모드일 때 초기값을 렌더링하고 삭제 버튼을 제공한다", () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();
    const onDelete = vi.fn();

    render(
      <GoalFormView
        initialGoal={DEMO_GOALS[0]}
        onSubmit={onSubmit}
        onCancel={onCancel}
        onDelete={onDelete}
      />,
    );

    expect(screen.getByRole("heading", { name: "목표 수정" })).toBeInTheDocument();
    expect(screen.getByDisplayValue("미국 주식 정기매수")).toBeInTheDocument();
    expect(screen.getByDisplayValue("1200")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "목표 삭제하기" }));
    expect(onDelete).toHaveBeenCalledWith("goal-1");
  });
});
