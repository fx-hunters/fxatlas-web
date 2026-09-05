import { useHomeDashboard } from "./use-home-dashboard";
import { HomeDashboardView } from "./home-dashboard-view";
import { HomeEmptyView } from "./home-empty-view";
import type { NavTabId } from "../../types/navigation";

interface HomeScreenProps {
  readonly isDemo: boolean;
  readonly onNavigate: (tab: NavTabId) => void;
}

export function HomeScreen({ isDemo, onNavigate }: HomeScreenProps) {
  const { state, recordRoundComplete } = useHomeDashboard(isDemo);

  if (state.status === "empty") {
    return <HomeEmptyView onNavigateToPlanner={() => onNavigate("planner")} />;
  }

  return (
    <HomeDashboardView
      data={state.data}
      onRecordComplete={recordRoundComplete}
      onNavigateToAssets={() => onNavigate("assets")}
      onNavigateToPlanner={() => onNavigate("planner")}
    />
  );
}
