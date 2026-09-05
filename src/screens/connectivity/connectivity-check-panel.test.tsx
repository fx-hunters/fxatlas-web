import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchConnectivityChecks } from "../../api/connectivity";
import { ConnectivityCheckPanel } from "./connectivity-check-panel";

vi.mock("../../api/connectivity", () => ({
  fetchConnectivityChecks: vi.fn(),
  createConnectivityCheck: vi.fn(),
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe("ConnectivityCheckPanel", () => {
  it("훅의 상태를 view로 넘겨 렌더한다", async () => {
    vi.mocked(fetchConnectivityChecks).mockResolvedValue([
      { id: 3, message: "wired", createdAt: "2026-01-01" },
    ]);

    render(<ConnectivityCheckPanel />);

    expect(
      screen.getByRole("heading", { name: /연결 확인/ }),
    ).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText("wired")).toBeInTheDocument());
  });
});
