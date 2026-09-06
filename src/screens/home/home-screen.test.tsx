import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { HomeScreen } from "./home-screen";

describe("HomeScreen", () => {
  it("데모 모드일 때 대시보드 뷰를 렌더링하고 다른 화면 이동 핸들러를 연결한다", () => {
    const onNavigate = vi.fn();
    render(<HomeScreen isDemo={true} onNavigate={onNavigate} />);

    expect(screen.getByRole("heading", { name: "오늘의 행동 (이번 주 확보액)" })).toBeInTheDocument();

    const assetsLink = screen.getByRole("button", { name: "자산 등록 / 편집" });
    fireEvent.click(assetsLink);
    expect(onNavigate).toHaveBeenCalledWith("assets");

    const plannerLink = screen.getByRole("button", { name: "플래너 확인하기 →" });
    fireEvent.click(plannerLink);
    expect(onNavigate).toHaveBeenCalledWith("planner");
  });

  it("API 빈 상태일 때 HomeEmptyView를 렌더링하고 플래너로 이동할 수 있다", async () => {
    const onNavigate = vi.fn();
    const loadSummary = vi.fn().mockResolvedValue({ data: {}, meta: { timestamp: "" } });
    render(<HomeScreen isDemo={false} onNavigate={onNavigate} loadSummary={loadSummary} />);

    expect(await screen.findByRole("heading", { name: "외화 목표가 없습니다" })).toBeInTheDocument();

    const plannerBtn = screen.getByRole("button", { name: "환전 플래너로 이동" });
    fireEvent.click(plannerBtn);
    expect(onNavigate).toHaveBeenCalledWith("planner");
  });

  it("API 로딩, 오류, 재시도와 성공 상태를 표시한다", async () => {
    let resolveFirst!: (value: {
      data: { notice: { message: string } };
      meta: { timestamp: string };
    }) => void;
    const first = new Promise<{
      data: { notice: { message: string } };
      meta: { timestamp: string };
    }>((resolve) => {
      resolveFirst = resolve;
    });
    const loadSummary = vi
      .fn()
      .mockReturnValueOnce(first)
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValueOnce({
        data: { notice: { message: "연결됨" } },
        meta: { timestamp: "" },
      });
    const { rerender } = render(
      <HomeScreen
        isDemo={false}
        onNavigate={vi.fn()}
        loadSummary={loadSummary}
      />,
    );

    expect(screen.getByText("홈 정보를 불러오는 중입니다")).toBeInTheDocument();
    resolveFirst({
      data: { notice: { message: "첫 응답" } },
      meta: { timestamp: "" },
    });
    expect(await screen.findByText("첫 응답")).toBeInTheDocument();

    const secondLoader = () => loadSummary();
    rerender(
      <HomeScreen
        isDemo={false}
        onNavigate={vi.fn()}
        loadSummary={secondLoader}
      />,
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "홈 정보를 불러오지 못했습니다",
    );
    fireEvent.click(screen.getByRole("button", { name: "다시 시도" }));
    expect(await screen.findByText("연결됨")).toBeInTheDocument();
  });
});
