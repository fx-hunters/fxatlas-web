import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { InitialSetupScreen } from "./initial-setup-screen";

describe("InitialSetupScreen", () => {
  it("첫 화면에는 설명 분야 단계만 표시한다", () => {
    render(<InitialSetupScreen onComplete={vi.fn()} />);

    expect(
      screen.getByRole("heading", {
        name: "어떤 분야의 설명이 가장 익숙한가요?",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("1 / 3")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "33",
    );
    expect(screen.queryByText("보유 자산을 알려주세요")).not.toBeInTheDocument();
    expect(screen.queryByText("간편 위험성향 진단")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "이전" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "다음" })).toBeDisabled();
  });

  it("이전과 다음으로 이동해도 선택 및 자산 입력을 유지한다", () => {
    render(<InitialSetupScreen onComplete={vi.fn()} />);

    fireEvent.click(screen.getByRole("radio", { name: /금융·경제/ }));
    fireEvent.click(screen.getByRole("button", { name: "다음" }));

    expect(
      screen.getByRole("heading", { name: "보유 자산을 알려주세요" }),
    ).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("해외주식 금액"), {
      target: { value: "1200000" },
    });
    fireEvent.click(screen.getByRole("button", { name: "이전" }));

    expect(screen.getByRole("radio", { name: /금융·경제/ })).toBeChecked();
    fireEvent.click(screen.getByRole("button", { name: "다음" }));
    expect(screen.getByLabelText("해외주식 금액")).toHaveValue("1200000");

    fireEvent.click(screen.getByRole("button", { name: "다음" }));
    expect(
      screen.getByRole("heading", { name: "간편 위험성향 진단" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Q1")).toBeInTheDocument();
    expect(screen.getByText("Q2")).toBeInTheDocument();
    expect(screen.getByText("Q3")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "초기 설정 마치기" }),
    ).toBeDisabled();
  });

  it("각 단계를 건너뛰면 기본값 없이 완료 결과를 전달한다", () => {
    const onComplete = vi.fn();
    render(<InitialSetupScreen onComplete={onComplete} />);

    fireEvent.click(screen.getByRole("button", { name: "건너뛰기" }));
    expect(screen.getByText("2 / 3")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "건너뛰기" }));
    expect(screen.getByText("3 / 3")).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "이 단계 건너뛰고 마치기" }),
    );

    expect(onComplete).toHaveBeenCalledWith({
      draft: {},
      skippedSteps: ["explanationDomain", "assets", "riskProfile"],
    });
  });

  it("360px 모바일에서도 진행률과 주요 조작을 제공한다", () => {
    const originalWidth = window.innerWidth;
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 360,
    });

    const { container } = render(<InitialSetupScreen onComplete={vi.fn()} />);

    expect(container.querySelector(".initial-setup")).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "초기 설정 진행률" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "건너뛰기" })).toBeVisible();
    expect(screen.getByRole("button", { name: "이전" })).toBeVisible();
    expect(screen.getByRole("button", { name: "다음" })).toBeVisible();

    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: originalWidth,
    });
  });
});
