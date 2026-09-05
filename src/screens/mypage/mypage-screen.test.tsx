import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { MyPageScreen } from "./mypage-screen";
import { useMyPage, NOTIFICATION_OPTIONS } from "./use-mypage";

describe("useMyPage hook", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("initializes with default demo profile and preferences", () => {
    const { result } = renderHook(() => useMyPage(true));
    expect(result.current.profile.name).toBe("김데모");
    expect(result.current.profile.email).toBe("demo.kim@example.com");
    expect(result.current.profile.riskProfile).toBe("안정 추구형");
    expect(result.current.bankPreferentialRate).toBe(80);
    expect(result.current.effectiveSpread).toBe("0.2");
    expect(result.current.notifications.budgetWarning).toBe(true);
    expect(result.current.notifications.opportunityBucket).toBe(false);
  });

  it("updates bank preferential rate and clamps between 0 and 100", () => {
    const { result } = renderHook(() => useMyPage(true));

    act(() => {
      result.current.setBankPreferentialRate(90);
    });
    expect(result.current.bankPreferentialRate).toBe(90);
    expect(result.current.effectiveSpread).toBe("0.1");

    act(() => {
      result.current.setBankPreferentialRate(120);
    });
    expect(result.current.bankPreferentialRate).toBe(100);
    expect(result.current.effectiveSpread).toBe("0.0");

    act(() => {
      result.current.setBankPreferentialRate(-10);
    });
    expect(result.current.bankPreferentialRate).toBe(0);
    expect(result.current.effectiveSpread).toBe("1.0");
  });

  it("toggles notification flags properly", () => {
    const { result } = renderHook(() => useMyPage(true));
    expect(result.current.notifications.opportunityBucket).toBe(false);

    act(() => {
      result.current.toggleNotification("opportunityBucket");
    });
    expect(result.current.notifications.opportunityBucket).toBe(true);

    act(() => {
      result.current.toggleNotification("budgetWarning");
    });
    expect(result.current.notifications.budgetWarning).toBe(false);
  });

  it("handles password change toast and auto-clears after 3 seconds", () => {
    const { result } = renderHook(() => useMyPage(true));
    expect(result.current.toastMessage).toBeNull();

    act(() => {
      result.current.handlePasswordChange();
    });
    expect(result.current.toastMessage).toBe("비밀번호 변경 안내 메일이 발송되었습니다.");

    act(() => {
      vi.advanceTimersByTime(3100);
    });
    expect(result.current.toastMessage).toBeNull();
  });

  it("handles re-diagnosis and cycles through risk profiles", () => {
    const { result } = renderHook(() => useMyPage(true));
    expect(result.current.profile.riskProfile).toBe("안정 추구형");

    act(() => {
      result.current.handleRediagnosis();
    });
    expect(result.current.profile.riskProfile).toBe("위험 중립형");
    expect(result.current.toastMessage).toBe("의사결정 성향이 재진단되었습니다.");

    act(() => {
      result.current.handleRediagnosis();
    });
    expect(result.current.profile.riskProfile).toBe("적극 투자형");

    act(() => {
      result.current.handleRediagnosis();
    });
    expect(result.current.profile.riskProfile).toBe("안정 추구형");
  });

  it("handles consecutive toasts without premature clearance", () => {
    const { result } = renderHook(() => useMyPage(true));
    act(() => {
      result.current.handlePasswordChange();
    });
    expect(result.current.toastMessage).toBe("비밀번호 변경 안내 메일이 발송되었습니다.");

    // Advance 1s and trigger rediagnosis toast
    act(() => {
      vi.advanceTimersByTime(1000);
      result.current.handleRediagnosis();
    });
    expect(result.current.toastMessage).toBe("의사결정 성향이 재진단되었습니다.");

    // Advance 2.1s (total 3.1s since first toast, 2.1s since second toast)
    act(() => {
      vi.advanceTimersByTime(2100);
    });
    // Second toast should still be active
    expect(result.current.toastMessage).toBe("의사결정 성향이 재진단되었습니다.");

    // Advance remaining 1s
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.toastMessage).toBeNull();
  });

  it("supports manual toast clear", () => {
    const { result } = renderHook(() => useMyPage(true));
    act(() => {
      result.current.handlePasswordChange();
    });
    expect(result.current.toastMessage).toBeTruthy();

    act(() => {
      result.current.clearToast();
    });
    expect(result.current.toastMessage).toBeNull();
  });
});

