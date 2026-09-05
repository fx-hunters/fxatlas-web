import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createConnectivityCheck,
  fetchConnectivityChecks,
  fetchHealthPing,
} from "./connectivity";

/** { data, meta } 봉투로 감싼 성공 응답을 흉내 내는 fetch mock. */
function stubFetchResolving(data: unknown) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ data, meta: { timestamp: "t" } }),
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

beforeEach(() => {
  vi.stubEnv("VITE_API_URL", "https://api.test");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("fetchConnectivityChecks", () => {
  it("목록을 조회하고 created_at을 createdAt으로 변환한다", async () => {
    const fetchMock = stubFetchResolving([
      { id: 1, message: "hi", created_at: "2026-01-01T00:00:00Z" },
    ]);

    const checks = await fetchConnectivityChecks();

    expect(checks).toEqual([
      { id: 1, message: "hi", createdAt: "2026-01-01T00:00:00Z" },
    ]);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.test/api/v1/connectivity-checks",
      expect.objectContaining({ headers: expect.any(Object) }),
    );
  });
});

describe("createConnectivityCheck", () => {
  it("message를 POST하고 생성된 행을 반환한다", async () => {
    const fetchMock = stubFetchResolving({
      id: 9,
      message: "new",
      created_at: "2026-02-02T00:00:00Z",
    });

    const created = await createConnectivityCheck("new");

    expect(created).toEqual({
      id: 9,
      message: "new",
      createdAt: "2026-02-02T00:00:00Z",
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.test/api/v1/connectivity-checks",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ message: "new" }),
      }),
    );
  });
});

describe("fetchHealthPing", () => {
  it("liveness 상태를 반환한다", async () => {
    stubFetchResolving({ status: "ok" });

    await expect(fetchHealthPing()).resolves.toEqual({ status: "ok" });
  });
});
