import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, it, expect, vi } from "vitest";
import { fetchConnectivityChecks } from "../api/connectivity";
import { App } from "./app";

// App은 연결 확인 패널을 렌더하므로 마운트 시 목록 조회가 일어난다.
// 실제 네트워크 대신 API를 모킹한다.
vi.mock("../api/connectivity", () => ({
  fetchConnectivityChecks: vi.fn().mockResolvedValue([]),
  createConnectivityCheck: vi.fn(),
}));

afterEach(() => {
  vi.mocked(fetchConnectivityChecks).mockClear();
});

describe("App", () => {
  it("서비스명을 렌더링한다", async () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: "Divurve" })).toBeInTheDocument();
    // 패널의 비동기 목록 조회가 끝날 때까지 기다려 act 경고를 피한다.
    await waitFor(() =>
      expect(fetchConnectivityChecks).toHaveBeenCalled(),
    );
  });

  it("연결 확인 패널을 렌더링한다", async () => {
    render(<App />);
    expect(
      screen.getByRole("heading", { name: /연결 확인/ }),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(fetchConnectivityChecks).toHaveBeenCalled(),
    );
  });
});
