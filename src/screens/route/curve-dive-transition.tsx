import { Badge } from "../../components/common/badge";
import { Icon } from "../../components/common/icon";
import type { PlannerPlan } from "../../types/route";
import type { PlannerEntryMode } from "./use-planner-interaction";

interface CurveDiveTransitionProps {
  readonly plan: PlannerPlan;
  readonly entryMode: Exclude<PlannerEntryMode, "replay">;
  readonly onComplete: () => void;
}

export function CurveDiveTransition({
  plan,
  entryMode,
  onComplete,
}: CurveDiveTransitionProps) {
  const goal = plan.introOption;
  const isReturnVisit = entryMode === "returnVisit";

  return (
    <section
      className={`planner-dive${isReturnVisit ? " planner-dive--return" : ""}`}
      aria-labelledby="planner-dive-title"
      aria-live="polite"
      data-entry-mode={entryMode}
    >
      <div className="planner-dive__ambient" aria-hidden="true" />
      <div
        className="planner-dive__stage"
        data-goal-id={plan.id}
        onAnimationEnd={onComplete}
      >
        <div className="planner-dive__target" data-currency={goal.currencyCode}>
          <span className="planner-dive__icon" aria-hidden="true">
            <Icon name="planner" size={22} />
          </span>
          <Badge variant="primary">{goal.purposeLabel}</Badge>
          <h2 id="planner-dive-title">{goal.name}</h2>
          <p>{goal.primaryValueLabel}</p>
          <small>
            {isReturnVisit
              ? "계획 Curve로 돌아가고 있습니다."
              : "계획 Curve를 펼치고 있습니다."}
          </small>
        </div>
      </div>
    </section>
  );
}
