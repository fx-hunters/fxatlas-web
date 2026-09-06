import { useXRay } from "./use-xray";
import { XRayExposureView } from "./xray-exposure-view";
import { XRayFitnessView } from "./xray-fitness-view";
import type { NavTabId } from "../../types/navigation";

interface XRayScreenProps {
  readonly isDemo?: boolean;
  readonly onNavigate?: (tab: NavTabId) => void;
}

export function XRayScreen({ isDemo = true, onNavigate }: XRayScreenProps) {
  const {
    data,
    activeTab,
    selectedScenarioId,
    activeScenario,
    eurSimulationPct,
    setActiveTab,
    setSelectedScenarioId,
    setEurSimulationPct,
    openAssetModal,
  } = useXRay(isDemo);

  const handleNavigateToPlanner = () => {
    if (onNavigate) {
      onNavigate("planner");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* 상단 서브 탭 네비게이션 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          borderBottom: "1px solid var(--border)",
          paddingBottom: "1px",
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab("exposure")}
          style={{
            padding: "0.75rem 1rem",
            fontSize: "0.875rem",
            fontWeight: 700,
            borderBottom: activeTab === "exposure" ? "2px solid var(--primary)" : "2px solid transparent",
            color: activeTab === "exposure" ? "var(--text)" : "var(--text-muted)",
            transition: "all 0.15s ease",
          }}
        >
          통화 노출 · 손익 분해
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("fitness")}
          style={{
            padding: "0.75rem 1rem",
            fontSize: "0.875rem",
            fontWeight: 700,
            borderBottom: activeTab === "fitness" ? "2px solid var(--primary)" : "2px solid transparent",
            color: activeTab === "fitness" ? "var(--text)" : "var(--text-muted)",
            transition: "all 0.15s ease",
          }}
        >
          통화 적합도
        </button>
      </div>

      {/* 탭 콘텐츠 */}
      {activeTab === "exposure" ? (
        <XRayExposureView
          data={data}
          selectedScenarioId={selectedScenarioId}
          activeScenario={activeScenario}
          onSelectScenario={setSelectedScenarioId}
          onNavigateToPlanner={handleNavigateToPlanner}
          onOpenAssetEdit={openAssetModal}
        />
      ) : (
        <XRayFitnessView
          data={data}
          eurSimulationPct={eurSimulationPct}
          onSetEurSimulationPct={setEurSimulationPct}
          onNavigateToPlanner={handleNavigateToPlanner}
        />
      )}
    </div>
  );
}
