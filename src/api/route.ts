import type { RoutePlanData } from "../types/route";
import { toCamelCase } from "./client";
import { DEMO_ROUTE_PLAN_RESPONSE } from "./fixtures/route-plan";

export type RoutePlanLoader = (
  isDemo: boolean,
) => Promise<RoutePlanData | null>;

/**
 * Route 데이터 경계.
 *
 * 실제 API 계약이 확정되기 전에는 데모 모드에서만 백엔드 응답 형태의
 * fixture를 반환한다. 실데이터 모드에서는 빈 상태를 반환하며 임의의
 * 엔드포인트나 계산 규칙을 만들지 않는다.
 */
export const loadRoutePlan: RoutePlanLoader = async (isDemo) => {
  if (!isDemo) {
    return null;
  }

  return toCamelCase(DEMO_ROUTE_PLAN_RESPONSE.data) as RoutePlanData;
};
