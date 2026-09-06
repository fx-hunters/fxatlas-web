import {
  loadRoutePlan,
  type RoutePlanLoader,
} from "../../api/route";
import type { NavTabId } from "../../types/navigation";
import { RouteScreenView } from "./route-screen-view";
import { RouteStatusView } from "./route-status-view";
import { usePlannerInteraction } from "./use-planner-interaction";
import { useRoutePlan } from "./use-route-plan";
import "./route-screen.css";
import { PlannerApiScreen } from "./planner-api-screen";
import type { PlannerApiDependencies } from "./use-planner-api";

interface RouteScreenProps {
  readonly isDemo?: boolean;
  readonly onNavigate?: (tab: NavTabId) => void;
  readonly loadPlan?: RoutePlanLoader;
  readonly apiDependencies?: PlannerApiDependencies;
}

export function RouteScreen({
  isDemo = true,
  loadPlan = loadRoutePlan,
  apiDependencies,
}: RouteScreenProps) {
  if (!isDemo && loadPlan === loadRoutePlan) {
    return <PlannerApiScreen dependencies={apiDependencies} />;
  }

  return <RouteDemoScreen isDemo={isDemo} loadPlan={loadPlan} />;
}

function RouteDemoScreen({
  isDemo = true,
  loadPlan = loadRoutePlan,
}: Pick<RouteScreenProps, "isDemo" | "loadPlan">) {
  const { state, reload } = useRoutePlan(isDemo, loadPlan);
  const interaction = usePlannerInteraction();

  if (state.status === "success") {
    return <RouteScreenView data={state.data} interaction={interaction} />;
  }

  return <RouteStatusView state={state} onRetry={reload} />;
}
