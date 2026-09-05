import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../api/client";
import {
  createConnectivityCheck,
  fetchConnectivityChecks,
} from "../../api/connectivity";
import { useConnectivityCheck } from "./use-connectivity-check";

vi.mock("../../api/connectivity", () => ({
  fetchConnectivityChecks: vi.fn(),
  createConnectivityCheck: vi.fn(),
}));

const fetchMock = vi.mocked(fetchConnectivityChecks);
const createMock = vi.mocked(createConnectivityCheck);

afterEach(() => {
  vi.clearAllMocks();
});

const sampleCheck = { id: 1, message: "hi", createdAt: "2026-01-01" };

describe("useConnectivityCheck", () => {
  it("마운트 시 목록을 로드해 success 상태가 된다", async () => {
    fetchMock.mockResolvedValue([sampleCheck]);

    const { result } = renderHook(() => useConnectivityCheck());

    await waitFor(() =>
      expect(result.current.checksState.status).toBe("success"),
    );
    expect(result.current.checksState).toEqual({
      status: "success",
      checks: [sampleCheck],
    });
  });

  it("ApiError면 그 메시지로 error 상태가 된다", async () => {
    fetchMock.mockRejectedValue(new ApiError("서버 폭발", 500));

    const { result } = renderHook(() => useConnectivityCheck());

    await waitFor(() =>
      expect(result.current.checksState.status).toBe("error"),
    );
    expect(result.current.checksState).toEqual({
      status: "error",
      message: "서버 폭발",
    });
  });

  it("알 수 없는 예외면 기본 안내 메시지로 error 상태가 된다", async () => {
    fetchMock.mockRejectedValue(new Error("network down"));

    const { result } = renderHook(() => useConnectivityCheck());

    await waitFor(() =>
      expect(result.current.checksState.status).toBe("error"),
    );
    expect(result.current.checksState).toMatchObject({
      status: "error",
      message: expect.stringContaining("백엔드가 실행 중인지"),
    });
  });

  it("빈 메시지를 제출하면 저장하지 않고 submitError를 세운다", async () => {
    fetchMock.mockResolvedValue([]);

    const { result } = renderHook(() => useConnectivityCheck());
    await waitFor(() =>
      expect(result.current.checksState.status).toBe("success"),
    );

    act(() => result.current.setMessage("   "));
    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(result.current.submitError).toBe("메시지를 입력하세요.");
    expect(createMock).not.toHaveBeenCalled();
  });

  it("메시지를 제출하면 저장 후 입력을 비우고 목록을 새로고침한다", async () => {
    fetchMock.mockResolvedValue([]);
    createMock.mockResolvedValue(sampleCheck);

    const { result } = renderHook(() => useConnectivityCheck());
    await waitFor(() =>
      expect(result.current.checksState.status).toBe("success"),
    );

    act(() => result.current.setMessage("  hello  "));
    fetchMock.mockResolvedValue([sampleCheck]);
    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(createMock).toHaveBeenCalledWith("hello");
    expect(result.current.message).toBe("");
    expect(result.current.submitError).toBeNull();
    expect(result.current.checksState).toEqual({
      status: "success",
      checks: [sampleCheck],
    });
  });

  it("저장이 실패하면 submitError를 세운다", async () => {
    fetchMock.mockResolvedValue([]);
    createMock.mockRejectedValue(new ApiError("검증 실패", 400));

    const { result } = renderHook(() => useConnectivityCheck());
    await waitFor(() =>
      expect(result.current.checksState.status).toBe("success"),
    );

    act(() => result.current.setMessage("boom"));
    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(result.current.submitError).toBe("검증 실패");
    expect(result.current.isSubmitting).toBe(false);
  });
});
