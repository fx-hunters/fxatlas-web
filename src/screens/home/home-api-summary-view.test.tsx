import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HomeApiSummaryView } from "./home-api-summary-view";
import { formatReferenceTime } from "./home-api-format";

describe("HomeApiSummaryView", () => {
  it("Swagger 홈 응답과 기준 시각을 표시한다", () => {
    render(
      <HomeApiSummaryView
        result={{
          data: {
            todayAction: { heroAmount: "145 USD" },
            currencyStatus: { totalAssets: 3 },
            notice: { message: "오늘 확인 사항" },
            weeklyChange: { summary: "이번 주 변화 있음" },
            marketSummary: { summary: "시장 흐름 안정" },
            referenceTime: "2026-09-07T00:00:00Z",
          },
          meta: { timestamp: "2026-09-06T00:00:00Z" },
        }}
      />,
    );

    expect(screen.getByRole("region", { name: "API 홈 요약" })).toHaveTextContent(
      "145 USD",
    );
    expect(screen.getByText("3건")).toBeInTheDocument();
    expect(screen.getByText("오늘 확인 사항")).toBeInTheDocument();
    expect(screen.getByText("이번 주 변화 있음")).toBeInTheDocument();
    expect(screen.getByText("시장 흐름 안정")).toBeInTheDocument();
    expect(screen.getByText(/2026/)).toBeInTheDocument();
  });

  it("누락된 필드는 안전한 빈 문구와 메타 시각으로 표시한다", () => {
    render(
      <HomeApiSummaryView
        result={{
          data: {},
          meta: { timestamp: "not-a-date" },
        }}
      />,
    );

    expect(screen.getByText("등록된 행동 없음")).toBeInTheDocument();
    expect(screen.getByText("0건")).toBeInTheDocument();
    expect(screen.getByText("확인할 사항이 없습니다.")).toBeInTheDocument();
    expect(screen.getByText("주간 변화 정보가 없습니다.")).toBeInTheDocument();
    expect(screen.getByText("시장 요약 정보가 없습니다.")).toBeInTheDocument();
    expect(screen.getByText("not-a-date")).toBeInTheDocument();
  });

  it("기준 시각이 없으면 미제공 문구를 반환한다", () => {
    expect(formatReferenceTime(undefined)).toBe("기준 시각 미제공");
  });
});
