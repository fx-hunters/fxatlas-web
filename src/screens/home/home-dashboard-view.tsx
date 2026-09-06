import { TodayActionCard } from "./today-action-card";
import { FxHoldingCard } from "./fx-holding-card";
import { AttentionBanner } from "./attention-banner";
import { MarketSummaryCard } from "./market-summary-card";
import { WeeklyComparisonCard } from "./weekly-comparison-card";
import type { HomeDashboardData } from "../../types/home";

interface HomeDashboardViewProps {
  readonly data: HomeDashboardData;
  readonly onRecordComplete?: () => void;
  readonly onNavigateToAssets?: () => void;
  readonly onNavigateToPlanner?: () => void;
}

export function HomeDashboardView({
  data,
  onRecordComplete,
  onNavigateToAssets,
  onNavigateToPlanner,
}: HomeDashboardViewProps) {
  return (
    <div
      className="home-dashboard-grid"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
        gap: "1.5rem",
      }}
    >
      {/* 주요 액션 및 외화 현황 컬럼 */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", minWidth: 0 }}>
        <TodayActionCard data={data.todayAction} onRecordComplete={onRecordComplete} />
        <FxHoldingCard data={data.fxHolding} onNavigateToAssets={onNavigateToAssets} />
      </div>

      {/* 시장, 경고 알림, 주간 비교 컬럼 */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", minWidth: 0 }}>
        {data.attentionAlert && (
          <AttentionBanner alert={data.attentionAlert} onNavigateToPlanner={onNavigateToPlanner} />
        )}
        <MarketSummaryCard data={data.marketSummary} />
        <WeeklyComparisonCard data={data.weeklyComparison} />
      </div>
    </div>
  );
}
