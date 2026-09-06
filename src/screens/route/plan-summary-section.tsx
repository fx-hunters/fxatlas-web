import { Badge } from "../../components/common/badge";
import type { PlannerAction, RoutePlanSummary } from "../../types/route";

interface PlanSummarySectionProps {
  readonly plan: RoutePlanSummary;
  readonly action: PlannerAction;
  readonly isDetailed?: boolean;
}

export function PlanSummarySection({
  plan,
  action,
  isDetailed = false,
}: PlanSummarySectionProps) {
  return (
    <section
      className={
        "planner-plan-summary" +
        (isDetailed ? " planner-plan-summary--detailed" : "")
      }
      aria-labelledby={
        isDetailed ? "planner-plan-detail-title" : "planner-action-title"
      }
    >
      <div className="planner-plan-summary__heading">
        <div>
          <p className="route-eyebrow">
            {isDetailed ? "계획 전체 정보" : "다음 준비"}
          </p>
          <h3
            id={
              isDetailed ? "planner-plan-detail-title" : "planner-action-title"
            }
          >
            {isDetailed ? plan.title : action.title}
          </h3>
        </div>
        <Badge variant={plan.statusTone}>{plan.statusLabel}</Badge>
      </div>

      {isDetailed ? (
        <>
          <p className="planner-plan-summary__description">
            {plan.description}
          </p>
          <strong className="planner-plan-summary__next">
            {plan.nextRoundLabel}
          </strong>
          <dl className="planner-plan-summary__facts">
            <div>
              <dt>회차</dt>
              <dd>{plan.roundCountLabel}</dd>
            </div>
            <div>
              <dt>확인 간격</dt>
              <dd>{plan.cadenceLabel}</dd>
            </div>
            <div>
              <dt>도착점</dt>
              <dd>{plan.destinationLabel}</dd>
            </div>
          </dl>
        </>
      ) : (
        <>
          <p className="planner-plan-summary__schedule">{action.dueLabel}</p>
          <strong className="planner-plan-summary__amount">
            {action.amountLabel}
          </strong>
          <p className="planner-plan-summary__description">
            {action.description}
          </p>
        </>
      )}
    </section>
  );
}
