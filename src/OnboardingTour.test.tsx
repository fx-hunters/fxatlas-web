import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { OnboardingTour, TOUR_STEPS } from "./OnboardingTour";

describe("OnboardingTour", () => {
  const onCompleteMock = vi.fn();
  const onNavigateMock = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();

    // Mock DOM elements with data-tour
    document.body.innerHTML = `
      <button data-tour="tour-home">홈</button>
      <button data-tour="tour-range">환율 범위</button>
      <button data-tour="tour-assets">내 자산</button>
      <button data-tour="tour-planner">환전 플래너</button>
      <button data-tour="tour-mypage">마이페이지</button>
      <button data-tour="tour-theme">테마 전환</button>
    `;

    // Mock getBoundingClientRect
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      left: 20,
      top: 100,
      right: 220,
      bottom: 140,
      width: 200,
      height: 40,
      x: 20,
      y: 100,
      toJSON: () => {},
    }));
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = "";
  });

  it("초기에 웰컴 모달(Step 0)을 렌더링하고 건너뛰기를 누르면 onComplete를 호출한다", () => {
    render(<OnboardingTour onComplete={onCompleteMock} onNavigate={onNavigateMock} />);

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(screen.getByRole("dialog", { name: "온보딩 웰컴" })).toBeInTheDocument();
    expect(screen.getByText("DIVURVE에 오신 것을 환영합니다")).toBeInTheDocument();

    const skipBtn = screen.getByRole("button", { name: "건너뛰기" });
    fireEvent.click(skipBtn);
    expect(onCompleteMock).toHaveBeenCalledTimes(1);
  });

  it("웰컴 모달에서 투어 시작하기를 누르면 Step 1로 이동하고 스포트라이트와 툴팁을 표시한다", () => {
    render(<OnboardingTour onComplete={onCompleteMock} onNavigate={onNavigateMock} />);

    act(() => {
      vi.advanceTimersByTime(100);
    });

    const startBtn = screen.getByRole("button", { name: /투어 시작하기/ });
    fireEvent.click(startBtn);

    expect(onNavigateMock).toHaveBeenCalledWith("home");

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(screen.getByText("STEP 1 / 6")).toBeInTheDocument();
    expect(screen.getByText("홈 대시보드")).toBeInTheDocument();
  });

  it("Step 1부터 마지막 Step 6까지 순차적으로 진행 후 완료 시 onComplete를 호출한다", () => {
    render(<OnboardingTour onComplete={onCompleteMock} onNavigate={onNavigateMock} />);

    act(() => {
      vi.advanceTimersByTime(100);
    });

    // 0 -> 1
    fireEvent.click(screen.getByRole("button", { name: /투어 시작하기/ }));
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // 1 -> 2 (range)
    fireEvent.click(screen.getByRole("button", { name: "다음" }));
    expect(onNavigateMock).toHaveBeenCalledWith("range");
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(screen.getByText("환율 범위 예측")).toBeInTheDocument();

    // 2 -> 1 (이전)
    fireEvent.click(screen.getByRole("button", { name: "이전" }));
    expect(onNavigateMock).toHaveBeenCalledWith("home");
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(screen.getByText("홈 대시보드")).toBeInTheDocument();

    // 1단계에서 이전 버튼 클릭 시 아무 동작도 하지 않음
    const prevBtnAtStep1 = screen.getByRole("button", { name: "이전" });
    expect(prevBtnAtStep1).toBeDisabled();
    fireEvent.click(prevBtnAtStep1);
    expect(screen.getByText("홈 대시보드")).toBeInTheDocument();

    // 1 -> 2 -> 3 -> 4 -> 5 -> 6 (마지막까지 진행)
    for (let i = 1; i < TOUR_STEPS.length - 1; i++) {
      fireEvent.click(screen.getByRole("button", { name: "다음" }));
      act(() => {
        vi.advanceTimersByTime(100);
      });
    }

    expect(screen.getByText("다크/라이트 모드")).toBeInTheDocument();
    const completeBtn = screen.getByRole("button", { name: "완료" });
    expect(completeBtn).toBeInTheDocument();

    fireEvent.click(completeBtn);
    expect(onCompleteMock).toHaveBeenCalledTimes(1);
  });

  it("Step 1 이상에서 백드롭을 클릭하면 다음 단계로 이동하고, 툴팁 클릭 시 전파가 중단된다", () => {
    render(<OnboardingTour onComplete={onCompleteMock} onNavigate={onNavigateMock} />);

    act(() => {
      vi.advanceTimersByTime(100);
    });

    fireEvent.click(screen.getByRole("button", { name: /투어 시작하기/ }));
    act(() => {
      vi.advanceTimersByTime(100);
    });

    const tooltipDialog = screen.getByRole("dialog", { name: "온보딩 단계 1" });
    fireEvent.click(tooltipDialog);
    expect(screen.getByText("STEP 1 / 6")).toBeInTheDocument();

    // 백드롭 클릭
    const backdrop = document.querySelector('[aria-hidden="true"]');
    if (backdrop) {
      fireEvent.click(backdrop);
      act(() => {
        vi.advanceTimersByTime(100);
      });
      expect(screen.getByText("STEP 2 / 6")).toBeInTheDocument();
    }
  });

  it("Step 1 이상에서 건너뛰기 버튼을 누르면 onComplete가 호출된다", () => {
    render(<OnboardingTour onComplete={onCompleteMock} onNavigate={onNavigateMock} />);

    act(() => {
      vi.advanceTimersByTime(100);
    });

    fireEvent.click(screen.getByRole("button", { name: /투어 시작하기/ }));
    act(() => {
      vi.advanceTimersByTime(100);
    });

    const skipBtn = screen.getByRole("button", { name: "투어 종료" });
    fireEvent.click(skipBtn);
    expect(onCompleteMock).toHaveBeenCalledTimes(1);
  });

  it("타겟 엘리먼트가 DOM에 없을 때도 에러 없이 렌더링된다", () => {
    document.body.innerHTML = ""; // DOM 비우기

    render(<OnboardingTour onComplete={onCompleteMock} onNavigate={onNavigateMock} />);

    act(() => {
      vi.advanceTimersByTime(100);
    });

    fireEvent.click(screen.getByRole("button", { name: /투어 시작하기/ }));
    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(screen.getByText("STEP 1 / 6")).toBeInTheDocument();

    // resize 이벤트 트리거
    act(() => {
      window.dispatchEvent(new Event("resize"));
    });
  });
});
