import { apiPath, request } from "./client";
import type {
  EventsResponse,
  FactorsResponse,
  ForecastBundle,
  ForecastResponse,
  ModelPerformanceResponse,
} from "./generated/divurve-api";

export async function fetchForecastBundle(
  pairCode: string,
  horizon: number,
): Promise<ForecastBundle> {
  const publicRequest = { requiresAuth: false } as const;
  const [forecast, factors, performance, events] = await Promise.all([
    request<ForecastResponse>(
      apiPath("/api/v1/forecast", { pairCode, horizon }),
      publicRequest,
    ),
    request<FactorsResponse>(
      apiPath("/api/v1/forecast/factors", { pairCode }),
      publicRequest,
    ),
    request<ModelPerformanceResponse>(
      apiPath("/api/v1/forecast/model-performance", { pairCode, horizon }),
      publicRequest,
    ),
    request<EventsResponse>("/api/v1/events", publicRequest),
  ]);

  return { forecast, factors, performance, events };
}
