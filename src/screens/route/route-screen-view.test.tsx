import { act, fireEvent, render, screen } from "@testing-library/react";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { loadRoutePlan } from "../../api/route";
import type { RoutePlanData } from "../../types/route";
import { RouteScreenView } from "./route-screen-view";
import { usePlannerInteraction } from "./use-planner-interaction";

async function getDemoRoutePlan(): Promise<RoutePlanData> {
  const data = await loadRoutePlan();
  if (data === null) {
    throw new Error("데모 플래너 fixture가 필요합니다.");
  }
  return data;
}

function RouteScreenViewHarness({ data }: { readonly data: RoutePlanData }) {
  const interaction = usePlannerInteraction();
  return <RouteScreenView data={data} interaction={interaction} />;
}

function completeDive(container: HTMLElement) {
  const stage = container.querySelector<HTMLElement>(".planner-dive__stage");
  if (stage === null) {
    throw new Error("Curve Dive 전환 요소가 필요합니다.");
  }
  fireEvent.animationEnd(stage);
}

beforeEach(() => {
  window.sessionStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("RouteScreenView", () => {
  it("플래너 첫 화면에 두 샘플과 새 계획 안내를 표시한다", async () => {
    render(<RouteScreenViewHarness data={await getDemoRoutePlan()} />);

    expect(
      screen.getByRole("heading", {
        name: "어떤 외화 목표를 준비하고 있나요?",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /미국 ETF 정기 투자/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /일본 여행 준비/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("기존 진단 결과 · 균형항로형 (데모 프로필)"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("진단 결과 없이도 체험할 수 있는 데모 목표"),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "새로운 계획 만들기" }),
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "새 계획 입력과 저장은 다음 API 계약에서 연결할 예정입니다.",
    );
  });

  it("첫 방문에 현재 위치, Curve, 다음 행동을 순서대로 공개한다", async () => {
    const data = await getDemoRoutePlan();
    vi.useFakeTimers();
    const view = render(<RouteScreenViewHarness data={data} />);

    fireEvent.click(
      screen.getByRole("button", { name: /예시로 먼저 체험하기/ }),
    );
    expect(
      view.container.querySelector(".planner-dive"),
    ).toHaveAttribute("data-entry-mode", "firstVisit");
    completeDive(view.container);

    expect(
      screen.getByRole("heading", {
        name: "미국 ETF 정기 투자",
        level: 2,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("3,000 USD")).toBeInTheDocument();
    expect(screen.getByText("1,260 USD 확보")).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "하나의 계획 Curve" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "상황이 바뀐다면?" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("계획 구성 · 준비 구간")).not.toBeInTheDocument();

    act(() => vi.advanceTimersByTime(620));
    expect(
      screen.getByRole("heading", { name: "하나의 계획 Curve" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "상황이 바뀐다면?" }),
    ).not.toBeInTheDocument();

    act(() => vi.advanceTimersByTime(1000));
    expect(
      screen.getByRole("button", { name: "상황이 바뀐다면?" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("145 USD").length).toBeGreaterThan(0);
    expect(
      view.container.querySelector('[data-curve-role="current"]'),
    ).toBeInTheDocument();
    expect(screen.queryByText("상황별 대체 계획")).not.toBeInTheDocument();
  });

  it("같은 목표 재방문은 짧은 진입 뒤 Curve와 다음 행동을 바로 표시한다", async () => {
    const data = await getDemoRoutePlan();
    vi.useFakeTimers();
    const view = render(<RouteScreenViewHarness data={data} />);

    fireEvent.click(
      screen.getByRole("button", { name: /미국 ETF 정기 투자/ }),
    );
    completeDive(view.container);
    act(() => vi.advanceTimersByTime(620));
    act(() => vi.advanceTimersByTime(1000));
    fireEvent.click(
      screen.getByRole("button", { name: /다른 목표 보기/ }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: /미국 ETF 정기 투자/ }),
    );

    expect(
      view.container.querySelector(".planner-dive"),
    ).toHaveAttribute("data-entry-mode", "returnVisit");
    expect(
      screen.getByText("계획 Curve로 돌아가고 있습니다."),
    ).toBeInTheDocument();
    completeDive(view.container);

    expect(
      screen.getByRole("heading", { name: "하나의 계획 Curve" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "상황이 바뀐다면?" }),
    ).toBeInTheDocument();
  });

  it("처음부터 다시 보기는 계획 데이터를 유지하고 공개 연출만 다시 실행한다", async () => {
    const data = await getDemoRoutePlan();
    window.sessionStorage.setItem(
      "divurve:planner-journey-seen:usd-etf-recurring-demo",
      "seen",
    );
    vi.useFakeTimers();
    const view = render(<RouteScreenViewHarness data={data} />);

    fireEvent.click(
      screen.getByRole("button", { name: /미국 ETF 정기 투자/ }),
    );
    completeDive(view.container);
    fireEvent.click(
      screen.getByRole("button", { name: "처음부터 다시 보기" }),
    );

    expect(
      screen.getByRole("heading", {
        name: "미국 ETF 정기 투자",
        level: 2,
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "하나의 계획 Curve" }),
    ).not.toBeInTheDocument();

    act(() => vi.advanceTimersByTime(620));
    act(() => vi.advanceTimersByTime(1000));
    expect(
      screen.getByRole("button", { name: "상황이 바뀐다면?" }),
    ).toBeInTheDocument();
  });

  it("reduced-motion 환경에서도 키보드로 마감형 샘플과 노드를 선택한다", async () => {
    const data = await getDemoRoutePlan();
    vi.useFakeTimers();
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockReturnValue({ matches: true } as MediaQueryList),
    );
    const view = render(<RouteScreenViewHarness data={data} />);
    const goalButton = screen.getByRole("button", { name: /일본 여행 준비/ });

    goalButton.focus();
    expect(goalButton).toHaveFocus();
    fireEvent.keyDown(goalButton, { key: "Enter", code: "Enter" });
    fireEvent.click(goalButton);
    completeDive(view.container);
    act(() => vi.advanceTimersByTime(80));
    act(() => vi.advanceTimersByTime(120));

    expect(screen.getAllByText("남은 기간 63일").length).toBeGreaterThan(0);
    expect(screen.getAllByText("180,000 JPY").length).toBeGreaterThan(0);
    expect(
      screen.getByRole("group", { name: /계획 경로/ }),
    ).toHaveAccessibleDescription(
      /세로축이나 환율 눈금 없이 현재 상태/,
    );

    const nextNode = view.container.querySelector<SVGGElement>(
      '[data-checkpoint-id="jpy-next"]',
    );
    if (nextNode === null) {
      throw new Error("다음 회차 노드가 필요합니다.");
    }
    nextNode.focus();
    fireEvent.keyDown(nextNode, { key: "Enter" });
    expect(
      screen.getByRole("button", { name: "이번 회차 기록" }),
    ).toBeInTheDocument();
  });
});
