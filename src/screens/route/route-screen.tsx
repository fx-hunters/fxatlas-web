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

interface RouteScreenProps {
  readonly isDemo?: boolean;
  readonly onNavigate?: (tab: NavTabId) => void;
  readonly loadPlan?: RoutePlanLoader;
}

export function RouteScreen({
  isDemo = true,
  loadPlan = loadRoutePlan,
}: RouteScreenProps) {
  const { state, reload } = useRoutePlan(isDemo, loadPlan);
  const interaction = usePlannerInteraction();

  if (state.status === "success") {
    return <RouteScreenView data={state.data} interaction={interaction} />;
  }

  return <RouteStatusView state={state} onRetry={reload} />;
}
