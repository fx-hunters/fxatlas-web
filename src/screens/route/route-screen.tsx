import { useRoutePlanner } from "./use-route-planner";
import { GoalListView } from "./goal-list-view";
import { GoalFormView } from "./goal-form-view";
import { GoalDetailView } from "./goal-detail-view";
import type { NavTabId } from "../../types/navigation";

interface RouteScreenProps {
  readonly isDemo?: boolean;
  readonly onNavigate?: (tab: NavTabId) => void;
}

export function RouteScreen({ isDemo = true }: RouteScreenProps) {
  const {
    goals,
    viewMode,
    selectedGoal,
    monthlyKrw,
    safeRatioPct,
    splitRounds,
    safeRatioFloor,
    simulation,
    openCreateView,
    openEditView,
    selectGoal,
    backToList,
    setMonthlyKrw,
    setSafeRatioPct,
    setSplitRounds,
    resetParameters,
    createGoal,
    updateGoal,
    deleteGoal,
    completeCurrentRound,
  } = useRoutePlanner(isDemo);

  if (viewMode === "create") {
    return <GoalFormView onSubmit={createGoal} onCancel={backToList} />;
  }

  if (viewMode === "edit" && selectedGoal) {
    return (
      <GoalFormView
        initialGoal={selectedGoal}
        onSubmit={(formData) => updateGoal(selectedGoal.id, formData)}
        onCancel={backToList}
        onDelete={deleteGoal}
      />
    );
  }

  if (viewMode === "detail" && selectedGoal) {
    return (
      <GoalDetailView
        goal={selectedGoal}
        simulation={simulation}
        monthlyKrw={monthlyKrw}
        safeRatioPct={safeRatioPct}
        splitRounds={splitRounds}
        safeRatioFloor={safeRatioFloor}
        onBack={backToList}
        onEdit={() => openEditView(selectedGoal.id)}
        onDelete={() => deleteGoal(selectedGoal.id)}
        onSetMonthlyKrw={setMonthlyKrw}
        onSetSafeRatioPct={setSafeRatioPct}
        onSetSplitRounds={setSplitRounds}
        onResetParameters={resetParameters}
        onCompleteRound={completeCurrentRound}
      />
    );
  }

  return (
    <GoalListView
      goals={goals}
      onSelectGoal={selectGoal}
      onCreateNew={openCreateView}
      onEditGoal={openEditView}
      onDeleteGoal={deleteGoal}
    />
  );
}