describe("MyPageScreen Component", () => {
  it("renders user profile info correctly", () => {
    render(<MyPageScreen />);
    expect(screen.getByText("김데모")).toBeInTheDocument();
    expect(screen.getByText("demo.kim@example.com")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "비밀번호 변경" })).toBeInTheDocument();
  });

  it("renders risk decision profile and triggers re-diagnosis", () => {
    render(<MyPageScreen />);
    expect(screen.getByText("의사결정 프로필 (투자성향)")).toBeInTheDocument();
    expect(screen.getByText(/안전 버킷 하한과 집중도 기준선/)).toBeInTheDocument();
    expect(screen.getByText("안정 추구형")).toBeInTheDocument();
    expect(screen.getByText(/진단일:/)).toBeInTheDocument();

    const rediagnosisBtn = screen.getByRole("button", { name: "재진단" });
    fireEvent.click(rediagnosisBtn);
    expect(screen.getByText("위험 중립형")).toBeInTheDocument();
  });

  it("handles password change click feedback toast", () => {
    render(<MyPageScreen />);
    const pwdBtn = screen.getByRole("button", { name: "비밀번호 변경" });
    fireEvent.click(pwdBtn);
    expect(screen.getByText("비밀번호 변경 안내 메일이 발송되었습니다.")).toBeInTheDocument();
  });

  it("renders and updates bank preferential rate slider", () => {
    render(<MyPageScreen />);
    expect(screen.getByText("주거래 은행 우대율")).toBeInTheDocument();
    expect(screen.getByText("80%")).toBeInTheDocument();
    expect(screen.getByText(/실효 스프레드: 약 0.2%/)).toBeInTheDocument();

    const slider = screen.getByLabelText("주거래 은행 우대율");
    fireEvent.change(slider, { target: { value: "90" } });

    expect(screen.getByText("90%")).toBeInTheDocument();
    expect(screen.getByText(/실효 스프레드: 약 0.1%/)).toBeInTheDocument();
  });

  it("renders notification checkboxes and allows toggling", () => {
    render(<MyPageScreen />);
    expect(screen.getByText("알림 설정 (계획 변화 기준)")).toBeInTheDocument();

    for (const opt of NOTIFICATION_OPTIONS) {
      expect(screen.getByText(opt.label)).toBeInTheDocument();
    }

    const budgetCheckbox = screen.getByLabelText("예산 부족 경고");
    expect(budgetCheckbox).toBeChecked();
    fireEvent.click(budgetCheckbox);
    expect(budgetCheckbox).not.toBeChecked();

    const opportunityCheckbox = screen.getByLabelText("기회 버킷 실행 알림");
    expect(opportunityCheckbox).not.toBeChecked();
    fireEvent.click(opportunityCheckbox);
    expect(opportunityCheckbox).toBeChecked();
  });

  it("triggers navigation when shortcut buttons are clicked", () => {
    const handleNavigate = vi.fn();
    render(<MyPageScreen onNavigate={handleNavigate} />);

    const assetShortcutBtn = screen.getByRole("button", { name: /자산 내역 편집/ });
    fireEvent.click(assetShortcutBtn);
    expect(handleNavigate).toHaveBeenCalledWith("assets");

    const plannerShortcutBtn = screen.getByRole("button", { name: /외화 목표 편집/ });
    fireEvent.click(plannerShortcutBtn);
    expect(handleNavigate).toHaveBeenCalledWith("planner");
  });

  it("handles navigation click when onNavigate is not provided without crashing", () => {
    render(<MyPageScreen />);
    const assetShortcutBtn = screen.getByRole("button", { name: /자산 내역 편집/ });
    expect(() => fireEvent.click(assetShortcutBtn)).not.toThrow();

    const plannerShortcutBtn = screen.getByRole("button", { name: /외화 목표 편집/ });
    expect(() => fireEvent.click(plannerShortcutBtn)).not.toThrow();
  });

  it("handles mouseEnter and mouseLeave interactions on buttons and labels", () => {
    render(<MyPageScreen />);
    const pwdBtn = screen.getByRole("button", { name: "비밀번호 변경" });
    fireEvent.mouseEnter(pwdBtn);
    fireEvent.mouseLeave(pwdBtn);

    const rediagnosisBtn = screen.getByRole("button", { name: "재진단" });
    fireEvent.mouseEnter(rediagnosisBtn);
    fireEvent.mouseLeave(rediagnosisBtn);

    const assetShortcutBtn = screen.getByRole("button", { name: /자산 내역 편집/ });
    fireEvent.mouseEnter(assetShortcutBtn);
    fireEvent.mouseLeave(assetShortcutBtn);

    const plannerShortcutBtn = screen.getByRole("button", { name: /외화 목표 편집/ });
    fireEvent.mouseEnter(plannerShortcutBtn);
    fireEvent.mouseLeave(plannerShortcutBtn);

    const budgetCheckbox = screen.getByLabelText("예산 부족 경고");
    const labelElem = budgetCheckbox.closest("label");
    if (labelElem) {
      fireEvent.mouseEnter(labelElem);
      fireEvent.mouseLeave(labelElem);
    }
  });
});
