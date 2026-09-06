import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ApiError } from "../../api/client";
import { XRAY_API_FIXTURE } from "../../test/api-fixtures";
import type { XrayApiDependencies } from "./use-xray-api";
import { XrayApiScreen } from "./xray-api-screen";
import { XRayScreen } from "./xray-screen";

const STRESS_RESULT = {
  totalAssetBeforeKrw: 20_000_000,
  totalAssetAfterKrw: 19_400_000,
  impactKrw: -600_000,
  impactRatio: -0.03,
  byCurrency: [],
};
const SIMULATION_RESULT = {
  portfolioVol: { before: 0.2, after: 0.18 },
  exposureAfter: { EUR: 0.1 },
  threshold: 0.5,
  withinThreshold: true,
};

function makeDependencies(
  overrides: Partial<XrayApiDependencies> = {},
): XrayApiDependencies {
  return {
    load: vi.fn().mockResolvedValue(XRAY_API_FIXTURE),
    stress: vi.fn().mockResolvedValue(STRESS_RESULT),
    simulate: vi.fn().mockResolvedValue(SIMULATION_RESULT),
    ...overrides,
  };
}

describe("XrayApiScreen", () => {
  it("서버 분석을 표시하고 스트레스·분산 요청 및 이동을 연결한다", async () => {
    const deps = makeDependencies();
    const onNavigate = vi.fn();
    render(<XrayApiScreen dependencies={deps} onNavigate={onNavigate} />);

    expect(screen.getByText("자산 분석을 불러오는 중입니다")).toBeInTheDocument();
    expect(await screen.findByRole("region", { name: "API 자산 분석" })).toBeInTheDocument();
    expect(screen.getByText("현재 분산 수준을 점검하세요.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "USD -10% 가정" }));
    expect(await screen.findByText(/서버 결과:/)).toHaveTextContent("영향");
    expect(deps.stress).toHaveBeenCalledWith({ shocks: { USD: -0.1 } });

    fireEvent.change(screen.getByLabelText("통화 코드"), {
      target: { value: "JPY" },
    });
    fireEvent.change(screen.getByLabelText("추가 비중 요청값"), {
      target: { value: "0.2" },
    });
    fireEvent.submit(screen.getByRole("button", { name: "서버에서 계산하기" }));
    expect(await screen.findByText(/변동성:/)).toHaveTextContent("0.2 → 0.18");
    expect(deps.simulate).toHaveBeenCalledWith({
      currencyCode: "JPY",
      deltaShare: 0.2,
    });

    fireEvent.click(screen.getByRole("button", { name: "플래너에서 목표 확인하기" }));
    expect(onNavigate).toHaveBeenCalledWith("planner");
  });

  it("액션의 로딩과 오류 상태를 표시한다", async () => {
    let rejectStress!: (reason?: unknown) => void;
    const stressPromise = new Promise<never>((_, reject) => {
      rejectStress = reject;
    });
    const deps = makeDependencies({
      stress: vi.fn().mockReturnValue(stressPromise),
      simulate: vi.fn().mockRejectedValue(new ApiError("분산 API 오류", 500, "SERVER")),
    });
    render(<XrayApiScreen dependencies={deps} />);
    await screen.findByRole("region", { name: "API 자산 분석" });

    fireEvent.click(screen.getByRole("button", { name: "JPY +8% 가정" }));
    expect(screen.getByRole("status")).toHaveTextContent("계산 결과 확인 중");
    expect(screen.getByRole("button", { name: "USD -10% 가정" })).toBeDisabled();
    rejectStress(new Error("stress"));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "자산 분석 정보를 불러오지 못했습니다",
    );

    fireEvent.submit(screen.getByRole("button", { name: "서버에서 계산하기" }));
    expect(await screen.findByText("분산 API 오류")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "플래너에서 목표 확인하기" })).not.toBeInTheDocument();
  });

  it("빈 상태를 표시한다", async () => {
    render(
      <XrayApiScreen
        dependencies={makeDependencies({
          load: vi.fn().mockResolvedValue({
            ...XRAY_API_FIXTURE,
            overview: { ...XRAY_API_FIXTURE.overview, exposure: [] },
          }),
        })}
      />,
    );
    expect(await screen.findByText("분석할 외화 자산이 없습니다")).toBeInTheDocument();
  });

  it("조회 오류를 재시도해 성공 상태로 전환한다", async () => {
    const load = vi
      .fn()
      .mockRejectedValueOnce(new ApiError("조회 API 오류", 500, "SERVER"))
      .mockResolvedValueOnce(XRAY_API_FIXTURE);
    render(<XrayApiScreen dependencies={makeDependencies({ load })} />);
    expect(await screen.findByRole("alert")).toHaveTextContent("조회 API 오류");
    fireEvent.click(screen.getByRole("button", { name: "다시 시도" }));
    expect(await screen.findByRole("region", { name: "API 자산 분석" })).toBeInTheDocument();
  });

  it("상위 화면의 API 모드 분기를 사용한다", async () => {
    render(
      <XRayScreen
        isDemo={false}
        apiDependencies={makeDependencies({
          load: vi.fn().mockResolvedValue({
            ...XRAY_API_FIXTURE,
            overview: { ...XRAY_API_FIXTURE.overview, exposure: [] },
          }),
        })}
      />,
    );
    expect(await screen.findByText("분석할 외화 자산이 없습니다")).toBeInTheDocument();
  });
});
