import { describe, expect, it } from "vitest";
import {
  INITIAL_SETUP_PATH,
  resolvePostAuthDestination,
} from "./post-auth-routing";

describe("post auth routing", () => {
  it("초기 설정 경로를 고정된 앱 경로로 제공한다", () => {
    expect(INITIAL_SETUP_PATH).toBe("/initial-setup");
  });

  it.each([
    [undefined, "home"],
    [{ isDemo: false, onboarded: true }, "home"],
    [{ isDemo: false }, "home"],
    [{ isDemo: true, onboarded: false }, "home"],
    [{ isDemo: false, onboarded: false }, "initialSetup"],
  ] as const)("인증 결과 %o를 %s 목적지로 보낸다", (result, destination) => {
    expect(resolvePostAuthDestination(result)).toBe(destination);
  });
});
