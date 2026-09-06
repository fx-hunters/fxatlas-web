import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ApiError } from "../../api/client";
import { PLANNER_API_FIXTURE } from "../../test/api-fixtures";
import type { PlannerApiDependencies } from "./use-planner-api";
import { PlannerApiScreen } from "./planner-api-screen";
import { RouteScreen } from "./route-screen";

const COMPLETE_RESULT = {
  seq: 2,
  status: "completed",
  executedAmount: 145,
  executedRate: 1_400,
  remainingAmount: 1_595,
};
const SKIP_RESULT = {
  redistributed: { perStepBefore: 145, perStepAfter: 160, increasePct: 10.3 },
  achieveProb: { before: 0.8, after: 0.75 },
  consecutiveSkips: 1,
  safeModeTriggered: false,
  newPlanVersion: 3,
};

function makeDependencies(
  overrides: Partial<PlannerApiDependencies> = {},
): PlannerApiDependencies {
  return {
    load: vi.fn().mockResolvedValue(PLANNER_API_FIXTURE),
    complete: vi.fn().mockResolvedValue(COMPLETE_RESULT),
    skip: vi.fn().mockResolvedValue(SKIP_RESULT),
    ...overrides,
  };
}

describe("PlannerApiScreen", () => {
  it("목표·활성 계획을 표시하고 회차 완료를 서버에 전달한다", async () => {
    let resolveComplete!: (value: typeof COMPLETE_RESULT) => void;
    const completePromise = new Promise<typeof COMPLETE_RESULT>((resolve) => {
      resolveComplete = resolve;
    });
    const deps = makeDependencies({
      complete: vi.fn().mockReturnValue(completePromise),
    });
    render(<PlannerApiScreen dependencies={deps} />);

    expect(screen.getByText("플래너를 불러오는 중입니다")).toBeInTheDocument();
    expect(await screen.findByRole("region", { name: "API 플래너" })).toBeInTheDocument();
    expect(screen.getByText("서버가 반환한 계획 설명입니다.")).toBeInTheDocument();
    expect(screen.getByText(/2026-09-12/)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("실행 외화 금액"), {
      target: { value: "150" },
    });
    fireEvent.change(screen.getByLabelText("실행 환율"), {
      target: { value: "1395" },
    });
    fireEvent.click(screen.getByRole("button", { name: "이번 회차 기록" }));
    expect(screen.getByRole("status")).toHaveTextContent("서버에 반영 중");
    expect(screen.getByRole("button", { name: "이번 회차 기록" })).toBeDisabled();
    resolveComplete(COMPLETE_RESULT);
    await waitFor(() =>
      expect(deps.complete).toHaveBeenCalledWith(
        "plan-usd",
        2,
        { executedAmount: 150, executedRate: 1_395 },
      ),
    );
    expect(await screen.findByRole("status")).toHaveTextContent(
      "2회차 기록을 서버에 저장했습니다",
    );
  });

  it("목표를 바꾸면 목표일 기본 문구와 계획 없음 안내를 표시한다", async () => {
    render(<PlannerApiScreen dependencies={makeDependencies()} />);
    await screen.findByRole("region", { name: "API 플래너" });
    fireEvent.click(screen.getByRole("button", { name: "일본 여행 준비" }));
    expect(screen.getByText("미설정")).toBeInTheDocument();
    expect(screen.getByText(/저장된 활성 계획이 없습니다/)).toBeInTheDocument();
  });

  it("건너뛰기 오류와 완료된 계획의 비활성 상태를 표시한다", async () => {
    const completedOverview = {
      items: [{
        ...PLANNER_API_FIXTURE.items[0]!,
        activePlan: {
          ...PLANNER_API_FIXTURE.items[0]!.activePlan!,
          isActive: false,
          steps: PLANNER_API_FIXTURE.items[0]!.activePlan!.steps.map((step) => ({
            ...step,
            status: "completed",
          })),
        },
      }],
    };
    render(
      <PlannerApiScreen
        dependencies={makeDependencies({
          load: vi.fn().mockResolvedValue(completedOverview),
        })}
      />,
    );
    expect(await screen.findByText("비활성")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "이번 회차 기록" })).not.toBeInTheDocument();

    const deps = makeDependencies({
      skip: vi.fn().mockRejectedValue(new ApiError("건너뛰기 API 오류", 500, "SERVER")),
    });
    const { unmount } = render(<PlannerApiScreen dependencies={deps} />);
    await screen.findAllByRole("region", { name: "API 플래너" });
    const skipButtons = screen.getAllByRole("button", { name: "이번 회차 건너뛰기" });
    fireEvent.click(skipButtons[skipButtons.length - 1]!);
    expect(await screen.findByRole("alert")).toHaveTextContent("건너뛰기 API 오류");
    unmount();
  });

  it("빈 상태를 표시한다", async () => {
    render(
      <PlannerApiScreen
        dependencies={makeDependencies({
          load: vi.fn().mockResolvedValue({ items: [] }),
        })}
      />,
    );
    expect(await screen.findByText("등록된 외화 목표가 없습니다")).toBeInTheDocument();
  });

  it("조회 오류를 재시도한다", async () => {
    const load = vi
      .fn()
      .mockRejectedValueOnce(new ApiError("플래너 API 오류", 500, "SERVER"))
      .mockResolvedValueOnce(PLANNER_API_FIXTURE);
    render(<PlannerApiScreen dependencies={makeDependencies({ load })} />);
    expect(await screen.findByRole("alert")).toHaveTextContent("플래너 API 오류");
    fireEvent.click(screen.getByRole("button", { name: "다시 시도" }));
    expect(await screen.findByRole("region", { name: "API 플래너" })).toBeInTheDocument();
  });

  it("상위 Route 화면의 API 모드 분기를 사용한다", async () => {
    render(
      <RouteScreen
        isDemo={false}
        apiDependencies={makeDependencies({
          load: vi.fn().mockResolvedValue({ items: [] }),
        })}
      />,
    );
    expect(await screen.findByText("등록된 외화 목표가 없습니다")).toBeInTheDocument();
  });
});
