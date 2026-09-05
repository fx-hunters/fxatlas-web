import { Card } from "../../components/common/card";
import type { WeeklyComparisonData } from "../../types/home";

interface WeeklyComparisonCardProps {
  readonly data: WeeklyComparisonData;
}

export function WeeklyComparisonCard({ data }: WeeklyComparisonCardProps) {
  const isPositiveFunded = data.fundedRatioDiffPct >= 0;
  const isPositiveValuation = data.valuationDiffKrw >= 0;
  const isHighConcentration = data.usdConcentrationDiffPctPoints > 0;

  return (
    <Card title="지난주 대비" className="weekly-comparison-card">
      <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
        {/* 확보율 */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "0.875rem",
          }}
        >
          <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>확보율</span>
          <span
            style={{
              fontWeight: 700,
              fontVariantNumeric: "tabular-nums",
              color: isPositiveFunded ? "var(--normal)" : "var(--danger)",
            }}
          >
            {isPositiveFunded ? `+${data.fundedRatioDiffPct.toFixed(1)}` : data.fundedRatioDiffPct.toFixed(1)}%
          </span>
        </div>

        {/* 평가액 */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "0.875rem",
          }}
        >
          <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>평가액</span>
          <span
            style={{
              fontWeight: 700,
              fontVariantNumeric: "tabular-nums",
              color: "var(--text)",
            }}
          >
            {isPositiveValuation ? `+₩${data.valuationDiffKrw.toLocaleString()}` : `-₩${Math.abs(data.valuationDiffKrw).toLocaleString()}`}
          </span>
        </div>

        {/* USD 집중도 */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "0.875rem",
          }}
        >
          <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>USD 집중도</span>
          <span
            style={{
              fontWeight: 700,
              fontVariantNumeric: "tabular-nums",
              color: isHighConcentration ? "var(--danger)" : "var(--normal)",
            }}
          >
            {isHighConcentration ? `+${data.usdConcentrationDiffPctPoints.toFixed(1)}` : data.usdConcentrationDiffPctPoints.toFixed(1)}%p
          </span>
        </div>
      </div>
    </Card>
  );
}
