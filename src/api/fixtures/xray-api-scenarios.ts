import type { StressRequest } from "../generated/divurve-api";

export interface XrayStressPreset {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly request: StressRequest;
}

/** 사용자가 서버 계산을 체험하기 위한 명시적 요청 입력 fixture. */
export const XRAY_STRESS_PRESETS: readonly XrayStressPreset[] = [
  {
    id: "usd-down",
    label: "USD -10% 가정",
    description: "USD 환율 충격 입력값을 서버에 보내 결과를 조회합니다.",
    request: { shocks: { USD: -0.1 } },
  },
  {
    id: "jpy-up",
    label: "JPY +8% 가정",
    description: "JPY 환율 충격 입력값을 서버에 보내 결과를 조회합니다.",
    request: { shocks: { JPY: 0.08 } },
  },
];
