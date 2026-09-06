import type { RoutePlanData } from "../types/route";
import { toCamelCase } from "./client";
import { DEMO_ROUTE_PLAN_RESPONSE } from "./fixtures/route-plan";

export type RoutePlanLoader = () => Promise<RoutePlanData | null>;

/**
 * Route 데이터 경계.
 *
 * 실제 API 계약이 확정되기 전까지 백엔드 응답 형태의 fixture를 반환한다.
 * 임의의 엔드포인트나 계산 규칙은 만들지 않는다.
 */
export const loadRoutePlan: RoutePlanLoader = async () => {
  return toCamelCase(DEMO_ROUTE_PLAN_RESPONSE.data) as RoutePlanData;
};
