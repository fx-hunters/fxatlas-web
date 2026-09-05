import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ForecastScreen } from "./forecast-screen";

describe("ForecastScreen", () => {
  it("통화 선택, 기간 토글, 팬 차트, 요약 카드 및 플래너 이동을 렌더링하고 동작한다", () => {
    const onNavigate = vi.fn();

    render(<ForecastScreen isDemo={true} onNavigate={onNavigate} />);

    expect(screen.getByText("USD")).toBeInTheDocument();
    expect(screen.getByText("JPY")).toBeInTheDocument();
    expect(screen.getByText("EUR")).toBeInTheDocument();
    expect(screen.getByText("30D")).toBeInTheDocument();
    expect(screen.getByText("90D")).toBeInTheDocument();

    expect(screen.getByRole("heading", { name: /시뮬레이션 팬 차트/ })).toBeInTheDocument();
    expect(screen.getByText("80% 범위 (30D)")).toBeInTheDocument();
    expect(screen.getByText("변동성 백분위")).toBeInTheDocument();
    expect(screen.getByText("내 자산에 미치는 영향")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "전망 동인" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "다가오는 일정" })).toBeInTheDocument();

    // JPY 통화 전환
    fireEvent.click(screen.getByRole("button", { name: "JPY" }));
    expect(screen.getByRole("heading", { name: /시뮬레이션 팬 차트 \(JPY\/KRW\)/ })).toBeInTheDocument();

    // 90D 기간 전환
    fireEvent.click(screen.getByRole("button", { name: "90D" }));
    expect(screen.getByText("80% 범위 (90D)")).toBeInTheDocument();

    // 플래너 이동 버튼 클릭
    fireEvent.click(screen.getByRole("button", { name: /내 계획에 적용하기/ }));
    expect(onNavigate).toHaveBeenCalledWith("planner");
  });

  it("onNavigate prop 없이도 에러 없이 렌더링되고 동작한다", () => {
    render(<ForecastScreen isDemo={false} />);
    fireEvent.click(screen.getByRole("button", { name: /내 계획에 적용하기/ }));
    expect(screen.getByText("EUR")).toBeInTheDocument();
  });
});
