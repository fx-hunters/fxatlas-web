import { Badge } from "../../components/common/badge";
import { Card } from "../../components/common/card";
import type { RouteRoundSummary } from "../../types/route";

interface RoundPlanSectionProps {
  readonly rounds: RouteRoundSummary;
}

export function RoundPlanSection({ rounds }: RoundPlanSectionProps) {
  return (
    <Card
      title="계획 구성 · 회차별 계획"
      action={<Badge>{rounds.totalLabel}</Badge>}
      className="route-section"
    >
      <ol className="route-round-list">
        {rounds.items.map((round) => (
          <li key={round.id}>
            <div className="route-round-list__sequence">
              <strong>{round.sequenceLabel}</strong>
              <span>{round.scheduledDateLabel}</span>
            </div>
            <div className="route-round-list__detail">
              <span>{round.bucketLabel}</span>
              <strong>{round.amountLabel}</strong>
            </div>
            <Badge variant={round.statusTone}>{round.statusLabel}</Badge>
          </li>
        ))}
      </ol>
      <p className="route-section__notice">{rounds.notice}</p>
    </Card>
  );
}
