import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ForecastScreen } from "./forecast-screen";

describe("ForecastScreen", () => {
  it("환율 범위 플레이스홀더를 렌더링한다", () => {
    render(<ForecastScreen />);
    expect(screen.getByRole("heading", { name: "환율 범위 (Forecast)" })).toBeInTheDocument();
  });
});
