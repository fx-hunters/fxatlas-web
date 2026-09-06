import { Badge } from "../../components/common/badge";
import type { PlannerCheckpointData } from "../../types/route";

interface PlannerNodeDetailProps {
  readonly checkpoint: PlannerCheckpointData;
  readonly isUserSelected: boolean;
  readonly onOpenReason: () => void;
}

export function PlannerNodeDetail({
  checkpoint,
  isUserSelected,
  onOpenReason,
}: PlannerNodeDetailProps) {
  return (
    <aside
      className="planner-node-detail"
      aria-label="선택한 계획 지점"
      aria-live="polite"
      data-checkpoint-detail={checkpoint.id}
    >
      <div className="planner-node-detail__heading">
        <span>{isUserSelected ? "선택한 지점" : "다음 준비"}</span>
        <Badge variant={checkpoint.status === "next" ? "primary" : "default"}>
          {checkpoint.statusLabel}
        </Badge>
      </div>
      <strong>{checkpoint.title}</strong>
      <p>
        <span>{checkpoint.detail}</span>
        <b>{checkpoint.amountLabel}</b>
      </p>
      {isUserSelected && (
        <button type="button" onClick={onOpenReason}>
          이 지점의 설명 보기
        </button>
      )}
    </aside>
  );
}
