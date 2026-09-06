import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { afterEach, describe, it, expect, vi } from "vitest";
import { fetchConnectivityChecks } from "../api/connectivity";
import { App } from "./app";

vi.mock("../api/connectivity", () => ({
  fetchConnectivityChecks: vi.fn().mockResolvedValue([]),
  createConnectivityCheck: vi.fn(),
}));

beforeEach(() => {
  localStorage.clear();
  vi.mocked(fetchConnectivityChecks).mockResolvedValue([]);
});

afterEach(() => {
  vi.mocked(fetchConnectivityChecks).mockClear();
});

describe("App", () => {
  it("초기에 랜딩 페이지를 렌더링하고, 대시보드 시작하기 클릭 시 온보딩 투어가 표시된다", async () => {
    render(<App />);
    expect(screen.getByText("가장 지능적인 환전 타이밍")).toBeInTheDocument();

    // 랜딩 페이지에서 테마 토글 버튼 클릭 (다크 -> 라이트 -> 다크)
    const landingThemeBtn = screen.getByRole("button", { name: "테마 전환" });
    fireEvent.click(landingThemeBtn);
    fireEvent.click(landingThemeBtn);

    const startBtn = screen.getByRole("button", { name: /대시보드 체험하기/ });
    fireEvent.click(startBtn);

    // 온보딩 웰컴 모달 표시 확인
    expect(screen.getByRole("dialog", { name: "온보딩 웰컴" })).toBeInTheDocument();

    // 투어 시작하기 클릭 -> onNavigate("home") 호출 및 STEP 1 렌더링
    const startTourBtn = screen.getByRole("button", { name: /투어 시작하기/ });
    fireEvent.click(startTourBtn);

    // STEP 1 툴팁이 렌더링될 때까지 대기 후 건너뛰기(투어 종료) 클릭
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "투어 종료" })).toBeInTheDocument();
    });
    const skipBtn = screen.getByRole("button", { name: "투어 종료" });
    fireEvent.click(skipBtn);

    expect(localStorage.getItem("divurve_tour_done")).toBe("1");
    expect(screen.getByRole("heading", { name: "DIVURVE" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "오늘의 행동 (이번 주 확보액)" })).toBeInTheDocument();
  });

  it("localStorage에 이미 투어 완료 기록이 있으면 투어를 띄우지 않고 즉시 대시보드로 진입한다", () => {
    localStorage.setItem("divurve_tour_done", "1");
    render(<App />);

    const startBtn = screen.getByRole("button", { name: /대시보드 체험하기/ });
    fireEvent.click(startBtn);

    expect(screen.queryByRole("dialog", { name: "온보딩 웰컴" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "DIVURVE" })).toBeInTheDocument();
  });

  it("localStorage 접근 에러가 발생해도 안전하게 투어를 표시하고 종료할 수 있다", () => {
    const getItemSpy = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });
    const setItemSpy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });

    render(<App />);
    const startBtn = screen.getByRole("button", { name: /대시보드 체험하기/ });
    fireEvent.click(startBtn);

    expect(screen.getByRole("dialog", { name: "온보딩 웰컴" })).toBeInTheDocument();

    const skipBtn = screen.getByRole("button", { name: "건너뛰기" });
    fireEvent.click(skipBtn);

    expect(screen.getByRole("heading", { name: "DIVURVE" })).toBeInTheDocument();

    getItemSpy.mockRestore();
    setItemSpy.mockRestore();
  });

  it("사이드바 탭 클릭 시 해당 화면으로 전환된다", async () => {
    localStorage.setItem("divurve_tour_done", "1");
    render(<App />);

    // 랜딩 페이지 -> 대시보드 진입
    const startBtn = screen.getByRole("button", { name: /대시보드 체험하기/ });
    fireEvent.click(startBtn);

    // 환전 플래너 탭으로 이동
    const plannerBtns = screen.getAllByRole("button", { name: /환전 플래너/ });
    fireEvent.click(plannerBtns[0]);
    expect(screen.getByRole("heading", { name: "환전 플래너", level: 2 })).toBeInTheDocument();

    // 내 자산 탭으로 이동
    const assetsBtns = screen.getAllByRole("button", { name: /내 자산/ });
    fireEvent.click(assetsBtns[0]);
    expect(screen.getByRole("heading", { name: "내 자산", level: 2 })).toBeInTheDocument();

    // 환율 범위 탭으로 이동
    const rangeBtns = screen.getAllByRole("button", { name: /환율 범위/ });
    fireEvent.click(rangeBtns[0]);
    expect(screen.getByRole("heading", { name: "환율 범위", level: 2 })).toBeInTheDocument();

    // 마이페이지 탭으로 이동
    const mypageBtns = screen.getAllByRole("button", { name: /마이페이지/ });
    fireEvent.click(mypageBtns[0]);
    expect(screen.getByRole("heading", { name: "마이페이지", level: 2 })).toBeInTheDocument();

    // 연결 확인 탭으로 이동
    const connBtns = screen.getAllByRole("button", { name: /연결 확인/ });
    fireEvent.click(connBtns[0]);
    expect(screen.getByRole("heading", { name: "연결 확인 (Connectivity Check)" })).toBeInTheDocument();

    await waitFor(() => {
      expect(fetchConnectivityChecks).toHaveBeenCalled();
    });
  });

  it("헤더의 마이페이지 아바타 버튼 클릭 시 마이페이지로 이동한다", () => {
    localStorage.setItem("divurve_tour_done", "1");
    render(<App />);
    const startBtn = screen.getByRole("button", { name: /대시보드 체험하기/ });
    fireEvent.click(startBtn);

    const avatarBtn = screen.getByRole("button", { name: "마이페이지 이동" });
    fireEvent.click(avatarBtn);
    expect(screen.getByRole("heading", { name: "마이페이지", level: 2 })).toBeInTheDocument();
  });

  it("데모 모드 토글 및 테마 토글이 정상 동작한다", () => {
    localStorage.setItem("divurve_tour_done", "1");
    render(<App />);
    const startBtn = screen.getByRole("button", { name: /대시보드 체험하기/ });
    fireEvent.click(startBtn);

    const demoToggle = screen.getByRole("button", { name: /데모 데이터 켜짐/ });
    expect(demoToggle).toBeInTheDocument();

    fireEvent.click(demoToggle);
    expect(screen.getByRole("button", { name: /빈 상태 보기/ })).toBeInTheDocument();

    const themeToggle = screen.getByRole("button", { name: /라이트 모드로 변경/ });
    fireEvent.click(themeToggle);
    expect(screen.getByRole("button", { name: /다크 모드로 변경/ })).toBeInTheDocument();
  });

  it("모바일 하단 내비게이션 탭 클릭 시 화면이 전환된다", () => {
    localStorage.setItem("divurve_tour_done", "1");
    render(<App />);
    const startBtn = screen.getByRole("button", { name: /대시보드 체험하기/ });
    fireEvent.click(startBtn);

    const mobileNav = screen.getByRole("navigation", { name: "모바일 하단 내비게이션" });
    const mobilePlannerBtn = mobileNav.querySelector("button:nth-child(2)");
    if (mobilePlannerBtn) {
      fireEvent.click(mobilePlannerBtn);
      expect(screen.getByRole("heading", { name: "환전 플래너", level: 2 })).toBeInTheDocument();
    }
  });

  it("온보딩 투어 진행 중 다음 단계 이동 시 해당 탭으로 화면이 자동 전환된다", async () => {
    render(<App />);
    const startBtn = screen.getByRole("button", { name: /대시보드 체험하기/ });
    fireEvent.click(startBtn);

    // 투어 시작하기 (Step 0 -> Step 1: home)
    const startTourBtn = screen.getByRole("button", { name: /투어 시작하기/ });
    fireEvent.click(startTourBtn);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "다음" })).toBeInTheDocument();
    });

    // Step 1 -> Step 2: range
    const nextBtn = screen.getByRole("button", { name: "다음" });
    fireEvent.click(nextBtn);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "환율 범위", level: 2 })).toBeInTheDocument();
    });
  });

  it("랜딩 페이지에서 로그인 버튼 클릭 시 AuthPage 로그인 탭으로 이동하고 홈으로 돌아갈 수 있다", () => {
    render(<App />);

    const loginBtn = screen.getByRole("button", { name: "로그인" });
    fireEvent.click(loginBtn);

    // AuthPage 로그인 폼 노출 확인
    expect(screen.getByLabelText("이메일")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "로그인" })).toBeInTheDocument();

    // 홈으로 돌아가기 클릭
    const backBtn = screen.getAllByRole("button", { name: /홈/ })[0];
    fireEvent.click(backBtn);

    expect(screen.getByText("가장 지능적인 환전 타이밍")).toBeInTheDocument();
  });

  it("랜딩 페이지에서 무료 시작 클릭 시 AuthPage 회원가입 탭으로 이동하고 인증 완료 시 대시보드로 이동한다", () => {
    localStorage.setItem("divurve_tour_done", "1");
    render(<App />);

    const signupBtn = screen.getByRole("button", { name: /무료 시작/ });
    fireEvent.click(signupBtn);

    // AuthPage 회원가입 폼 노출 확인
    expect(screen.getByLabelText("이름")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "가입하기" })).toBeInTheDocument();

    // 소셜 로그인 클릭으로 인증 완료 트리거
    const googleBtn = screen.getByRole("button", { name: "구글로 시작하기" });
    fireEvent.click(googleBtn);

    expect(screen.getByRole("heading", { name: "DIVURVE" })).toBeInTheDocument();
  });

  it("마이페이지에서 로그아웃 버튼 클릭 시 랜딩 페이지로 복귀한다", () => {
    localStorage.setItem("divurve_tour_done", "1");
    render(<App />);

    // 대시보드 진입
    const startBtn = screen.getByRole("button", { name: /대시보드 체험하기/ });
    fireEvent.click(startBtn);

    // 마이페이지로 이동
    const mypageBtn = screen.getAllByRole("button", { name: /마이페이지/ })[0];
    fireEvent.click(mypageBtn);
    expect(screen.getByRole("heading", { name: "마이페이지", level: 2 })).toBeInTheDocument();

    // 로그아웃 버튼 클릭
    const logoutBtn = screen.getByRole("button", { name: "로그아웃" });
    fireEvent.click(logoutBtn);

    // 랜딩 페이지로 복귀 확인
    expect(screen.getByText("가장 지능적인 환전 타이밍")).toBeInTheDocument();
  });
});
