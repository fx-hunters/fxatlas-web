import type { RoutePlanData } from "../../types/route";
import { CurveDiveTransition } from "./curve-dive-transition";
import { PlannerIntro } from "./planner-intro";
import { PlannerJourney } from "./planner-journey";
import type { UsePlannerInteractionResult } from "./use-planner-interaction";

interface RouteScreenViewProps {
  readonly data: RoutePlanData;
  readonly interaction: UsePlannerInteractionResult;
}

export function RouteScreenView({ data, interaction }: RouteScreenViewProps) {
  const { state } = interaction;

  if (state.stage === "intro") {
    return (
      <PlannerIntro
        content={data.intro}
        dataNotice={data.dataNotice}
        plans={data.plans}
        defaultPlan={data.plans[0]}
        isCreationNoticeVisible={state.isCreationNoticeVisible}
        onSelectGoal={interaction.selectPlan}
        onShowCreationNotice={interaction.showCreationNotice}
      />
    );
  }

  if (state.stage === "entering") {
    return (
      <CurveDiveTransition
        plan={state.plan}
        entryMode={state.entryMode}
        onComplete={interaction.completeEntry}
      />
    );
  }

  return (
    <PlannerJourney
      dataNotice={data.dataNotice}
      state={state}
      actions={interaction}
    />
  );
}
