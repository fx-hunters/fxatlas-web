import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ApiError } from "../../api/client";
import {
  EMPTY_FORECAST_API_FIXTURE,
  FORECAST_API_FIXTURE,
} from "../../test/api-fixtures";
import { ForecastApiScreen } from "./forecast-api-screen";
import { toFanChartData } from "./forecast-api-presenter";
import { ForecastScreen } from "./forecast-screen";

describe("ForecastApiScreen", () => {
  it("로딩 후 Swagger 범위와 근거를 표시하고 컨트롤을 연결한다", async () => {
    const loader = vi.fn(async (pairCode: string, horizon: number) => ({
      ...FORECAST_API_FIXTURE,
      forecast: {
        ...FORECAST_API_FIXTURE.forecast,
        pairCode,
        horizonDays: horizon,
      },
    }));
    const onNavigate = vi.fn();
    render(<ForecastApiScreen loader={loader} onNavigate={onNavigate} />);

    expect(screen.getByText("환율 범위를 불러오는 중입니다")).toBeInTheDocument();
    expect(await screen.findByRole("region", { name: "API 환율 범위" })).toBeInTheDocument();
    expect(screen.getByText("금리 차")).toBeInTheDocument();
    expect(screen.getByText("미국 물가 발표")).toBeInTheDocument();
    expect(screen.getByText("walk-forward")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "EUR" }));
    await waitFor(() => expect(loader).toHaveBeenCalledWith("EUR_KRW", 30));
    expect(await screen.findByText("등록된 일정이 없습니다.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "90D" }));
    await waitFor(() => expect(loader).toHaveBeenCalledWith("EUR_KRW", 90));
    fireEvent.click(screen.getByRole("button", { name: "플래너에서 확인하기" }));
    expect(onNavigate).toHaveBeenCalledWith("planner");
  });

  it("빈 상태를 표시한다", async () => {
    render(
      <ForecastApiScreen
        loader={vi.fn().mockResolvedValue(EMPTY_FORECAST_API_FIXTURE)}
      />,
    );
    expect(await screen.findByText("표시할 환율 범위가 없습니다")).toBeInTheDocument();
  });

  it("API 오류를 표시하고 다시 조회한다", async () => {
    const loader = vi
      .fn()
      .mockRejectedValueOnce(new ApiError("현재 범위 API 오류", 500, "SERVER"))
      .mockResolvedValueOnce(FORECAST_API_FIXTURE);
    render(<ForecastApiScreen loader={loader} />);

    expect(await screen.findByRole("alert")).toHaveTextContent("현재 범위 API 오류");
    fireEvent.click(screen.getByRole("button", { name: "다시 시도" }));
    expect(await screen.findByRole("region", { name: "API 환율 범위" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "플래너에서 확인하기" })).not.toBeInTheDocument();
  });

  it("상위 화면이 API 모드에서 API 전용 화면을 선택한다", async () => {
    render(
      <ForecastScreen
        isDemo={false}
        apiLoader={vi.fn().mockResolvedValue(EMPTY_FORECAST_API_FIXTURE)}
      />,
    );
    expect(await screen.findByText("표시할 환율 범위가 없습니다")).toBeInTheDocument();
  });

  it("서로 다른 날짜 배열을 차트 표시 구조로 결합한다", () => {
    expect(toFanChartData(FORECAST_API_FIXTURE)).toEqual([
      {
        day: "2026-09-01",
        price: 1_390,
        projected: null,
        range80Upper: null,
        range80Lower: null,
        range50Upper: null,
        range50Lower: null,
      },
      {
        day: "2026-09-02",
        price: 1_400,
        projected: 1_401,
        range80Upper: 1_440,
        range80Lower: 1_360,
        range50Upper: 1_420,
        range50Lower: 1_380,
      },
      {
        day: "2026-09-30",
        price: null,
        projected: 1_410,
        range80Upper: 1_450,
        range80Lower: 1_350,
        range50Upper: 1_430,
        range50Lower: 1_370,
      },
    ]);
  });
});
