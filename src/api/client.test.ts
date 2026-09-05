import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ApiError,
  apiUrl,
  request,
  resolveApiBaseUrl,
  toCamelCase,
} from "./client";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("resolveApiBaseUrl", () => {
  it("VITE_API_URL을 반환하고 끝 슬래시를 제거한다", () => {
    expect(resolveApiBaseUrl({ VITE_API_URL: "https://api.test/" })).toBe(
      "https://api.test",
    );
  });

  it("값이 없으면 예외를 던진다", () => {
    expect(() => resolveApiBaseUrl({ VITE_API_URL: "" })).toThrow(/VITE_API_URL/);
  });

  it("인자를 생략하면 import.meta.env를 사용한다", () => {
    vi.stubEnv("VITE_API_URL", "https://env.test");
    expect(resolveApiBaseUrl()).toBe("https://env.test");
  });
});

describe("apiUrl", () => {
  it("베이스와 경로를 합치고 중복 슬래시를 정리한다", () => {
    expect(apiUrl("/goals", { VITE_API_URL: "https://api.test" })).toBe(
      "https://api.test/goals",
    );
  });

  it("기본 env(import.meta.env)로 동작한다", () => {
    vi.stubEnv("VITE_API_URL", "https://env.test");
    expect(apiUrl("plans")).toBe("https://env.test/plans");
  });
});

describe("toCamelCase", () => {
  it("객체 키를 camelCase로 바꾼다", () => {
    expect(toCamelCase({ created_at: "2026-01-01", message: "hi" })).toEqual({
      createdAt: "2026-01-01",
      message: "hi",
    });
  });

  it("배열과 중첩 객체를 재귀적으로 변환한다", () => {
    expect(
      toCamelCase([{ user_id: 1, nested_obj: { first_name: "a" } }]),
    ).toEqual([{ userId: 1, nestedObj: { firstName: "a" } }]);
  });

  it("원시값과 null은 그대로 둔다", () => {
    expect(toCamelCase(42)).toBe(42);
    expect(toCamelCase("plain")).toBe("plain");
    expect(toCamelCase(null)).toBeNull();
  });
});

describe("ApiError", () => {
  it("메시지와 status를 담고 name이 ApiError다", () => {
    const error = new ApiError("실패", 500);
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe("실패");
    expect(error.status).toBe(500);
    expect(error.name).toBe("ApiError");
  });
});

describe("request", () => {
  const env = { VITE_API_URL: "https://api.test" };

  it("성공 응답의 data를 언래핑하고 camelCase로 변환한다", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { created_at: "t" }, meta: {} }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await request<{ createdAt: string }>("/api/v1/x", {}, env);

    expect(result).toEqual({ createdAt: "t" });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.test/api/v1/x",
      expect.objectContaining({
        headers: { "Content-Type": "application/json" },
      }),
    );
  });

  it("init 없이도 기본 헤더로 호출한다", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [], meta: {} }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await request("/api/v1/y", undefined, env);

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.test/api/v1/y",
      expect.objectContaining({
        headers: { "Content-Type": "application/json" },
      }),
    );
  });

  it("실패 응답이면 status를 담은 ApiError를 던진다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 404 }),
    );

    await expect(request("/api/v1/z", {}, env)).rejects.toMatchObject({
      status: 404,
    });
  });
});
