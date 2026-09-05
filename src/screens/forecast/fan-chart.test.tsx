import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { FanChart } from "./fan-chart";
import { generateFanChartPoints } from "./use-forecast";

describe("FanChart", () => {
  it("팬 차트 SVG 요소를 렌더링하고 마우스 호버 시 툴팁을 표시한다", () => {
    const data = generateFanChartPoints("USD", "30D");

    render(<FanChart data={data} currency="USD" />);

    expect(
      screen.getByRole("img", { name: "시뮬레이션 팬 차트 (USD/KRW)" }),
    ).toBeInTheDocument();

    const hoverRects = document.querySelectorAll("rect");
    expect(hoverRects.length).toBeGreaterThan(0);

    // 과거 포인트 호버
    fireEvent.mouseEnter(hoverRects[2]);
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
    expect(screen.getByText(/실제 환율:/)).toBeInTheDocument();

    // 미래 포인트 호버
    fireEvent.mouseEnter(hoverRects[20]);
    expect(screen.getByText(/시나리오 중심:/)).toBeInTheDocument();
    expect(screen.getByText(/80% 범위:/)).toBeInTheDocument();

    fireEvent.mouseLeave(hoverRects[20]);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("데이터가 비어 있을 때 안내 텍스트를 표시한다", () => {
    render(<FanChart data={[]} currency="USD" />);
    expect(screen.getByText("데이터가 없습니다.")).toBeInTheDocument();
  });
});
