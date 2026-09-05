import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { afterEach, describe, it, expect, vi } from "vitest";
import { fetchConnectivityChecks } from "../api/connectivity";
import { App } from "./app";

vi.mock("../api/connectivity", () => ({
  fetchConnectivityChecks: vi.fn().mockResolvedValue([]),
  createConnectivityCheck: vi.fn(),
}));

afterEach(() => {
  vi.mocked(fetchConnectivityChecks).mockClear();
});

describe("App", () => {
  it("서비스명 DIVURVE와 홈 대시보드를 초기 렌더링한다", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: "DIVURVE" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "오늘의 행동 (이번 주 확보액)" })).toBeInTheDocument();
  });

  it("사이드바 탭 클릭 시 해당 화면으로 전환된다", async () => {
    render(<App />);

    // 환전 플래너 탭으로 이동
    const plannerBtns = screen.getAllByRole("button", { name: /환전 플래너/ });
    fireEvent.click(plannerBtns[0]);
    expect(screen.getByRole("heading", { name: "환전 플래너" })).toBeInTheDocument();

    // 내 자산 탭으로 이동
    const assetsBtns = screen.getAllByRole("button", { name: /내 자산/ });
    fireEvent.click(assetsBtns[0]);
    expect(screen.getByRole("heading", { name: "내 자산 (X-Ray)" })).toBeInTheDocument();

    // 환율 범위 탭으로 이동
    const rangeBtns = screen.getAllByRole("button", { name: /환율 범위/ });
    fireEvent.click(rangeBtns[0]);
    expect(screen.getByRole("heading", { name: "환율 범위 (Forecast)" })).toBeInTheDocument();

    // 마이페이지 탭으로 이동
    const mypageBtns = screen.getAllByRole("button", { name: /마이페이지/ });
    fireEvent.click(mypageBtns[0]);
    expect(screen.getByRole("heading", { name: "마이페이지" })).toBeInTheDocument();

    // 연결 확인 탭으로 이동
    const connBtns = screen.getAllByRole("button", { name: /연결 확인/ });
    fireEvent.click(connBtns[0]);
    expect(screen.getByRole("heading", { name: /연결 확인/ })).toBeInTheDocument();

    await waitFor(() => {
      expect(fetchConnectivityChecks).toHaveBeenCalled();
    });
  });

  it("헤더의 마이페이지 아바타 버튼 클릭 시 마이페이지로 이동한다", () => {
    render(<App />);
    const avatarBtn = screen.getByRole("button", { name: "마이페이지" });
    fireEvent.click(avatarBtn);
    expect(screen.getByRole("heading", { name: "마이페이지" })).toBeInTheDocument();
  });
});
