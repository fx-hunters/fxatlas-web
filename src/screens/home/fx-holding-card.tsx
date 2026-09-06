import { Card } from "../../components/common/card";
import { DonutChart } from "../../components/common/donut-chart";
import type { FxHoldingData } from "../../types/home";

interface FxHoldingCardProps {
  readonly data: FxHoldingData;
  readonly onNavigateToAssets?: () => void;
}

export function FxHoldingCard({ data, onNavigateToAssets }: FxHoldingCardProps) {
  const isPositiveDiff = data.dayOverDayDiffPctPoints >= 0;

  return (
    <Card
      title="내 외화 현황"
      action={
        onNavigateToAssets && (
          <button
            type="button"
            onClick={onNavigateToAssets}
            style={{
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "var(--primary)",
              textDecoration: "underline",
            }}
          >
            자산 등록 / 편집
          </button>
        )
      }
      className="fx-holding-card"
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "1.5rem",
        }}
      >
        <DonutChart
          percent={data.fxRatio * 100}
          size={120}
          strokeWidth={14}
          color="var(--usd)"
          trackColor="var(--border)"
          label={`외화 비중 ${(data.fxRatio * 100).toFixed(0)}%`}
        />

        <div style={{ flex: 1, minWidth: "200px", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "0.8125rem",
              color: "var(--text-muted)",
              fontWeight: 500,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            <span>
              어제 대비{" "}
              <strong style={{ color: isPositiveDiff ? "var(--normal)" : "var(--danger)" }}>
                {isPositiveDiff ? `+${data.dayOverDayDiffPctPoints.toFixed(1)}` : data.dayOverDayDiffPctPoints.toFixed(1)}%p
              </strong>
            </span>
            <span style={{ color: "var(--primary)" }}>
              1% 변동시 ±₩{data.sensitivity1pctKrw.toLocaleString()}
            </span>
          </div>

          {/* 통화별 비중 바 */}
          <div
            style={{
              height: "14px",
              width: "100%",
              backgroundColor: "var(--border)",
              borderRadius: "var(--radius-full)",
              display: "flex",
              overflow: "hidden",
            }}
            aria-label="통화별 비중 바"
          >
            <div
              style={{
                width: `${data.breakdown.usd}%`,
                backgroundColor: "var(--usd)",
                transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
              title={`USD ${data.breakdown.usd}%`}
            />
            <div
              style={{
                width: `${data.breakdown.jpy}%`,
                backgroundColor: "var(--jpy)",
                transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
              title={`JPY ${data.breakdown.jpy}%`}
            />
            <div
              style={{
                width: `${data.breakdown.eur}%`,
                backgroundColor: "var(--eur)",
                transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
              title={`EUR ${data.breakdown.eur}%`}
            />
          </div>

          {/* 범례 */}
          <div
            style={{
              display: "flex",
              gap: "1rem",
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "var(--text)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "2px", backgroundColor: "var(--usd)" }} />
              <span>USD {data.breakdown.usd}%</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "2px", backgroundColor: "var(--jpy)" }} />
              <span>JPY {data.breakdown.jpy}%</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "2px", backgroundColor: "var(--eur)" }} />
              <span>EUR {data.breakdown.eur}%</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
