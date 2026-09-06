import { beforeEach, describe, expect, it, vi } from "vitest";
import { startDemoSession } from "./auth";
import { readApiSession } from "./session";
import { ensureApiSession } from "./session-bootstrap";

vi.mock("./auth", () => ({ startDemoSession: vi.fn() }));
vi.mock("./session", () => ({ readApiSession: vi.fn() }));

const DEMO_SESSION = {
  accessToken: "demo",
  refreshToken: "refresh",
  expiresIn: 1800,
  isDemo: true,
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(readApiSession).mockReturnValue(null);
  vi.mocked(startDemoSession).mockResolvedValue(DEMO_SESSION);
});

describe("ensureApiSession", () => {
  it("저장된 세션이 있으면 발급 요청 없이 그대로 사용한다", async () => {
    const member = { ...DEMO_SESSION, isDemo: false };
    vi.mocked(readApiSession).mockReturnValue(member);

    await expect(ensureApiSession()).resolves.toBe(member);
    expect(startDemoSession).not.toHaveBeenCalled();
  });

  it("세션이 없으면 BE 데모 계정 세션을 발급받는다", async () => {
    await expect(ensureApiSession()).resolves.toBe(DEMO_SESSION);
    expect(startDemoSession).toHaveBeenCalledTimes(1);
  });

  it("동시에 여러 번 호출해도 발급 요청은 한 번만 나간다", async () => {
    const [first, second] = await Promise.all([
      ensureApiSession(),
      ensureApiSession(),
    ]);

    expect(first).toBe(DEMO_SESSION);
    expect(second).toBe(DEMO_SESSION);
    expect(startDemoSession).toHaveBeenCalledTimes(1);
  });

  it("발급에 실패하면 다음 호출이 다시 시도할 수 있다", async () => {
    vi.mocked(startDemoSession).mockRejectedValueOnce(new Error("network"));

    await expect(ensureApiSession()).rejects.toThrow("network");
    await expect(ensureApiSession()).resolves.toBe(DEMO_SESSION);
    expect(startDemoSession).toHaveBeenCalledTimes(2);
  });
});
