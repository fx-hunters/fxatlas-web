import { requestWithMeta, type ApiResult } from "./client";
import type { HomeSummaryResponse } from "./generated/divurve-api";

export function fetchHomeSummary(): Promise<ApiResult<HomeSummaryResponse>> {
  return requestWithMeta<HomeSummaryResponse>("/api/v1/home/summary");
}
