import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ApiError,
  apiPath,
  apiUrl,
  request,
  requestWithMeta,
  resolveApiBaseUrl,
  toCamelCase,
  toSnakeCase,
} from "./client";
import { clearApiSession, saveApiSession } from "./session";

const env = { VITE_API_URL: "https://api.test/" };

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

beforeEach(() => clearApiSession());

afterEach(() => {
  clearApiSession();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("API URL helpers", () => {
  it("환경변수 URL을 정규화하고 경로를 결합한다", () => {
    expect(resolveApiBaseUrl(env)).toBe("https://api.test");
    expect(apiUrl("/goals", env)).toBe("https://api.test/goals");
  });

  it("환경변수 누락을 알리고 기본 import.meta.env를 사용한다", () => {
    expect(() => resolveApiBaseUrl({ VITE_API_URL: "" })).toThrow(/VITE_API_URL/);
    vi.stubEnv("VITE_API_URL", "https://env.test");
    expect(resolveApiBaseUrl()).toBe("https://env.test");
    expect(apiUrl("plans")).toBe("https://env.test/plans");
  });

  it("정의된 쿼리 값만 URL에 인코딩한다", () => {
    expect(
      apiPath("/forecast", {
        pairCode: "USD/KRW",
        horizon: 30,
        enabled: true,
        omitted: undefined,
      }),
    ).toBe("/forecast?pairCode=USD%2FKRW&horizon=30&enabled=true");
    expect(apiPath("/events", { omitted: undefined })).toBe("/events");
  });
});

describe("API key conversion", () => {
  it("응답 객체, 배열과 원시값을 camelCase로 바꾼다", () => {
    expect(toCamelCase([{ user_id: 1, nested_obj: { first_name: "a" } }])).toEqual([
      { userId: 1, nestedObj: { firstName: "a" } },
    ]);
    expect(toCamelCase(42)).toBe(42);
    expect(toCamelCase(null)).toBeNull();
  });

  it("요청 객체, 배열과 원시값을 snake_case로 바꾼다", () => {
    expect(toSnakeCase([{ userId: 1, nestedObj: { firstName: "a" } }])).toEqual([
      { user_id: 1, nested_obj: { first_name: "a" } },
    ]);
    expect(toSnakeCase("plain")).toBe("plain");
    expect(toSnakeCase(null)).toBeNull();
  });
});

describe("ApiError", () => {
  it("상태와 기본 또는 서버 오류 코드를 보존한다", () => {
    expect(new ApiError("실패", 500)).toMatchObject({
      name: "ApiError",
      message: "실패",
      status: 500,
      code: "HTTP_ERROR",
    });
    expect(new ApiError("실패", 400, "VALIDATION").code).toBe("VALIDATION");
  });
});

describe("request", () => {
  it("Bearer 인증, 요청 키 변환, 응답 언래핑과 메타 변환을 수행한다", async () => {
    saveApiSession({
      accessToken: "access",
      refreshToken: "refresh",
      expiresIn: 1800,
      isDemo: true,
    });
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        data: { created_at: "t" },
        meta: { timestamp: "now", source_names: ["server"] },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await requestWithMeta<{ createdAt: string }>(
      "/api/v1/x",
      { method: "POST", body: { goalId: "g1" } },
      env,
    );

    expect(result).toEqual({
      data: { createdAt: "t" },
      meta: { timestamp: "now", sourceNames: ["server"] },
    });
    const requestInit = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const headers = new Headers(requestInit.headers);
    expect(headers.get("Authorization")).toBe("Bearer access");
    expect(headers.get("Content-Type")).toBe("application/json");
    expect(headers.get("Accept")).toBe("application/json");
    expect(requestInit.body).toBe('{"goal_id":"g1"}');
  });

  it("공개 GET은 토큰과 본문 없이 호출하고 data만 반환한다", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({ data: [{ created_at: "t" }], meta: {} }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      request<{ createdAt: string }[]>(
        "/api/v1/y",
        { requiresAuth: false },
        env,
      ),
    ).resolves.toEqual([{ createdAt: "t" }]);
    const requestInit = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const headers = new Headers(requestInit.headers);
    expect(headers.has("Authorization")).toBe(false);
    expect(headers.has("Content-Type")).toBe(false);
    expect(requestInit.body).toBeUndefined();
  });

  it("토큰이 필요한 요청은 fetch 전에 인증 오류를 던진다", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    await expect(request("/private", {}, env)).rejects.toMatchObject({
      status: 401,
      code: "AUTH_REQUIRED",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("서버의 구조화된 오류와 일반 HTTP 오류를 변환한다", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse(
          { error: { code: "NOT_FOUND", message: "찾을 수 없습니다." } },
          404,
        ),
      )
      .mockResolvedValueOnce(new Response("not-json", { status: 502 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      request("/missing", { requiresAuth: false }, env),
    ).rejects.toMatchObject({
      status: 404,
      code: "NOT_FOUND",
      message: "찾을 수 없습니다.",
    });
    await expect(
      request("/bad-gateway", { requiresAuth: false }, env),
    ).rejects.toMatchObject({ status: 502, code: "HTTP_ERROR" });
  });

  it("네트워크 실패와 잘못된 성공 응답을 구분한다", async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce(jsonResponse({ meta: { timestamp: "now" } }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      request("/offline", { requiresAuth: false }, env),
    ).rejects.toMatchObject({ code: "NETWORK_ERROR", status: 0 });
    await expect(
      request("/invalid", { requiresAuth: false }, env),
    ).rejects.toMatchObject({ code: "INVALID_RESPONSE" });
  });

  it("204 응답과 메타가 없는 정상 응답을 처리한다", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(jsonResponse({ data: "ok" }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      request<void>("/delete", { requiresAuth: false }, env),
    ).resolves.toBeUndefined();
    await expect(
      requestWithMeta<string>("/ok", { requiresAuth: false }, env),
    ).resolves.toEqual({ data: "ok", meta: { timestamp: "" } });
  });
});
