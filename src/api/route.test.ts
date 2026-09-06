import { describe, expect, it } from "vitest";
import { loadRoutePlan } from "./route";

describe("loadRoutePlan", () => {
  it("데모 모드에서는 백엔드 형태 fixture를 camelCase 데이터로 반환한다", async () => {
    const data = await loadRoutePlan(true);

    expect(data).toMatchObject({
      dataNotice: {
        source: "mock",
        sourceLabel: "데모 데이터",
      },
      intro: {
        title: "어떤 외화 목표를 준비하고 있나요?",
      },
    });
    expect(data?.plans).toHaveLength(2);
    expect(data?.plans[0].goal).toMatchObject({
      currencyCode: "USD",
      targetAmountLabel: "3,000 USD",
      progressPercent: 42,
    });
    expect(data?.plans[1].goal).toMatchObject({
      currencyCode: "JPY",
      targetAmountLabel: "180,000 JPY",
      remainingPeriodLabel: "남은 기간 63일",
    });
    expect(data).not.toHaveProperty("data_notice");
    expect(data?.plans[0]).not.toHaveProperty("intro_option");
  });

  it("실제 API 계약이 없는 비데모 모드에서는 빈 상태를 반환한다", async () => {
    await expect(loadRoutePlan(false)).resolves.toBeNull();
  });
});
