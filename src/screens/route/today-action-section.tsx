import { Badge } from "../../components/common/badge";
import { Icon } from "../../components/common/icon";
import type { PlannerAction, RoutePlanSummary } from "../../types/route";
import { PlanSummarySection } from "./plan-summary-section";

export type PlannerDockActionId =
  | "explore"
  | "record"
  | "compare"
  | "apply"
  | "next"
  | "skip"
  | "reason"
  | "details";

type PlannerDockMode = Exclude<
  PlannerDockActionId,
  "skip" | "reason" | "details"
>;

interface PlannerActionDockProps {
  readonly action: PlannerAction;
  readonly plan: RoutePlanSummary;
  readonly mode: PlannerDockMode;
  readonly isRecorded: boolean;
  readonly recordedStatusLabel: string;
  readonly onAction: (actionId: PlannerDockActionId) => void;
}

const PRIMARY_ACTION_LABELS: Readonly<Record<PlannerDockMode, string>> = {
  explore: "상황이 바뀐다면?",
  record: "이번 회차 기록",
  compare: "기존 계획과 비교",
  apply: "이 계획 적용",
  next: "다음 일정 확인",
};

export function PlannerActionDock({
  action,
  plan,
  mode,
  isRecorded,
  recordedStatusLabel,
  onAction,
}: PlannerActionDockProps) {
  return (
    <aside
      className="planner-action-dock"
      aria-labelledby="planner-action-title"
      data-primary-action={mode}
    >
      <div className="planner-action-dock__surface">
        <div className="planner-action-dock__status">
          <span>NOW</span>
          <Badge variant={isRecorded ? "normal" : "primary"}>
            {isRecorded ? recordedStatusLabel : action.dueLabel}
          </Badge>
        </div>

        <PlanSummarySection plan={plan} action={action} />

        <button
          type="button"
          className="route-button route-button--primary planner-action-dock__primary"
          onClick={() => onAction(mode)}
        >
          {mode === "record" && <Icon name="checkCircle" size={17} />}
          {PRIMARY_ACTION_LABELS[mode]}
          {mode !== "record" && <Icon name="arrowRight" size={17} />}
        </button>

        <button
          type="button"
          className="planner-action-dock__detail-link"
          onClick={() => onAction("details")}
        >
          계획 자세히 보기
        </button>

        <details className="planner-action-dock__overflow">
          <summary>보조 행동 열기</summary>
          <div>
            {!isRecorded && mode !== "record" && (
              <button type="button" onClick={() => onAction("record")}>
                {action.recordLabel}
              </button>
            )}
            {!isRecorded && (
              <button type="button" onClick={() => onAction("skip")}>
                {action.skipLabel}
              </button>
            )}
            <button type="button" onClick={() => onAction("reason")}>
              {action.reasonLabel}
            </button>
          </div>
        </details>
      </div>
    </aside>
  );
}
