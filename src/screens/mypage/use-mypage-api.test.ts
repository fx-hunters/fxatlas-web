import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../api/client";
import {
  MY_PAGE_API_FIXTURE,
  MY_PAGE_SETTINGS_FIXTURE,
} from "../../test/api-fixtures";
import { fetchMyPageBundle, updateSettings } from "../../api/mypage";
import {
  useMyPageApi,
  type MyPageApiDependencies,
} from "./use-mypage-api";

vi.mock("../../api/mypage", () => ({
  fetchMyPageBundle: vi.fn(),
  updateSettings: vi.fn(),
}));

function dependencies(
  overrides: Partial<MyPageApiDependencies> = {},
): MyPageApiDependencies {
  return {
    load: vi.fn().mockResolvedValue(MY_PAGE_API_FIXTURE),
    saveSettings: vi.fn().mockResolvedValue(MY_PAGE_SETTINGS_FIXTURE),
    ...overrides,
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

describe("useMyPageApi", () => {
  beforeEach(() => {
    vi.mocked(fetchMyPageBundle).mockReset();
    vi.mocked(updateSettings).mockReset();
  });

  it("기본 Swagger 의존성으로 조회하고 설정을 저장한다", async () => {
    vi.mocked(fetchMyPageBundle).mockResolvedValue(MY_PAGE_API_FIXTURE);
    vi.mocked(updateSettings).mockResolvedValue({
      ...MY_PAGE_SETTINGS_FIXTURE,
      explainLevel: "detailed",
    });
    const { result } = renderHook(() => useMyPageApi());
    await waitFor(() => expect(result.current.state.status).toBe("success"));

    await act(async () =>
      result.current.saveSettings({ explainLevel: "detailed" }),
    );
    expect(updateSettings).toHaveBeenCalledWith({ explainLevel: "detailed" });
    expect(result.current.saveState.status).toBe("saved");
    expect(result.current.state).toMatchObject({
      status: "success",
      data: { settings: { explainLevel: "detailed" } },
    });
  });

  it("재조회한다", async () => {
    const load = vi.fn().mockResolvedValue(MY_PAGE_API_FIXTURE);
    const deps = dependencies({ load });
    const { result } = renderHook(() => useMyPageApi(deps));
    await waitFor(() => expect(result.current.state.status).toBe("success"));
    act(() => result.current.reload());
    await waitFor(() => expect(load).toHaveBeenCalledTimes(2));
  });

  it.each([
    [new ApiError("사용자 서버 오류", 500, "SERVER"), "사용자 서버 오류"],
    [
      new Error("network"),
      "마이페이지 정보를 불러오지 못했습니다. 잠시 후 다시 확인해 주세요.",
    ],
  ])("조회 오류를 사용자 메시지로 바꾼다", async (error, message) => {
    const deps = dependencies({ load: vi.fn().mockRejectedValue(error) });
    const { result } = renderHook(() => useMyPageApi(deps));
    await waitFor(() =>
      expect(result.current.state).toEqual({ status: "error", message }),
    );
  });

  it.each([
    [new ApiError("저장 서버 오류", 400, "BAD"), "저장 서버 오류"],
    [
      new Error("network"),
      "마이페이지 정보를 불러오지 못했습니다. 잠시 후 다시 확인해 주세요.",
    ],
  ])("저장 오류를 상태로 표시한다", async (error, message) => {
    const deps = dependencies({
      saveSettings: vi.fn().mockRejectedValue(error),
    });
    const { result } = renderHook(() => useMyPageApi(deps));
    await waitFor(() => expect(result.current.state.status).toBe("success"));
    await act(async () => result.current.saveSettings({ fxDiscountRatio: 0.7 }));
    expect(result.current.saveState).toEqual({ status: "error", message });
  });

  it("조회 중 저장 결과가 도착해도 아직 없는 사용자 묶음을 덮어쓰지 않는다", async () => {
    const load = deferred<typeof MY_PAGE_API_FIXTURE>();
    const deps = dependencies({ load: () => load.promise });
    const { result, unmount } = renderHook(() => useMyPageApi(deps));
    await act(async () => result.current.saveSettings({ explainLevel: "simple" }));
    expect(result.current.state.status).toBe("loading");
    expect(result.current.saveState.status).toBe("saved");
    unmount();
    await act(async () => load.resolve(MY_PAGE_API_FIXTURE));
  });

  it("언마운트 이후의 조회 실패를 무시한다", async () => {
    const load = deferred<never>();
    const deps = dependencies({ load: () => load.promise });
    const hook = renderHook(() => useMyPageApi(deps));
    hook.unmount();
    await act(async () => load.reject(new Error("late")));
  });
});
