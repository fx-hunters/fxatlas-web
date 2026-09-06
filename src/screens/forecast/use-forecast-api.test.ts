import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../api/client";
import {
  EMPTY_FORECAST_API_FIXTURE,
  FORECAST_API_FIXTURE,
} from "../../test/api-fixtures";
import { fetchForecastBundle } from "../../api/forecast";
import { useForecastApi } from "./use-forecast-api";

vi.mock("../../api/forecast", () => ({
  fetchForecastBundle: vi.fn(),
}));

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

describe("useForecastApi", () => {
  beforeEach(() => {
    vi.mocked(fetchForecastBundle).mockReset();
  });

  it("기본 조회와 통화·기간 변경 및 재시도를 API 요청으로 전달한다", async () => {
    const loader = vi.fn().mockResolvedValue(FORECAST_API_FIXTURE);
    const { result } = renderHook(() => useForecastApi(loader));

    await waitFor(() => expect(result.current.state.status).toBe("success"));
    expect(loader).toHaveBeenCalledWith("USD_KRW", 30);

    act(() => result.current.setCurrency("JPY"));
    await waitFor(() => expect(loader).toHaveBeenCalledWith("JPY_KRW", 30));
    act(() => result.current.setPeriod("90D"));
    await waitFor(() => expect(loader).toHaveBeenCalledWith("JPY_KRW", 90));
    const callsBeforeReload = loader.mock.calls.length;
    act(() => result.current.reload());
    await waitFor(() => expect(loader).toHaveBeenCalledTimes(callsBeforeReload + 1));
  });

  it("기본 Swagger 로더를 사용한다", async () => {
    vi.mocked(fetchForecastBundle).mockResolvedValue(FORECAST_API_FIXTURE);
    const { result } = renderHook(() => useForecastApi());

    await waitFor(() => expect(result.current.state.status).toBe("success"));
    expect(fetchForecastBundle).toHaveBeenCalledWith("USD_KRW", 30);
  });

  it.each([
    EMPTY_FORECAST_API_FIXTURE,
    {
      ...EMPTY_FORECAST_API_FIXTURE,
      forecast: {
        ...EMPTY_FORECAST_API_FIXTURE.forecast,
        history: [{ d: "2026-09-01", rate: 1_400 }],
      },
    },
    {
      ...EMPTY_FORECAST_API_FIXTURE,
      forecast: {
        ...EMPTY_FORECAST_API_FIXTURE.forecast,
        path: [{
          d: "2026-09-02",
          p50Lo: 1,
          p50Hi: 2,
          p80Lo: 0,
          p80Hi: 3,
        }],
      },
    },
    {
      ...EMPTY_FORECAST_API_FIXTURE,
      forecast: {
        ...EMPTY_FORECAST_API_FIXTURE.forecast,
        modelPath: [{ d: "2026-09-03", rate: 1_410 }],
      },
    },
  ])("응답 배열의 내용 유무를 상태로 구분한다", async (bundle) => {
    const loader = vi.fn().mockResolvedValue(bundle);
    const { result } = renderHook(() => useForecastApi(loader));
    await waitFor(() =>
      expect(result.current.state.status).toBe(
        bundle === EMPTY_FORECAST_API_FIXTURE ? "empty" : "success",
      ),
    );
  });

  it.each([
    [new ApiError("서버 오류", 500, "SERVER"), "서버 오류"],
    [
      new Error("network"),
      "환율 범위 정보를 불러오지 못했습니다. 잠시 후 다시 확인해 주세요.",
    ],
  ])("조회 오류를 사용자 메시지로 표시한다", async (error, message) => {
    const loader = vi.fn().mockRejectedValue(error);
    const { result } = renderHook(() => useForecastApi(loader));
    await waitFor(() =>
      expect(result.current.state).toEqual({ status: "error", message }),
    );
  });

  it("언마운트 이후의 성공과 실패 응답을 무시한다", async () => {
    const success = deferred<typeof FORECAST_API_FIXTURE>();
    const successLoader = () => success.promise;
    const successHook = renderHook(() => useForecastApi(successLoader));
    successHook.unmount();
    await act(async () => success.resolve(FORECAST_API_FIXTURE));

    const failure = deferred<never>();
    const failureLoader = () => failure.promise;
    const failureHook = renderHook(() => useForecastApi(failureLoader));
    failureHook.unmount();
    await act(async () => failure.reject(new Error("late")));
  });
});
