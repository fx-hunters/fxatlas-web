import { Card } from "../../components/common/card";
import { Badge } from "../../components/common/badge";
import { SparklineChart } from "../../components/common/sparkline-chart";
import type { MarketSummaryData } from "../../types/home";

interface MarketSummaryCardProps {
  readonly data: MarketSummaryData;
}

export function MarketSummaryCard({ data }: MarketSummaryCardProps) {
  return (
    <Card title={`오늘의 시장 (${data.pair})`} className="market-summary-card">
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: "0.25rem",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          <span style={{ fontSize: "1.25rem", color: "var(--text-muted)", fontWeight: 500 }}>₩</span>
          <span style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text)" }}>
            {data.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div>
          <Badge variant="primary">
            하단 {data.bandLower.toLocaleString()} - 상단 {data.bandUpper.toLocaleString()}
          </Badge>
        </div>

        <div style={{ marginTop: "0.5rem" }}>
          <SparklineChart data={data.sparkline} height={90} />
        </div>
      </div>
    </Card>
  );
}
