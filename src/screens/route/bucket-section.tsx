import { Card } from "../../components/common/card";
import type { RouteBucketSummary } from "../../types/route";

interface BucketSectionProps {
  readonly buckets: RouteBucketSummary;
}

export function BucketSection({ buckets }: BucketSectionProps) {
  return (
    <Card
      title="계획 구성 · 준비 구간"
      subtitle={buckets.totalLabel}
      className="route-section"
    >
      <div
        className="route-bucket-bar"
        role="img"
        aria-label={buckets.items.map((item) => `${item.label} ${item.ratioLabel}`).join(", ")}
      >
        {buckets.items.map((item) => (
          <span
            className={`route-bucket-bar__segment route-bucket-bar__segment--${item.kind}`}
            key={item.id}
            style={{ width: `${item.widthPercent}%` }}
          />
        ))}
      </div>

      <ul className="route-bucket-list">
        {buckets.items.map((item) => (
          <li key={item.id}>
            <span
              className={`route-bucket-list__marker route-bucket-list__marker--${item.kind}`}
              aria-hidden="true"
            />
            <div>
              <div className="route-section__heading-row">
                <strong>{item.label}</strong>
                <span className="route-value">{item.ratioLabel}</span>
              </div>
              <p>{item.amountLabel}</p>
              <small>{item.description}</small>
            </div>
          </li>
        ))}
      </ul>

      <p className="route-section__notice">{buckets.notice}</p>
    </Card>
  );
}
