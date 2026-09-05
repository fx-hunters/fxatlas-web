import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { SparklineChart } from "./sparkline-chart";

describe("SparklineChart", () => {
  const sampleData = [
    { time: "09:00", price: 1378.2 },
    { time: "10:00", price: 1379.5 },
    { time: "11:00", price: 1381.1 },
    { time: "12:00", price: 1380.4 },
    { time: "13:00", price: 1382.0 },
    { time: "14:00", price: 1382.4 },
  ];

  it("데이터가 있을 때 SVG 스파크라인과 그라디언트를 렌더링한다", () => {
    render(<SparklineChart data={sampleData} height={100} />);
    const svg = screen.getByRole("img");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("aria-label", expect.stringContaining("환율 추이"));
  });

  it("데이터가 비어있을 때 빈 상태 메시지를 렌더링한다", () => {
    render(<SparklineChart data={[]} />);
    expect(screen.getByText("데이터 없음")).toBeInTheDocument();
  });
});
