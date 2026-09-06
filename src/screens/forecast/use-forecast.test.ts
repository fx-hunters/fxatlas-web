import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useForecast, generateFanChartPoints } from "./use-forecast";

describe("useForecast", () => {
  it("USD 및 30D 기본값으로 초기화된다", () => {
    const { result } = renderHook(() => useForecast(true));

    expect(result.current.currency).toBe("USD");
    expect(result.current.period).toBe("30D");
    expect(result.current.chartData.length).toBe(30);
    expect(result.current.currencyInfo.summary.upper).toBe(1410);
  });

  it("통화 및 기간 변경 시 차트 데이터와 메트릭이 업데이트된다", () => {
    const { result } = renderHook(() => useForecast(true));

    act(() => {
      result.current.setCurrency("JPY");
      result.current.setPeriod("90D");
    });

    expect(result.current.currency).toBe("JPY");
    expect(result.current.period).toBe("90D");
    expect(result.current.chartData.length).toBe(90);
    expect(result.current.currencyInfo.summary.upper).toBe(935);

    act(() => {
      result.current.setCurrency("EUR");
    });
    expect(result.current.currency).toBe("EUR");
    expect(result.current.currencyInfo.summary.upper).toBe(1530);
  });
});

describe("generateFanChartPoints", () => {
  it("과거 데이터와 미래 투영 밴드 포인트를 생성한다", () => {
    const points = generateFanChartPoints("USD", "30D");
    expect(points.length).toBe(30);

    const firstPoint = points[0];
    expect(firstPoint.price).not.toBeNull();
    expect(firstPoint.range80Upper).toBeNull();

    const lastPoint = points[points.length - 1];
    expect(lastPoint.price).toBeNull();
    expect(lastPoint.range80Upper).not.toBeNull();
    expect(lastPoint.range80Lower).not.toBeNull();
  });
});
