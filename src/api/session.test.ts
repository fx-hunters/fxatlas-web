import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  API_SESSION_STORAGE_KEY,
  clearApiSession,
  getApiAccessToken,
  readApiSession,
  saveApiSession,
  type ApiSession,
} from "./session";

const session: ApiSession = {
  accessToken: "access",
  refreshToken: "refresh",
  expiresIn: 1800,
  isDemo: true,
  onboarded: true,
};

beforeEach(() => clearApiSession());
afterEach(() => {
  vi.restoreAllMocks();
  clearApiSession();
});

describe("API session storage", () => {
  it("세션 저장소와 로컬 저장소에 선택적으로 저장한다", () => {
    saveApiSession(session);
    expect(readApiSession()).toEqual(session);
    expect(getApiAccessToken()).toBe("access");
    expect(sessionStorage.getItem(API_SESSION_STORAGE_KEY)).toContain("access");

    saveApiSession({ ...session, accessToken: "local" }, "local");
    expect(readApiSession()?.accessToken).toBe("local");
    expect(sessionStorage.getItem(API_SESSION_STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem(API_SESSION_STORAGE_KEY)).toContain("local");
  });

  it("메모리 세션이 없으면 유효한 저장값을 읽고 잘못된 값은 무시한다", () => {
    clearApiSession();
    sessionStorage.setItem(API_SESSION_STORAGE_KEY, JSON.stringify(session));
    expect(readApiSession()).toEqual(session);

    clearApiSession();
    sessionStorage.setItem(API_SESSION_STORAGE_KEY, "not-json");
    localStorage.setItem(API_SESSION_STORAGE_KEY, JSON.stringify(session));
    expect(readApiSession()).toEqual(session);

    clearApiSession();
    sessionStorage.setItem(API_SESSION_STORAGE_KEY, JSON.stringify({ accessToken: 1 }));
    expect(readApiSession()).toBeNull();
  });

  it("빈 저장소와 객체가 아닌 값은 세션으로 해석하지 않는다", () => {
    expect(readApiSession()).toBeNull();
    sessionStorage.setItem(API_SESSION_STORAGE_KEY, "null");
    expect(readApiSession()).toBeNull();
  });

  it("브라우저 저장소가 차단되어도 메모리 세션을 사용하고 정리를 시도한다", () => {
    const setSpy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    saveApiSession(session);
    expect(readApiSession()).toEqual(session);
    setSpy.mockRestore();

    clearApiSession();
    const getSpy = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(readApiSession()).toBeNull();
    getSpy.mockRestore();

    const removeSpy = vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(() => clearApiSession()).not.toThrow();
    removeSpy.mockRestore();
  });
});
