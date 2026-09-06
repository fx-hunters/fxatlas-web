import { apiPath, request } from "./client";
import type {
  AttributionResponse,
  ConcentrationResponse,
  SimulateRequest,
  SimulateResponse,
  StressRequest,
  StressResponse,
  XrayBundle,
  XrayResponse,
} from "./generated/divurve-api";

export async function fetchXrayBundle(
  currencyCode?: string,
): Promise<XrayBundle> {
  const [overview, attribution, concentration] = await Promise.all([
    request<XrayResponse>("/api/v1/xray"),
    request<AttributionResponse>(
      apiPath("/api/v1/xray/attribution", { currencyCode }),
    ),
    request<ConcentrationResponse>("/api/v1/fit/concentration"),
  ]);
  return { overview, attribution, concentration };
}

export function applyStressScenario(
  input: StressRequest,
): Promise<StressResponse> {
  return request<StressResponse>("/api/v1/xray/stress", {
    method: "POST",
    body: input,
  });
}

export function simulateDiversification(
  input: SimulateRequest,
): Promise<SimulateResponse> {
  return request<SimulateResponse>("/api/v1/fit/simulate", {
    method: "POST",
    body: input,
  });
}
