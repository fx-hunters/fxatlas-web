import { useHomeDashboard, type HomeSummaryLoader } from "./use-home-dashboard";
import { HomeDashboardView } from "./home-dashboard-view";
import { HomeEmptyView } from "./home-empty-view";
import { HomeApiSummaryView } from "./home-api-summary-view";
import { ApiStateView } from "../../components/common/api-state-view";
import type { NavTabId } from "../../types/navigation";

interface HomeScreenProps {
  readonly isDemo: boolean;
  readonly onNavigate: (tab: NavTabId) => void;
  readonly loadSummary?: HomeSummaryLoader;
}

export function HomeScreen({ isDemo, onNavigate, loadSummary }: HomeScreenProps) {
  const { state, recordRoundComplete, reload } = useHomeDashboard(isDemo, loadSummary);

  if (state.status === "loading") {
    return (
      <ApiStateView
        status="loading"
        title="홈 정보를 불러오는 중입니다"
        message="서버의 최신 요약을 확인하고 있습니다."
      />
    );
  }

  if (state.status === "error") {
    return (
      <ApiStateView
        status="error"
        title="홈 정보를 불러오지 못했습니다"
        message={state.message}
        onRetry={reload}
      />
    );
  }

  if (state.status === "empty") {
    return <HomeEmptyView onNavigateToPlanner={() => onNavigate("planner")} />;
  }

  if (state.source === "api") {
    return <HomeApiSummaryView result={state.result} />;
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
