import { Badge } from "../../components/common/badge";
import { ProgressBar } from "../../components/common/progress-bar";
import type { RouteDataNotice, RouteGoalSummary } from "../../types/route";
import type { PlannerRevealPhase } from "./use-planner-interaction";

interface GoalSummarySectionProps {
  readonly goal: RouteGoalSummary;
  readonly dataNotice: RouteDataNotice;
  readonly revealPhase: PlannerRevealPhase;
  readonly isExpanded: boolean;
  readonly onToggle: () => void;
}

export function GoalSummarySection({
  goal,
  dataNotice,
  revealPhase,
  isExpanded,
  onToggle,
}: GoalSummarySectionProps) {
  const isOrientation = revealPhase === "orientation";

  return (
    <section
      className={
        "planner-goal-summary" +
        (isOrientation
          ? " planner-goal-summary--orientation"
          : " planner-goal-summary--docked")
      }
      aria-labelledby="planner-journey-title"
      data-reveal-phase={revealPhase}
    >
      <div className="planner-goal-summary__main">
        <div className="planner-goal-summary__title">
          <p className="route-eyebrow">
            {isOrientation
              ? "지금 여기에서 시작해요"
              : goal.currencyCode + " 목표"}
          </p>
          <h2 id="planner-journey-title">{goal.name}</h2>
        </div>

        <div
          className="planner-goal-summary__numbers"
          data-currency={goal.currencyCode}
        >
          <span>
            <small>목표</small>
            <strong>{goal.targetAmountLabel}</strong>
          </span>
          <span>
            <small>현재</small>
            <strong>{goal.securedAmountLabel}</strong>
          </span>
        </div>

        {!isOrientation && (
          <p className="planner-goal-summary__metric">
            <span>{goal.primaryMetricLabel}</span>
            <strong>{goal.primaryMetricValue}</strong>
          </p>
        )}

        <Badge variant="primary">{dataNotice.sourceLabel}</Badge>
      </div>

      {!isOrientation && (
        <button
          type="button"
          className="planner-goal-summary__toggle"
          aria-expanded={isExpanded}
          aria-controls="planner-goal-summary-details"
          onClick={onToggle}
        >
          목표 정보 {isExpanded ? "접기" : "보기"}
          <span aria-hidden="true">{isExpanded ? "−" : "+"}</span>
        </button>
      )}

      {isExpanded && !isOrientation && (
        <div
          id="planner-goal-summary-details"
          className="planner-goal-summary__details"
        >
          <dl>
            <div>
              <dt>도착 조건</dt>
              <dd>{goal.targetDateLabel}</dd>
            </div>
            <div>
              <dt>남은 일정</dt>
              <dd>{goal.remainingPeriodLabel}</dd>
            </div>
            <div>
              <dt>진단 프로필</dt>
              <dd>{goal.diagnosisLabel}</dd>
            </div>
          </dl>
          <ProgressBar
            ratio={goal.progressPercent}
            color="var(--primary)"
            label={goal.progressLabel}
          />
        </div>
      )}
    </section>
  );
}
