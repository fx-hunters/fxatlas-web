import { afterEach, describe, expect, it, vi } from "vitest";
import { apiUrl, resolveApiBaseUrl } from "./client";

afterEach(() => {
  vi.unstubAllEnvs();
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
