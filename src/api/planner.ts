import { ApiError, request } from "./client";
import type {
  ActivePlanResponse,
  GoalListResponse,
  GoalResponse,
  StepCompleteRequest,
  StepCompleteResponse,
  StepSkipResponse,
} from "./generated/divurve-api";

export interface PlannerApiItem {
  readonly goal: GoalResponse;
  readonly activePlan: ActivePlanResponse | null;
}

export interface PlannerApiOverview {
  readonly items: readonly PlannerApiItem[];
}

async function fetchActivePlan(goalId: string): Promise<ActivePlanResponse | null> {
  try {
    return await request<ActivePlanResponse>(
      `/api/v1/goals/${encodeURIComponent(goalId)}/plans/active`,
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export async function fetchPlannerOverview(): Promise<PlannerApiOverview> {
  const { goals } = await request<GoalListResponse>("/api/v1/goals");
  const items = await Promise.all(
    goals.map(async (goal) => ({
      goal,
      activePlan: await fetchActivePlan(goal.id),
    })),
  );
  return { items };
}

export function completePlanStep(
  planId: string,
  sequence: number,
  input: StepCompleteRequest,
): Promise<StepCompleteResponse> {
  return request<StepCompleteResponse>(
    `/api/v1/plans/${encodeURIComponent(planId)}/steps/${sequence}/complete`,
    { method: "POST", body: input },
  );
}

export function skipPlanStep(
  planId: string,
  sequence: number,
): Promise<StepSkipResponse> {
  return request<StepSkipResponse>(
    `/api/v1/plans/${encodeURIComponent(planId)}/steps/${sequence}/skip`,
    { method: "POST" },
  );
}
